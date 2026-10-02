# backend/export_market_data.py
"""
สคริปต์สำหรับดึงและส่งออกข้อมูลตลาดหุ้นจาก Yahoo Finance และ Database
สร้างไฟล์ Excel (.xlsx) และ CSV (.csv) เพื่อเปิดดูใน Excel หรือนำไปทำรายงานวิจัย
"""
import os
import sys
import warnings
import pandas as pd
import numpy as np
import yfinance as yf

# เพิ่ม path ให้ import โมดูลของ backend ได้
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from engine.data_fetcher import SETDataFetcher, get_db_connection

warnings.filterwarnings("ignore")

def export_all_market_data():
    print("==========================================================")
    print("📊 เริ่มต้นกระบวนการส่งออกข้อมูลตลาดหุ้น (Yahoo Finance + DB)")
    print("==========================================================")

    # 1. ดึงรายชื่อหุ้นและข้อมูลพื้นฐานจาก Database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ticker, sector, market_cap FROM assets WHERE is_active = TRUE ORDER BY ticker")
    asset_rows = cursor.fetchall()
    cursor.close()
    conn.close()

    tickers = [r[0] for r in asset_rows]
    sectors = {r[0]: r[1] for r in asset_rows}
    market_caps = {r[0]: r[2] for r in asset_rows}

    print(f"✅ ดึงรายชื่อหุ้น SET50 จากฐานข้อมูล: {len(tickers)} ตัว")

    # 2. ดึงราคาปิดย้อนหลัง 5 ปี (Weekly) จาก Yahoo Finance ตามระเบียบวิธีวิจัย AUC²
    yf_symbols = [f"{t}.BK" for t in tickers] + ["TDEX.BK"]
    print(f"📥 กำลังดาวน์โหลดข้อมูลราคาย้อนหลัง 5 ปี จาก Yahoo Finance ({len(yf_symbols)} สัญลักษณ์)...")
    
    raw_data = yf.download(yf_symbols, period="5y", interval="1wk", progress=True)


    if raw_data is None or raw_data.empty:
        print("❌ เกิดข้อผิดพลาด: ไม่สามารถดึงข้อมูลจาก Yahoo Finance ได้")
        return

    # เลือกใช้ราคาปิดปรับปรุง (Adj Close) หรือ Close
    if isinstance(raw_data.columns, pd.MultiIndex):
        if 'Adj Close' in raw_data.columns.levels[0]:
            prices = raw_data['Adj Close'].copy()
        else:
            prices = raw_data['Close'].copy()
    else:
        prices = raw_data.copy()

    # ล้างชื่อคอลัมน์ (.BK)
    prices.columns = [str(c).replace(".BK", "") for c in prices.columns]
    prices = prices.ffill().bfill().dropna(axis=1)

    print(f"✅ ข้อมูลราคาที่ดาวน์โหลดสำเร็จ: {prices.shape[1]} สัญลักษณ์, จำนวน {prices.shape[0]} สัปดาห์")

    # 3. คำนวณ Returns รายสัปดาห์
    returns = prices.pct_change().dropna()

    # 4. คำนวณ Covariance Matrix (รายปี x52 สัปดาห์)
    stock_cols = [c for c in returns.columns if c != "TDEX"]
    cov_matrix = returns[stock_cols].cov() * 52

    # 5. คำนวณค่า Beta เทียบกับ TDEX (SET50 ETF)
    betas = {}
    benchmark_var = returns["TDEX"].var() if "TDEX" in returns.columns else 0.0

    for col in stock_cols:
        if benchmark_var > 0:
            cov_bm = returns[col].cov(returns["TDEX"])
            betas[col] = round(cov_bm / benchmark_var, 2)
        else:
            betas[col] = 1.0

    # 6. คำนวณผลตอบแทนเฉลี่ยต่อปี (Annualized Return) และความผันผวนต่อปี (Annualized Volatility)
    annual_returns = (1 + returns[stock_cols].mean()) ** 52 - 1
    annual_volatilities = returns[stock_cols].std() * np.sqrt(52)

    # 7. รวมเป็นตารางสรุปรายหุ้น (Summary DataFrame)
    summary_list = []
    for t in stock_cols:
        summary_list.append({
            "Ticker": t,
            "Sector": sectors.get(t, "General"),
            "Market Cap (ล้านบาท)": market_caps.get(t, 100000),
            "Beta (vs TDEX)": betas.get(t, 1.0),
            "ผลตอบแทนเฉลี่ยต่อปี (Annual Return)": f"{annual_returns.get(t, 0.0):.2%}",
            "ความผันผวนต่อปี (Volatility)": f"{annual_volatilities.get(t, 0.0):.2%}",
            "ราคาปิดล่าสุด (บาท)": round(float(prices[t].iloc[-1]), 2) if t in prices else None
        })

    df_summary = pd.DataFrame(summary_list)
    df_summary = df_summary.sort_values(by="Market Cap (ล้านบาท)", ascending=False)

    # 8. ส่งออกไฟล์ไปยังโฟลเดอร์ exported_market_data
    export_dir = os.path.join(os.path.dirname(current_dir), "exported_market_data")
    os.makedirs(export_dir, exist_ok=True)

    # Export CSVs
    summary_csv = os.path.join(export_dir, "stock_summary_and_betas.csv")
    prices_5y_csv = os.path.join(export_dir, "weekly_prices_5y.csv")
    prices_2y_csv = os.path.join(export_dir, "weekly_prices_2y.csv")
    cov_csv = os.path.join(export_dir, "covariance_matrix.csv")
    returns_csv = os.path.join(export_dir, "weekly_returns.csv")

    df_summary.to_csv(summary_csv, index=False, encoding="utf-8-sig")
    prices.to_csv(prices_5y_csv, encoding="utf-8-sig")
    prices.to_csv(prices_2y_csv, encoding="utf-8-sig")  # สำรองชื่อเดิมไว้เพื่อความเข้ากันได้
    cov_matrix.to_csv(cov_csv, encoding="utf-8-sig")
    returns.to_csv(returns_csv, encoding="utf-8-sig")

    # Export All-in-one Excel
    excel_path = os.path.join(export_dir, "intelliportfolio_market_data.xlsx")
    with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
        df_summary.to_excel(writer, sheet_name="Stock Summary & Beta", index=False)
        prices.to_excel(writer, sheet_name="Weekly Close Prices (5Y)")
        cov_matrix.to_excel(writer, sheet_name="Covariance Matrix (5Y)")
        returns.to_excel(writer, sheet_name="Weekly Returns (5Y)")


    print("\n==========================================================")
    print("🎉 ส่งออกข้อมูลสำเร็จเรียบร้อยแล้ว!")
    print("==========================================================")
    print(f"📁 โฟลเดอร์ที่เก็บไฟล์: {export_dir}")
    print(f"   📗 ไฟล์ Excel รวมทุกอย่าง: {os.path.basename(excel_path)}")
    print(f"   📄 ไฟล์ CSV สรุปหุ้นและ Beta: {os.path.basename(summary_csv)}")
    print(f"   📄 ไฟล์ CSV ราคาปิดย้อนหลัง 5 ปี: {os.path.basename(prices_5y_csv)}")
    print(f"   📄 ไฟล์ CSV Covariance Matrix (5Y): {os.path.basename(cov_csv)}")
    print(f"   📄 ไฟล์ CSV ผลตอบแทนรายสัปดาห์ (5Y): {os.path.basename(returns_csv)}")
    print("==========================================================")
    
    print("\nตัวอย่างข้อมูลหุ้น 10 ตัวแรก (เรียงตาม Market Cap):")
    print(df_summary.head(10).to_string(index=False))

if __name__ == "__main__":
    export_all_market_data()
