from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error

problems_bp = Blueprint("problems", __name__, url_prefix="/api/projects")


@problems_bp.route("/<pid>/problems", methods=["GET"])
def list_problems(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM local_problems WHERE project_id = ? ORDER BY created_at", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@problems_bp.route("/<pid>/problems", methods=["POST"])
def create_problem(pid):
    data = request.json or {}
    if not data.get("title"):
        return error("Title is required")
    ts = now_iso()
    pid_new = new_id()
    conn = get_db()
    conn.execute("""
        INSERT INTO local_problems (id, project_id, title, description, category, severity, source, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (pid_new, pid, data["title"], data.get("description",""), data.get("category",""),
          data.get("severity","medium"), data.get("source",""), data.get("notes",""), ts))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM local_problems WHERE id = ?", (pid_new,)).fetchone())
    conn.close()
    return success(row, 201)


@problems_bp.route("/<pid>/problems/<item_id>", methods=["PUT"])
def update_problem(pid, item_id):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    conn.execute("""
        UPDATE local_problems SET title=COALESCE(?,title), description=COALESCE(?,description),
            category=COALESCE(?,category), severity=COALESCE(?,severity),
            source=COALESCE(?,source), notes=COALESCE(?,notes)
        WHERE id=? AND project_id=?
    """, (data.get("title"),data.get("description"),data.get("category"),
          data.get("severity"),data.get("source"),data.get("notes"), item_id, pid))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM local_problems WHERE id = ?", (item_id,)).fetchone())
    conn.close()
    return success(row)


@problems_bp.route("/<pid>/problems/<item_id>", methods=["DELETE"])
def delete_problem(pid, item_id):
    conn = get_db()
    conn.execute("DELETE FROM local_problems WHERE id=? AND project_id=?", (item_id, pid))
    conn.commit()
    conn.close()
    return success({"deleted": item_id})
