import sqlite3
import datetime
import os
import hashlib
import secrets

DB_PATH = 'crime_logs.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS Crime_Logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            crime_type TEXT,
            frame_path TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Operator',
            created_at DATETIME NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def log_anomaly(crime_type, frame_path):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c.execute("INSERT INTO Crime_Logs (timestamp, crime_type, frame_path) VALUES (?, ?, ?)", 
              (timestamp, crime_type, frame_path))
    conn.commit()
    conn.close()

def get_total_alerts():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM Crime_Logs")
    count = c.fetchone()[0]
    conn.close()
    return count

def get_recent_alerts(limit=20):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        SELECT id, timestamp, crime_type, frame_path
        FROM Crime_Logs
        ORDER BY datetime(timestamp) DESC, id DESC
        LIMIT ?
        """,
        (limit,)
    )
    rows = c.fetchall()
    conn.close()
    return [
        {
            "id": row[0],
            "timestamp": row[1],
            "crime_type": row[2],
            "frame_path": row[3]
        }
        for row in rows
    ]

def _hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_user(full_name, email, password, role="Operator"):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    password_hash = _hash_password(password)
    try:
        c.execute(
            """
            INSERT INTO Users (full_name, email, password_hash, role, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (full_name, email.lower().strip(), password_hash, role, created_at)
        )
        conn.commit()
        user_id = c.lastrowid
    finally:
        conn.close()
    return get_user_by_id(user_id)

def get_user_by_email(email):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        SELECT id, full_name, email, role, created_at, password_hash
        FROM Users
        WHERE email = ?
        """,
        (email.lower().strip(),)
    )
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0],
        "full_name": row[1],
        "email": row[2],
        "role": row[3],
        "created_at": row[4],
        "password_hash": row[5]
    }

def get_user_by_id(user_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        SELECT id, full_name, email, role, created_at
        FROM Users
        WHERE id = ?
        """,
        (user_id,)
    )
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0],
        "full_name": row[1],
        "email": row[2],
        "role": row[3],
        "created_at": row[4]
    }

def verify_user(email, password):
    user = get_user_by_email(email)
    if not user:
        return None
    if user["password_hash"] != _hash_password(password):
        return None
    return {
        "id": user["id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"]
    }

def list_users():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        SELECT id, full_name, email, role, created_at
        FROM Users
        ORDER BY datetime(created_at) DESC, id DESC
        """
    )
    rows = c.fetchall()
    conn.close()
    return [
        {
            "id": row[0],
            "full_name": row[1],
            "email": row[2],
            "role": row[3],
            "created_at": row[4]
        }
        for row in rows
    ]

def issue_token(user_id):
    return f"{user_id}:{secrets.token_hex(16)}"
    
# Initialize on import
init_db()
