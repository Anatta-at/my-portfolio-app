import yfinance as yf
import psycopg2

conn = psycopg2.connect(dbname="intelliport_db", user="admin", password="Heyrose05", host="localhost", port="5432")
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
