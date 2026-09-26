from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error
import json

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


@projects_bp.route("", methods=["GET"])
def list_projects():
    conn = get_db()
    rows = conn.execute("SELECT * FROM projects ORDER BY updated_at DESC").fetchall()
    conn.close()
    return success(rows_to_list(rows))


@projects_bp.route("", methods=["POST"])
def create_project():
    data = request.json or {}
    name = data.get("name", "").strip()
    if not name:
        return error("Project name is required")

    pid = new_id()
    ts = now_iso()
    conn = get_db()
    conn.execute("""
        INSERT INTO projects (id, name, city, state, location_name, site_area_km2,
            coordinates, description, planning_org, stage, is_demo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    """, (
        pid,
        name,
        data.get("city", ""),
        data.get("state", ""),
        data.get("location_name", ""),
        float(data.get("site_area_km2", 0)),
        json.dumps(data.get("coordinates", {})),
        data.get("description", ""),
        data.get("planning_org", ""),
        "setup",
        ts, ts
    ))

    # Initialize site_info
    conn.execute("""
        INSERT INTO site_info (project_id, updated_at) VALUES (?, ?)
    """, (pid, ts))

    # Initialize revit workflow
    conn.execute("""
        INSERT INTO revit_workflow (project_id, updated_at) VALUES (?, ?)
    """, (pid, ts))

    # Initialize final concept
    conn.execute("""
        INSERT OR IGNORE INTO final_concept (project_id, updated_at) VALUES (?, ?)
    """, (pid, ts))

    # Initialize walkthrough
    conn.execute("""
        INSERT OR IGNORE INTO walkthrough (project_id, updated_at) VALUES (?, ?)
    """, (pid, ts))

    # Initialize forma workflow steps
    forma_steps = [
        (1, "Create Site in Forma", "Log in to Autodesk Forma and create new site project"),
        (2, "Define Site Limits", "Draw site boundary polygon >= 1.0 km²"),
        (3, "Add Contextual Data", "Import surrounding context buildings, roads, terrain"),
        (4, "Add Buildings — Proposal A", "Model building massing for Proposal A"),
        (5, "Add Landscaping — Proposal A", "Add green areas, parks for Proposal A"),
        (6, "Add Transportation — Proposal A", "Add roads, transit, pedestrian paths for Proposal A"),
        (7, "Add Buildings — Proposal B", "Model building massing for Proposal B"),
        (8, "Add Landscaping — Proposal B", "Add green-blue network for Proposal B"),
        (9, "Add Transportation — Proposal B", "Add mobility corridors for Proposal B"),
        (10, "Run All 8 Forma Analyses", "Area, Carbon, Sun Hours, Daylight, Wind, Microclimate, Noise, Solar"),
        (11, "Forma Board Comparison", "Create Forma Board with proposals and analysis"),
        (12, "Export for Revit", "Export selected office building massing to Revit"),
    ]
    for idx, sname, sdesc in forma_steps:
        conn.execute("""
            INSERT INTO forma_workflow (id, project_id, step_index, step_name, step_description, status, updated_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
        """, (new_id(), pid, idx, sname, sdesc, ts))

    # Initialize proposals A and B
    for label in ["A", "B"]:
        prop_id = new_id()
        conn.execute("""
            INSERT INTO proposals (id, project_id, label, name, status, metrics, images, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'draft', '[]', '[]', ?, ?)
        """, (prop_id, pid, label, f"Proposal {label}", ts, ts))

        # Initialize all 8 analyses for each proposal
        for atype in ["area_metrics","embodied_carbon","sun_hours","daylight","wind","microclimate","noise","solar_energy"]:
            conn.execute("""
                INSERT INTO analyses (id, project_id, proposal_id, analysis_type,
                    status, provenance, updated_at)
                VALUES (?, ?, ?, ?, 'not_started', 'user', ?)
            """, (new_id(), pid, prop_id, atype, ts))

    # Initialize forma board frames
    frames = [
        (1, "Site & Problem"), (2, "Proposal A"), (3, "Proposal B"),
        (4, "Head-to-Head Analysis"), (5, "Final Decision")
    ]
    for fidx, ftitle in frames:
        conn.execute("""
            INSERT INTO forma_board (id, project_id, frame_index, frame_title,
                image_paths, metric_tags, updated_at)
            VALUES (?, ?, ?, ?, '[]', '[]', ?)
        """, (new_id(), pid, fidx, ftitle, ts))

    # Initialize presentation slides
    slide_titles = [
        "Title + Site + Local Problems",
        "Smart City Vision + Objectives",
        "Proposal A vs Proposal B Concepts",
        "Analysis-Driven Comparison",
        "Final Proposal + Rationale",
        "Revit Office Building + Sync Workflow",
        "Forma Board + Visuals + Impact",
    ]
    for sidx, stitle in enumerate(slide_titles, 1):
        conn.execute("""
            INSERT INTO presentation_slides (id, project_id, slide_index, title,
                image_paths, metrics, status, updated_at)
            VALUES (?, ?, ?, ?, '[]', '[]', 'empty', ?)
        """, (new_id(), pid, sidx, stitle, ts))

    # Initialize SIH checklist
    checklist_items = [
        "site_area","site_limits","context","landscaping","buildings","transportation",
        "proposal_a","proposal_b",
        "analysis_area","analysis_carbon","analysis_sun","analysis_daylight",
        "analysis_wind","analysis_microclimate","analysis_noise","analysis_solar",
        "forma_board","office_building","revit_export","revit_detailing",
        "revit_sync","rendered_images","walkthrough_30s","presentation_ppt","final_review"
    ]
    for key in checklist_items:
        conn.execute("""
            INSERT INTO sih_checklist (project_id, item_key, status, updated_at)
            VALUES (?, ?, 'pending', ?)
        """, (pid, key, ts))

    conn.commit()
    project = row_to_dict(conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone())
    conn.close()
    return success(project, 201)


