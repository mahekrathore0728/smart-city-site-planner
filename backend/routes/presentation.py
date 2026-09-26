from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error
import json

presentation_bp = Blueprint("presentation", __name__, url_prefix="/api/projects")


@presentation_bp.route("/<pid>/presentation", methods=["GET"])
def get_presentation(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM presentation_slides WHERE project_id = ? ORDER BY slide_index", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@presentation_bp.route("/<pid>/presentation/<slide_id>", methods=["PUT"])
def update_slide(pid, slide_id):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    conn.execute("""
        UPDATE presentation_slides SET
            title = COALESCE(?, title),
            content_notes = COALESCE(?, content_notes),
            image_paths = COALESCE(?, image_paths),
            metrics = COALESCE(?, metrics),
            status = COALESCE(?, status),
            updated_at = ?
        WHERE id = ? AND project_id = ?
    """, (
        data.get("title"), data.get("content_notes"),
        json.dumps(data["image_paths"]) if "image_paths" in data else None,
        json.dumps(data["metrics"]) if "metrics" in data else None,
        data.get("status"), ts, slide_id, pid
    ))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM presentation_slides WHERE id = ?", (slide_id,)).fetchone())
    conn.close()
    return success(row)
