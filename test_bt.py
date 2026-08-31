import sys
sys.path.append('backend')
from analysis.backtester import BacktestEngine
import datetime

bt = BacktestEngine()
weights = {"PTT.BK": 0.5, "AOT.BK": 0.5}
res = bt.run_backtest(weights, "2021-01-01", "2026-08-01")
print("length:", len(res['chart_data']))
if len(res['chart_data']) > 0:
    print(res['chart_data'][:2])
