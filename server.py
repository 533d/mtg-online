#!/usr/bin/env python3
import json
import re
import threading
import unicodedata
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import parse_qs, quote, urlparse


SCRYFALL_NAMED = "https://api.scryfall.com/cards/named?exact="
DRAGONBOX_DISCOVER = "https://mtg.dragonbox.top/api/discover"
DRAGONBOX_ORIGIN = "https://mtg.dragonbox.top/"
SCRYFALL_IMAGE_ORIGIN = "https://cards.scryfall.io/"
DRAGONBOX_PAGE_SIZE = 200
DRAGONBOX_MAX_PAGES = 4
DEFAULT_CARD_SOURCE = "official"
CARD_SOURCES = {"official", "dragonbox"}
TABLE_STATE = None
TABLE_LOCK = threading.Lock()
CARD_EXACT_CACHE = {}


class MtgTableHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/api/card-image?"):
            self.proxy_card_image()
            return
        if self.path.startswith("/api/card/exact?"):
            self.proxy_card_exact()
            return
        if self.path == "/api/table/state":
            self.get_table_state()
            return
        super().do_GET()

    def do_HEAD(self):
        if self.path.startswith("/api/card-image?"):
            self.proxy_card_image(head_only=True)
            return
        super().do_HEAD()

    def do_POST(self):
        if self.path == "/api/table/state":
            self.set_table_state()
            return
        self.send_error(404)

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            return
        self.send_error(404)

    def read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0") or "0")
        except ValueError as error:
            raise ValueError("invalid content length") from error
        if length < 0:
            raise ValueError("invalid content length")
        body = self.rfile.read(length)
        return json.loads(body or b"{}")

    def get_table_state(self):
        with TABLE_LOCK:
            payload = {"state": TABLE_STATE}
        self.send_json(200, payload)

    def set_table_state(self):
        global TABLE_STATE
        try:
            payload = self.read_json_body()
        except ValueError:
            self.send_json(400, {"error": "invalid content length"})
            return
        except json.JSONDecodeError:
            self.send_json(400, {"error": "invalid json"})
            return
        state = payload.get("state")
        if not isinstance(state, dict):
            self.send_json(400, {"error": "state must be an object"})
            return
        with TABLE_LOCK:
            current_updated_at = TABLE_STATE.get("updatedAt") if isinstance(TABLE_STATE, dict) else None
            incoming_updated_at = state.get("updatedAt")
            if (
                isinstance(current_updated_at, (int, float))
                and isinstance(incoming_updated_at, (int, float))
                and incoming_updated_at < current_updated_at
            ):
                self.send_json(409, {"error": "stale state", "updatedAt": current_updated_at})
                return
            TABLE_STATE = state
        self.send_json(200, {"ok": True, "updatedAt": state.get("updatedAt")})

    def proxy_card_image(self, head_only=False):
        params = parse_qs(urlparse(self.path).query)
        image_url = params.get("url", [""])[0]
        if not (image_url.startswith(SCRYFALL_IMAGE_ORIGIN) or image_url.startswith(DRAGONBOX_ORIGIN)):
            self.send_json(400, {"error": "unsupported image url"})
            return

        request = Request(
            image_url,
            headers={
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "User-Agent": "mtg-online-table/0.1",
            },
            method="GET",
        )
        try:
            with urlopen(request, timeout=20) as response:
                payload = b"" if head_only else response.read()
                self.send_response(response.status)
                self.send_header("Content-Type", response.headers.get("Content-Type", "image/jpeg"))
                self.send_header("Cache-Control", "public, max-age=604800")
                if not head_only:
                    self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                if not head_only:
                    self.wfile.write(payload)
        except HTTPError as error:
            self.send_error(error.code)
        except URLError:
            self.send_error(502)

    def proxy_card_exact(self):
        params = parse_qs(urlparse(self.path).query)
        name = params.get("name", [""])[0].strip()
        source = normalize_card_source(params.get("source", [DEFAULT_CARD_SOURCE])[0])
        if not name:
            self.send_json(400, {"error": "name is required"})
            return
        cache_key = f"{source}:{name.lower()}"
        if cache_key in CARD_EXACT_CACHE:
            self.send_json(200, CARD_EXACT_CACHE[cache_key])
            return

        try:
            payload = self.find_official_card(name) if source == "official" else self.find_dragonbox_card(name)
            CARD_EXACT_CACHE[cache_key] = payload
            self.send_json(200, payload)
        except HTTPError as error:
            if error.code == 404:
                self.send_json(404, {"error": "not found"})
                return
            payload = error.read() or json.dumps({"error": str(error)}).encode("utf-8")
            try:
                self.send_json(error.code, json.loads(payload))
            except json.JSONDecodeError:
                self.send_json(error.code, {"error": payload.decode("utf-8", errors="replace")})
        except URLError as error:
            self.send_json(502, {"error": f"{source} request failed: {error.reason}"})

    def find_official_card(self, name):
        return self.fetch_scryfall_json(f"{SCRYFALL_NAMED}{quote(name)}")

    def fetch_scryfall_json(self, url):
        request = Request(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "mtg-online-table/0.1",
            },
            method="GET",
        )
        with urlopen(request, timeout=15) as response:
            return json.loads(response.read() or b"{}")

    def find_dragonbox_card(self, name):
        for page in range(1, DRAGONBOX_MAX_PAGES + 1):
            payload = self.fetch_dragonbox_json(
                {
                    "q": name,
                    "page": page,
                    "page_size": DRAGONBOX_PAGE_SIZE,
                    "include_zh": True,
                }
            )
            results = payload.get("results") or []
            card = choose_exact_dragonbox_card(name, results)
            if card:
                return card
            total = payload.get("total")
            if not results or not isinstance(total, int) or page * DRAGONBOX_PAGE_SIZE >= total:
                break
        raise HTTPError(DRAGONBOX_DISCOVER, 404, "not found", {}, None)

    def fetch_dragonbox_json(self, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        request = Request(
            DRAGONBOX_DISCOVER,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "mtg-online-table/0.1",
            },
            data=data,
            method="POST",
        )
        with urlopen(request, timeout=25) as response:
            return json.loads(response.read() or b"{}")

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def choose_exact_dragonbox_card(query, cards):
    scored = []
    for index, card in enumerate(cards):
        score = dragonbox_match_score(query, card)
        if score is not None:
            scored.append((score, index, card))
    if not scored:
        return None
    return min(scored, key=lambda item: (item[0], item[1]))[2]


