# pyright: ignore [reportAttributeAccessIssue, reportUnusedParameter, reportMissingImports]
import random
import numpy as np
import pandas as pd
from typing import Dict
from deap import base, creator, tools, algorithms

class BlackLittermanEngine:
    @staticmethod
    def calculate_posterior(market_caps: pd.Series, cov_matrix: pd.DataFrame, views_data: Dict[str, Dict[str, float]]):
        tickers = list(cov_matrix.columns)
        n = len(tickers)
        S = cov_matrix.values
        w_mkt = market_caps.values / market_caps.sum()
        pi = 2.5 * np.dot(S, w_mkt)  # type: ignore
        
        if not views_data:
            return pi, S
        p_list, q_list, omega_diag = [], [], []
        for t, data in views_data.items():
            if t in tickers:
                row = np.zeros(n)
                row[tickers.index(t)] = 1
                p_list.append(row)
                q_list.append(data['return_view'])
                omega_diag.append(data.get('variance', 0.05))
        
        if not q_list:
            return pi, S
        P, Q, tau = np.array(p_list), np.array(q_list), 0.05
        Omega = np.diag(omega_diag) 
        term1 = np.linalg.inv(np.linalg.inv(tau * S) + np.dot(np.dot(P.T, np.linalg.inv(Omega)), P))  # type: ignore
        term2 = np.dot(np.linalg.inv(tau * S), pi) + np.dot(np.dot(P.T, np.linalg.inv(Omega)), Q)  # type: ignore
        return np.dot(term1, term2), S

