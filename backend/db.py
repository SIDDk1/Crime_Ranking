import sqlite3
import datetime
import os

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
    
# Initialize on import
init_db()
