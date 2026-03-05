# backend/main.py
import json
import psycopg2
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Optional, List
import pandas as pd

# ==========================================
# IMPORT ENGINES (ระบบคำนวณพอร์ตของคุณ)
# ==========================================
from engine.data_fetcher import YahooFinanceFetcher, SETDataFetcher
from engine.core_optimizer import BlackLittermanEngine, GeneticPortfolioOptimizer
from analysis.backtester import BacktestEngine
from engine.manual_views import ManualViewProvider

# ==========================================
# INITIALIZE APP
# ==========================================
app = FastAPI(
    title="Intelliportfolio Pro (Core Engine)", 
    description="Portfolio Optimization API (Auth managed by Clerk)",
    version="8.0"
)

# ✅ CORS Middleware สำหรับเชื่อมต่อกับ Next.js หน้าบ้าน
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# โครงสร้างรับข้อมูลสำหรับจัดพอร์ต
# ==========================================
class OptimizeRequest(BaseModel):
    user_id: Optional[str] = None  # รหัสจาก Clerk
    user_custom_views: Optional[Dict[str, float]] = None 
    target_beta: float = 1.0
    max_stocks: int = Field(default=5, ge=3, le=25) 
    start_date: str = "2024-01-01"
    end_date: str = "2024-12-01"
    
    # 🌟 เพิ่มตัวแปรมารับค่าเพื่อเก็บลง Database
    budget: Optional[float] = 100000.0
    duration_years: Optional[int] = 5

# ==========================================
# 🌟 ฟังก์ชันบันทึกข้อมูลลง PostgreSQL 🌟
# ==========================================
def save_portfolio_to_db(clerk_id: str, beta: float, budget: float, duration: int, portfolio_data: list):
    # ถ้าไม่มี user_id (ผู้ใช้ไม่ได้ล็อกอิน) ให้ข้ามการบันทึกไป
    if not clerk_id:
        print("⚠️ ข้ามการบันทึก: ไม่พบ Clerk ID")
        return

    try:
        # 🔧 ตั้งค่าการเชื่อมต่อ Database ของคุณที่นี่
        conn = psycopg2.connect(
            dbname="intelliport_db",
            user="admin",            # เปลี่ยนเป็น user ของคุณ
            password="Heyrose05",     # เปลี่ยนเป็นรหัสผ่านของคุณ
            host="localhost",        # ถ้าใช้ db ในเครื่องใช้ localhost
            port="5432"
        )
        cursor = conn.cursor()

        # คำสั่ง SQL สำหรับบันทึกข้อมูล
        insert_query = """
            INSERT INTO portfolio_history 
            (clerk_id, target_beta, budget, duration_years, recommended_portfolio)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        # แปลงข้อมูลพอร์ต (List of Dict) ให้เป็น JSON String สำหรับลงคอลัมน์ JSONB
        portfolio_json = json.dumps(portfolio_data)
        
        # รันคำสั่ง Insert
        cursor.execute(insert_query, (clerk_id, beta, budget, duration, portfolio_json))
        conn.commit()

        cursor.close()
        conn.close()
        print(f"✅ บันทึกประวัติพอร์ตของ {clerk_id} ลง Database สำเร็จ!")

    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการบันทึก Database: {e}")

# ==========================================
# API สำหรับคำนวณและจัดพอร์ตการลงทุน
# ==========================================
@app.post("/api/optimize")
def optimize_portfolio(req: OptimizeRequest):
    try:
        # 1. ดึงรายชื่อหุ้น SET50 ล่าสุด
        tickers = SETDataFetcher.get_set50_tickers()
        
        # 2. ดึงข้อมูลราคาจาก Yahoo Finance และคำนวณ Beta/Covariance
        cov_matrix, calc_betas = YahooFinanceFetcher.get_market_data_with_beta(tickers)
        
        valid_tickers = list(cov_matrix.columns)
        market_caps = SETDataFetcher.get_market_caps(valid_tickers)
        
        # 3. จัดการค่า Beta รายตัว
        actual_betas_series = pd.Series({t: round(calc_betas.get(t, 1.0), 2) for t in valid_tickers})

        # 4. เตรียมมุมมองนักวิเคราะห์ (Views)
        views_data = ManualViewProvider.get_all_views(valid_tickers)

        if req.user_custom_views:
            for symbol, val in req.user_custom_views.items():
                t = f"{symbol}.BK"
                if t in views_data:
                    views_data[t] = {"return_view": val, "variance": 0.01}
        
        # 5. ประมวลผล Black-Litterman
        bl_engine = BlackLittermanEngine()
        adj_returns, updated_cov = bl_engine.calculate_posterior(market_caps, cov_matrix, views_data)
        
        # 6. ค้นหาพอร์ตที่ดีที่สุดด้วย Genetic Algorithm (GA)
        ga_engine = GeneticPortfolioOptimizer()
        portfolio_df = ga_engine.run_optimization(
            tickers=valid_tickers, 
            bl_returns=adj_returns, 
            cov_matrix=updated_cov, 
            market_caps=market_caps,
            target_beta=req.target_beta, 
            max_stocks=req.max_stocks,
            actual_betas=actual_betas_series
        )
        
        # 7. กรองหุ้นและแปลงเป็น List Dictionary
        final_portfolio = portfolio_df[portfolio_df['Weight'] > 0.01].copy().fillna(0.0)
        weights_dict = dict(zip(final_portfolio['Ticker'], final_portfolio['Weight']))
        portfolio_records = final_portfolio.to_dict(orient="records")

        # 🌟 7.5 บันทึกข้อมูลลง PostgreSQL ทันทีที่คำนวณเสร็จ! 🌟
        save_portfolio_to_db(
            clerk_id=req.user_id,
            beta=req.target_beta,
            budget=req.budget,
            duration=req.duration_years,
            portfolio_data=portfolio_records
        )
        
        # 8. ทดสอบย้อนหลัง (Backtest)
        bt_engine = BacktestEngine()
        bt_results = bt_engine.run_backtest(weights_dict, req.start_date, req.end_date)
        
        # 9. ส่งผลลัพธ์กลับไปให้หน้า Dashboard
        return {
            "status": "success",
            "metadata": {
                "user_id": req.user_id,
                "target_beta": req.target_beta,
                "max_stocks_set": req.max_stocks,
                "view_source": "PostgreSQL Database",
                "backtest_period": f"{req.start_date} to {req.end_date}"
            },
            "portfolio": portfolio_records,
            "backtest": bt_results
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# ==========================================
# RUN SERVER
# ==========================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)