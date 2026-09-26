from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, row_to_dict, rows_to_list, success, error

analyses_bp = Blueprint("analyses", __name__, url_prefix="/api/projects")

VALID_TYPES = ["area_metrics","embodied_carbon","sun_hours","daylight","wind","microclimate","noise","solar_energy"]
VALID_STATUSES = ["not_started","evidence_required","uploaded","reviewed"]
VALID_PROVENANCE = ["forma","user","assumption","reference"]


@analyses_bp.route("/<pid>/analyses", methods=["GET"])
def list_analyses(pid):
    proposal_id = request.args.get("proposal_id")
    conn = get_db()
    if proposal_id:
        rows = conn.execute("""
            SELECT * FROM analyses WHERE project_id = ? AND proposal_id = ?
            ORDER BY analysis_type
        """, (pid, proposal_id)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM analyses WHERE project_id = ? ORDER BY proposal_id, analysis_type", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@analyses_bp.route("/<pid>/analyses/<aid>", methods=["GET"])
def get_analysis(pid, aid):
    conn = get_db()
    row = conn.execute("SELECT * FROM analyses WHERE id = ? AND project_id = ?", (aid, pid)).fetchone()
    conn.close()
    if not row:
        return error("Analysis not found", 404)
    return success(row_to_dict(row))


@analyses_bp.route("/<pid>/analyses/<aid>", methods=["PUT"])
def update_analysis(pid, aid):
    data = request.json or {}
    ts = now_iso()

    status = data.get("status")
    if status and status not in VALID_STATUSES:
        return error(f"Invalid status. Must be one of: {VALID_STATUSES}")

    provenance = data.get("provenance")
    if provenance and provenance not in VALID_PROVENANCE:
        return error(f"Invalid provenance. Must be one of: {VALID_PROVENANCE}")

    conn = get_db()
    existing = conn.execute("SELECT id FROM analyses WHERE id = ? AND project_id = ?", (aid, pid)).fetchone()
    if not existing:
        conn.close()
        return error("Analysis not found", 404)

    conn.execute("""
        UPDATE analyses SET
            finding = COALESCE(?, finding),
            design_response = COALESCE(?, design_response),
            result_value = COALESCE(?, result_value),
            result_unit = COALESCE(?, result_unit),
            status = COALESCE(?, status),
            provenance = COALESCE(?, provenance),
            evidence_image_path = COALESCE(?, evidence_image_path),
            source = COALESCE(?, source),
            notes = COALESCE(?, notes),
            updated_at = ?
        WHERE id = ? AND project_id = ?
    """, (
        data.get("finding"), data.get("design_response"),
        data.get("result_value"), data.get("result_unit"),
        status, provenance,
        data.get("evidence_image_path"),
        data.get("source"), data.get("notes"),
        ts, aid, pid
    ))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM analyses WHERE id = ?", (aid,)).fetchone())
    conn.close()
    return success(row)
