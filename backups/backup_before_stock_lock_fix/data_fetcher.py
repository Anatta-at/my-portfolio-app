# pyright: ignore [reportMissingImports, reportMissingModuleSource]
import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple
import warnings
import os
import redis
import pickle
import hashlib

warnings.filterwarnings("ignore")

def get_redis_client():
    host = os.getenv("REDIS_HOST", "localhost")
    try:
        client = redis.Redis(host=host, port=6379, db=0, socket_timeout=2)
        client.ping()
        return client
    except Exception as e:
        print(f"⚠️ Redis Connection Error: {e}")
        return None

def get_db_connection():
    # ✅ แก้ไข: ลบ hardcoded password และ import os ซ้ำออก
    # ก่อน: password="Heyrose05" ถูก hardcode ตรงๆ ใน source code
    # หลัง: ใช้ os.getenv() อ่านจาก .env file ทั้งหมด
    import psycopg2
    import os
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

class SETDataFetcher:

    @staticmethod
    def get_set50_tickers() -> List[str]:
        """
        ดึงรายชื่อหุ้นที่ Active จาก Database
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT ticker FROM assets WHERE is_active = TRUE ORDER BY ticker")
            tickers = [row[0] for row in cursor.fetchall()]
            cursor.close()
            conn.close()
            return tickers
        except Exception as e:
            print(f"⚠️ Database Error in get_set50_tickers: {e}")
            return []

    @staticmethod
    def filter_by_sector(tickers: List[str], preferred_sectors: List[str]) -> List[str]:
        """
        กรองหุ้นเฉพาะที่อยู่ในหมวดหมู่ที่ต้องการ
        ✅ แก้ไข: เปลี่ยนจาก Hardcode Dictionary → ดึง sector จาก Database โดยตรง
        ก่อน: SET50_SECTORS ถูก hardcode ไว้ใน Python เมื่อเพิ่มหุ้นใหม่ต้องแก้โค้ด
        หลัง: ดึงจากตาราง assets ทำให้ Admin เพิ่ม/แก้ไข sector ผ่าน API ได้เลย
        """
        if not preferred_sectors:
            return tickers

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            # ดึง sector mapping ของทุกหุ้นจาก Database ครั้งเดียว
            cursor.execute("SELECT ticker, sector FROM assets WHERE sector IS NOT NULL")
            sector_map: Dict[str, str] = {row[0]: row[1] for row in cursor.fetchall()}
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"⚠️ Database Error in filter_by_sector: {e}")
            return tickers  # ถ้า DB error ให้คืนรายการหุ้นทั้งหมดแทน

        filtered = [
            t for t in tickers
            if sector_map.get(t.replace(".BK", "")) in preferred_sectors
        ]
        # ขั้นต่ำต้องมีอย่างน้อย 3 ตัวตามข้อกำหนดพอร์ต
        return filtered if len(filtered) >= 3 else tickers

    @staticmethod
    def get_market_caps(tickers: List[str]) -> pd.Series:
        """
        ดึงข้อมูล Market Capitalization จาก Database
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # ดึงทั้งหมดที่มีในตาราง
            cursor.execute("SELECT ticker, market_cap FROM assets")
            base_caps = {row[0]: row[1] for row in cursor.fetchall()}
            
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"⚠️ Database Error in get_market_caps: {e}")
            base_caps = {}

        # สำหรับหุ้นตัวอื่นที่ไม่ได้ระบุ ให้ใช้ค่าเฉลี่ย 100,000 ล้านบาท
        caps = {t: base_caps.get(t.replace(".BK", ""), 100000) for t in tickers}
        return pd.Series(caps)



class YahooFinanceFetcher:
    @staticmethod
    def get_market_data_with_beta(tickers: List[str], period: str = "2y") -> Tuple[pd.DataFrame, Dict[str, float]]:
        """
        ดึงราคาหุ้นและคำนวณ Covariance Matrix พร้อมค่า Beta (Weekly 2Y)
        พร้อมใช้งาน Redis Caching (อายุแคช 24 ชั่วโมง)
        """
        tickers_str = ",".join(sorted(tickers))
        cache_key = f"market_data:{hashlib.md5(tickers_str.encode()).hexdigest()}:{period}"
        
        r = get_redis_client()
        if r:
            cached_data = r.get(cache_key)  # type: ignore
            if cached_data:
                print("⚡ ข้อมูลราคาหุ้นถูกดึงมาจาก Redis Cache (ไม่ต้องรอโหลด API)")
                return pickle.loads(cached_data)  # type: ignore

        # เพิ่ม .BK สำหรับหุ้นไทย และดึงดัชนีตลาด (^SET.BK)
        yf_tickers = [f"{t}.BK" for t in tickers]
        all_tickers = yf_tickers + ["^SET.BK"]
        
        print(f"📥 กำลังดึงข้อมูลราคา {len(tickers)} หุ้น จาก Yahoo Finance...")
        data = yf.download(all_tickers, period=period, interval="1wk", progress=False)
        
        if data is None or data.empty:
            raise ValueError("ไม่สามารถดึงข้อมูลจาก Yahoo Finance ได้")

        # สกัดเอาเฉพาะราคาปิด (Adj Close หรือ Close)
        if isinstance(data.columns, pd.MultiIndex):
            prices = data['Adj Close'] if 'Adj Close' in data.columns.levels[0] else data['Close']
        else:
            prices = data
            
        # คลีนชื่อคอลัมน์และจัดการค่าว่าง
        prices.columns = [c.replace(".BK", "") for c in prices.columns]
        prices = prices.ffill().bfill().dropna(axis=1)
        
        # คำนวณ Returns
        returns = prices.pct_change().dropna()
        
        # 1. คำนวณ Covariance Matrix (รายปี)
        cov_matrix = returns.drop(columns=["^SET"], errors='ignore').cov() * 52 # type: ignore
        
        # 2. คำนวณค่า Beta รายตัวเทียบกับดัชนี ^SET
        betas = {}
        if "^SET" in returns.columns:
            market_var = returns["^SET"].var()
            for t in cov_matrix.columns:
                
                ticker_series = pd.Series(returns[t])
                market_series = pd.Series(returns["^SET"])
                ticker_cov_market = ticker_series.cov(market_series)
                betas[t] = ticker_cov_market / market_var if market_var != 0 else 1.0
        else:
            betas = {t: 1.0 for t in cov_matrix.columns}
            
        if r:
            try:
                r.setex(cache_key, 86400, pickle.dumps((cov_matrix, betas))) # เก็บ 24 ชม.
                print("💾 บันทึกข้อมูลลง Redis Cache สำเร็จ")
            except Exception as e:
                print(f"⚠️ ไม่สามารถบันทึก Cache ได้: {e}")
            
        return cov_matrix, betas