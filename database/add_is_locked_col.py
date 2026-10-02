import os
import psycopg2
from dotenv import load_dotenv

# โหลด environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

def add_is_locked_column():
    db_host = os.getenv("DATABASE_HOST", "localhost")
    print(f"Connecting to DB at {db_host}...")
    
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        conn = psycopg2.connect(db_url)
    else:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME", "intelliport_db"),
            user=os.getenv("DB_USER", "admin"),
            password=os.getenv("DB_PASSWORD", ""),
            host=db_host,
            port=os.getenv("DB_PORT", "5432")
        )
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE portfolio_assets ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;")
        conn.commit()
        print("✅ Column 'is_locked' added successfully to 'portfolio_assets'.")
    except Exception as e:
        print(f"Error adding column: {e}")
        conn.rollback()
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    add_is_locked_column()
