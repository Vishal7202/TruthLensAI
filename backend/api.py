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

#from pdf2image import convert_from_bytes
import pytesseract
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

# ================= ROOT =================
@app.get("/")
def root():
    return {"message": "TruthLensAI Backend Running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ================= PATH CONFIG =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "storage", "news_model.pkl")
VEC_PATH = os.path.join(BASE_DIR, "storage", "vectorizer.pkl")
DB_PATH = os.path.join(BASE_DIR, "storage", "truthlens.db")

# ================= CONFIG =================
SECRET = "my_ultra_secure_secret_key_1234567890"
security = HTTPBearer()
DB = DB_PATH


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

# ================= AUTO CREATE TABLE =================
conn = get_db()
cur = conn.cursor()

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


import os
import spacy
import joblib
from sentence_transformers import SentenceTransformer

# ================= MODELS =================

# 🔹 Spacy safe load
try:
    nlp = spacy.load("en_core_web_sm")
except:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# 🔹 Sentence Transformer safe load
try:
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
except:
    embedder = None

# 🔹 ML Model safe load
try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
except:
    model = None
    vectorizer = None

# ================= UTILITIES =================

def normalize_claim(text: str):
    text = text.lower()
    text = re.sub(r"[^\w\s°]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_text_from_pdf(file_bytes):
    reader = PdfReader(BytesIO(file_bytes))

    full_text = ""
    for page in reader.pages:
        t = page.extract_text()
        if t:
            full_text += t + " "

    if not full_text.strip():
        images = convert_from_bytes(file_bytes)
        for img in images:
            full_text += pytesseract.image_to_string(img) + " "

    return full_text.strip()


def split_into_claims(text):
    doc = nlp(text)
    raw = []

    for sent in doc.sents:
        parts = re.split(r"\b(and|but|or)\b", sent.text, flags=re.I)

        buf = ""
        for p in parts:
            if p.lower() in ["and", "but", "or"]:
                if buf.strip():
                    raw.append(buf.strip())
                buf = ""
            else:
                buf += " " + p

        if buf.strip():
            raw.append(buf.strip())

    final = []
    seen = set()

    for c in raw:
        key = normalize_claim(c)
        if key not in seen and len(c.split()) > 2:
            seen.add(key)
            final.append(c.strip())

    return final


def science_override(claim):
    text = normalize_claim(claim)

    if "water" not in text or "boil" not in text:
        return None

    match = re.search(
        r"(\d+\.?\d*)\s*(degree\s*)?(celsius|°c|fahrenheit|°f|kelvin|k)",
        text
    )

    if not match:
        return None

    temp = float(match.group(1))
    unit = match.group(3)

    if unit in ["celsius", "°c"]:
        return ("TRUE", 0.95) if 99 <= temp <= 101 else ("FALSE", 0.95)

    if unit in ["fahrenheit", "°f"]:
        return ("TRUE", 0.95) if 210 <= temp <= 214 else ("FALSE", 0.95)

    if unit in ["kelvin", "k"]:
        return ("TRUE", 0.95) if 372 <= temp <= 374 else ("FALSE", 0.95)

    return None


def save_history_safe(claim, verdict, confidence, category):
    norm = normalize_claim(claim)

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT 1 FROM history WHERE claim_norm=?", (norm,))
    if cur.fetchone():
        conn.close()
        return

    cur.execute(
        "INSERT INTO history (claim, claim_norm, label, confidence, category) VALUES (?,?,?,?,?)",
        (claim, norm, verdict, confidence, category)
    )

    conn.commit()
    conn.close()



# ================= SCHEMAS =================
class ContactRequest(BaseModel):
    name: str
    email: str
    message: str


class VerifyRequest(BaseModel):
    text: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ================= AUTH ROUTES =================

@app.post("/register")
def register(data: RegisterRequest):

    conn = get_db()
    cur = conn.cursor()

    hashed = generate_password_hash(data.password)

    try:
        cur.execute(
            "INSERT INTO users (name,email,password) VALUES (?,?,?)",
            (data.name, data.email, hashed)
        )
        conn.commit()

        user_id = cur.lastrowid

    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already exists")

    finally:
        conn.close()

    token = jwt.encode(
        {
            "id": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        },
        SECRET,
        algorithm="HS256"
    )

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": data.name,
            "email": data.email
        }
    }


@app.post("/login")
def login(data: LoginRequest):

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT id,password,name,email FROM users WHERE email=?",
        (data.email,)
    )

    user = cur.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, hashed, name, email = user

    if not check_password_hash(hashed, data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
        {
            "id": user_id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        },
        SECRET,
        algorithm="HS256"
    )

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }


@app.get("/me")
def get_me(Authorization: str = Header(None)):

    if not Authorization:
        raise HTTPException(status_code=401, detail="No token")

    try:
        token = Authorization.replace("Bearer ", "")
        data = jwt.decode(token, SECRET, algorithms=["HS256"])

        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "SELECT id,name,email FROM users WHERE id=?",
            (data["id"],)
        )

        user = cur.fetchone()
        conn.close()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")



# ================= CONTACT =================

