from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error, get_current_user
import json

projects_bp = Blueprint("projects", __name__, url_prefix="/api/projects")


@projects_bp.route("", methods=["GET"])
def list_projects():
    conn = get_db()
    user = get_current_user(conn)
    if not user:
        conn.close()
        return error("Authentication required", 401)

    rows = conn.execute(
        "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
        (user["id"],)
    ).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@projects_bp.route("", methods=["POST"])
def create_project():
    conn = get_db()
    user = get_current_user(conn)
    if not user:
        conn.close()
        return error("Authentication required", 401)

    data = request.json or {}
    name = data.get("name", "").strip()
    if not name:
        conn.close()
        return error("Project name is required", 422)

    pid = new_id()
    ts = now_iso()

    # Calculate site area in km² (1 km² = 1,000,000 m²)
    site_area_km2 = float(data.get("site_area_km2", 0))

    conn.execute("""
        INSERT INTO projects (id, user_id, name, city, state, location_name, site_area_km2,
            coordinates, description, planning_org, stage, is_demo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'setup', 0, ?, ?)
    """, (
        pid,
        user["id"],
        name,
        data.get("city", "").strip(),
        data.get("state", "").strip(),
        data.get("location_name", "").strip(),
        site_area_km2,
        json.dumps(data.get("coordinates", {})),
        data.get("description", "").strip(),
        data.get("planning_org", "").strip(),
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
        (1, "Site Boundary Definition", "Establish boundary polygon (minimum 1.0 km² / 1,000,000 m²)"),
        (2, "Import Contextual Data", "Import terrain, surrounding roads, and existing building context"),
        (3, "Design Option 1 Massing", "Model building envelopes and spatial layout for Option 1"),
        (4, "Design Option 1 Landscape", "Model open spaces, green corridors, and public realm"),
        (5, "Design Option 1 Mobility", "Model road network, transit connections, and pedestrian routes"),
        (6, "Design Option 2 Massing", "Model building envelopes and spatial layout for Option 2"),
        (7, "Design Option 2 Landscape", "Model open spaces, green corridors, and public realm"),
        (8, "Design Option 2 Mobility", "Model road network, transit connections, and pedestrian routes"),
        (9, "Environmental Analysis Execution", "Run sun, daylight, wind, microclimate, noise, and solar analyses"),
        (10, "Comparative Evaluation", "Evaluate metrics and trade-offs between Option 1 and Option 2"),
        (11, "Presentation Board Assembly", "Document key evidence frames on the planning board"),
        (12, "Building Export & Detailed Modeling", "Export massing for architectural detailing and synchronization"),
    ]
    for idx, sname, sdesc in forma_steps:
        conn.execute("""
            INSERT INTO forma_workflow (id, project_id, step_index, step_name, step_description, status, updated_at)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
        """, (new_id(), pid, idx, sname, sdesc, ts))

    # Initialize Design Option 1 and Design Option 2
    # Both label "1"/"2" and label "A"/"B" references are supported
    options = [
        ("1", "Design Option 1"),
        ("2", "Design Option 2")
    ]
    for label, opt_name in options:
        prop_id = new_id()
        conn.execute("""
            INSERT INTO proposals (id, project_id, label, name, status, metrics, images, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'draft', '[]', '[]', ?, ?)
        """, (prop_id, pid, label, opt_name, ts, ts))

        # Initialize all 8 analyses for each option
        for atype in ["area_metrics", "embodied_carbon", "sun_hours", "daylight", "wind", "microclimate", "noise", "solar_energy"]:
            conn.execute("""
                INSERT INTO analyses (id, project_id, proposal_id, analysis_type,
                    status, provenance, updated_at)
                VALUES (?, ?, ?, ?, 'not_started', 'user', ?)
            """, (new_id(), pid, prop_id, atype, ts))

    # Initialize presentation board frames (6 frames)
    frames = [
        (1, "Site & Context"),
        (2, "Design Option 1"),
        (3, "Design Option 2"),
        (4, "Environmental Analysis"),
        (5, "Building / Revit Integration"),
        (6, "Final Concept")
    ]
    for fidx, ftitle in frames:
        conn.execute("""
            INSERT INTO forma_board (id, project_id, frame_index, frame_title,
                image_paths, metric_tags, updated_at)
            VALUES (?, ?, ?, ?, '[]', '[]', ?)
        """, (new_id(), pid, fidx, ftitle, ts))

    # Initialize presentation slides (7 slides)
    slide_titles = [
        "Title + Site Context & Challenges",
        "Planning Objectives & Benchmarks",
        "Design Option 1 vs Design Option 2",
        "Environmental Analysis & Evidence",
        "Final Concept Selection & Rationale",
        "Revit Detailing & Building Integration",
        "Forma Board & Strategic Implementation",
    ]
    for sidx, stitle in enumerate(slide_titles, 1):
        conn.execute("""
            INSERT INTO presentation_slides (id, project_id, slide_index, title,
                image_paths, metrics, status, updated_at)
            VALUES (?, ?, ?, ?, '[]', '[]', 'empty', ?)
        """, (new_id(), pid, sidx, stitle, ts))

    conn.commit()
    project = row_to_dict(conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone())
    conn.close()
    return success(project, 201)


@projects_bp.route("/<pid>", methods=["GET"])
def get_project(pid):
    conn = get_db()
    user = get_current_user(conn)
    row = conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
    if not row:
        conn.close()
        return error("Project not found", 404)

    # Check ownership if user is logged in and project has owner
    if user and row["user_id"] and row["user_id"] != user["id"]:
        conn.close()
        return error("Access denied to this project", 403)

    result = row_to_dict(row)
    conn.close()
    return success(result)


@projects_bp.route("/<pid>", methods=["PUT"])
def update_project(pid):
    conn = get_db()
    user = get_current_user(conn)
    existing = conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
    if not existing:
        conn.close()
        return error("Project not found", 404)

    if user and existing["user_id"] and existing["user_id"] != user["id"]:
        conn.close()
        return error("Access denied to update this project", 403)

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
        float(data["site_area_km2"]) if "site_area_km2" in data and data["site_area_km2"] is not None else None,
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
    user = get_current_user(conn)
    existing = conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
    if not existing:
        conn.close()
        return error("Project not found", 404)

    if user and existing["user_id"] and existing["user_id"] != user["id"]:
        conn.close()
        return error("Access denied to delete this project", 403)

    conn.execute("DELETE FROM projects WHERE id = ?", (pid,))
    conn.commit()
    conn.close()
    return success({"deleted": pid})


@projects_bp.route("/<pid>/readiness", methods=["GET"])
def get_readiness(pid):
    conn = get_db()
    user = get_current_user(conn)
    project = conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone()
    if not project:
        conn.close()
        return error("Project not found", 404)

    if user and project["user_id"] and project["user_id"] != user["id"]:
        conn.close()
        return error("Access denied", 403)

    project = dict(project)
    site = conn.execute("SELECT * FROM site_info WHERE project_id = ?", (pid,)).fetchone()
    site = dict(site) if site else {}
    problems_count = conn.execute("SELECT COUNT(*) FROM local_problems WHERE project_id = ?", (pid,)).fetchone()[0]
    objectives_count = conn.execute("SELECT COUNT(*) FROM objectives WHERE project_id = ?", (pid,)).fetchone()[0]

    proposals = conn.execute("SELECT * FROM proposals WHERE project_id = ?", (pid,)).fetchall()
    prop_1 = next((dict(p) for p in proposals if p["label"] in ("1", "A")), None)
    prop_2 = next((dict(p) for p in proposals if p["label"] in ("2", "B")), None)

    analyses_1 = conn.execute("""
        SELECT COUNT(*) FROM analyses
        WHERE project_id = ? AND proposal_id = ? AND status != 'not_started'
    """, (pid, prop_1["id"] if prop_1 else "")).fetchone()[0] if prop_1 else 0

    analyses_2 = conn.execute("""
        SELECT COUNT(*) FROM analyses
        WHERE project_id = ? AND proposal_id = ? AND status != 'not_started'
    """, (pid, prop_2["id"] if prop_2 else "")).fetchone()[0] if prop_2 else 0

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
        "option_1": bool(prop_1 and prop_1.get("concept")),
        "option_2": bool(prop_2 and prop_2.get("concept")),
        "analyses_1": analyses_1 >= 8,
        "analyses_2": analyses_2 >= 8,
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
