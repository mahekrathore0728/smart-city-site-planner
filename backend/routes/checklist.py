from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, row_to_dict, rows_to_list, success, error

checklist_bp = Blueprint("checklist", __name__, url_prefix="/api/projects")

CHECKLIST_ITEMS = [
    "site_area","site_limits","context","landscaping","buildings","transportation",
    "proposal_a","proposal_b",
    "analysis_area","analysis_carbon","analysis_sun","analysis_daylight",
    "analysis_wind","analysis_microclimate","analysis_noise","analysis_solar",
    "forma_board","office_building","revit_export","revit_detailing",
    "revit_sync","rendered_images","walkthrough_30s","presentation_ppt","final_review"
]


@checklist_bp.route("/<pid>/checklist", methods=["GET"])
def get_checklist(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM sih_checklist WHERE project_id = ?", (pid,)).fetchall()
    conn.close()
    items = {r["item_key"]: row_to_dict(r) for r in rows}
    return success(items)


@checklist_bp.route("/<pid>/checklist", methods=["PUT"])
def update_checklist(pid):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    for key, val in data.items():
        if key not in CHECKLIST_ITEMS:
            continue
        status = val.get("status") if isinstance(val, dict) else val
        notes = val.get("notes", "") if isinstance(val, dict) else ""
        if status not in ("pending","in_progress","complete"):
            continue
        conn.execute("""
            INSERT INTO sih_checklist (project_id, item_key, status, notes, updated_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(project_id, item_key) DO UPDATE SET
                status = excluded.status,
                notes = excluded.notes,
                updated_at = excluded.updated_at
        """, (pid, key, status, notes, ts))
    conn.commit()
    rows = conn.execute("SELECT * FROM sih_checklist WHERE project_id = ?", (pid,)).fetchall()
    conn.close()
    items = {r["item_key"]: row_to_dict(r) for r in rows}
    return success(items)
