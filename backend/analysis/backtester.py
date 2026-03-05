import yfinance as yf
import pandas as pd
import numpy as np
import warnings

warnings.filterwarnings("ignore")

class BacktestEngine:
    def run_backtest(self, weights_dict, start_date, end_date):
        if not weights_dict:
            return self._default_empty_result("ไม่มีหุ้นในพอร์ต")

        tickers_bk = [f"{t}.BK" if not t.endswith(".BK") else t for t in weights_dict.keys()]
        clean_requested = [t.replace(".BK", "") for t in tickers_bk]
        
        try:
            # 1. ดึงข้อมูลราคาหุ้นในพอร์ต
            data = yf.download(tickers_bk, start=start_date, end=end_date, progress=False)
            if data.empty:
                return self._default_empty_result(f"ไม่พบประวัติราคาในช่วง {start_date} ถึง {end_date}")

            if isinstance(data.columns, pd.MultiIndex):
                price_data = data['Adj Close'] if 'Adj Close' in data.columns.levels[0] else data['Close']
            else:
                price_data = data[['Adj Close']] if 'Adj Close' in data.columns else data[['Close']]
                
            price_data = price_data.dropna(axis=1, how='all').ffill().bfill()
            price_data.columns = [str(c).replace(".BK", "") for c in price_data.columns]
            
            valid_tickers = list(price_data.columns)
            missing_tickers = [t for t in clean_requested if t not in valid_tickers]
            
            if not valid_tickers:
                return self._default_empty_result("หุ้นทั้งหมดในพอร์ตไม่มีข้อมูลราคาช่วงเวลาที่กำหนด")

            # 2. คำนวณ Portfolio Performance แบบรายวัน
            daily_returns = price_data.pct_change().dropna()
            valid_weights = np.array([weights_dict.get(t, 0) for t in valid_tickers])
            valid_weights = valid_weights / np.sum(valid_weights) 
            
            port_returns = daily_returns.dot(valid_weights)
            
            # คำนวณผลตอบแทนสะสม (Cumulative Returns) โดยสมมติเริ่มที่เงิน 100,000 บาท
            port_cum_returns = (1 + port_returns).cumprod() * 100000
            
            total_return = (1 + port_returns).prod() - 1
            port_volatility = port_returns.std() * np.sqrt(252)
            
            # 3. ดึงและคำนวณ Benchmark (^SET.BK) เพื่อเทียบกับตลาด
            bm_data = yf.download("^SET.BK", start=start_date, end=end_date, progress=False)
            bm_cum_returns = pd.Series(100000, index=port_cum_returns.index)
            bm_total_return = 0.0
            
            if not bm_data.empty:
                bm_price = bm_data['Adj Close'] if 'Adj Close' in bm_data.columns else bm_data['Close']
                if isinstance(bm_price, pd.DataFrame): bm_price = bm_price.iloc[:, 0]
                
                bm_returns = bm_price.pct_change().dropna()
                bm_cum_returns = (1 + bm_returns).cumprod() * 100000
                raw_return = (bm_price.iloc[-1] / bm_price.iloc[0]) - 1
                bm_total_return = float(raw_return.iloc[0]) if hasattr(raw_return, "iloc") else float(raw_return)

            # 4. 🔥 สร้างข้อมูลรายเดือน สำหรับส่งให้กราฟ (AreaChart) บนเว็บ
            port_monthly = port_cum_returns.resample('ME').last()
            bm_monthly = bm_cum_returns.resample('ME').last()
            
            # จับคู่ข้อมูลเข้าด้วยกันเป็น DataFrame
            chart_df = pd.DataFrame({"AI": port_monthly, "SET50": bm_monthly}).dropna()
            chart_df.index = chart_df.index.strftime('%Y-%m') # เปลี่ยนรูปแบบวันที่เป็น YYYY-MM
            chart_df.reset_index(inplace=True)
            chart_df.rename(columns={'Date': 'date'}, inplace=True) # ให้ตรงกับที่ Dashboard หน้าบ้านอ่าน

            # แปลงเป็น Array JSON เพื่อส่งกลับ
            chart_data = chart_df.to_dict(orient='records')

            result = {
                "portfolio_return": float(total_return),
                "benchmark_return": float(bm_total_return),
                "portfolio_volatility": float(port_volatility),
                "chart_data": chart_data # 👈 นี่คือพระเอกที่จะถูกส่งไปให้กราฟ!
            }
            
            if missing_tickers:
                result["warning"] = f"หุ้น {', '.join(missing_tickers)} ไม่มีข้อมูลในช่วงนี้"
                
            return result
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return self._default_empty_result(f"ระบบมีปัญหา: {str(e)}")

    def _default_empty_result(self, msg: str):
        return {"portfolio_return": 0.0, "benchmark_return": 0.0, "portfolio_volatility": 0.0, "chart_data": [], "warning": msg}