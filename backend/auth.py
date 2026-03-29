import os
import sqlite3
import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# ================= CONFIG =================
SECRET = "supersecretkey"

# ================= PATH FIX =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "truthlens.db")


# ================= DB HELPER =================
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ================= REGISTER =================
def register_user(name, email, password):

    conn = get_connection()
    cur = conn.cursor()

    hashed = generate_password_hash(password)

    try:
        cur.execute(
            "INSERT INTO users (name,email,password) VALUES (?,?,?)",
            (name, email, hashed)
        )
        conn.commit()

        user_id = cur.lastrowid

        token = jwt.encode(
            {
                "id": user_id,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
            },
            SECRET,
            algorithm="HS256"
        )

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email
            }
        }

    except sqlite3.IntegrityError:
        return {"success": False, "error": "Email already exists"}

    finally:
        conn.close()


# ================= LOGIN =================
def login_user(email, password):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id,password,name,email FROM users WHERE email=?",
        (email,)
    )

    user = cur.fetchone()
    conn.close()

    if not user:
        return {"success": False, "error": "Invalid credentials"}

    user_id, hashed, name, email = user

    if not check_password_hash(hashed, password):
        return {"success": False, "error": "Invalid credentials"}

    token = jwt.encode(
        {
            "id": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        },
        SECRET,
        algorithm="HS256"
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }


# ================= VERIFY TOKEN =================
def verify_token(token):

    try:
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        return {"valid": True, "user_id": data["id"]}

    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired"}

    except Exception:
        return {"valid": False, "error": "Invalid token"}