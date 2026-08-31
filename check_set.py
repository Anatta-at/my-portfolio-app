import yfinance as yf
bm_data = yf.download("^SET", start="2021-01-01", end="2026-08-01", progress=False)
if not bm_data.empty:
    print("Found ^SET data!")
    print(bm_data['Close'].dropna().tail())