@projects_bp.route("/<pid>", methods=["GET"])
def get_project(pid):
    conn = get_db()
    row = conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
    conn.close()
    if not row:
        return error("Project not found", 404)
    return success(row_to_dict(row))


@projects_bp.route("/<pid>", methods=["PUT"])
def update_project(pid):
    conn = get_db()
    existing = conn.execute("SELECT id FROM projects WHERE id = ?", (pid,)).fetchone()
    if not existing:
        conn.close()
        return error("Project not found", 404)

    data = request.json or {}
    ts = now_iso()
    conn.execute("""
        UPDATE projects SET
            name = COALESCE(?, name),
            city = COALESCE(?, city),
            state = COALESCE(?, state),
            location_name = COALESCE(?, location_name),
            site_area_km2 = COALESCE(?, site_area_km2),
            coordinates = COALESCE(?, coordinates),
            description = COALESCE(?, description),
            planning_org = COALESCE(?, planning_org),
            stage = COALESCE(?, stage),
            updated_at = ?
        WHERE id = ?
    """, (
        data.get("name"), data.get("city"), data.get("state"),
        data.get("location_name"),
        float(data["site_area_km2"]) if "site_area_km2" in data else None,
        json.dumps(data["coordinates"]) if "coordinates" in data else None,
        data.get("description"), data.get("planning_org"), data.get("stage"),
        ts, pid
    ))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone())
    conn.close()
    return success(row)


@projects_bp.route("/<pid>", methods=["DELETE"])
def delete_project(pid):
    conn = get_db()
    conn.execute("DELETE FROM projects WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return success({"deleted": pid})


@projects_bp.route("/<pid>/readiness", methods=["GET"])
def get_readiness(pid):
    conn = get_db()
    project = conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
    if not project:
        conn.close()
        return error("Project not found", 404)

    project = dict(project)
    site = conn.execute("SELECT * FROM site_info WHERE project_id = ?", (pid,)).fetchone()
    site = dict(site) if site else {}
    problems_count = conn.execute("SELECT COUNT(*) FROM local_problems WHERE project_id = ?", (pid,)).fetchone()[0]
    objectives_count = conn.execute("SELECT COUNT(*) FROM objectives WHERE project_id = ?", (pid,)).fetchone()[0]

    proposals = conn.execute("SELECT * FROM proposals WHERE project_id = ?", (pid,)).fetchall()
    prop_a = next((dict(p) for p in proposals if p["label"] == "A"), None)
    prop_b = next((dict(p) for p in proposals if p["label"] == "B"), None)

    analyses_a = conn.execute("""
        SELECT COUNT(*) FROM analyses
        WHERE project_id = ? AND proposal_id = ? AND status != 'not_started'
    """, (pid, prop_a["id"] if prop_a else "")).fetchone()[0] if prop_a else 0

    analyses_b = conn.execute("""
        SELECT COUNT(*) FROM analyses
        WHERE project_id = ? AND proposal_id = ? AND status != 'not_started'
    """, (pid, prop_b["id"] if prop_b else "")).fetchone()[0] if prop_b else 0

    final = conn.execute("SELECT * FROM final_concept WHERE project_id = ?", (pid,)).fetchone()
    final = dict(final) if final else {}

    forma_board_frames = conn.execute("""
        SELECT COUNT(*) FROM forma_board WHERE project_id = ? AND (description IS NOT NULL AND description != '')
    """, (pid,)).fetchone()[0]

    revit = conn.execute("SELECT * FROM revit_workflow WHERE project_id = ?", (pid,)).fetchone()
    revit = dict(revit) if revit else {}

    slides_filled = conn.execute("""
        SELECT COUNT(*) FROM presentation_slides WHERE project_id = ? AND status != 'empty'
    """, (pid,)).fetchone()[0]

    walkthrough = conn.execute("SELECT * FROM walkthrough WHERE project_id = ?", (pid,)).fetchone()
    walkthrough = dict(walkthrough) if walkthrough else {}

    items = {
        "site_area": project.get("site_area_km2", 0) >= 1.0,
        "site_boundary": bool(site.get("boundary_coords")),
        "local_problems": problems_count >= 1,
        "objectives": objectives_count >= 1,
        "proposal_a": bool(prop_a and prop_a.get("concept")),
        "proposal_b": bool(prop_b and prop_b.get("concept")),
        "analyses_a": analyses_a >= 8,
        "analyses_b": analyses_b >= 8,
        "comparison_notes": bool(final.get("rationale")),
        "final_concept": bool(final.get("selected_proposal")),
        "revit_workflow": bool(revit.get("building_name") and revit.get("export_status") != "pending"),
        "forma_board": forma_board_frames >= 3,
        "presentation": slides_filled >= 5,
        "walkthrough": bool(walkthrough.get("video_path") or walkthrough.get("video_url")),
    }

    passed = sum(1 for v in items.values() if v)
    score = round(passed / len(items) * 100)

    conn.close()
    return success({"items": items, "score": score, "passed": passed, "total": len(items)})
