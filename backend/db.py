import pymongo
from pymongo import MongoClient
from bson.objectid import ObjectId
import datetime
import hashlib
import secrets

import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/?serverSelectionTimeoutMS=2000")
DB_NAME = "CrimeRankingDB"

def get_db():
    client = MongoClient(MONGO_URI)
    return client[DB_NAME]

def init_db():
    try:
        db = get_db()
        db.users.create_index("email", unique=True)
        # Force a quick connection test to trigger the fast timeout if missing
        db.command("ping")
    except Exception as e:
        print(f"\n[WARNING] MongoDB Connection Failed: {e}\n[WARNING] The app will run, but database features (Login, History) will not work without MONGO_URI.\n")
    
def log_anomaly(crime_type, frame_path):
    try:
        db = get_db()
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db.crime_logs.insert_one({
            "timestamp": timestamp,
            "crime_type": crime_type,
            "frame_path": frame_path
        })
    except Exception:
        pass # Ignore db errors silently to keep video loop fast

def get_total_alerts():
    db = get_db()
    return db.crime_logs.count_documents({})

def get_recent_alerts(limit=20):
    db = get_db()
    # Sort by timestamp DESC
    cursor = db.crime_logs.find().sort("timestamp", -1).limit(limit)
    rows = list(cursor)
    
    return [
        {
            "id": str(row["_id"]),
            "timestamp": row.get("timestamp", ""),
            "crime_type": row.get("crime_type", ""),
            "frame_path": row.get("frame_path", "")
        }
        for row in rows
    ]

def _hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def create_user(full_name, email, password, role="Operator"):
    db = get_db()
    created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    password_hash = _hash_password(password)
    
    user_doc = {
        "full_name": full_name,
        "email": email.lower().strip(),
        "password_hash": password_hash,
        "role": role,
        "created_at": created_at
    }
    
    result = db.users.insert_one(user_doc)
    return get_user_by_id(str(result.inserted_id))

def get_user_by_email(email):
    db = get_db()
    user = db.users.find_one({"email": email.lower().strip()})
    if not user:
        return None
    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "created_at": user.get("created_at", ""),
        "password_hash": user.get("password_hash", "")
    }

def get_user_by_id(user_id):
    db = get_db()
    try:
        obj_id = ObjectId(user_id)
    except:
        return None
        
    user = db.users.find_one({"_id": obj_id})
    if not user:
        return None
        
    return {
        "id": str(user["_id"]),
        "full_name": user.get("full_name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "created_at": user.get("created_at", "")
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
    db = get_db()
    cursor = db.users.find().sort("created_at", -1)
    users = list(cursor)
    
    return [
        {
            "id": str(user["_id"]),
            "full_name": user.get("full_name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", ""),
            "created_at": user.get("created_at", "")
        }
        for user in users
    ]

def issue_token(user_id):
    return f"{user_id}:{secrets.token_hex(16)}"
    
# Initialize on import
init_db()
