from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error

sources_bp = Blueprint("sources", __name__, url_prefix="/api/projects")


@sources_bp.route("/<pid>/sources", methods=["GET"])
def list_sources(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM data_sources WHERE project_id = ? ORDER BY created_at", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@sources_bp.route("/<pid>/sources", methods=["POST"])
def create_source(pid):
    data = request.json or {}
    if not data.get("name"):
        return error("Name is required")
    ts = now_iso()
    sid = new_id()
    conn = get_db()
    conn.execute("""
        INSERT INTO data_sources (id, project_id, name, url, description, date_accessed, geographic_scope, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (sid, pid, data["name"], data.get("url",""), data.get("description",""),
          data.get("date_accessed",""), data.get("geographic_scope",""), data.get("notes",""), ts))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM data_sources WHERE id = ?", (sid,)).fetchone())
    conn.close()
    return success(row, 201)


@sources_bp.route("/<pid>/sources/<sid>", methods=["PUT"])
def update_source(pid, sid):
    data = request.json or {}
    conn = get_db()
    conn.execute("""
        UPDATE data_sources SET name=COALESCE(?,name), url=COALESCE(?,url),
            description=COALESCE(?,description), date_accessed=COALESCE(?,date_accessed),
            geographic_scope=COALESCE(?,geographic_scope), notes=COALESCE(?,notes)
        WHERE id=? AND project_id=?
    """, (data.get("name"),data.get("url"),data.get("description"),
          data.get("date_accessed"),data.get("geographic_scope"),data.get("notes"), sid, pid))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM data_sources WHERE id = ?", (sid,)).fetchone())
    conn.close()
    return success(row)


@sources_bp.route("/<pid>/sources/<sid>", methods=["DELETE"])
def delete_source(pid, sid):
    conn = get_db()
    conn.execute("DELETE FROM data_sources WHERE id=? AND project_id=?", (sid, pid))
    conn.commit()
    conn.close()
    return success({"deleted": sid})
