from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, row_to_dict, success, error

revit_bp = Blueprint("revit", __name__, url_prefix="/api/projects")


@revit_bp.route("/<pid>/revit", methods=["GET"])
def get_revit(pid):
    conn = get_db()
    row = conn.execute("SELECT * FROM revit_workflow WHERE project_id = ?", (pid,)).fetchone()
    conn.close()
    if not row:
        return error("Revit workflow not found", 404)
    return success(row_to_dict(row))


@revit_bp.route("/<pid>/revit", methods=["PUT"])
def update_revit(pid):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    conn.execute("""
        INSERT INTO revit_workflow (project_id, building_name, building_role, forma_ref, revit_ref,
            export_status, sync_status, detailing_done, analysis_rerun,
            before_image, after_image, floor_plan_image, model_3d_image, facade_image, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            building_name = COALESCE(excluded.building_name, building_name),
            building_role = COALESCE(excluded.building_role, building_role),
            forma_ref = COALESCE(excluded.forma_ref, forma_ref),
            revit_ref = COALESCE(excluded.revit_ref, revit_ref),
            export_status = COALESCE(excluded.export_status, export_status),
            sync_status = COALESCE(excluded.sync_status, sync_status),
            detailing_done = COALESCE(excluded.detailing_done, detailing_done),
            analysis_rerun = COALESCE(excluded.analysis_rerun, analysis_rerun),
            before_image = COALESCE(excluded.before_image, before_image),
            after_image = COALESCE(excluded.after_image, after_image),
            floor_plan_image = COALESCE(excluded.floor_plan_image, floor_plan_image),
            model_3d_image = COALESCE(excluded.model_3d_image, model_3d_image),
            facade_image = COALESCE(excluded.facade_image, facade_image),
            notes = COALESCE(excluded.notes, notes),
            updated_at = excluded.updated_at
    """, (
        pid,
        data.get("building_name"), data.get("building_role"),
        data.get("forma_ref"), data.get("revit_ref"),
        data.get("export_status"), data.get("sync_status"),
        data.get("detailing_done"), data.get("analysis_rerun"),
        data.get("before_image"), data.get("after_image"),
        data.get("floor_plan_image"), data.get("model_3d_image"),
        data.get("facade_image"), data.get("notes"), ts
    ))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM revit_workflow WHERE project_id = ?", (pid,)).fetchone())
    conn.close()
    return success(row)
