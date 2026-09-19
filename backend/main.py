# ================= IMPORTS =================
import os
import re
import sqlite3
import jwt
import datetime
import logging
from contextlib import contextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from werkzeug.security import generate_password_hash, check_password_hash

import joblib

# ================= CONFIG =================
SECRET = os.getenv("SECRET_KEY", "super_secure_production_key")
TOKEN_EXPIRE_HOURS = 24

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

DB_PATH = os.path.join(STORAGE_DIR, "truthlens.db")
MODEL_PATH = os.path.join(STORAGE_DIR, "news_model.pkl")
VEC_PATH = os.path.join(STORAGE_DIR, "vectorizer.pkl")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ================= APP =================
app = FastAPI(title="TruthLens API 🚀", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ================= DB =================
@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user'
        )
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            claim TEXT,
            claim_norm TEXT,
            label TEXT,
            confidence REAL,
            category TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

                # ================= CREATE ADMIN =================
        admin_email = os.getenv("ADMIN_EMAIL")
        admin_password = os.getenv("ADMIN_PASSWORD")

        if admin_email and admin_password:
            cur.execute(
                "SELECT id FROM users WHERE email=?",
                (admin_email.lower(),)
            )

            if not cur.fetchone():
                admin_hash = generate_password_hash(admin_password)

                cur.execute(
                    """
                    INSERT INTO users(name, email, password, role)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        "Administrator",
                        admin_email.lower(),
                        admin_hash,
                        "admin"
                    )
                )

                print("✅ Admin account created")

        conn.commit()

init_db()

# ================= MODEL =================
try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
    MODEL_READY = True

    print("MODEL PATH:", MODEL_PATH)
    print("VECTORIZER PATH:", VEC_PATH)
    print("MODEL TYPE:", type(model))

except Exception as e:
    logger.warning("Model not loaded: %s", e)
    MODEL_READY = False
    model = None
    vectorizer = None

# ================= HELPERS =================
def normalize(text):
    return re.sub(r"\W+", " ", text.lower()).strip()

def create_token(user_id, role):
    payload = {
        "id": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        return jwt.decode(credentials.credentials, SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except:
        raise HTTPException(401, "Invalid token")

def save_history(text, label, confidence):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
        INSERT INTO history (claim, claim_norm, label, confidence, category)
        VALUES (?, ?, ?, ?, ?)
        """, (text, normalize(text), label, confidence, "GENERAL"))
        conn.commit()

# ================= SCHEMAS =================
class Register(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)

class Login(BaseModel):
    email: EmailStr
    password: str

class Verify(BaseModel):
    text: str = Field(..., min_length=3)
    language: str = "English"
    depth: str = "Balanced"
    explain: str = "Detailed"

# ================= AUTH =================
@app.post("/api/auth/register")
def register(data: Register):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            hashed = generate_password_hash(data.password)

            cur.execute(
                "INSERT INTO users(name,email,password,role) VALUES (?,?,?,?)",
                (data.name.strip(), data.email.lower(), hashed, "user")
            )
            conn.commit()

            user_id = cur.lastrowid

        return {
            "success": True,
            "token": create_token(user_id, "user"),
            "user": {
                "id": user_id,
                "name": data.name,
                "email": data.email
            }
        }

    except sqlite3.IntegrityError:
        return {
            "success": False,
            "error": "Email already exists"
        }

    except Exception as e:
        print("REGISTER ERROR:", e)
        return {
            "success": False,
            "error": "Server error"
        }
@app.post("/api/auth/login")
def login(data: Login):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            cur.execute(
                "SELECT id,name,email,password,role FROM users WHERE email=?",
                (data.email.lower(),)
            )
            user = cur.fetchone()

        if not user:
            return {"success": False, "error": "User not found"}

        if not check_password_hash(user[3], data.password):
            return {"success": False, "error": "Wrong password"}

        return {
            "success": True,
            "token": create_token(user[0], user[4]),
            "role": user[4],
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }

    except Exception as e:
        print("LOGIN ERROR:", e)  # 🔥 logs में दिखेगा
        return {"success": False, "error": "Server error"}
