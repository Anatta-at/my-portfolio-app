import yfinance as yf
import psycopg2
import os
from dotenv import load_dotenv

# ✅ แก้ไข: อ่าน DB credentials จาก .env แทน hardcode
# ก่อน: password="Heyrose05" อยู่ตรงๆ บรรทัดแรก
# หลัง: โหลด .env แล้วอ่าน env var
load_dotenv()

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
cursor.execute("SELECT ticker FROM assets WHERE is_active = TRUE")
tickers = [row[0] for row in cursor.fetchall()]

sector_map = {}
for t in tickers:
    try:
        info = yf.Ticker(f"{t}.BK").info
        sector = info.get('sector', 'Unknown')
        sector_map[t] = sector
    except:
        sector_map[t] = 'Unknown'

print(sector_map)
