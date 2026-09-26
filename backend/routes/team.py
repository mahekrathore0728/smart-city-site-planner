from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error

team_bp = Blueprint("team", __name__, url_prefix="/api/projects")


@team_bp.route("/<pid>/team", methods=["GET"])
def list_team(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM team_members WHERE project_id = ? ORDER BY created_at", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@team_bp.route("/<pid>/team", methods=["POST"])
def create_member(pid):
    data = request.json or {}
    if not data.get("name"):
        return error("Name is required")
    ts = now_iso()
    mid = new_id()
    conn = get_db()
    conn.execute("""
        INSERT INTO team_members (id, project_id, name, role, module, responsibilities, evidence, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (mid, pid, data["name"], data.get("role",""), data.get("module",""),
          data.get("responsibilities",""), data.get("evidence",""), ts))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM team_members WHERE id = ?", (mid,)).fetchone())
    conn.close()
    return success(row, 201)


@team_bp.route("/<pid>/team/<mid>", methods=["PUT"])
def update_member(pid, mid):
    data = request.json or {}
    conn = get_db()
    conn.execute("""
        UPDATE team_members SET name=COALESCE(?,name), role=COALESCE(?,role),
            module=COALESCE(?,module), responsibilities=COALESCE(?,responsibilities),
            evidence=COALESCE(?,evidence)
        WHERE id=? AND project_id=?
    """, (data.get("name"),data.get("role"),data.get("module"),
          data.get("responsibilities"),data.get("evidence"), mid, pid))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM team_members WHERE id = ?", (mid,)).fetchone())
    conn.close()
    return success(row)


@team_bp.route("/<pid>/team/<mid>", methods=["DELETE"])
def delete_member(pid, mid):
    conn = get_db()
    conn.execute("DELETE FROM team_members WHERE id=? AND project_id=?", (mid, pid))
    conn.commit()
    conn.close()
    return success({"deleted": mid})
