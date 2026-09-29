"""Shared helpers for routes"""
import uuid
import json
import functools
from datetime import datetime, timezone
from flask import jsonify, request
from database import get_db


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def new_id():
    return str(uuid.uuid4())


def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    # Parse JSON fields
    for k, v in d.items():
        if isinstance(v, str) and v and v[0] in ('[', '{'):
            try:
                d[k] = json.loads(v)
            except Exception:
                pass
    return d


def rows_to_list(rows):
    return [row_to_dict(r) for r in rows]


def success(data=None, status=200):
    return jsonify({"ok": True, "data": data}), status


def error(message, status=400):
    return jsonify({"ok": False, "error": message}), status


def get_current_user(conn=None):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None

    close_conn = False
    if conn is None:
        conn = get_db()
        close_conn = True

    try:
        row = conn.execute("""
            SELECT u.id, u.email, u.full_name, u.created_at
            FROM users u
            JOIN user_tokens t ON u.id = t.user_id
            WHERE t.token = ?
        """, (token,)).fetchone()
        return dict(row) if row else None
    finally:
        if close_conn:
            conn.close()


def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return error("Authentication required. Please log in to continue.", 401)
        return f(*args, current_user=user, **kwargs)
    return decorated
