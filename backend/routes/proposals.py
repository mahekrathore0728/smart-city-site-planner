from flask import Blueprint, request
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, rows_to_list, success, error
import json

proposals_bp = Blueprint("proposals", __name__, url_prefix="/api/projects")


@proposals_bp.route("/<pid>/proposals", methods=["GET"])
def list_proposals(pid):
    conn = get_db()
    rows = conn.execute("SELECT * FROM proposals WHERE project_id = ? ORDER BY label", (pid,)).fetchall()
    conn.close()
    return success(rows_to_list(rows))


@proposals_bp.route("/<pid>/proposals/<prop_id>", methods=["GET"])
def get_proposal(pid, prop_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM proposals WHERE id = ? AND project_id = ?", (prop_id, pid)).fetchone()
    conn.close()
    if not row:
        return error("Proposal not found", 404)
    return success(row_to_dict(row))


@proposals_bp.route("/<pid>/proposals/by-label/<label>", methods=["GET"])
def get_proposal_by_label(pid, label):
    conn = get_db()
    label_norm = label.strip().upper()
    valid_labels = [label_norm]
    if label_norm in ('1', 'A'):
        valid_labels = ['1', 'A']
    elif label_norm in ('2', 'B'):
        valid_labels = ['2', 'B']

    placeholders = ",".join("?" * len(valid_labels))
    row = conn.execute(
        f"SELECT * FROM proposals WHERE project_id = ? AND label IN ({placeholders}) LIMIT 1",
        [pid] + valid_labels
    ).fetchone()
    conn.close()
    if not row:
        return error("Design option not found", 404)
    return success(row_to_dict(row))


@proposals_bp.route("/<pid>/proposals/<prop_id>", methods=["PUT"])
def update_proposal(pid, prop_id):
    data = request.json or {}
    ts = now_iso()
    conn = get_db()
    existing = conn.execute("SELECT id FROM proposals WHERE id = ? AND project_id = ?", (prop_id, pid)).fetchone()
    if not existing:
        conn.close()
        return error("Proposal not found", 404)

    conn.execute("""
        UPDATE proposals SET
            name = COALESCE(?, name),
            concept = COALESCE(?, concept),
            description = COALESCE(?, description),
            planning_strategy = COALESCE(?, planning_strategy),
            transportation = COALESCE(?, transportation),
            buildings = COALESCE(?, buildings),
            landscaping = COALESCE(?, landscaping),
            density = COALESCE(?, density),
            advantages = COALESCE(?, advantages),
            tradeoffs = COALESCE(?, tradeoffs),
            notes = COALESCE(?, notes),
            status = COALESCE(?, status),
            metrics = COALESCE(?, metrics),
            images = COALESCE(?, images),
            updated_at = ?
        WHERE id = ? AND project_id = ?
    """, (
        data.get("name"), data.get("concept"), data.get("description"),
        data.get("planning_strategy"), data.get("transportation"),
        data.get("buildings"), data.get("landscaping"), data.get("density"),
        data.get("advantages"), data.get("tradeoffs"), data.get("notes"),
        data.get("status"),
        json.dumps(data["metrics"]) if "metrics" in data else None,
        json.dumps(data["images"]) if "images" in data else None,
        ts, prop_id, pid
    ))
    conn.commit()
    row = row_to_dict(conn.execute("SELECT * FROM proposals WHERE id = ?", (prop_id,)).fetchone())
    conn.close()
    return success(row)
