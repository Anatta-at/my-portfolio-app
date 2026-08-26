# backend/main.py
# pyright: ignore [reportMissingImports, reportMissingModuleSource]
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

import json
import psycopg2
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Any
import pandas as pd

# ==========================================
# IMPORT ENGINES (ระบบคำนวณพอร์ตของคุณ)
# ==========================================
from engine.data_fetcher import YahooFinanceFetcher, SETDataFetcher
from engine.core_optimizer import BlackLittermanEngine, GeneticPortfolioOptimizer
from analysis.backtester import BacktestEngine

# ==========================================
# INITIALIZE APP
# ==========================================

def get_db_connection():
    import os, psycopg2
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return psycopg2.connect(db_url)
    
    db_host = os.getenv("DATABASE_HOST", "localhost")
    return psycopg2.connect(
        dbname="intelliport_db",
        user="admin",
        password="Heyrose05",
        host=db_host,
        port="5432"
    )

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
    portfolio_name: Optional[str] = "My Portfolio"
    user_custom_views: Optional[Dict[str, float]] = None 
    target_beta: float = 1.0
    max_stocks: int = Field(default=5, ge=3, le=25) 
    max_weight_per_asset: Optional[float] = 0.40
    start_date: str = "2024-01-01"
    end_date: str = "2024-12-01"
    
    # 🌟 เพิ่มตัวแปรมารับค่าเพื่อเก็บลง Database
    budget: Optional[float] = 100000.0
    target_amount: Optional[float] = None
    duration_years: Optional[int] = 5
    locked_stocks: Optional[List[str]] = []
    sectors: Optional[List[str]] = []

class TemplateRequest(BaseModel):
    user_id: str
    portfolio_name: str
    target_beta: float
    budget: float
    target_amount: Optional[float] = None
    duration_years: int
    expected_return: float
    portfolio_volatility: float
    portfolio_data: list

class DeletePortfoliosRequest(BaseModel):
    portfolio_ids: List[int]
    clerk_id: str

class SyncUserRequest(BaseModel):
    clerk_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None

# ==========================================
# ==========================================
# 🌟 ฟังก์ชันคำนวณความน่าจะเป็นที่เป้าหมายสำเร็จ (Monte Carlo / GBM formula) 🌟
# ==========================================
def calculate_success_probability(budget: float, target_amount: Optional[float], duration_years: int, expected_return: float, portfolio_volatility: float) -> float:
    import math
    if not target_amount or target_amount <= budget:
        return 1.0
    if budget <= 0:
        return 0.0
    if portfolio_volatility <= 0:
        terminal_value = budget * math.exp(expected_return * duration_years)
        return 1.0 if terminal_value >= target_amount else 0.0
    
    t = max(float(duration_years), 0.0)
    if t == 0.0:
        terminal_value = budget * math.exp(expected_return * t)
        return 1.0 if terminal_value >= target_amount else 0.0
        
    mu = float(expected_return)
    sigma = float(portfolio_volatility)
    
    m = math.log(budget) + (mu - 0.5 * (sigma ** 2)) * t
    s = sigma * math.sqrt(t)
    
    x = (m - math.log(target_amount)) / s
    prob = 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))
    return min(max(prob, 0.0), 1.0)

# 🌟 ฟังก์ชันคำนวณคาดการณ์มูลค่าเงินในอนาคต (ช่วงสูงสุด-ต่ำสุด 1 Std Dev) 🌟
# ==========================================
def calculate_forecast_range(budget: float, duration_years: int, expected_return: float, portfolio_volatility: float) -> dict:
    import math
    if budget <= 0:
        return {"lower": 0.0, "upper": 0.0}
    t = max(float(duration_years), 0.0)
    mu = float(expected_return)
    sigma = float(portfolio_volatility)
    
    # 1 standard deviation for 68% confidence interval
    m = math.log(budget) + (mu - 0.5 * (sigma ** 2)) * t
    s = sigma * math.sqrt(t)
    
    lower = math.exp(m - s)
    upper = math.exp(m + s)
    return {"lower": round(lower, 2), "upper": round(upper, 2)}

