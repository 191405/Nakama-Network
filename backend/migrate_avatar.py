
import sqlite3
import os

# Use the same path as database.py
DB_PATH = "sql_app.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print("Database not found, skipping migration (tables will be created fresh).")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN avatar VARCHAR")
        conn.commit()
        print("Successfully added 'avatar' column to messages table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("'avatar' column already exists.")
        else:
            print(f"Migration error: {e}")
            
    conn.close()

if __name__ == "__main__":
    migrate()
