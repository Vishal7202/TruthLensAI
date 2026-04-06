# ================= IMPORTS =================
import os
import re
import sqlite3
import jwt
import datetime
import logging

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from werkzeug.security import generate_password_hash, check_password_hash
from fastapi.responses import JSONResponse

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
app = FastAPI(title="TruthLens API 🚀", version="3.0")

app.add_middleware(
    CORSMiddleware,
   allow_origins=["https://truthlens-self.vercel.app"], # 👉 production me yaha apna frontend URL daalna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ================= DB =================
def get_db():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    conn = get_db()
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
    conn.close()
init_db()

# ================= MODEL =================
try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
    MODEL_READY = True
except:
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
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def save_history(text, label, confidence):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO history (claim, claim_norm, label, confidence, category)
    VALUES (?, ?, ?, ?, ?)
    """, (text, normalize(text), label, confidence, "GENERAL"))

    conn.commit()
    conn.close()

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

# 🔥 SIGNUP
@app.post("/register")
def register(data: Register):
    conn = get_db()
    cur = conn.cursor()

    hashed = generate_password_hash(data.password)

    try:
        role = "user"

        cur.execute(
            "INSERT INTO users(name,email,password,role) VALUES (?,?,?,?)",
            (data.name, data.email, hashed, role)
        )

        conn.commit()
        user_id = cur.lastrowid

    except:
        raise HTTPException(400, "Email already exists")

    finally:
        conn.close()

    return {
    "token": create_token(user_id, role),
    "role": role,
    "user": {
        "id": user_id,
        "name": data.name,
        "email": data.email
    }
}
# 🔥 LOGIN
@app.post("/login")
def login(data: Login):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id,name,email,password,role FROM users WHERE email=?", (data.email,))
    user = cur.fetchone()
    conn.close()

    if not user or not check_password_hash(user[3], data.password):
        raise HTTPException(401, "Invalid credentials")

    return {
        "token": create_token(user[0], user[4]),
        "role": user[4],
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2]
        }
    }

# 🔥 ADMIN PROTECTION
def admin_only(user=Depends(verify_token)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admin access only")
    return user

# ================= VERIFY =================
@app.post("/verify")
def verify(data: Verify, user=Depends(verify_token)):
    if not MODEL_READY:
        return {
            "text": data.text,
            "label": "MODEL_NOT_READY",
            "confidence": 0
        }

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
@app.get("/dashboard/stats")
def dashboard_stats(user=Depends(verify_token)):
    conn = get_db()
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

    recent = [
        {"text": r[0], "label": r[1], "date": r[2]}
        for r in cur.fetchall()
    ]

    conn.close()

    return {
        "total": total,
        "true": true,
        "false": false,
        "unverified": unverified,
        "recent": recent
    }

# ================= ROOT =================
@app.get("/", include_in_schema=False)
def root():
    return {"message": "TruthLens API running 🚀"}