# ================= VERIFY =================
@app.post("/api/verify")
def verify(data: Verify, user=Depends(verify_token)):

    print("LANGUAGE:", data.language)
    print("DEPTH:", data.depth)
    print("EXPLAIN:", data.explain)

    if not MODEL_READY:
        return {
            "label": "MODEL_NOT_READY",
            "confidence": 0,
            "explanation": "AI model is not loaded."
        }

    vec = vectorizer.transform([data.text])

    probs = model.predict_proba(vec)[0]

    false_prob = float(probs[0])
    true_prob = float(probs[1])

    confidence = max(false_prob, true_prob) * 100

    if true_prob >= 0.85:
        label = "TRUE"
    elif true_prob >= 0.65:
        label = "LIKELY_TRUE"
    elif true_prob >= 0.40:
        label = "UNVERIFIED"
    elif true_prob >= 0.20:
        label = "LIKELY_FALSE"
    else:
        label = "FALSE"

    save_history(data.text, label, round(confidence, 2))

    if confidence >= 85:
        reliability = "HIGH"
    elif confidence >= 65:
        reliability = "MEDIUM"
    else:
        reliability = "LOW"

    if data.explain == "Simple":
        explanation = (
            f"Claim classified as {label} "
            f"with {round(confidence,1)}% confidence."
        )

    elif data.explain == "Technical":
        explanation = (
            f"Model: LogisticRegression | "
            f"True Probability={round(true_prob*100,2)}% | "
            f"False Probability={round(false_prob*100,2)}%"
        )

    else:
        explanation = (
            f"The AI model analyzed the claim and "
            f"classified it as {label}. "
            f"Confidence level is "
            f"{round(confidence,1)}% "
            f"({reliability} reliability)."
        )

    return {
        "text": data.text,
        "label": label,
        "confidence": round(confidence, 2),
        "reliability": reliability,
        "true_probability": round(true_prob * 100, 2),
        "false_probability": round(false_prob * 100, 2),
        "language": data.language,
        "depth": data.depth,
        "explanation": explanation
    }

# ================= DASHBOARD =================
@app.get("/api/dashboard/stats")
def dashboard_stats(user=Depends(verify_token)):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            # Total Predictions
            cur.execute("SELECT COUNT(*) FROM history")
            total = cur.fetchone()[0] or 0

            # TRUE Predictions
            cur.execute("SELECT COUNT(*) FROM history WHERE label = ?", ("TRUE",))
            true_count = cur.fetchone()[0] or 0

            # FALSE Predictions
            cur.execute("SELECT COUNT(*) FROM history WHERE label = ?", ("FALSE",))
            false_count = cur.fetchone()[0] or 0

            # UNVERIFIED Predictions
            cur.execute("SELECT COUNT(*) FROM history WHERE label = ?", ("UNVERIFIED",))
            unverified_count = cur.fetchone()[0] or 0

            # Recent Activity
            cur.execute("""
                SELECT claim, label, timestamp
                FROM history
                ORDER BY timestamp DESC
                LIMIT 5
            """)

            recent = []
            rows = cur.fetchall()

            for row in rows:
                recent.append({
                    "text": row[0],
                    "label": row[1],
                    "date": row[2]
                })

            return {
                "success": True,
                "total": total,
                "true": true_count,
                "false": false_count,
                "unverified": unverified_count,
                "recent": recent
            }

    except Exception as e:
        print("DASHBOARD ERROR:", e)

        return {
            "success": False,
            "error": str(e),
            "total": 0,
            "true": 0,
            "false": 0,
            "unverified": 0,
            "recent": []
        }
# ================= HISTORY =================
@app.get("/history")
def get_history():

    try:
        with get_db() as conn:
            cur = conn.cursor()

            cur.execute("""
                SELECT claim,label,confidence,timestamp
                FROM history
                ORDER BY id DESC
            """)

            rows = cur.fetchall()

            return [
                {
                    "claim": row[0],
                    "label": row[1],
                    "confidence": row[2],
                    "time": row[3]
                }
                for row in rows
            ]

    except Exception as e:
        print("HISTORY ERROR:", e)
        return []

# ================= HEALTH =================
@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "TruthLens API Running"
    }
# ================= ROOT =================
@app.get("/")
def root():
    return {"message": "TruthLens API Running 🚀"}