# 🌟 ฟังก์ชันบันทึกข้อมูลลง PostgreSQL 🌟
# ==========================================
def save_portfolio_to_db(clerk_id: str, name: str, beta: float, budget: float, target_amount: Optional[float], duration: int, portfolio_data: list, exp_ret: float, port_vol: float):
    # ถ้าไม่มี user_id (ผู้ใช้ไม่ได้ล็อกอิน) ให้ข้ามการบันทึกไป
    if not clerk_id:
        print("⚠️ ข้ามการบันทึก: ไม่พบ Clerk ID")
        return

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Upsert User (สร้าง user ใหม่ถ้ายังไม่มี หรืออัปเดตเวลาเข้าใช้งาน)
        cursor.execute("""
            INSERT INTO users (clerk_id) 
            VALUES (%s) 
            ON CONFLICT (clerk_id) 
            DO UPDATE SET last_login_at = CURRENT_TIMESTAMP;
        """, (clerk_id,))

        # คำนวณความน่าจะเป็นที่จะสำเร็จ
        success_prob = calculate_success_probability(budget, target_amount, duration, exp_ret, port_vol)

        # 2. บันทึกข้อมูลพอร์ตหลัก (portfolios)
        cursor.execute("""
            INSERT INTO portfolios 
            (clerk_id, name, target_beta, budget, target_amount, duration_years, expected_return, portfolio_volatility, success_probability)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (clerk_id, name, beta, budget, target_amount, duration, float(exp_ret), float(port_vol), success_prob))
        
        result = cursor.fetchone()
        portfolio_id = result[0] if result else None

        # 3. บันทึกข้อมูลหุ้นรายตัวในพอร์ต (portfolio_assets)
        asset_query = """
            INSERT INTO portfolio_assets (portfolio_id, ticker, weight, beta)
            VALUES (%s, %s, %s, %s)
        """
        for asset in portfolio_data:
            cursor.execute(asset_query, (
                portfolio_id,
                asset['Ticker'],
                float(asset['Weight']),
                float(asset.get('Beta', 1.0))
            ))
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ บันทึกพอร์ต (ID: {portfolio_id}) ลงฐานข้อมูลสำเร็จ!")
        return portfolio_id

    except Exception as e:
        print(f"❌ Database Error: {e}")
        return None

# ==========================================
# API สำหรับจัดการข้อมูล User Sync
# ==========================================
@app.post("/api/users/sync")
def sync_user(req: SyncUserRequest):
    if not req.clerk_id:
        return {"status": "error", "message": "Missing clerk_id"}
    try:
        import os
        import psycopg2
        db_host = os.getenv("DATABASE_HOST", "localhost")
        conn = psycopg2.connect(
            dbname="intelliport_db",
            user="admin",            
            password="Heyrose05",     
            host=db_host,        
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (clerk_id, email, full_name) 
            VALUES (%s, %s, %s) 
            ON CONFLICT (clerk_id) 
            DO UPDATE SET 
                email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                last_login_at = CURRENT_TIMESTAMP;
        """, (req.clerk_id, req.email, req.full_name))
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        print(f"❌ DB Error in sync_user: {e}")
        return {"status": "error", "message": str(e)}

