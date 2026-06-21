#!/usr/bin/env python3
import json
import queue
import random
import re
import socket
import string
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse


TABLES = {}
TABLE_LOCK = threading.Lock()
CLIENT_TTL_SECONDS = 45
EMPTY_TABLE_TTL_SECONDS = 5 * 60
TABLE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{3,24}$")
PORT = 5173


class DualStackThreadingHTTPServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        if hasattr(socket, "IPV6_V6ONLY"):
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


class IPv6OnlyThreadingHTTPServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6

    def server_bind(self):
        if hasattr(socket, "IPV6_V6ONLY"):
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 1)
        super().server_bind()


class MtgTableHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/tables":
            self.list_tables(parsed)
            return
        if parsed.path == "/api/table/state":
            self.get_table_state(parsed)
            return
        if parsed.path == "/api/table/events":
            self.stream_table_events(parsed)
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/tables":
            self.create_table()
            return
        if parsed.path == "/api/tables/join":
            self.join_table()
            return
        if parsed.path == "/api/table/state":
            self.set_table_state()
            return
        if parsed.path == "/api/table/heartbeat":
            self.heartbeat_table()
            return
        if parsed.path == "/api/table/leave":
            self.leave_table()
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

    def list_tables(self, parsed):
        params = parse_qs(parsed.query)
        query = (params.get("query") or params.get("q") or [""])[0].strip().lower()
        with TABLE_LOCK:
            cleanup_tables_locked()
            tables = [table_summary(table) for table in TABLES.values()]
        if query:
            tables = [table for table in tables if query in table["id"].lower()]
        tables.sort(key=lambda table: table["updatedAt"], reverse=True)
        self.send_json(200, {"tables": tables})

    def create_table(self):
        try:
            payload = self.read_json_body()
        except ValueError:
            self.send_json(400, {"error": "invalid content length"})
            return
        except json.JSONDecodeError:
            self.send_json(400, {"error": "invalid json"})
            return

        requested_id = str(payload.get("tableId") or "").strip()
        password = str(payload.get("password") or "")
        if requested_id and not TABLE_ID_PATTERN.match(requested_id):
            self.send_json(400, {"error": "table id must be 3-24 letters, numbers, _ or -"})
            return

        now = now_ms()
        with TABLE_LOCK:
            cleanup_tables_locked()
            table_id = requested_id or generate_table_id_locked()
            if table_id in TABLES:
                self.send_json(409, {"error": "table already exists"})
                return
            TABLES[table_id] = {
                "id": table_id,
                "password": password,
                "createdAt": now,
                "updatedAt": now,
                "lastActivityAt": now,
                "lastEmptyAt": now,
                "state": None,
                "clients": {},
                "subscribers": {},
            }
            summary = table_summary(TABLES[table_id])
        self.send_json(201, {"table": summary})

    def join_table(self):
        try:
            payload = self.read_json_body()
        except ValueError:
            self.send_json(400, {"error": "invalid content length"})
            return
        except json.JSONDecodeError:
            self.send_json(400, {"error": "invalid json"})
            return

        table_id = str(payload.get("tableId") or "").strip()
        password = str(payload.get("password") or "")
        client_id = str(payload.get("clientId") or "").strip()
        if not table_id or not client_id:
            self.send_json(400, {"error": "tableId and clientId are required"})
            return

        with TABLE_LOCK:
            cleanup_tables_locked()
            table = TABLES.get(table_id)
            if not table:
                self.send_json(404, {"error": "table not found"})
                return
            if table["password"] and password != table["password"]:
                self.send_json(403, {"error": "invalid password"})
                return
            touch_client_locked(table, client_id)
            payload = {"table": table_summary(table), "state": table["state"]}
        self.send_json(200, payload)

    def get_table_state(self, parsed):
        params = parse_qs(parsed.query)
        table_id = (params.get("tableId") or params.get("table") or [""])[0].strip()
        client_id = (params.get("clientId") or [""])[0].strip()
        since = parse_number((params.get("since") or [""])[0])
        with TABLE_LOCK:
            cleanup_tables_locked()
            table = TABLES.get(table_id)
            if not table:
                self.send_json(404, {"error": "table not found"})
                return
            if not is_joined_client_locked(table, client_id):
                self.send_json(403, {"error": "join required"})
                return
            touch_client_locked(table, client_id)
            state = table["state"]
            state_updated_at = state.get("updatedAt") if isinstance(state, dict) else None
            if (
                isinstance(since, (int, float))
                and isinstance(state_updated_at, (int, float))
                and since >= state_updated_at
            ):
                payload = {
                    "table": table_summary(table),
                    "unchanged": True,
                    "updatedAt": state_updated_at,
                }
            else:
                payload = {
                    "table": table_summary(table),
                    "state": state,
                    "updatedAt": state_updated_at,
                }
        self.send_json(200, payload)

    def set_table_state(self):
        try:
            payload = self.read_json_body()
        except ValueError:
            self.send_json(400, {"error": "invalid content length"})
            return
        except json.JSONDecodeError:
            self.send_json(400, {"error": "invalid json"})
            return

        table_id = str(payload.get("tableId") or "").strip()
        client_id = str(payload.get("clientId") or "").strip()
        state = payload.get("state")
        if not table_id or not client_id:
            self.send_json(400, {"error": "tableId and clientId are required"})
            return
        if not isinstance(state, dict):
            self.send_json(400, {"error": "state must be an object"})
            return

        with TABLE_LOCK:
            cleanup_tables_locked()
            table = TABLES.get(table_id)
            if not table:
                self.send_json(404, {"error": "table not found"})
                return
            if not is_joined_client_locked(table, client_id):
                self.send_json(403, {"error": "join required"})
                return

            current_state = table["state"]
            current_updated_at = current_state.get("updatedAt") if isinstance(current_state, dict) else None
            incoming_updated_at = state.get("updatedAt")
            if (
                isinstance(current_updated_at, (int, float))
                and isinstance(incoming_updated_at, (int, float))
                and incoming_updated_at < current_updated_at
            ):
                self.send_json(409, {"error": "stale state", "updatedAt": current_updated_at})
                return

            now = now_ms()
            table["state"] = state
            table["updatedAt"] = now
            table["lastActivityAt"] = now
            touch_client_locked(table, client_id)
            summary = table_summary(table)
            event_payload = {
                "table": summary,
                "state": state,
                "updatedAt": state.get("updatedAt"),
                "sourceClientId": client_id,
            }
            publish_table_event_locked(table, "state", event_payload)
            payload = {"ok": True, "updatedAt": state.get("updatedAt"), "table": summary}
        self.send_json(200, payload)

    def stream_table_events(self, parsed):
        params = parse_qs(parsed.query)
        table_id = (params.get("tableId") or params.get("table") or [""])[0].strip()
        client_id = (params.get("clientId") or [""])[0].strip()
        if not table_id or not client_id:
            self.send_json(400, {"error": "tableId and clientId are required"})
            return

        subscriber_id = f"{client_id}:{id(self)}"
        events = queue.Queue(maxsize=8)
        with TABLE_LOCK:
            cleanup_tables_locked()
            table = TABLES.get(table_id)
            if not table:
                self.send_json(404, {"error": "table not found"})
                return
            if not is_joined_client_locked(table, client_id):
                self.send_json(403, {"error": "join required"})
                return
            touch_client_locked(table, client_id)
            table.setdefault("subscribers", {})[subscriber_id] = events
            initial_payload = {
                "table": table_summary(table),
                "state": table["state"],
                "updatedAt": table["state"].get("updatedAt") if isinstance(table["state"], dict) else None,
                "sourceClientId": "",
            }

        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        try:
            self.write_sse("hello", initial_payload)
            while True:
                try:
                    event_name, payload = events.get(timeout=15)
                    self.write_sse(event_name, payload)
                except queue.Empty:
                    with TABLE_LOCK:
                        table = TABLES.get(table_id)
                        if not table or subscriber_id not in table.get("subscribers", {}):
                            break
                        touch_client_locked(table, client_id)
                    self.wfile.write(b": ping\n\n")
                    self.wfile.flush()
        except (BrokenPipeError, ConnectionError, OSError):
            pass
        finally:
            with TABLE_LOCK:
                table = TABLES.get(table_id)
                if table:
                    table.get("subscribers", {}).pop(subscriber_id, None)

    def write_sse(self, event_name, payload):
        data = json.dumps(payload, ensure_ascii=False)
        self.wfile.write(f"event: {event_name}\n".encode("utf-8"))
        for line in data.splitlines() or [""]:
            self.wfile.write(f"data: {line}\n".encode("utf-8"))
        self.wfile.write(b"\n")
        self.wfile.flush()

    def heartbeat_table(self):
        payload = self.safe_json_body()
        if payload is None:
            return
        table_id = str(payload.get("tableId") or "").strip()
        client_id = str(payload.get("clientId") or "").strip()
        with TABLE_LOCK:
            cleanup_tables_locked()
            table = TABLES.get(table_id)
            if not table:
                self.send_json(404, {"error": "table not found"})
                return
            if not is_joined_client_locked(table, client_id):
                self.send_json(403, {"error": "join required"})
                return
            touch_client_locked(table, client_id)
            summary = table_summary(table)
        self.send_json(200, {"ok": True, "table": summary})

    def leave_table(self):
        payload = self.safe_json_body()
        if payload is None:
            return
        table_id = str(payload.get("tableId") or "").strip()
        client_id = str(payload.get("clientId") or "").strip()
        with TABLE_LOCK:
            cleanup_tables_locked()
            table = TABLES.get(table_id)
            if not table:
                self.send_json(200, {"ok": True})
                return
            table["clients"].pop(client_id, None)
            mark_empty_if_needed_locked(table)
            summary = table_summary(table)
        self.send_json(200, {"ok": True, "table": summary})

    def safe_json_body(self):
        try:
            return self.read_json_body()
        except ValueError:
            self.send_json(400, {"error": "invalid content length"})
        except json.JSONDecodeError:
            self.send_json(400, {"error": "invalid json"})
        return None

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def now_ms():
    return int(time.time() * 1000)


