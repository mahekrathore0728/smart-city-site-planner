"""
Smart City Site Planner — Database Layer
SQLite schema initialization and demo seed data.
"""
import sqlite3
import os
import json
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")
DEMO_PROJECT_ID = "demo-sih-26114"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT,
        state TEXT,
        location_name TEXT,
        site_area_km2 REAL DEFAULT 0,
        coordinates TEXT,
        description TEXT,
        planning_org TEXT,
        stage TEXT DEFAULT 'setup',
        is_demo INTEGER DEFAULT 0,
        schema_version INTEGER DEFAULT 1,
        created_at TEXT,
        updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS site_info (
        project_id TEXT PRIMARY KEY,
        boundary_coords TEXT,
        site_limits_done INTEGER DEFAULT 0,
        landscaping_done INTEGER DEFAULT 0,
        buildings_done INTEGER DEFAULT 0,
        transportation_done INTEGER DEFAULT 0,
        context_notes TEXT,
        local_context TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS local_problems (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        title TEXT,
        description TEXT,
        category TEXT,
        severity TEXT DEFAULT 'medium',
        source TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS data_sources (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT,
        url TEXT,
        description TEXT,
        date_accessed TEXT,
        geographic_scope TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS objectives (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT,
        description TEXT,
        target TEXT,
        rationale TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        label TEXT NOT NULL,
        name TEXT,
        concept TEXT,
        description TEXT,
        planning_strategy TEXT,
        transportation TEXT,
        buildings TEXT,
        landscaping TEXT,
        density TEXT,
        advantages TEXT,
        tradeoffs TEXT,
        notes TEXT,
        status TEXT DEFAULT 'draft',
        metrics TEXT DEFAULT '[]',
        images TEXT DEFAULT '[]',
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        proposal_id TEXT NOT NULL,
        analysis_type TEXT NOT NULL,
        finding TEXT,
        design_response TEXT,
        result_value TEXT,
        result_unit TEXT,
        status TEXT DEFAULT 'not_started',
        provenance TEXT DEFAULT 'user',
        evidence_image_path TEXT,
        source TEXT,
        notes TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS forma_workflow (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        step_index INTEGER,
        step_name TEXT,
        step_description TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        evidence_path TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS revit_workflow (
        project_id TEXT PRIMARY KEY,
        building_name TEXT,
        building_role TEXT,
        forma_ref TEXT,
        revit_ref TEXT,
        export_status TEXT DEFAULT 'pending',
        sync_status TEXT DEFAULT 'pending',
        detailing_done INTEGER DEFAULT 0,
        analysis_rerun INTEGER DEFAULT 0,
        before_image TEXT,
        after_image TEXT,
        floor_plan_image TEXT,
        model_3d_image TEXT,
        facade_image TEXT,
        notes TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS forma_board (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        frame_index INTEGER,
        frame_title TEXT,
        description TEXT,
        image_paths TEXT DEFAULT '[]',
        metric_tags TEXT DEFAULT '[]',
        decision_notes TEXT,
        notes TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS final_concept (
        project_id TEXT PRIMARY KEY,
        selected_proposal TEXT,
        rationale TEXT,
        key_evidence TEXT,
        tradeoffs TEXT,
        planning_priorities TEXT,
        notes TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS presentation_slides (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        slide_index INTEGER,
        title TEXT,
        content_notes TEXT,
        image_paths TEXT DEFAULT '[]',
        metrics TEXT DEFAULT '[]',
        status TEXT DEFAULT 'empty',
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS walkthrough (
        project_id TEXT PRIMARY KEY,
        video_path TEXT,
        video_url TEXT,
        thumbnail_path TEXT,
        description TEXT,
        sequence_notes TEXT,
        updated_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS impact_metrics (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        category TEXT,
        metric_name TEXT,
        value TEXT,
        unit TEXT,
        baseline TEXT,
        source TEXT,
        method TEXT,
        proposal TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS implementation_phases (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        phase_index INTEGER,
        title TEXT,
        description TEXT,
        items TEXT DEFAULT '[]',
        timeline TEXT,
        notes TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT,
        role TEXT,
        module TEXT,
        responsibilities TEXT,
        evidence TEXT,
        created_at TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sih_checklist (
        project_id TEXT NOT NULL,
        item_key TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        updated_at TEXT,
        PRIMARY KEY (project_id, item_key),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    """)

    conn.commit()
    conn.close()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def seed_demo_project():
    """
    Seeds a clearly labeled DEMO project.
    All content is marked as DEMO / SAMPLE DATA.
    No fabricated Forma/Revit analysis results — all analysis data
    is marked as 'Evidence Required' or 'Awaiting Forma Result'.
    """
    conn = get_db()
    c = conn.cursor()

    existing = c.execute("SELECT id FROM projects WHERE id = ?", (DEMO_PROJECT_ID,)).fetchone()
    if existing:
        conn.close()
        return

    ts = now_iso()

    # Default User
    from werkzeug.security import generate_password_hash
    user_exists = c.execute("SELECT id FROM users WHERE email = 'planner@urbanplan.io'").fetchone()
    if not user_exists:
        c.execute("""
            INSERT INTO users (id, full_name, email, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, ("usr_demo", "Urban Planner", "planner@urbanplan.io", generate_password_hash("urbanplan2026"), ts))

    # Project
    c.execute("""
        INSERT INTO projects (id, name, city, state, location_name, site_area_km2,
            coordinates, description, planning_org, stage, is_demo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        DEMO_PROJECT_ID,
        "Pune Mixed-Use Development",
        "Pune", "Maharashtra",
        "Hinjewadi–Wakad Corridor, Pune",
        2.5,
        json.dumps({"lat": 18.5912, "lng": 73.7390, "zoom": 14}),
        "Sample urban site planning project for Hinjewadi–Wakad mixed-use corridor in Pune.",
        "Pune Municipal Corporation / PMRDA",
        "forma_workflow",
        1,
        ts, ts
    ))

    # Site info
    c.execute("""
        INSERT INTO site_info (project_id, boundary_coords, site_limits_done,
            landscaping_done, buildings_done, transportation_done, context_notes, local_context, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        DEMO_PROJECT_ID,
        json.dumps([
            [18.5950, 73.7350], [18.5950, 73.7450],
            [18.5870, 73.7450], [18.5870, 73.7350]
        ]),
        1, 1, 1, 1,
        "Hinjewadi–Wakad corridor — major IT hub with poor last-mile connectivity and urban heat stress.",
        "Pune Metropolitan Region, adjacent to IT parks and residential zones. Pimpri-Chinchwad Municipal Corporation area.",
        ts
    ))

    # Local problems
    problems = [
        ("demo-p1", "Traffic Congestion on NH-48", "Severe peak-hour congestion between Hinjewadi IT Park and Wakad node.", "mobility", "high", "PCMC Traffic Survey 2023"),
        ("demo-p2", "Urban Heat Island Effect", "Surface temperatures significantly higher than surrounding rural areas due to impervious surfaces.", "environment", "high", "IMD / ISRO Bhuvan Land Surface Temperature Data"),
        ("demo-p3", "Lack of Green Space", "Green coverage below recommended norms. No accessible public parks in 1 km radius.", "environment", "medium", "Pune Master Plan 2041"),
    ]
    for pid, title, desc, cat, sev, src in problems:
        c.execute("""
            INSERT INTO local_problems (id, project_id, title, description, category, severity, source, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (pid, DEMO_PROJECT_ID, title, desc, cat, sev, src, "", ts))

    # Data sources
    sources = [
        ("demo-s1", "Pune Master Plan 2041", "https://pmrda.gov.in", "Zoning, land use, and development plan for Pune Metropolitan Region.", "2023", "Pune Metropolitan Region"),
        ("demo-s2", "ISRO Bhuvan Portal", "https://bhuvan.nrsc.gov.in", "Satellite imagery and land use classification layers.", "2024", "Maharashtra"),
        ("demo-s3", "data.gov.in Urban Datasets", "https://data.gov.in", "Census data, infrastructure stats, and urban mobility datasets.", "2024", "India"),
    ]
    for sid, name, url, desc, date, scope in sources:
        c.execute("""
            INSERT INTO data_sources (id, project_id, name, url, description, date_accessed, geographic_scope, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sid, DEMO_PROJECT_ID, name, url, desc, date, scope, "", ts))

    # Objectives
    objectives = [
        ("demo-o1", "Improve Last-Mile Connectivity", "Reduce travel time from transit nodes to IT parks and residential areas.", "Reduce last-mile travel time by 30% from baseline", "Pune Metro Phase 2 alignment"),
        ("demo-o2", "Reduce Urban Heat Stress", "Increase green and blue coverage to lower surface temperatures.", "Achieve 30% green coverage across site", "IGBC Green Master Plan guidelines"),
        ("demo-o3", "Improve Walkability", "Create pedestrian-priority streets and secure footpaths connecting key destinations.", "Walkability score above 60 on Walk Score index", "National Urban Transport Policy"),
    ]
    for oid, name, desc, target, rationale in objectives:
        c.execute("""
            INSERT INTO objectives (id, project_id, name, description, target, rationale, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (oid, DEMO_PROJECT_ID, name, desc, target, rationale, "active", ts))

    # Proposals
    proposals_data = [
        (
            "demo-prop-a", DEMO_PROJECT_ID, "A",
            "Design Option A",
            "Transit-Oriented Compact Development",
            "Higher density mixed-use development concentrated around transit nodes, walkable streets, and compact urban form.",
            "Design Option A focuses on compact, transit-oriented development with density gradient from transit core to periphery.",
            "Metro feeder buses, shared mobility hubs at transit nodes, elevated pedestrian walkways",
            "Mixed-use towers (G+15 to G+25) at transit nodes, mid-rise residential at periphery",
            "Linear green corridors along streets, rooftop gardens, pocket parks",
            "High density at core (FSI 3.5–4.0), medium at periphery (FSI 1.5–2.0)",
            "High transit ridership potential, reduced car dependency, efficient land use",
            "Higher embodied carbon from dense construction, less ground-level green space"
        ),
        (
            "demo-prop-b", DEMO_PROJECT_ID, "B",
            "Design Option B",
            "Green-Blue Resilient Development",
            "Moderate density with emphasis on blue-green infrastructure, flood resilience, and urban cooling.",
            "Design Option B prioritizes environmental resilience with distributed green-blue network and lower building density.",
            "Green mobility corridors, cycling infrastructure, pedestrian priority streets",
            "Low-to-mid-rise buildings (G+4 to G+10), distributed across site with green buffers",
            "Extensive green network: wetlands, rain gardens, linear parks, tree canopy",
            "Moderate density throughout (FSI 1.5–2.5), more even distribution",
            "Lower heat stress, flood resilience, better daylight, biodiversity benefits",
            "Lower FAR means less housing/commercial capacity, may require more land area"
        )
    ]
    for p in proposals_data:
        c.execute("""
            INSERT INTO proposals (id, project_id, label, name, concept, description,
                planning_strategy, transportation, buildings, landscaping, density,
                advantages, tradeoffs, notes, status, metrics, images, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (*p, "", "draft",
              json.dumps([]), json.dumps([]), ts, ts))

    # Analyses — all marked as evidence_required, no fabricated numbers
    analysis_types = [
        "area_metrics", "embodied_carbon", "sun_hours",
        "daylight", "wind", "microclimate", "noise", "solar_energy"
    ]
    for proposal_id in ["demo-prop-a", "demo-prop-b"]:
        for atype in analysis_types:
            aid = f"demo-an-{proposal_id[-1].lower()}-{atype}"
            c.execute("""
                INSERT INTO analyses (id, project_id, proposal_id, analysis_type,
                    finding, design_response, result_value, result_unit,
                    status, provenance, evidence_image_path, source, notes, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                aid, DEMO_PROJECT_ID, proposal_id, atype,
                None, None, None, None,
                "evidence_required", "user", None,
                None, "Run site analysis and upload verified evidence.", ts
            ))

    # Forma workflow steps
    forma_steps = [
        (1, "Create Site Model", "Create site boundaries and contextual GIS data"),
        (2, "Define Site Limits", "Draw site boundary polygon >= 1.0 km²"),
        (3, "Add Contextual Data", "Import surrounding context buildings, roads, terrain"),
        (4, "Add Buildings — Option A", "Model building massing for Design Option A"),
        (5, "Add Landscaping — Option A", "Add green areas, parks, corridors for Design Option A"),
        (6, "Add Transportation — Option A", "Add roads, transit, pedestrian paths for Design Option A"),
        (7, "Add Buildings — Option B", "Model building massing for Design Option B"),
        (8, "Add Landscaping — Option B", "Add green-blue network for Design Option B"),
        (9, "Add Transportation — Option B", "Add mobility corridors for Design Option B"),
        (10, "Run Site Analyses", "Area Metrics, Carbon, Sun Hours, Daylight, Wind, Microclimate, Noise, Solar"),
        (11, "Design Board Comparison", "Create Design Board with both options and analysis results"),
        (12, "Export for BIM Modeling", "Export selected office building massing for detailed BIM modeling"),
    ]
    for idx, name, desc in forma_steps:
        c.execute("""
            INSERT INTO forma_workflow (id, project_id, step_index, step_name, step_description, status, notes, evidence_path, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"demo-forma-{idx}", DEMO_PROJECT_ID, idx, name, desc,
              "complete" if idx <= 3 else "pending", "", None, ts))

    # Revit workflow
    c.execute("""
        INSERT INTO revit_workflow (project_id, building_name, building_role, forma_ref, revit_ref,
            export_status, sync_status, detailing_done, analysis_rerun, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (DEMO_PROJECT_ID, "Hinjewadi Innovation Hub",
          "Mixed-use office building at transit node",
          "forma-model-ref-demo", None,
          "pending", "pending", 0, 0, "Complete detailed BIM modeling and performance re-evaluation.", ts))

    # Forma Board — 5 frames
    frames = [
        (1, "Site & Problem", "Overview of site location, area, and key local planning challenges."),
        (2, "Design Option A — Transit-Oriented", "Compact, high-density transit-oriented development concept."),
        (3, "Design Option B — Green-Blue Resilient", "Moderate density with extensive green-blue infrastructure."),
        (4, "Head-to-Head Analysis", "Side-by-side comparison of site analyses."),
        (5, "Final Decision & Rationale", "Selected option, key evidence, trade-offs, and planning priorities."),
    ]
    for fidx, ftitle, fdesc in frames:
        c.execute("""
            INSERT INTO forma_board (id, project_id, frame_index, frame_title, description,
                image_paths, metric_tags, decision_notes, notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"demo-fb-{fidx}", DEMO_PROJECT_ID, fidx, ftitle, fdesc,
              json.dumps([]), json.dumps([]), None, "", ts))

    # Presentation slides — 7
    slides = [
        (1, "Site + Local Problems", "Title, site location map, 3 key problems"),
        (2, "Vision + Objectives", "Vision statement and 3 planning objectives with targets"),
        (3, "Option A vs Option B", "Concept diagrams and key differentiators"),
        (4, "Analysis-Driven Comparison", "Site analyses side-by-side"),
        (5, "Final Concept + Rationale", "Selected concept with design decisions and evidence"),
        (6, "Detailed BIM Modeling", "Detailed office building and integration workflow"),
        (7, "Design Board + Impact", "Design Board visuals, impact metrics, and conclusion"),
    ]
    for sidx, stitle, snotes in slides:
        c.execute("""
            INSERT INTO presentation_slides (id, project_id, slide_index, title,
                content_notes, image_paths, metrics, status, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"demo-slide-{sidx}", DEMO_PROJECT_ID, sidx, stitle, snotes,
              json.dumps([]), json.dumps([]), "empty", ts))

    # SIH Checklist
    checklist_items = [
        "site_area", "site_limits", "context", "landscaping", "buildings", "transportation",
        "proposal_a", "proposal_b",
        "analysis_area", "analysis_carbon", "analysis_sun", "analysis_daylight",
        "analysis_wind", "analysis_microclimate", "analysis_noise", "analysis_solar",
        "forma_board", "office_building", "revit_export", "revit_detailing",
        "revit_sync", "rendered_images", "walkthrough_30s", "presentation_ppt", "final_review"
    ]
    for key in checklist_items:
        c.execute("""
            INSERT INTO sih_checklist (project_id, item_key, status, notes, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (DEMO_PROJECT_ID, key,
              "complete" if key in ("site_area", "site_limits", "context") else "pending",
              "", ts))

    conn.commit()
    conn.close()
    print("[DB] Demo project seeded successfully.")


if __name__ == "__main__":
    init_db()
    seed_demo_project()
    print("[DB] Database initialized.")
