import psycopg2
import os

try:
    conn = psycopg2.connect(
        dbname="intelliport_db", user="admin", password="Heyrose05", host="localhost", port="5432"
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
