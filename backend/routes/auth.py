import secrets
import re
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
from .helpers import now_iso, new_id, row_to_dict, success, error

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def is_valid_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip()))


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not full_name:
        return error("Full name is required", 422)
    if not email or not is_valid_email(email):
        return error("A valid email address is required", 422)
    if not password:
        return error("Password is required", 422)
    if len(password) < 6:
        return error("Password must be at least 6 characters long", 422)
    if confirm_password and password != confirm_password:
        return error("Passwords do not match", 422)

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return error("An account with this email already exists", 409)

    user_id = new_id()
    token = secrets.token_hex(32)
    ts = now_iso()
    pw_hash = generate_password_hash(password)

    conn.execute("""
        INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, email, pw_hash, full_name, ts, ts))

    conn.execute("""
        INSERT INTO user_tokens (token, user_id, created_at)
        VALUES (?, ?, ?)
    """, (token, user_id, ts))

    conn.commit()
    conn.close()

    return success({
        "user": {
            "id": user_id,
            "email": email,
            "full_name": full_name,
        },
        "token": token
    }, 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return error("Email and password are required", 422)

    conn = get_db()
    user_row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not user_row:
        conn.close()
        return error("Invalid email or password", 401)

    user = dict(user_row)
    if not check_password_hash(user["password_hash"], password):
        conn.close()
        return error("Invalid email or password", 401)

    token = secrets.token_hex(32)
    ts = now_iso()
    conn.execute("""
        INSERT INTO user_tokens (token, user_id, created_at)
        VALUES (?, ?, ?)
    """, (token, user["id"], ts))
    conn.commit()
    conn.close()

    return success({
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
        },
        "token": token
    })


@auth_bp.route("/me", methods=["GET"])
def get_me():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return error("Authentication token required", 401)
    token = auth_header.split(" ", 1)[1].strip()

    conn = get_db()
    row = conn.execute("""
        SELECT u.id, u.email, u.full_name, u.created_at
        FROM users u
        JOIN user_tokens t ON u.id = t.user_id
        WHERE t.token = ?
    """, (token,)).fetchone()
    conn.close()

    if not row:
        return error("Session expired or invalid token", 401)

    return success(dict(row))


@auth_bp.route("/logout", methods=["POST"])
def logout():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        conn = get_db()
        conn.execute("DELETE FROM user_tokens WHERE token = ?", (token,))
        conn.commit()
        conn.close()

    return success({"message": "Logged out successfully"})


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return error("Email is required", 422)

    # Local prototype / workspace response
    return success({
        "message": f"If an account exists for {email}, password recovery instructions have been initiated. For local workspace mode, you can sign up with a new profile or reset via workspace admin."
    })