# ==========================================
# API สำหรับคำนวณและจัดพอร์ตการลงทุน
# ==========================================
@app.post("/api/optimize")
def optimize_portfolio(req: OptimizeRequest):
    try:
        # 1. ดึงรายชื่อหุ้น SET50 ล่าสุด
        tickers = SETDataFetcher.get_set50_tickers()
        
        # 1.5 กรองหุ้นตาม Sector (ถ้ามีส่งมา)
        if req.sectors:
            tickers = SETDataFetcher.filter_by_sector(tickers, req.sectors)
            # ถ้ากรองแล้วเหลือน้อยกว่า max_stocks ให้ปรับ max_stocks ลงมา
            if len(tickers) < req.max_stocks:
                req.max_stocks = max(3, len(tickers))
        
        # 2. ดึงข้อมูลราคาจาก Yahoo Finance และคำนวณ Beta/Covariance
        cov_matrix, calc_betas = YahooFinanceFetcher.get_market_data_with_beta(tickers)
        
        valid_tickers = list(cov_matrix.columns)
        market_caps = SETDataFetcher.get_market_caps(valid_tickers)
        
        # 3. จัดการค่า Beta รายตัว
        actual_betas_series = pd.Series({t: round(calc_betas.get(t, 1.0), 2) for t in valid_tickers})

        # 4. เตรียมมุมมองนักวิเคราะห์ (Views)
        views_data = {}

        if req.user_custom_views:
            for symbol, val in req.user_custom_views.items():
                t = f"{symbol}.BK"
                if t in valid_tickers: # เปลี่ยนจากการเช็คใน views_data เป็นเช็คว่ามีหุ้นนี้ในตลาดหรือไม่
                    views_data[t] = {"return_view": val, "variance": 0.01}
        
        # 5. ประมวลผล Black-Litterman
        bl_engine = BlackLittermanEngine()
        adj_returns, updated_cov = bl_engine.calculate_posterior(market_caps, cov_matrix, views_data)
        
        # 6. ค้นหาพอร์ตที่ดีที่สุดด้วย Genetic Algorithm (GA)
        ga_engine = GeneticPortfolioOptimizer()
        portfolio_df, final_ret, final_vol = ga_engine.run_optimization(
            tickers=valid_tickers, 
            bl_returns=adj_returns, 
            cov_matrix=updated_cov, 
            market_caps=market_caps,
            target_beta=req.target_beta, 
            max_stocks=req.max_stocks,
            actual_betas=actual_betas_series,
            locked_stocks=req.locked_stocks,
            max_weight_per_asset=req.max_weight_per_asset or 0.40
        )
        
        # 7. กรองหุ้นและแปลงเป็น List Dictionary
        final_portfolio = portfolio_df[portfolio_df['Weight'] > 0.01].copy().fillna(0.0)
        weights_dict = dict(zip(final_portfolio['Ticker'], final_portfolio['Weight']))
        portfolio_records = final_portfolio.to_dict(orient="records") # type: ignore

        # 🌟 7.5 บันทึกข้อมูลลง PostgreSQL ทันทีที่คำนวณเสร็จ! 🌟
        port_id = save_portfolio_to_db(
            clerk_id=req.user_id or "",
            name=req.portfolio_name or "My Portfolio",
            beta=req.target_beta,
            budget=req.budget or 100000.0,
            target_amount=req.target_amount,
            duration=req.duration_years or 5,
            portfolio_data=portfolio_records,
            exp_ret=final_ret,
            port_vol=final_vol
        )
        
        # 8. ทดสอบย้อนหลัง (Backtest)
        bt_engine = BacktestEngine()
        bt_results = bt_engine.run_backtest(weights_dict, req.start_date, req.end_date)
        
        success_prob = calculate_success_probability(req.budget or 100000.0, req.target_amount, req.duration_years or 5, final_ret, final_vol)
        forecast_range = calculate_forecast_range(req.budget or 100000.0, req.duration_years or 5, final_ret, final_vol)
        
        # 9. ส่งผลลัพธ์กลับไปให้หน้า Dashboard
        return {
            "status": "success",
            "portfolio_id": port_id,
            "metadata": {
                "user_id": req.user_id,
                "target_beta": req.target_beta,
                "budget": req.budget,
                "target_amount": req.target_amount,
                "duration_years": req.duration_years,
                "success_probability": success_prob,
                "forecast_lower": forecast_range["lower"],
                "forecast_upper": forecast_range["upper"],
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
# 🌟 API สำหรับบันทึกพอร์ตสำเร็จรูป (Template) 🌟
# ==========================================
@app.post("/api/portfolios/template")
def create_template_portfolio(req: TemplateRequest):
    try:
        port_id = save_portfolio_to_db(
            clerk_id=req.user_id,
            name=req.portfolio_name,
            beta=req.target_beta,
            budget=req.budget,
            target_amount=req.target_amount,
            duration=req.duration_years,
            portfolio_data=req.portfolio_data,
            exp_ret=req.expected_return,
            port_vol=req.portfolio_volatility
        )
        if port_id:
            return {"status": "success", "portfolio_id": port_id}
        else:
            return {"status": "error", "message": "Failed to save template to database"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# ==========================================
# 🌟 API สำหรับดึงประวัติพอร์ตการลงทุนทั้งหมด 🌟
# ==========================================
@app.get("/api/portfolios")
def get_user_portfolios(clerk_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, target_beta, budget, target_amount, duration_years, expected_return, portfolio_volatility, created_at, success_probability, name
            FROM portfolios
            WHERE clerk_id = %s
            ORDER BY created_at DESC;
        """, (clerk_id,))
        
        rows = cursor.fetchall()
        portfolios = []
        for r in rows:
            prob = r[8]
            if prob is None and r[2] is not None and r[5] is not None and r[6] is not None:
                prob = calculate_success_probability(
                    float(r[2]),
                    float(r[3]) if r[3] is not None else None,
                    r[4] or 5,
                    float(r[5]),
                    float(r[6])
                )
            
            # คำนวณขอบเขตคาดการณ์ในอนาคต (Forecast Range)
            forecast_lower = None
            forecast_upper = None
            if r[2] is not None and r[5] is not None and r[6] is not None:
                fc = calculate_forecast_range(float(r[2]), r[4] or 5, float(r[5]), float(r[6]))
                forecast_lower = fc["lower"]
                forecast_upper = fc["upper"]
                
            portfolios.append({
                "id": r[0],
                "target_beta": float(r[1]) if r[1] is not None else None,
                "budget": float(r[2]) if r[2] is not None else None,
                "target_amount": float(r[3]) if r[3] is not None else None,
                "duration_years": r[4],
                "expected_return": float(r[5]) if r[5] is not None else None,
                "portfolio_volatility": float(r[6]) if r[6] is not None else None,
                "created_at": r[7].isoformat() if r[7] is not None else None,
                "success_probability": float(prob) if prob is not None else None,
                "forecast_lower": forecast_lower,
                "forecast_upper": forecast_upper,
                "name": r[9] if len(r) > 9 else "My Portfolio"
            })
            
        cursor.close()
        conn.close()
        return {"status": "success", "portfolios": portfolios}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==========================================
# 🌟 API สำหรับดึงข้อมูลรายละเอียดพอร์ตและประมวลผล Backtest 🌟
# ==========================================
@app.post("/api/portfolios/delete")
def delete_portfolios(req: DeletePortfoliosRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify ownership and delete
        for pid in req.portfolio_ids:
            cursor.execute("DELETE FROM portfolios WHERE id = %s AND clerk_id = %s", (pid, req.clerk_id))
            
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Portfolios deleted successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/portfolios/{portfolio_id}")
def get_portfolio_details(portfolio_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. ดึงรายละเอียดพอร์ต
        cursor.execute("""
            SELECT id, target_beta, budget, target_amount, duration_years, expected_return, portfolio_volatility, created_at, clerk_id, success_probability, name
            FROM portfolios
            WHERE id = %s;
        """, (portfolio_id,))
        p_row = cursor.fetchone()
        if not p_row:
            cursor.close()
            conn.close()
            return {"status": "error", "message": "Portfolio not found"}
            
        prob = p_row[9]
        if prob is None and p_row[2] is not None and p_row[5] is not None and p_row[6] is not None:
            prob = calculate_success_probability(
                float(p_row[2]),
                float(p_row[3]) if p_row[3] is not None else None,
                p_row[4] or 5,
                float(p_row[5]),
                float(p_row[6])
            )
            
        # คำนวณขอบเขตคาดการณ์ในอนาคต (Forecast Range)
        forecast_lower = None
        forecast_upper = None
        if p_row[2] is not None and p_row[5] is not None and p_row[6] is not None:
            fc = calculate_forecast_range(float(p_row[2]), p_row[4] or 5, float(p_row[5]), float(p_row[6]))
            forecast_lower = fc["lower"]
            forecast_upper = fc["upper"]
            
        p_meta = {
            "id": p_row[0],
            "target_beta": float(p_row[1]) if p_row[1] is not None else None,
            "budget": float(p_row[2]) if p_row[2] is not None else None,
            "target_amount": float(p_row[3]) if p_row[3] is not None else None,
            "duration_years": p_row[4],
            "expected_return": float(p_row[5]) if p_row[5] is not None else None,
            "portfolio_volatility": float(p_row[6]) if p_row[6] is not None else None,
            "created_at": p_row[7].isoformat() if p_row[7] is not None else None,
            "clerk_id": p_row[8],
            "success_probability": float(prob) if prob is not None else None,
            "forecast_lower": forecast_lower,
            "forecast_upper": forecast_upper,
            "name": p_row[10] if len(p_row) > 10 else "My Portfolio"
        }
        
        # 2. ดึงสัดส่วนหุ้น
        cursor.execute("""
            SELECT ticker, weight, beta
            FROM portfolio_assets
            WHERE portfolio_id = %s;
        """, (portfolio_id,))
        asset_rows = cursor.fetchall()
        assets = []
        weights_dict = {}
        for r in asset_rows:
            assets.append({
                "Ticker": r[0],
                "Weight": float(r[1]),
                "Beta": float(r[2]) if r[2] is not None else 1.0
            })
            weights_dict[r[0]] = float(r[1])
            
        cursor.close()
        conn.close()
        
        # 3. รัน Backtest
        duration_num = p_meta["duration_years"] if p_meta["duration_years"] else 5
        import datetime
        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=duration_num * 365)
        
        bt_engine = BacktestEngine()
        bt_results = bt_engine.run_backtest(
            weights_dict, 
            start_date.strftime("%Y-%m-%d"), 
            end_date.strftime("%Y-%m-%d")
        )
        
        return {
            "status": "success",
            "metadata": {
                "user_id": p_meta["clerk_id"],
                "target_beta": p_meta["target_beta"],
                "budget": p_meta["budget"],
                "target_amount": p_meta["target_amount"],
                "duration_years": p_meta["duration_years"],
                "created_at": p_meta["created_at"],
                "expected_return": p_meta["expected_return"],
                "portfolio_volatility": p_meta["portfolio_volatility"],
                "success_probability": p_meta["success_probability"],
                "forecast_lower": p_meta["forecast_lower"],
                "forecast_upper": p_meta["forecast_upper"]
            },
            "portfolio": assets,
            "backtest": bt_results
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# ==========================================
# ADMIN APIs
# ==========================================
@app.get("/api/admin/users")
def get_all_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT u.clerk_id, u.created_at, u.last_login_at, COUNT(p.id) as portfolio_count, u.role
            FROM users u
            LEFT JOIN portfolios p ON u.clerk_id = p.clerk_id
            GROUP BY u.clerk_id, u.created_at, u.last_login_at, u.role
            ORDER BY u.last_login_at DESC;
        """)
        rows = cursor.fetchall()
        
        users = []
        for r in rows:
            users.append({
                "clerk_id": r[0],
                "created_at": r[1],
                "last_login_at": r[2],
                "portfolio_count": r[3],
                "role": r[4]
            })
            
        cursor.close()
        conn.close()
        return {"status": "success", "data": users}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

class RoleUpdateRequest(BaseModel):
    new_role: str
    admin_id: str

class SyncUsersRequest(BaseModel):
    users: List[Dict[str, Any]]

class AssetRequest(BaseModel):
    ticker: str
    market_cap: int
    is_active: bool = True

@app.post("/api/admin/users/sync")
def sync_users_data(req: SyncUsersRequest):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for u in req.users:
            cursor.execute("""
                UPDATE users SET email = %s, full_name = %s 
                WHERE clerk_id = %s;
            """, (u.get("email"), u.get("full_name"), u.get("clerk_id")))
        
        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Users synced successfully"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.put("/api/admin/users/{target_clerk_id}/role")
def update_user_role(target_clerk_id: str, req: RoleUpdateRequest):
    try:
        if req.new_role not in ["user", "admin"]:
            return {"status": "error", "message": "Invalid role"}
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify the requester is actually an admin
        cursor.execute("SELECT role FROM users WHERE clerk_id = %s", (req.admin_id,))
        admin_row = cursor.fetchone()
        if not admin_row or admin_row[0] != "admin":
            cursor.close()
            conn.close()
            return {"status": "error", "message": "Unauthorized: Only admins can change roles"}
            
        cursor.execute("""
            INSERT INTO users (clerk_id, role)
            VALUES (%s, %s)
            ON CONFLICT (clerk_id) 
            DO UPDATE SET role = EXCLUDED.role;
        """, (target_clerk_id, req.new_role))
        conn.commit()
        
        cursor.close()
        conn.close()
        return {"status": "success", "message": f"Role updated to {req.new_role}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/admin/assets")
def get_admin_assets():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT ticker, market_cap, is_active FROM assets ORDER BY ticker")
        assets = []
        for row in cursor.fetchall():
            assets.append({
                "ticker": row[0],
                "market_cap": row[1],
                "is_active": row[2]
            })
        cursor.close()
        conn.close()
        return {"status": "success", "data": assets}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/admin/assets")
def add_admin_asset(req: AssetRequest):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO assets (ticker, market_cap, is_active)
            VALUES (%s, %s, %s)
        """, (req.ticker, req.market_cap, req.is_active))
        conn.commit()
        cursor.close()
        return {"status": "success", "message": "Asset added successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if conn:
            conn.close()

@app.put("/api/admin/assets/{ticker}")
def update_admin_asset(ticker: str, req: AssetRequest):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE assets SET market_cap = %s, is_active = %s
            WHERE ticker = %s
        """, (req.market_cap, req.is_active, ticker))
        conn.commit()
        cursor.close()
        return {"status": "success", "message": "Asset updated successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if conn:
            conn.close()

@app.delete("/api/admin/assets/{ticker}")
def delete_admin_asset(ticker: str):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM assets WHERE ticker = %s", (ticker,))
        conn.commit()
        cursor.close()
        return {"status": "success", "message": "Asset deleted successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if conn:
            conn.close()

@app.get("/api/users/{clerk_id}/role")
def get_user_role(clerk_id: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT role FROM users WHERE clerk_id = %s", (clerk_id,))
        row = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if row:
            return {"status": "success", "role": row[0]}
        else:
            return {"status": "success", "role": "user"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ==========================================
# API สำหรับดึงข้อมูลภาพรวมตลาดหน้า Landing Page
# ==========================================
import datetime
from datetime import timedelta
# pyright: ignore [reportMissingImports, reportMissingModuleSource]
import yfinance as yf

market_highlight_cache: Dict[str, Any] = {
    "timestamp": None,
    "data": None
}

@app.get("/api/market-highlights")
def get_market_highlights():
    global market_highlight_cache
    now = datetime.datetime.now()
    
    if market_highlight_cache["timestamp"] and market_highlight_cache["data"]:
        if (now - market_highlight_cache["timestamp"]).total_seconds() < 3600:
            return {"status": "success", "data": market_highlight_cache["data"], "cached": True}
            
    tickers_info = [
        {"symbol": "DELTA.BK", "name": "Delta Electronics", "tickerSymbol": "DELTA"},
        {"symbol": "SCC.BK", "name": "Siam Cement Group", "tickerSymbol": "SCC"},
        {"symbol": "PTTEP.BK", "name": "PTT Expl. & Prod.", "tickerSymbol": "PTTEP"}
    ]
    
    end_date = now.date()
    start_date = end_date - timedelta(days=21) 
    
    result_data = []
    
    try:
        for info in tickers_info:
            df = yf.download(info["symbol"], start=start_date, end=end_date, progress=False)
            if df is None or df.empty: # type: ignore
                continue
                
            price_col = df['Adj Close'] if 'Adj Close' in df.columns else df['Close'] # type: ignore
            if isinstance(price_col, pd.DataFrame): price_col = price_col.iloc[:, 0] # type: ignore
            
            recent_data = price_col.dropna().tail(14)
            if len(recent_data) < 2:
                continue
                
            current_price = recent_data.iloc[-1]
            prev_price = recent_data.iloc[-2]
            
            change = current_price - prev_price
            pct_change = (change / prev_price) * 100
            
            chart_data = [{"date": str(date_val)[:10], "value": float(price)} for date_val, price in recent_data.items()] # type: ignore
            
            result_data.append({
                "name": info["name"],
                "tickerSymbol": info["tickerSymbol"],
                "value": round(float(current_price), 2),
                "change": round(float(change), 2),
                "percentageChange": round(float(pct_change), 2),
                "changeType": "positive" if change >= 0 else "negative",
                "chartData": chart_data
            })
            
        if result_data:
            market_highlight_cache["timestamp"] = now
            market_highlight_cache["data"] = result_data
            
        return {"status": "success", "data": result_data, "cached": False}
    except Exception as e:
        print("Error fetching market highlights:", e)
        if market_highlight_cache["data"]:
            return {"status": "success", "data": market_highlight_cache["data"], "cached": True, "error": str(e)}
        return {"status": "error", "message": str(e)}

# ==========================================
# RUN SERVER
# ==========================================
if __name__ == "__main__":
    # pyright: ignore [reportMissingImports, reportMissingModuleSource]
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)