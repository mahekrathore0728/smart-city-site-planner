from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, row_to_dict, success, error
import json

site_bp = Blueprint("site", __name__, url_prefix="/api/projects")


@site_bp.route("/<pid>/site", methods=["GET"])
def get_site(pid):
    conn = get_db()
    row = conn.execute("SELECT * FROM site_info WHERE project_id = ?", (pid,)).fetchone()
    conn.close()
    if not row:
        return error("Site info not found", 404)
    return success(row_to_dict(row))


@site_bp.route("/<pid>/site", methods=["PUT"])
def update_site(pid):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    conn.execute("""
        INSERT INTO site_info (project_id, boundary_coords, site_limits_done,
            landscaping_done, buildings_done, transportation_done,
            context_notes, local_context, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            boundary_coords = COALESCE(excluded.boundary_coords, boundary_coords),
            site_limits_done = COALESCE(excluded.site_limits_done, site_limits_done),
            landscaping_done = COALESCE(excluded.landscaping_done, landscaping_done),
            buildings_done = COALESCE(excluded.buildings_done, buildings_done),
            transportation_done = COALESCE(excluded.transportation_done, transportation_done),
            context_notes = COALESCE(excluded.context_notes, context_notes),
            local_context = COALESCE(excluded.local_context, local_context),
            updated_at = excluded.updated_at
    """, (
        pid,
        json.dumps(data["boundary_coords"]) if "boundary_coords" in data else None,
        data.get("site_limits_done"),
        data.get("landscaping_done"),
        data.get("buildings_done"),
        data.get("transportation_done"),
        data.get("context_notes"),
        data.get("local_context"),
        ts
    ))

    # Update project site_area if provided
    if "site_area_km2" in data:
        conn.execute("UPDATE projects SET site_area_km2 = ?, updated_at = ? WHERE id = ?",
                     (float(data["site_area_km2"]), ts, pid))

    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM site_info WHERE project_id = ?", (pid,)).fetchone())
    conn.close()
    return success(row)