def parse_number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def publish_table_event_locked(table, event_name, payload):
    stale_subscribers = []
    for subscriber_id, events in table.setdefault("subscribers", {}).items():
        try:
            events.put_nowait((event_name, payload))
        except queue.Full:
            try:
                events.get_nowait()
                events.put_nowait((event_name, payload))
            except queue.Empty:
                pass
            except queue.Full:
                stale_subscribers.append(subscriber_id)
    for subscriber_id in stale_subscribers:
        table["subscribers"].pop(subscriber_id, None)


def generate_table_id_locked():
    alphabet = string.ascii_uppercase + string.digits
    while True:
        table_id = "".join(random.choice(alphabet) for _ in range(6))
        if table_id not in TABLES:
            return table_id


def touch_client_locked(table, client_id):
    table["clients"][client_id] = time.time()
    table["lastEmptyAt"] = None


def is_joined_client_locked(table, client_id):
    if not client_id:
        return False
    expire_clients_locked(table)
    return client_id in table["clients"]


def expire_clients_locked(table):
    cutoff = time.time() - CLIENT_TTL_SECONDS
    expired = [client_id for client_id, seen_at in table["clients"].items() if seen_at < cutoff]
    for client_id in expired:
        table["clients"].pop(client_id, None)
    mark_empty_if_needed_locked(table)


