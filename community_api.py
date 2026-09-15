from __future__ import annotations

import json
import re
import threading
import time
import uuid
from pathlib import Path
from urllib.parse import urlparse

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "community_projects.json"
LOCK = threading.Lock()

MAX_ITEMS = 500
MAX_PER_HOST = 25
MIN_SECONDS_BETWEEN_POSTS = 8
_last_post_by_ip: dict[str, float] = {}

URL_RE = re.compile(r"^https?://", re.I)


def load_projects() -> list[dict]:
    if not DATA_FILE.exists():
        return []
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def save_projects(items: list[dict]) -> None:
    DATA_FILE.write_text(
        json.dumps(items, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def normalize_url(value: str) -> str:
    value = (value or "").strip()
    if len(value) > 1000:
        raise ValueError("URL이 너무 깁니다.")
    if not URL_RE.match(value):
        raise ValueError("http:// 또는 https:// URL만 등록할 수 있습니다.")

    parsed = urlparse(value)
    if not parsed.hostname:
        raise ValueError("올바른 URL이 아닙니다.")

    host = parsed.hostname.lower()
    if host in {"localhost", "127.0.0.1", "0.0.0.0"} or host.endswith(".local"):
        raise ValueError("외부에서 접속 가능한 URL만 등록할 수 있습니다.")
    return value


def get_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.remote_addr or "unknown"


@app.get("/api/community/projects")
def list_projects():
    items = load_projects()
    items.sort(key=lambda x: x.get("created_at", 0), reverse=True)
    return jsonify({"projects": items})


@app.post("/api/community/projects")
def create_project():
    body = request.get_json(silent=True) or {}

    # hidden field: basic bot trap
    if body.get("company"):
        return jsonify({"error": "등록할 수 없습니다."}), 400

    try:
        page_url = normalize_url(str(body.get("url", "")))
        thumb_url = normalize_url(str(body.get("thumbnail", "")))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    ip = get_ip()
    now = time.time()
    last = _last_post_by_ip.get(ip, 0)
    if now - last < MIN_SECONDS_BETWEEN_POSTS:
        wait = int(MIN_SECONDS_BETWEEN_POSTS - (now - last)) + 1
        return jsonify({"error": f"잠시 후 다시 등록해 주세요. ({wait}초)"}), 429

    page_host = (urlparse(page_url).hostname or "").lower()

    with LOCK:
        items = load_projects()

        if any(str(item.get("url", "")).rstrip("/") == page_url.rstrip("/") for item in items):
            return jsonify({"error": "이미 등록된 URL입니다."}), 409

        host_count = 0
        for item in items:
            try:
                host = (urlparse(str(item.get("url", ""))).hostname or "").lower()
                if host == page_host:
                    host_count += 1
            except Exception:
                pass

        if host_count >= MAX_PER_HOST:
            return jsonify({"error": "같은 도메인에서 너무 많은 페이지가 등록되었습니다."}), 429

        project = {
            "id": uuid.uuid4().hex[:12],
            "url": page_url,
            "thumbnail": thumb_url,
            "created_at": int(now),
        }

        items.insert(0, project)
        items = items[:MAX_ITEMS]
        save_projects(items)
        _last_post_by_ip[ip] = now

    return jsonify(project), 201


@app.get("/health")
def health():
    return jsonify({"ok": True, "count": len(load_projects())})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6990, debug=False)
