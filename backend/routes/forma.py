from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, row_to_dict, rows_to_list, success, error

forma_bp = Blueprint("forma", __name__, url_prefix="/api/projects")

VALID_STATUSES = ["pending", "in_progress", "complete"]


@forma_bp.route("/<pid>/forma", methods=["GET"])
def get_forma(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM forma_workflow WHERE project_id = ? ORDER BY step_index", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@forma_bp.route("/<pid>/forma/<step_id>", methods=["PUT"])
def update_forma_step(pid, step_id):
    data = request.json or {}
    ts = now_iso()

    status = data.get("status")
    if status and status not in VALID_STATUSES:
        return error(f"Status must be one of: {VALID_STATUSES}")

    conn = get_db()
    conn.execute("""
        UPDATE forma_workflow SET
            status = COALESCE(?, status),
            notes = COALESCE(?, notes),
            evidence_path = COALESCE(?, evidence_path),
            updated_at = ?
        WHERE id = ? AND project_id = ?
    """, (status, data.get("notes"), data.get("evidence_path"), ts, step_id, pid))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM forma_workflow WHERE id = ?", (step_id,)).fetchone())
    conn.close()
    return success(row)
