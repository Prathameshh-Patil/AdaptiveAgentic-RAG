import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    
    # 1. Enable vector extension
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    # 2. Users table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 3. Queries table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_queries (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            query_text TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 4. Interests table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_interests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            interest_name TEXT NOT NULL,
            interest_category TEXT,
            confidence_score FLOAT,
            embedding VECTOR(768),
            last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, interest_name)
        );
    """)
    
    # Create a default user if not exists
    cur.execute("INSERT INTO users (username) VALUES ('Prishh') ON CONFLICT (username) DO NOTHING;")
    
    conn.commit()
    cur.close()
    conn.close()

def log_query(query_text):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = 'Prishh';")
    user_id = cur.fetchone()[0]
    
    cur.execute("INSERT INTO user_queries (user_id, query_text) VALUES (%s, %s);", (user_id, query_text))
    conn.commit()
    cur.close()
    conn.close()

def update_interest(interest_name, category, confidence, embedding):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = 'Prishh';")
    user_id = cur.fetchone()[0]
    
    cur.execute("""
        INSERT INTO user_interests (user_id, interest_name, interest_category, confidence_score, embedding, last_seen)
        VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, interest_name) DO UPDATE SET
            confidence_score = (user_interests.confidence_score + EXCLUDED.confidence_score) / 2,
            last_seen = CURRENT_TIMESTAMP;
    """, (user_id, interest_name, category, confidence, embedding))
    
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")
