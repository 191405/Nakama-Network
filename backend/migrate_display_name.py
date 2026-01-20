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

    # Check if 'display_name' column exists in user_stats
    cursor.execute("PRAGMA table_info(user_stats)")
    columns = [col[1] for col in cursor.fetchall()]

    if 'display_name' not in columns:
        try:
            cursor.execute("ALTER TABLE user_stats ADD COLUMN display_name TEXT")
            conn.commit()
            print("Successfully added 'display_name' column to user_stats table.")
        except sqlite3.OperationalError as e:
            print(f"Migration failed: {e}")
    else:
        print("'display_name' column already exists in user_stats.")

    conn.close()

if __name__ == "__main__":
    migrate()
