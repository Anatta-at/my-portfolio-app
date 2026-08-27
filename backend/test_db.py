import psycopg2
import os
from dotenv import load_dotenv

# ✅ แก้ไข: โหลด .env ก่อน แล้วอ่าน password จาก env var
# ก่อน: password="Heyrose05" hardcode ตรงๆ
# หลัง: อ่านจาก .env ไฟล์ → รันได้ปลอดภัย ไม่ต้อง hardcode
load_dotenv()

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
    cursor = conn.cursor()
    cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assets';")
    columns = cursor.fetchall()
    print("Assets Table Columns:")
    for col in columns:
        print(f"- {col[0]} ({col[1]})")
        
    cursor.execute("SELECT ticker, sector FROM assets LIMIT 5;")
    rows = cursor.fetchall()
    print("\nSample Data:")
    for row in rows:
        print(row)
        
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")