class GeneticPortfolioOptimizer:
    def __init__(self, risk_free_rate: float = 0.025):
        self.rf = risk_free_rate
        if not hasattr(creator, "FitnessMax"):
            creator.create("FitnessMax", base.Fitness, weights=(1.0,))
            creator.create("Individual", list, fitness=creator.FitnessMax)  # type: ignore

    def run_optimization(self, tickers, bl_returns, cov_matrix, market_caps, target_beta=1.0, max_stocks=5, actual_betas=None, locked_stocks=None, max_weight_per_asset=0.20):
        """
        ฟังก์ชันคำนวณสัดส่วนพอร์ตที่เหมาะสมที่สุดด้วย Genetic Algorithm
        :param max_stocks: จำนวนหุ้นสูงสุดในพอร์ต (รองรับขั้นต่ำ 3 ตัวตามที่คุณต้องการ)
        :param max_weight_per_asset: จำกัดสัดส่วนน้ำหนักสูงสุดต่อหุ้น 1 ตัว (ค่าเริ่มต้น 20%)
        """
        if locked_stocks is None:
            locked_stocks = []
        # Append .BK if not present to match valid_tickers format
        locked_stocks_bk = [f"{t}.BK" if not t.endswith(".BK") else t for t in locked_stocks]
        locked_indices = [tickers.index(t) for t in locked_stocks_bk if t in tickers]


        random.seed(42)
        np.random.seed(42)
        
        cov = getattr(cov_matrix, "values", cov_matrix)  # type: ignore
        
        if actual_betas is None:
            asset_betas = np.ones(len(tickers))
        else:
            asset_betas = getattr(actual_betas, "values", actual_betas)

        toolbox = base.Toolbox()
        toolbox.register("attr", random.random)
        toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr, n=len(tickers))  # type: ignore
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)  # type: ignore
        
        def evaluate(ind):
            w = np.array(ind)
            w = np.maximum(w, 0)
            
            # 🌟 ส่วนการกรองจำนวนหุ้นให้เหลือเท่ากับ max_stocks (เช่น 3, 5 หรือ 10)
            if np.count_nonzero(w) > max_stocks:
                w_temp = w.copy()
                if locked_indices:
                    w_temp[locked_indices] += 1000.0  # บังคับให้หุ้นที่เลือกรอดจากการตัดออก
                threshold = np.sort(w_temp)[-max_stocks]
                w[w_temp < threshold] = 0.0

            if locked_indices:
                w[locked_indices] = np.maximum(w[locked_indices], 0.01)
            
            w_sum = np.sum(w)
            if w_sum <= 0:
                return -999.0,
            
            # คำนวณผลตอบแทนและความผันผวนของพอร์ต (เราไม่ได้ normalize ในระดับ ind เพื่อให้ penalty ทำงาน)
            w_normalized = w / w_sum
            p_ret = np.dot(w_normalized, bl_returns)
            p_vol = np.sqrt(np.dot(w_normalized.T, np.dot(cov, w_normalized)))  # type: ignore
            if p_vol == 0:
                return -999.0,
            
            # Sharpe Ratio: วัดความคุ้มค่าของผลตอบแทนต่อความเสี่ยง
            sharpe = (p_ret - self.rf) / p_vol
            
            # Penalty: บทลงโทษค่าน้ำหนัก (ให้รวมกันได้ 100%) ตามเอกสารข้อ 2.1.6.2
            weight_penalty = 1000.0 * ((w_sum - 1.0) ** 2)
            
            # Penalty: บทลงโทษหากค่า Beta เบี่ยงเบนจากเป้าหมาย
            beta_penalty = abs(np.dot(w_normalized, asset_betas) - target_beta) * 10  # type: ignore
            
            # Penalty: บทลงโทษหากมีหุ้นตัวใดตัวหนึ่งมีน้ำหนักเกินกำหนด (Max Weight Limit)
            max_weight_penalty = 0.0
            if np.max(w_normalized) > max_weight_per_asset:
                # ลงโทษรุนแรงตามส่วนที่เกินมา
                max_weight_penalty = 50.0 * (np.max(w_normalized) - max_weight_per_asset)

            # Fitness_penalized
            return (sharpe - weight_penalty - beta_penalty - max_weight_penalty),

        toolbox.register("evaluate", evaluate)
        toolbox.register("mate", tools.cxBlend, alpha=0.5)
        toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=0.2, indpb=0.1)
        toolbox.register("select", tools.selTournament, tournsize=3)

        # --- การรัน GA แบบ Manual พร้อมแสดงผลการวิวัฒนาการ (Logs) ---
        pop = toolbox.population(n=100)  # type: ignore
        hof = tools.HallOfFame(1)
        ngen = 50 # จำนวนรุ่นในการวิวัฒนาการ
        cxpb, mutpb = 0.8, 0.1

        print(f"\n🚀 เริ่มต้น GA (จำนวนหุ้นสูงสุด: {max_stocks}, เป้าหมาย Beta: {target_beta})")
        print("-" * 65)

        for gen in range(ngen):
            offspring = algorithms.varAnd(pop, toolbox, cxpb=cxpb, mutpb=mutpb)
            fits = toolbox.map(toolbox.evaluate, offspring)  # type: ignore
            for ind, fit in zip(offspring, fits):
                ind.fitness.values = fit
            pop = toolbox.select(offspring, k=len(pop))  # type: ignore
            hof.update(pop)
            
            # แสดงค่า Fitness ทุกๆ 10 รุ่นเพื่อติดตามการเรียนรู้ของ AI
            if gen % 10 == 0 or gen == ngen - 1:
                best_val = hof[0].fitness.values[0]
                print(f"🧬 Generation {gen:03d}: Best Fitness = {best_val:.4f}")

        print("-" * 65)
        print("✅ กระบวนการ Genetic Algorithm เสร็จสมบูรณ์!")

        best_w = np.array(hof[0])
        best_w = np.maximum(best_w, 0)
        
        # 🌟 บังคับให้เหลือเฉพาะหุ้นที่กำหนด (max_stocks) ในขั้นตอนสุดท้าย
        if np.count_nonzero(best_w) > max_stocks:
            best_w_temp = best_w.copy()
            if locked_indices:
                best_w_temp[locked_indices] += 1000.0
            threshold = np.sort(best_w_temp)[-max_stocks]
            best_w[best_w_temp < threshold] = 0.0
            
        if locked_indices:
            best_w[locked_indices] = np.maximum(best_w[locked_indices], 0.01)

        if np.sum(best_w) > 0:
            best_w /= np.sum(best_w)  # Normalize ครั้งสุดท้ายก่อนนำไปใช้จริง
        else:
            best_w = np.ones(len(tickers)) / len(tickers)
        
        # แสดงสถานะสุดท้ายของพอร์ตก่อนส่งกลับ
        final_ret = float(np.dot(best_w, bl_returns))
        final_vol = float(np.sqrt(np.dot(best_w.T, np.dot(cov, best_w))))  # type: ignore
        final_beta = float(np.dot(best_w, asset_betas))  # type: ignore
        print(f"📈 ผลตอบแทนคาดหวังรายปี: {final_ret:.2%}")
        print(f"🛡️ ค่าความเสี่ยงพอร์ต (Beta): {final_beta:.4f}")

        portfolio_df = pd.DataFrame({'Ticker': tickers, 'Weight': best_w, 'Beta': asset_betas})  # type: ignore
        return portfolio_df, final_ret, final_vol