@app.post("/contact")
def contact(data: ContactRequest):
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "INSERT INTO contact_messages(name,email,message) VALUES (?,?,?)",
            (data.name, data.email, data.message)
        )

        conn.commit()
        conn.close()

        return {"success": True, "message": "Message received"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= VERIFY CORE =================

def verify_claim_logic(claim: str):

    category = "SCIENCE" if "boil" in claim.lower() else "GENERAL"

    override = science_override(claim)

    if override:
        verdict, confidence = override
        explanation = "Scientific fact about boiling point of water."

    else:
        try:
            evidence = wikipedia.summary(claim, sentences=2, auto_suggest=True)
        except:
            evidence = "No reliable evidence found."

        c_emb = embedder.encode(claim, convert_to_tensor=True)
        e_emb = embedder.encode(evidence, convert_to_tensor=True)
        similarity = float(util.cos_sim(c_emb, e_emb))

        vec = vectorizer.transform([claim])
        ml_prob = model.predict_proba(vec)[0][1]

        confidence = round((similarity + ml_prob) / 2, 2)

        if confidence > 0.75:
            verdict = "TRUE"
        elif confidence > 0.55:
            verdict = "PARTIALLY_TRUE"
        elif confidence > 0.35:
            verdict = "UNVERIFIED"
        elif confidence > 0.20:
            verdict = "MISLEADING"
        else:
            verdict = "FALSE"

        explanation = evidence[:200]

    save_history_safe(claim, verdict, confidence, category)

    return {
        "claim": claim,
        "label": verdict,
        "confidence": confidence,
        "category": category,
        "explanation": explanation
    }


# ================= VERIFY TEXT =================

@app.post("/verify")
def verify(data: VerifyRequest):
    try:
        claims = split_into_claims(data.text)
        return [verify_claim_logic(c) for c in claims]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= VERIFY PDF =================

@app.post("/verify-pdf")
async def verify_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        text = extract_text_from_pdf(contents)

        if not text:
            return {"error": "No readable text found"}

        claims = split_into_claims(text)[:5]
        return [verify_claim_logic(c) for c in claims]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================= HISTORY =================

@app.get("/history")
def get_history():
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute(
            "SELECT claim, label, confidence, category, timestamp "
            "FROM history ORDER BY id DESC LIMIT 50"
        )

        rows = cur.fetchall()
        conn.close()

        return [
            {
                "claim": r[0],
                "label": r[1],
                "confidence": r[2],
                "category": r[3],
                "time": r[4]
            }
            for r in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= DASHBOARD STATS =================

@app.get("/dashboard/stats")
def dashboard_stats(credentials: HTTPAuthorizationCredentials = Depends(security)):

    try:
        token = credentials.credentials
        jwt.decode(token, SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT label, claim FROM history")
        rows = cur.fetchall()

        total = len(rows)
        labels = [r[0] for r in rows]

        counter = Counter(labels)

        true_count = counter.get("TRUE", 0)
        false_count = counter.get("FALSE", 0)

        unverified_count = (
            counter.get("UNVERIFIED", 0)
            + counter.get("MISLEADING", 0)
            + counter.get("PARTIALLY_TRUE", 0)
        )

        cur.execute(
            "SELECT claim,label,timestamp FROM history ORDER BY id DESC LIMIT 5"
        )
        recent_rows = cur.fetchall()

        recent = [
            {
                "text": r[0],
                "label": r[1],
                "date": r[2] if r[2] else "recent"
            }
            for r in recent_rows
        ]

        cur.execute(
            """
            SELECT strftime('%w', timestamp) as day, COUNT(*)
            FROM history
            GROUP BY day
            """
        )

        raw = cur.fetchall()

        conn.close()

        daymap = {
            "0": "Sun", "1": "Mon", "2": "Tue", "3": "Wed",
            "4": "Thu", "5": "Fri", "6": "Sat"
        }

        traffic = [
            {"day": daymap.get(d, "?"), "checks": c}
            for d, c in raw
        ]

        return {
            "total": total,
            "true": true_count,
            "false": false_count,
            "unverified": unverified_count,
            "recent": recent,
            "traffic": traffic
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= CONTACT MESSAGES =================

@app.get("/contact-messages")
def get_contact_messages(credentials: HTTPAuthorizationCredentials = Depends(security)):

    try:
        token = credentials.credentials
        jwt.decode(token, SECRET, algorithms=["HS256"])

    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id,name,email,message,created_at
        FROM contact_messages
        WHERE name!='string'
        ORDER BY id DESC
        LIMIT 50
    """)

    rows = cur.fetchall()
    conn.close()

    return [
        {
            "id": r[0],
            "name": r[1],
            "email": r[2],
            "message": r[3],
            "time": r[4]
        }
        for r in rows
    ]


@app.delete("/contact-messages/{msg_id}")
def delete_contact_message(
    msg_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    try:
        token = credentials.credentials
        jwt.decode(token, SECRET, algorithms=["HS256"])

    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    conn = get_db()
    cur = conn.cursor()

    cur.execute("DELETE FROM contact_messages WHERE id=?", (msg_id,))
    conn.commit()
    conn.close()

    return {"success": True}