import faiss
import numpy as np
import sqlite3
import pickle
import os
from sentence_transformers import SentenceTransformer

DB_NAME = "healthcare.db"
INDEX_FILE = "hospital_index.faiss"
CHUNKS_FILE = "hospital_chunks.pkl"

# Load model (runs once)
print("⏳ Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("✅ Embedding model loaded")

def build_index():
    """Build FAISS index from hospital data — run once"""
    print("🔨 Building RAG index from 987 hospitals...")
    
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name, address_city, address_stateOrRegion,
               facilityTypeId, specialties, capability,
               procedure, equipment, description,
               numberDoctors, capacity
        FROM hospitals
        WHERE name IS NOT NULL
    """)
    rows = cursor.fetchall()
    conn.close()

    chunks = []
    texts = []

    for r in rows:
        # Create rich text chunk for each hospital
        text = f"""
        Hospital: {r['name']}
        Location: {r['address_city']}, {r['address_stateOrRegion']}
        Type: {r['facilityTypeId']}
        Specialties: {r['specialties']}
        Capabilities: {r['capability']}
        Procedures: {r['procedure']}
        Equipment: {r['equipment']}
        Description: {r['description']}
        Doctors: {r['numberDoctors']}
        Beds: {r['capacity']}
        """.strip()

        chunks.append({
            "text": text,
            "name": r['name'],
            "city": r['address_city'] or 'Unknown',
            "region": r['address_stateOrRegion'] or 'Unknown',
            "facilityType": r['facilityTypeId'],
            "specialties": r['specialties'],
            "capability": r['capability'],
        })
        texts.append(text)

    print(f"📝 Creating embeddings for {len(texts)} hospitals...")
    embeddings = model.encode(texts, show_progress_bar=True)
    embeddings = np.array(embeddings).astype('float32')

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    # Build FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner product = cosine similarity
    index.add(embeddings)

    # Save index and chunks
    faiss.write_index(index, INDEX_FILE)
    with open(CHUNKS_FILE, 'wb') as f:
        pickle.dump(chunks, f)

    print(f"✅ RAG index built with {len(chunks)} hospitals!")
    return index, chunks

def load_index():
    """Load existing index or build new one"""
    if os.path.exists(INDEX_FILE) and os.path.exists(CHUNKS_FILE):
        print("📂 Loading existing RAG index...")
        index = faiss.read_index(INDEX_FILE)
        with open(CHUNKS_FILE, 'rb') as f:
            chunks = pickle.load(f)
        print(f"✅ Loaded index with {len(chunks)} hospitals")
        return index, chunks
    else:
        return build_index()

def semantic_search(query: str, k: int = 5):
    """Search hospitals using semantic similarity"""
    index, chunks = load_index()
    
    # Embed query
    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding).astype('float32')
    faiss.normalize_L2(query_embedding)
    
    # Search
    scores, indices = index.search(query_embedding, k)
    
    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < len(chunks):
            chunk = chunks[idx].copy()
            chunk['score'] = float(score)
            results.append(chunk)
    
    return results

# Load index on startup
_index, _chunks = None, None

def get_index():
    global _index, _chunks
    if _index is None:
        _index, _chunks = load_index()
    return _index, _chunks

# Pre-load
get_index()