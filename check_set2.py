import yfinance as yf
data = yf.download("^SET.BK", period="5y")
print(data)
