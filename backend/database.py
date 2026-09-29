"""
Smart City Site Planner — Database Layer
SQLite schema initialization.
"""
import sqlite3
import os
import json
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")


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
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT,
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
        schema_version INTEGER DEFAULT 2,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

    # Check if user_id column exists on projects (in case existing DB table didn't have it)
    try:
        c.execute("ALTER TABLE projects ADD COLUMN user_id TEXT")
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def seed_demo_project():
    """
    Deprecated / Disabled.
    No automatic demo projects are seeded.
    New users start with a clean, empty workspace.
    """
    pass


if __name__ == "__main__":
    init_db()
    print("[DB] Database initialized.")