def dragonbox_match_score(query, card):
    query_norm = normalize_card_name(query)
    query_base = normalize_card_name(strip_token_suffix(query))
    token_query = query_norm != query_base or "衍生" in str(query)
    if not query_norm:
        return None

    if normalize_card_name(card.get("name")) == query_norm:
        return 0
    if normalize_card_name((card.get("zh") or {}).get("name")) == query_norm:
        return 1

    face_names = [face.get("name") for face in card.get("card_faces") or []]
    zh_face_names = [face.get("name") for face in (card.get("zh") or {}).get("card_faces") or []]
    if any(normalize_card_name(name) == query_norm for name in face_names):
        return 2
    if any(normalize_card_name(name) == query_norm for name in zh_face_names):
        return 3

    if token_query and query_base:
        if any(normalize_card_name(name) == query_base for name in face_names):
            return 4
        if any(normalize_card_name(name) == query_base for name in zh_face_names):
            return 5
        if normalize_card_name(card.get("name")) == query_base:
            return 6
        if normalize_card_name((card.get("zh") or {}).get("name")) == query_base:
            return 7

    return None


def strip_token_suffix(value):
    return re.sub(r"\s+(token|衍生物?|衍生)$", "", str(value or ""), flags=re.IGNORECASE).strip()


def normalize_card_name(value):
    text = unicodedata.normalize("NFKC", str(value or ""))
    text = text.replace("’", "'").replace("`", "'").replace("–", "-").replace("—", "-")
    text = re.sub(r"\s+", " ", text).strip().casefold()
    return text


def normalize_card_source(value):
    source = str(value or "").strip().lower()
    return source if source in CARD_SOURCES else DEFAULT_CARD_SOURCE


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 5173), MtgTableHandler)
    print("Serving MTG table at http://0.0.0.0:5173/")
    server.serve_forever()
