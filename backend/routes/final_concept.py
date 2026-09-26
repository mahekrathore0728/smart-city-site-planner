from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, row_to_dict, rows_to_list, success, error
import json

final_bp = Blueprint("final", __name__, url_prefix="/api/projects")


@final_bp.route("/<pid>/final", methods=["GET"])
def get_final(pid):
    conn = get_db()
    row = conn.execute("SELECT * FROM final_concept WHERE project_id = ?", (pid,)).fetchone()
    conn.close()
    return success(row_to_dict(row) if row else {})


@final_bp.route("/<pid>/final", methods=["PUT"])
def update_final(pid):
    data = request.json or {}
    ts = now_iso()
    selected = data.get("selected_proposal")
    if selected and selected not in ("A", "B", "hybrid"):
        return error("selected_proposal must be A, B, or hybrid")

    conn = get_db()
    conn.execute("""
        INSERT INTO final_concept (project_id, selected_proposal, rationale, key_evidence,
            tradeoffs, planning_priorities, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET
            selected_proposal = COALESCE(excluded.selected_proposal, selected_proposal),
            rationale = COALESCE(excluded.rationale, rationale),
            key_evidence = COALESCE(excluded.key_evidence, key_evidence),
            tradeoffs = COALESCE(excluded.tradeoffs, tradeoffs),
            planning_priorities = COALESCE(excluded.planning_priorities, planning_priorities),
            notes = COALESCE(excluded.notes, notes),
            updated_at = excluded.updated_at
    """, (pid, selected, data.get("rationale"), data.get("key_evidence"),
          data.get("tradeoffs"), data.get("planning_priorities"), data.get("notes"), ts))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM final_concept WHERE project_id = ?", (pid,)).fetchone())
    conn.close()
    return success(row)


# Forma Board
@final_bp.route("/<pid>/forma-board", methods=["GET"])
def get_forma_board(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM forma_board WHERE project_id = ? ORDER BY frame_index", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@final_bp.route("/<pid>/forma-board/<frame_id>", methods=["PUT"])
def update_forma_board_frame(pid, frame_id):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    conn.execute("""
        UPDATE forma_board SET
            frame_title = COALESCE(?, frame_title),
            description = COALESCE(?, description),
            image_paths = COALESCE(?, image_paths),
            metric_tags = COALESCE(?, metric_tags),
            decision_notes = COALESCE(?, decision_notes),
            notes = COALESCE(?, notes),
            updated_at = ?
        WHERE id = ? AND project_id = ?
    """, (
        data.get("frame_title"), data.get("description"),
        json.dumps(data["image_paths"]) if "image_paths" in data else None,
        json.dumps(data["metric_tags"]) if "metric_tags" in data else None,
        data.get("decision_notes"), data.get("notes"),
        ts, frame_id, pid
    ))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM forma_board WHERE id = ?", (frame_id,)).fetchone())
    conn.close()
    return success(row)
