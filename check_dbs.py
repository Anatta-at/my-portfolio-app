import os
import psycopg2
from dotenv import load_dotenv

# ✅ แก้ไข: ทั้ง Remote และ Local DB ใช้ env var ครบแล้ว
# ก่อน: Local DB ส่วนล่างยังมี password="Heyrose05" hardcode
# หลัง: ทุกส่วนอ่านจาก .env เหมือนกันหมด
load_dotenv('.env')

print("DATABASE_URL:", os.getenv("DATABASE_URL"))

# ทดสอบ Remote DB (Cloud)
try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    cursor.execute("SELECT clerk_id, role FROM users LIMIT 5;")
    print("Remote DB Users:")
    print(cursor.fetchall())
    conn.close()
except Exception as e:
    print("Error connecting to Remote DB:", e)

# ทดสอบ Local DB
try:
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME", "intelliport_db"),
        user=os.getenv("DB_USER", "admin"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DATABASE_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )
    cursor = conn.cursor()
    cursor.execute("SELECT clerk_id, role FROM users LIMIT 5;")
    print("Local DB Users:")
    print(cursor.fetchall())
    conn.close()
except Exception as e:
    print("Error connecting to Local DB:", e)
