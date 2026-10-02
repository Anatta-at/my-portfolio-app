"""
database/update_sectors.py
──────────────────────────
สคริปต์ย้ายข้อมูล Sector จาก Hardcode Dictionary ใน data_fetcher.py
เข้าไปเก็บในคอลัมน์ sector ของตาราง assets ใน PostgreSQL

รันครั้งเดียวก็พอครับ:
  python database/update_sectors.py
"""

import psycopg2
import os
from dotenv import load_dotenv

# โหลด .env จาก root directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# ข้อมูล Sector ของหุ้น SET50 ทั้ง 50 ตัว (ย้ายมาจาก data_fetcher.py)
SET50_SECTORS = {
    'ADVANC': 'Communication Services',
    'AOT':    'Industrials',
    'AWC':    'Consumer Cyclical',
    'BANPU':  'Energy',
    'BBL':    'Financial Services',
    'BDMS':   'Healthcare',
    'BEM':    'Industrials',
    'BH':     'Healthcare',
    'BJC':    'Industrials',
    'BTS':    'Industrials',
    'CBG':    'Consumer Defensive',
    'CCET':   'Technology',
    'CENTEL': 'Consumer Cyclical',
    'COM7':   'Consumer Cyclical',
    'CPALL':  'Consumer Defensive',
    'CPF':    'Consumer Defensive',
    'CPN':    'Real Estate',
    'CRC':    'Consumer Cyclical',
    'DELTA':  'Industrials',
    'EGCO':   'Utilities',
    'GPSC':   'Utilities',
    'GULF':   'Utilities',
    'HMPRO':  'Consumer Cyclical',
    'IVL':    'Basic Materials',
    'KBANK':  'Financial Services',
    'KKP':    'Financial Services',
    'KTB':    'Financial Services',
    'KTC':    'Financial Services',
    'LH':     'Real Estate',
    'MINT':   'Consumer Cyclical',
    'MTC':    'Financial Services',
    'OR':     'Energy',
    'OSP':    'Consumer Defensive',
    'PTT':    'Energy',
    'PTTEP':  'Energy',
    'PTTGC':  'Basic Materials',
    'RATCH':  'Utilities',
    'SAWAD':  'Financial Services',
    'SCB':    'Financial Services',
    'SCC':    'Industrials',
    'SCGP':   'Consumer Cyclical',
    'TCAP':   'Financial Services',
    'TIDLOR': 'Financial Services',
    'TISCO':  'Financial Services',
    'TLI':    'Financial Services',
    'TOP':    'Energy',
    'TRUE':   'Communication Services',
    'TTB':    'Financial Services',
    'TU':     'Consumer Defensive',
    'WHA':    'Real Estate',
}

def get_connection():
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return psycopg2.connect(db_url)
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "intelliport_db"),
        user=os.getenv("DB_USER", "admin"),
        password=os.getenv("DB_PASSWORD", ""),
        host=os.getenv("DATABASE_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )

def update_sectors():
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        updated = 0
        skipped = 0

        for ticker, sector in SET50_SECTORS.items():
            cursor.execute(
                "UPDATE assets SET sector = %s WHERE ticker = %s",
                (sector, ticker)
            )
            if cursor.rowcount > 0:
                updated += 1
                print(f"  ✅ {ticker:<10} → {sector}")
            else:
                skipped += 1
                print(f"  ⚠️  {ticker:<10} ไม่พบใน assets table (ข้ามไป)")

        conn.commit()
        cursor.close()

        print(f"\n{'─'*50}")
        print(f"✅ อัปเดตสำเร็จ : {updated} หุ้น")
        if skipped:
            print(f"⚠️  ข้ามไป       : {skipped} หุ้น (ไม่พบใน DB)")

    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🚀 เริ่มอัปเดต Sector ใน Database...")
    print(f"{'─'*50}")
    update_sectors()
