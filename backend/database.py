import os
import sqlite3
import re

# ================= PATH FIX =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "truthlens.db")

# ================= CONNECTION =================
conn = sqlite3.connect(
    DB_PATH,
    check_same_thread=False,
    isolation_level=None   # autocommit mode
)

cursor = conn.cursor()

# ================= PERFORMANCE SETTINGS =================
cursor.execute("PRAGMA journal_mode=WAL")
cursor.execute("PRAGMA synchronous=NORMAL")

# ================= HISTORY TABLE =================
cursor.execute("""
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim TEXT NOT NULL,
    claim_norm TEXT UNIQUE,
    label TEXT,
    confidence REAL,
    category TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

# ================= CONTACT MESSAGES TABLE =================
cursor.execute("""
CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

# ================= USERS TABLE =================
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

# ================= INDEX =================
cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_history_time
ON history(timestamp DESC)
""")

# ================= HELPER FUNCTION =================
def normalize_claim(text: str):
    text = text.lower()
    text = re.sub(r"[^\w\s°]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# ================= SAFE INSERT HISTORY =================
def insert_history_safe(claim, label, confidence, category):

    norm = normalize_claim(claim)

    try:
        cursor.execute(
            "INSERT INTO history (claim, claim_norm, label, confidence, category) VALUES (?,?,?,?,?)",
            (claim, norm, label, confidence, category)
        )
    except sqlite3.IntegrityError:
        pass