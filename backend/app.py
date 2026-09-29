"""
Smart City Site Planner — SIH 26114
Flask Backend Application
"""
import os
import json
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from database import init_db, seed_demo_project

from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.site import site_bp
from routes.problems import problems_bp
from routes.sources import sources_bp
from routes.objectives import objectives_bp
from routes.proposals import proposals_bp
from routes.analyses import analyses_bp
from routes.forma import forma_bp
from routes.revit import revit_bp
from routes.final_concept import final_bp
from routes.presentation import presentation_bp
from routes.walkthrough import walkthrough_bp
from routes.team import team_bp
from routes.checklist import checklist_bp
from routes.uploads import uploads_bp
from routes.auth import auth_bp

def create_app():
    app = Flask(__name__, static_folder=None)
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})

    # Ensure upload directory exists
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = upload_dir
    app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024  # 32 MB

    # Initialize database
    init_db()

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(site_bp)
    app.register_blueprint(problems_bp)
    app.register_blueprint(sources_bp)
    app.register_blueprint(objectives_bp)
    app.register_blueprint(proposals_bp)
    app.register_blueprint(analyses_bp)
    app.register_blueprint(forma_bp)
    app.register_blueprint(revit_bp)
    app.register_blueprint(final_bp)
    app.register_blueprint(presentation_bp)
    app.register_blueprint(walkthrough_bp)
    app.register_blueprint(team_bp)
    app.register_blueprint(checklist_bp)
    app.register_blueprint(uploads_bp)

    @app.route("/api/health")
    def health():
        return jsonify({"ok": True, "data": {"status": "ok", "service": "Smart City Site Planner API", "version": "1.0.0"}})

    # Serve uploaded files
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"ok": False, "error": f"Endpoint not found: {request.path}"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"ok": False, "error": f"Method {request.method} not allowed for {request.path}"}), 405

    @app.errorhandler(500)
    def server_error(e):
        original = getattr(e, "original_exception", e)
        return jsonify({"ok": False, "error": f"Internal server error: {str(original)}"}), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            return jsonify({"ok": False, "error": e.description}), e.code
        return jsonify({"ok": False, "error": f"Server error: {str(e)}"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000, host="0.0.0.0")
