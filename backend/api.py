import os
import re
import sqlite3
import jwt
import datetime
from io import BytesIO
from collections import Counter

from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

import joblib
import spacy
import wikipedia
from sentence_transformers import SentenceTransformer, util
from PyPDF2 import PdfReader
from werkzeug.security import generate_password_hash, check_password_hash

# ================= APP =================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= PATH =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "storage", "truthlens.db")
MODEL_PATH = os.path.join(BASE_DIR, "storage", "news_model.pkl")
VEC_PATH = os.path.join(BASE_DIR, "storage", "vectorizer.pkl")

SECRET = "super_secret_key"
security = HTTPBearer()

# ================= DB =================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ================= INIT DB =================
def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
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

    cur.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ================= MODELS =================
nlp = spacy.load("en_core_web_sm")
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VEC_PATH)
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ================= HELPERS =================
def normalize_claim(text):
    return re.sub(r'\W+', ' ', text.lower()).strip()

def save_history(claim, label, confidence, category):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    INSERT INTO history (claim, claim_norm, label, confidence, category)
    VALUES (?, ?, ?, ?, ?)
    """, (claim, normalize_claim(claim), label, confidence, category))

    conn.commit()
    conn.close()

# ================= SCHEMAS =================
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyRequest(BaseModel):
    text: str

class ContactRequest(BaseModel):
    name: str
    email: str
    message: str

# ================= AUTH =================
@app.post("/register")
def register(data: RegisterRequest):
    conn = get_db()
    cur = conn.cursor()

    hashed = generate_password_hash(data.password)

    try:
        cur.execute("INSERT INTO users (name,email,password) VALUES (?,?,?)",
                    (data.name, data.email, hashed))
        conn.commit()
        user_id = cur.lastrowid
    except:
        raise HTTPException(400, "Email exists")
    finally:
        conn.close()

    token = jwt.encode({"id": user_id}, SECRET, algorithm="HS256")

    return {"token": token}

@app.post("/login")
def login(data: LoginRequest):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email=?", (data.email,))
    user = cur.fetchone()
    conn.close()

    if not user or not check_password_hash(user["password"], data.password):
        raise HTTPException(401, "Invalid credentials")

    token = jwt.encode({"id": user["id"]}, SECRET, algorithm="HS256")

    return {"token": token}

@app.post("/forgot-password")
def forgot(data: LoginRequest):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email=?", (data.email,))
    user = cur.fetchone()
    conn.close()

    if not user:
        raise HTTPException(404, "Email not found")

    return {"message": "Reset link sent (demo)"}

# ================= VERIFY =================
def verify_logic(text):
    vec = vectorizer.transform([text])
    prob = model.predict_proba(vec)[0][1]

    if prob > 0.7:
        label = "TRUE"
    elif prob > 0.4:
        label = "UNVERIFIED"
    else:
        label = "FALSE"

    save_history(text, label, prob, "GENERAL")

    return {
        "text": text,
        "label": label,
        "confidence": prob
    }

@app.post("/verify")
def verify(data: VerifyRequest):
    return verify_logic(data.text)

# ================= CONTACT =================
@app.post("/contact")
def contact(data: ContactRequest):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("INSERT INTO contact_messages(name,email,message) VALUES (?,?,?)",
                (data.name, data.email, data.message))

    conn.commit()
    conn.close()

    return {"success": True}

# ================= HISTORY =================
@app.get("/history")
def history():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM history ORDER BY id DESC LIMIT 20")
    rows = cur.fetchall()
    conn.close()

    return [dict(r) for r in rows]

# ================= ROOT =================
@app.get("/")
def root():
    return {"status": "running"}