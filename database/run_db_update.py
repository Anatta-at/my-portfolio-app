import psycopg2
import os
from dotenv import load_dotenv

# โหลด environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

def run_sql_file(filename):
    conn = None
    cursor = None
    try:
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            conn = psycopg2.connect(db_url)
        else:
            conn = psycopg2.connect(
                dbname=os.getenv("DB_NAME", "intelliport_db"),
                user=os.getenv("DB_USER", "admin"),
                password=os.getenv("DB_PASSWORD", ""),
                host=os.getenv("DATABASE_HOST", "localhost"),
                port=os.getenv("DB_PORT", "5432")
            )
        conn.autocommit = True
        cursor = conn.cursor()
        
        with open(filename, 'r', encoding='utf-8') as file:
            sql_script = file.read()
            
        cursor.execute(sql_script)
        print("✅ Database schema updated successfully!")
        
    except Exception as e:
        print(f"❌ Error updating database: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(current_dir, "CS-01 Database.session.sql")
    run_sql_file(sql_path)
