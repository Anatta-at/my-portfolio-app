import yfinance as yf
data = yf.download("TDEX.BK", start="2021-01-01", end="2026-08-01", progress=False)
if not data.empty:
    print(data['Close'].head())
    print(data['Close'].tail())
    # Check for anomalies (daily return > 10%)
    rets = data['Close'].pct_change().dropna()
    print("Max daily return:", rets.max())
    print("Min daily return:", rets.min())
