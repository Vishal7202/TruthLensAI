import os
import sqlite3
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# ================= CONFIG =================
SECRET = os.environ.get("JWT_SECRET", "supersecretkey")
TOKEN_EXP_DAYS = 7

# ================= PATH FIX =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "truthlens.db")


# ================= DB HELPER =================
def get_connection():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print("DB Connection Error:", e)
        return None


# ================= COMMON TOKEN GENERATOR =================
def generate_token(user_id):
    try:
        payload = {
            "id": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=TOKEN_EXP_DAYS)
        }
        return jwt.encode(payload, SECRET, algorithm="HS256")
    except Exception as e:
        print("Token Error:", e)
        return None


# ================= REGISTER =================
def register_user(name, email, password):

    if not name or not email or not password:
        return {"success": False, "error": "All fields are required"}

    conn = get_connection()
    if not conn:
        return {"success": False, "error": "Database connection failed"}

    cur = conn.cursor()

    try:
        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email=?", (email,))
        if cur.fetchone():
            return {"success": False, "error": "Email already exists"}

        hashed = generate_password_hash(password)

        cur.execute(
            "INSERT INTO users (name,email,password) VALUES (?,?,?)",
            (name.strip(), email.strip().lower(), hashed)
        )
        conn.commit()

        user_id = cur.lastrowid
        token = generate_token(user_id)

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "name": name.strip(),
                "email": email.strip().lower()
            }
        }

    except Exception as e:
        print("Register Error:", e)
        return {"success": False, "error": "Something went wrong"}

    finally:
        conn.close()


# ================= LOGIN =================
def login_user(email, password):

    if not email or not password:
        return {"success": False, "error": "Email and password required"}

    conn = get_connection()
    if not conn:
        return {"success": False, "error": "Database connection failed"}

    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id,password,name,email FROM users WHERE email=?",
            (email.strip().lower(),)
        )

        user = cur.fetchone()

        if not user:
            return {"success": False, "error": "Invalid credentials"}

        user_id, hashed, name, email = user

        if not check_password_hash(hashed, password):
            return {"success": False, "error": "Invalid credentials"}

        token = generate_token(user_id)

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email
            }
        }

    except Exception as e:
        print("Login Error:", e)
        return {"success": False, "error": "Something went wrong"}

    finally:
        conn.close()


# ================= VERIFY TOKEN =================
def verify_token(token):

    if not token:
        return {"valid": False, "error": "Token missing"}

    try:
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        return {"valid": True, "user_id": data["id"]}

    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired"}

    except jwt.InvalidTokenError:
        return {"valid": False, "error": "Invalid token"}

    except Exception as e:
        print("Verify Error:", e)
        return {"valid": False, "error": "Something went wrong"}