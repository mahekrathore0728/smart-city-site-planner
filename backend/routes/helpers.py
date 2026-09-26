"""Shared helpers for routes"""
import uuid
import json
from datetime import datetime, timezone
from flask import jsonify
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
