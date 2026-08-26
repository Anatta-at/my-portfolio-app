import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('.env')

print("DATABASE_URL:", os.getenv("DATABASE_URL"))

try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    cursor.execute("SELECT clerk_id, role FROM users LIMIT 5;")
    print("Remote DB Users:")
    print(cursor.fetchall())
    conn.close()
except Exception as e:
    print("Error connecting to Remote DB:", e)

try:
    conn = psycopg2.connect(
        dbname="intelliport_db", user="admin", password="Heyrose05", host="localhost", port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT clerk_id, role FROM users LIMIT 5;")
    print("Local DB Users:")
    print(cursor.fetchall())
    conn.close()
except Exception as e:
    print("Error connecting to Local DB:", e)
