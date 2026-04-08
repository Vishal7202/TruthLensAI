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

        conn.commit()

init_db()

# ================= MODEL =================
try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
    MODEL_READY = True
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

# ================= AUTH =================
@app.post("/api/auth/register")
def register(data: Register):
    with get_db() as conn:
        cur = conn.cursor()

        hashed = generate_password_hash(data.password)

        try:
            cur.execute(
                "INSERT INTO users(name,email,password,role) VALUES (?,?,?,?)",
                (data.name.strip(), data.email.lower(), hashed, "user")
            )
            conn.commit()
            user_id = cur.lastrowid

        except sqlite3.IntegrityError:
          return {
                "success": False,
                "error": "Email already exists"
    }

    return {
        "success": True,
        "token": create_token(user_id, "user"),
        "user": {
            "id": user_id,
            "name": data.name,
            "email": data.email
        }
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
    if not MODEL_READY:
        return {"label": "MODEL_NOT_READY", "confidence": 0}

    vec = vectorizer.transform([data.text])
    prob = model.predict_proba(vec)[0][1]

    if prob > 0.7:
        label = "TRUE"
    elif prob > 0.4:
        label = "UNVERIFIED"
    else:
        label = "FALSE"

    save_history(data.text, label, prob)

    return {
        "text": data.text,
        "label": label,
        "confidence": round(prob, 3)
    }

# ================= DASHBOARD =================
@app.get("/api/dashboard/stats")
def dashboard_stats(user=Depends(verify_token)):
    with get_db() as conn:
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM history")
        total = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM history WHERE label='TRUE'")
        true = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM history WHERE label='FALSE'")
        false = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM history WHERE label='UNVERIFIED'")
        unverified = cur.fetchone()[0]

        cur.execute("""
        SELECT claim, label, timestamp
        FROM history
        ORDER BY timestamp DESC
        LIMIT 5
        """)

        recent = [{"text": r[0], "label": r[1], "date": r[2]} for r in cur.fetchall()]

    return {
        "total": total,
        "true": true,
        "false": false,
        "unverified": unverified,
        "recent": recent
    }

# ================= ROOT =================
@app.get("/")
def root():
    return {"message": "TruthLens API Running 🚀"}