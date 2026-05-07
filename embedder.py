import sqlite3
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

# Path for SQlite database is also the same as config
DB_PATH = Path.home() / '.yt-note' / 'embeddings.db'

_model = None

def get_model():

    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def init_db():
    """
    Create embeddings table if not alredy exists: 

    Schema:
        note_path  — unique identifier (the file path), prevents duplicates
        title      — note title for display in search results
        summary    — the text that was embedded, for showing snippets
        embedding  — the vector as raw bytes (BLOB)
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS embeddings (
            note_path TEXT PRIMARY KEY,
            title TEXT,
            summary TEXT,
            embedding BLOB
        )
    ''')
    conn.commit()
    conn.close()\
    
def embed_text(text):
    model = get_model()
    return model.encode(text, convert_to_numpy=True).astype(np.float32)

def store_embedding(note_path, title, summary):
    init_db()

    embedding = embed_text(summary)
    blob = embedding.tobytes()

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    cursor.execute(
        'INSERT OR REPLACE INTO embeddings (note_path, title, summary, embedding) VALUES (?, ?, ?, ?)',
        (note_path, title, summary, blob)
    )
    conn.commit()
    conn.close()

def search_embedding(query, top_n=5):
    """
    Currently going with a brute force search approach. For a small number of test notes.
    Embeds query text and compares vs stored. Embedding with cosine similarity. Returns top N matches.

    Args:
        query: string to search for
        top_n: number of results to return

    Returns:
    List of dicts sorted by relevance (highest first):
        [
            {
                'note_path': '/path/to/note.md',
                'title': 'How Compound Interest Works',
                'summary': 'Compound interest is...',
                'score': 0.94
            },
            ...
        ]
    """

    init_db()

    query_embedding = embed_text(query)

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute('SELECT note_path, title, summary, embedding FROM embeddings')
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return []
    
    results = []
    for note_path, title, summary, blob in rows:
        stored_embedding = np.frombuffer(blob, dtype=np.float32)
        score = cosine_similarity(query_embedding, stored_embedding)
        results.append({
            'note_path': note_path,
            'title': title,
            'summary': summary,
            'score': score
        })

    results.sort(key=lambda r: r['score'], reverse=True)
    return results[:top_n]

def cosine_similarity(a, b):
    """
    Measures how similar the direction of two vectors is,
    ignoring their magnitude. Returns a value between -1 and 1:
      1.0  = identical meaning
      0.0  = completely unrelated
     -1.0  = opposite meaning
     """
    
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)

def get_embedding_count():
    """
    Return total number notes embedded
    
    Useful for displaing "Searching across N notes in the UI"
    """

    init_db()
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM embeddings')
    count = cursor.fetchone()[0]
    conn.close()
    return count