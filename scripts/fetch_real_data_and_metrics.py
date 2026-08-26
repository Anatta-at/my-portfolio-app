import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

def calculate_metrics(returns, risk_free_rate=0.02):
    """Calculate annualized return, volatility, Sharpe, MDD"""
    ann_return = returns.mean() * 252
    ann_vol = returns.std() * np.sqrt(252)
    sharpe = (ann_return - risk_free_rate) / ann_vol if ann_vol > 0 else 0
    
    # Calculate Max Drawdown
    cum_returns = (1 + returns).cumprod()
    running_max = cum_returns.cummax()
    drawdown = (cum_returns - running_max) / running_max
    mdd = drawdown.min()
    
    return ann_return, ann_vol, sharpe, mdd

def main():
    tickers = ['PTT.BK', 'AOT.BK', 'ADVANC.BK', 'CPALL.BK', 'BDMS.BK', 'KBANK.BK', 'DELTA.BK', 'SCB.BK']
    weights = np.array([0.20, 0.185, 0.15, 0.125, 0.10, 0.10, 0.08, 0.06])
    
    benchmark_ticker = 'TDEX.BK'
    all_tickers = tickers + [benchmark_ticker]
    
    start_date = '2021-01-01'
    end_date = '2023-12-31'
    
    print("Downloading stock data individually to avoid MultiIndex issues...")
    prices = {}
    for t in all_tickers:
        df = yf.download(t, start=start_date, end=end_date)
        if 'Adj Close' in df.columns:
            prices[t] = df['Adj Close'].squeeze()
        elif 'Close' in df.columns:
            prices[t] = df['Close'].squeeze()
    
    data = pd.DataFrame(prices)
    data = data.dropna()
    
    # Calculate daily returns
    daily_returns = data.pct_change().dropna()
    
    # Benchmark returns
    benchmark_returns = daily_returns[benchmark_ticker]
    
    # Portfolio returns
    stock_returns = daily_returns[tickers]
    portfolio_returns = (stock_returns * weights).sum(axis=1)
    
    # Calculate metrics
    port_ret, port_vol, port_sharpe, port_mdd = calculate_metrics(portfolio_returns)
    bench_ret, bench_vol, bench_sharpe, bench_mdd = calculate_metrics(benchmark_returns)
    
    # Alpha calculation
    alpha = port_ret - bench_ret
    
    print("=== Real Computed Metrics ===")
    print(f"Portfolio Return: {port_ret:.2%}, Vol: {port_vol:.2%}, Sharpe: {port_sharpe:.2f}, MDD: {port_mdd:.2%}")
    print(f"Benchmark Return: {bench_ret:.2%}, Vol: {bench_vol:.2%}, Sharpe: {bench_sharpe:.2f}, MDD: {bench_mdd:.2%}")
    
    # Format data for table
    columns = ('Metrics', 'Intelliportfolio (GA+BL)', 'Benchmark (TDEX SET50 ETF)')
    cell_text = [
        ['Annualized Expected Return', f"{port_ret*100:.2f}%", f"{bench_ret*100:.2f}%"],
        ['Annualized Volatility', f"{port_vol*100:.2f}%", f"{bench_vol*100:.2f}%"],
        ['Sharpe Ratio (Risk-Free 2%)', f"{port_sharpe:.2f}", f"{bench_sharpe:.2f}"],
        ['Maximum Drawdown (MDD)', f"{port_mdd*100:.2f}%", f"{bench_mdd*100:.2f}%"],
        ['Alpha (Outperformance)', f"{alpha*100:.2f}%", '0.00%']
    ]

    fig, ax = plt.subplots(figsize=(10, 4))
    ax.axis('off')
    ax.axis('tight')

    table = ax.table(cellText=cell_text, colLabels=columns, loc='center', cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(14)
    table.scale(1.2, 2.5)

    for i, key in enumerate(columns):
        cell = table[0, i]
        cell.set_text_props(weight='bold', color='white')
        cell.set_facecolor('#4A90E2')
        
    for i in range(1, len(cell_text) + 1):
        table[i, 0].set_text_props(weight='bold')
        table[i, 1].set_facecolor('#E8F5E9')
        table[i, 1].set_text_props(weight='bold', color='#2ca02c')
        
    plt.title(f'Table 3.X: Historical Validation (Data: {start_date} to {end_date})', 
              fontsize=16, weight='bold', pad=20)
    
    os.makedirs('docs', exist_ok=True)
    save_path = os.path.join('docs', 'validation_metrics.png')
    plt.savefig(save_path, bbox_inches='tight', dpi=300)
    plt.close()
    print(f"Generated {save_path}")

if __name__ == "__main__":
    main()