def mark_empty_if_needed_locked(table):
    if table["clients"]:
        table["lastEmptyAt"] = None
    elif table.get("lastEmptyAt") is None:
        table["lastEmptyAt"] = now_ms()


def cleanup_tables_locked():
    now = now_ms()
    stale_ids = []
    for table_id, table in TABLES.items():
        expire_clients_locked(table)
        last_empty_at = table.get("lastEmptyAt")
        if last_empty_at is not None and now - last_empty_at >= EMPTY_TABLE_TTL_SECONDS * 1000:
            stale_ids.append(table_id)
    for table_id in stale_ids:
        TABLES.pop(table_id, None)


def table_summary(table):
    expire_clients_locked(table)
    state = table["state"] if isinstance(table["state"], dict) else {}
    players = state.get("players") if isinstance(state.get("players"), dict) else {}
    player_names = [
        players.get("p1", {}).get("name") or "P1",
        players.get("p2", {}).get("name") or "P2",
    ]
    return {
        "id": table["id"],
        "hasPassword": bool(table["password"]),
        "createdAt": table["createdAt"],
        "updatedAt": table["updatedAt"],
        "lastActivityAt": table["lastActivityAt"],
        "activeClients": len(table["clients"]),
        "playerNames": player_names,
    }


def make_servers():
    if socket.has_ipv6 and socket.has_dualstack_ipv6():
        try:
            return "dual-stack", [DualStackThreadingHTTPServer(("::", PORT), MtgTableHandler)]
        except OSError:
            pass

    servers = [ThreadingHTTPServer(("0.0.0.0", PORT), MtgTableHandler)]
    if socket.has_ipv6:
        servers.append(IPv6OnlyThreadingHTTPServer(("::", PORT), MtgTableHandler))
    return "separate-ipv4-ipv6" if len(servers) > 1 else "ipv4-only", servers


def serve_all(servers):
    for server in servers[1:]:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
    servers[0].serve_forever()


if __name__ == "__main__":
    mode, servers = make_servers()
    print(f"Serving MTG lobby on port {PORT} ({mode})")
    try:
        serve_all(servers)
    except KeyboardInterrupt:
        for server in servers:
            server.shutdown()
            server.server_close()
