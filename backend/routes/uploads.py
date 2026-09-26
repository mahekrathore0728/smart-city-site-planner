import os
import uuid
from flask import Blueprint, request, current_app
from .helpers import success, error

uploads_bp = Blueprint("uploads", __name__, url_prefix="/api")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "pdf", "mp4", "mov", "webm"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@uploads_bp.route("/uploads", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return error("No file provided")
    file = request.files["file"]
    if not file.filename:
        return error("Empty filename")
    if not allowed_file(file.filename):
        return error(f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    ext = file.filename.rsplit(".", 1)[1].lower()
    safe_name = f"{uuid.uuid4()}.{ext}"
    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], safe_name)
    file.save(save_path)
    url = f"/uploads/{safe_name}"
    return success({"url": url, "filename": safe_name, "original": file.filename}, 201)
