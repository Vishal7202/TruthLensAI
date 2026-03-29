# ============================================
# TRUTHLENS AI - TRAINING ENGINE (PRO VERSION)
# ============================================

import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# ================= PATH CONFIG =================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset")
MODEL_DIR = os.path.join(BASE_DIR, "backend", "model")

os.makedirs(MODEL_DIR, exist_ok=True)

# ================= TRAINING =================

print("🚀 Starting Training...")

fake = pd.read_csv(os.path.join(DATASET_PATH, "Fake.csv"))
true = pd.read_csv(os.path.join(DATASET_PATH, "True.csv"))

fake["label"] = 0
true["label"] = 1

data = pd.concat([fake, true])[["text", "label"]]

X_train, X_test, y_train, y_test = train_test_split(
    data["text"], data["label"], test_size=0.2, random_state=42
)

vectorizer = TfidfVectorizer(stop_words="english", max_df=0.7)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = LogisticRegression(max_iter=1000)
model.fit(X_train_vec, y_train)

pred = model.predict(X_test_vec)
acc = accuracy_score(y_test, pred)

print(f"✅ Accuracy: {round(acc * 100, 2)}%")

# ================= SAVE MODEL =================

joblib.dump(model, os.path.join(MODEL_DIR, "news_model.pkl"))
joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))

print("🔥 Model saved successfully")

# ============================================
# ADVANCED AI ANALYSIS (OPTIONAL TEST MODE)
# ============================================

if __name__ == "__main__":

    from sentence_transformers import SentenceTransformer, util
    from transformers import pipeline
    import wikipedia
    import spacy
    import requests

    print("\n🧠 Loading Advanced AI Modules...")

    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    nli_model = pipeline("text-classification", model="facebook/bart-large-mnli")
    nlp = spacy.load("en_core_web_sm")

    print("✅ Advanced AI Ready\n")

    text = input("Enter claim: ").strip()
    claim = text.lower()

    # ================= CLAIM SPLIT =================
    doc = nlp(text)
    for sent in doc.sents:
        print("Detected Claim:", sent.text)

    # ================= FETCH SOURCES =================
    def fetch_sources(claim):
        sources = []

        try:
            results = wikipedia.search(claim)
            if results:
                page = wikipedia.page(results[0], auto_suggest=False)
                sources.append(("Wikipedia", page.summary[:800]))
        except:
            pass

        try:
            url = f"https://news.google.com/rss/search?q={claim}"
            res = requests.get(url)
            if res.status_code == 200:
                sources.append(("News", res.text[:800]))
        except:
            pass

        if not sources:
            sources.append(("Fallback", "No reliable evidence"))

        return sources

    sources = fetch_sources(claim)

    # ================= RANK =================
    claim_emb = embedder.encode(claim, convert_to_tensor=True)
    ranked = []

    for name, text in sources:
        emb = embedder.encode(text.lower(), convert_to_tensor=True)
        score = util.cos_sim(claim_emb, emb).item()
        ranked.append((name, text, score))

    ranked.sort(key=lambda x: x[2], reverse=True)
    best = ranked[0]

    print("\nTop Source:", best[0])

    # ================= NLI =================
    def nli_check(c, e):
        inp = f"Premise: {e} Hypothesis: {c}"
        res = nli_model(inp)[0]

        if res["label"] == "ENTAILMENT":
            return res["score"] * 100
        elif res["label"] == "CONTRADICTION":
            return -res["score"] * 100
        return 0

    sim = best[2] * 100
    nli = nli_check(claim, best[1])

    confidence = 0.3 * sim + 0.6 * nli + 0.1 * 80

    if confidence > 60:
        verdict = "TRUE"
    elif confidence > 30:
        verdict = "PARTIAL"
    elif confidence > 0:
        verdict = "UNVERIFIED"
    else:
        verdict = "FALSE"

    print("\nFINAL VERDICT:", verdict)
    print("Confidence:", round(confidence, 2), "%")