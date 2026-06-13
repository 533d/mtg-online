#!/usr/bin/env python3
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


TABLE_STATE = None
TABLE_LOCK = threading.Lock()


class MtgTableHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/table/state":
            self.get_table_state()
            return
        super().do_GET()

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

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", 5173), MtgTableHandler)
    print("Serving MTG table at http://0.0.0.0:5173/")
    server.serve_forever()
