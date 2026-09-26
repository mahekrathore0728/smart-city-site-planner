from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, row_to_dict, success, error

walkthrough_bp = Blueprint("walkthrough", __name__, url_prefix="/api/projects")


@walkthrough_bp.route("/<pid>/walkthrough", methods=["GET"])
def get_walkthrough(pid):
    conn = get_db()
    row = conn.execute("SELECT * FROM walkthrough WHERE project_id = ?", (pid,)).fetchone()
    conn.close()
    return success(row_to_dict(row) if row else {})


@walkthrough_bp.route("/<pid>/walkthrough", methods=["PUT"])
def update_walkthrough(pid):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    conn.execute("""
        INSERT INTO walkthrough (project_id, video_path, video_url, thumbnail_path, description, sequence_notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            video_path = COALESCE(excluded.video_path, video_path),
            video_url = COALESCE(excluded.video_url, video_url),
            thumbnail_path = COALESCE(excluded.thumbnail_path, thumbnail_path),
            description = COALESCE(excluded.description, description),
            sequence_notes = COALESCE(excluded.sequence_notes, sequence_notes),
            updated_at = excluded.updated_at
    """, (pid, data.get("video_path"), data.get("video_url"),
          data.get("thumbnail_path"), data.get("description"),
          data.get("sequence_notes"), ts))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM walkthrough WHERE project_id = ?", (pid,)).fetchone())
    conn.close()
    return success(row)
