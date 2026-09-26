from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error

objectives_bp = Blueprint("objectives", __name__, url_prefix="/api/projects")


@objectives_bp.route("/<pid>/objectives", methods=["GET"])
def list_objectives(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM objectives WHERE project_id = ? ORDER BY created_at", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@objectives_bp.route("/<pid>/objectives", methods=["POST"])
def create_objective(pid):
    data = request.json or {}
    if not data.get("name"):
        return error("Name is required")
    ts = now_iso()
    oid = new_id()
    conn = get_db()
    conn.execute("""
        INSERT INTO objectives (id, project_id, name, description, target, rationale, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (oid, pid, data["name"], data.get("description",""), data.get("target",""),
          data.get("rationale",""), data.get("status","active"), ts))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM objectives WHERE id = ?", (oid,)).fetchone())
    conn.close()
    return success(row, 201)


@objectives_bp.route("/<pid>/objectives/<oid>", methods=["PUT"])
def update_objective(pid, oid):
    data = request.json or {}
    conn = get_db()
    conn.execute("""
        UPDATE objectives SET name=COALESCE(?,name), description=COALESCE(?,description),
            target=COALESCE(?,target), rationale=COALESCE(?,rationale), status=COALESCE(?,status)
        WHERE id=? AND project_id=?
    """, (data.get("name"),data.get("description"),data.get("target"),
          data.get("rationale"),data.get("status"), oid, pid))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM objectives WHERE id = ?", (oid,)).fetchone())
    conn.close()
    return success(row)


@objectives_bp.route("/<pid>/objectives/<oid>", methods=["DELETE"])
def delete_objective(pid, oid):
    conn = get_db()
    conn.execute("DELETE FROM objectives WHERE id=? AND project_id=?", (oid, pid))
    conn.commit()
    conn.close()
    return success({"deleted": oid})
