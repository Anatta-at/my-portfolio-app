# pyright: ignore [reportAttributeAccessIssue, reportUnusedParameter, reportMissingImports]
import random
import time
import numpy as np
import pandas as pd
from typing import Dict
from deap import base, creator, tools, algorithms

class BlackLittermanEngine:
    @staticmethod
    def calculate_posterior(market_caps: pd.Series, cov_matrix: pd.DataFrame, views_data: Dict[str, Dict[str, float]], tau: float = 0.05):
        """
        คำนวณผลตอบแทนคาดหวังชุดใหม่ (Posterior Expected Returns) ตามแบบจำลอง Black-Litterman (BL)
        โดยผสาน 'ดุลยภาพตลาด (Prior: Π)' เข้ากับ 'มุมมองผู้ลงทุน (Investor Views: Q)' ผ่าน Bayesian Updating
        ตามสมการในงานวิจัย:
          E(R) = [(τΣ)^-1 + P^T Ω^-1 P]^-1 [(τΣ)^-1 Π + P^T Ω^-1 Q]
        :param market_caps: มูลค่าตามราคาตลาดของหุ้นแต่ละตัว
        :param cov_matrix: เมทริกซ์ความแปรปรวนร่วม (Covariance Matrix)
        :param views_data: พจนานุกรมมุมมองของนักลงทุน เช่น {'PTT': {'return_view': 0.15, 'variance': 0.02}}
        :param tau: สเกลาร์ควบคุมความไม่แน่นอน กำหนดไว้ที่ 0.05 ตามผลการทดสอบ Sensitivity Analysis ในงานวิจัย
        """
        tickers = list(cov_matrix.columns)
        n = len(tickers)
        S = cov_matrix.values
        
        # 1. w_mkt = สัดส่วนมูลค่าตลาดของหุ้นแต่ละตัว (Market Capitalization Weights)
        w_mkt = market_caps.values / market_caps.sum()
        
        # 2. Π (Prior Returns) = ผลตอบแทนดุลยภาพตลาดตามกลไก Reverse Optimization
        # โดยกำหนดค่าสัมประสิทธิ์ความหลีกเลี่ยงความเสี่ยงตลาด δ (Risk Aversion) = 2.5 ตามงานวิจัย
        pi = 2.5 * np.dot(S, w_mkt)  # type: ignore
        
        # 3. หากไม่มีมุมมองของนักลงทุน (Investor Views) ส่งมา ให้ส่งค่าดุลยภาพตลาด (Π) คืนกลับทันที
        if not views_data:
            return pi, S
            
        # 4. แปลงมุมมองของนักลงทุนให้อยู่ในรูปเมทริกซ์ P, เวกเตอร์ Q และเมทริกซ์ความคลาดเคลื่อน Ω
        p_list, q_list, omega_diag = [], [], []
        clean_tickers = [t.replace(".BK", "").strip().upper() for t in tickers]
        
        for t, data in views_data.items():
            clean_t = t.replace(".BK", "").strip().upper()
            if clean_t in clean_tickers:
                idx = clean_tickers.index(clean_t)
                row = np.zeros(n)
                row[idx] = 1.0  # Absolute View สำหรับหุ้นตัวนี้
                p_list.append(row)
                q_list.append(float(data.get('return_view', 0.10)))
                # ค่าความไม่แน่นอน (Variance) ยิ่งน้อยยิ่งแปลว่ามั่นใจมาก ค่าเริ่มต้น 0.02
                omega_diag.append(float(data.get('variance', 0.02)))
                
        # หากไม่มีมุมมองที่ตรงกับรายชื่อหุ้นในพอร์ต ให้คืนค่าดุลยภาพตลาด
        if not q_list:
            return pi, S
            
        P = np.array(p_list)        # Shape: (k, n)
        Q = np.array(q_list)        # Shape: (k,)
        Omega = np.diag(omega_diag) # Shape: (k, k)
        
        # 5. คำนวณ Bayesian Updating ตามสมการ Black-Litterman ในงานวิจัย
        # ใช้ pseudo-inverse เพื่อความเสถียรทางตัวเลข (Numerical Stability)
        tau_S_inv = np.linalg.pinv(tau * S)
        Omega_inv = np.linalg.pinv(Omega)
        
        # M_inv = (τΣ)^-1 + P^T Ω^-1 P
        M_inv = tau_S_inv + np.dot(np.dot(P.T, Omega_inv), P)
        M = np.linalg.pinv(M_inv)
        
        # E(R) = M * [ (τΣ)^-1 Π + P^T Ω^-1 Q ]
        term_market = np.dot(tau_S_inv, pi)
        term_views = np.dot(np.dot(P.T, Omega_inv), Q)
        posterior_returns = np.dot(M, term_market + term_views)
        
        # ปรับปรุงเมทริกซ์ความแปรปรวนร่วมหลังผสานมุมมอง: Σ_bl = Σ + M
        updated_cov = S + M
        
        print(f"📊 ผสานมุมมองของนักลงทุนสำเร็จ: {len(q_list)} หุ้น (τ = {tau})")
        for clean_t, ret in zip([t for t in views_data if t.replace('.BK', '').strip().upper() in clean_tickers], q_list):
            print(f"   💡 {clean_t}: คาดหวังกำไร {ret:.2%}")
            
        return posterior_returns, updated_cov

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
        locked_stocks_clean = [t.replace(".BK", "") for t in locked_stocks]
        locked_indices = [tickers.index(t) for t in locked_stocks_clean if t in tickers]


        # ✅ กำหนดค่า Seed คงที่ (42) ตามระเบียบวิธีวิจัย เพื่อให้ผลลัพธ์มีความสม่ำเสมอและแม่นยำ (Reproducible)
        # เมื่อผู้ใช้กรอกเงื่อนไขเดิมทุกประการ จะได้ผลลัพธ์พอร์ตเดิมตรงกัน 100% เสมอ
        seed = 42
        random.seed(seed)
        np.random.seed(seed)
        
        cov = getattr(cov_matrix, "values", cov_matrix)  # type: ignore
        
        if actual_betas is None:
            asset_betas = np.ones(len(tickers))
        else:
            asset_betas = getattr(actual_betas, "values", actual_betas)

        toolbox = base.Toolbox()
        toolbox.register("attr", random.random)
        toolbox.register("individual", tools.initRepeat, creator.Individual, toolbox.attr, n=len(tickers))  # type: ignore
        toolbox.register("population", tools.initRepeat, list, toolbox.individual)  # type: ignore
        
        # =========================================================================
        # ⭐⭐⭐ ตรงนี้คือสูตร FITNESS FUNCTION ของจริง ที่ใช้ประเมินคะแนนแต่ละพอร์ต ⭐⭐⭐
        # =========================================================================
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

        # =========================================================================
        # ⭐⭐⭐ ตรงนี้คือการตั้งค่า พารามิเตอร์ ของ GA (ประชากร, รุ่น, โอกาสผสมพันธุ์) ⭐⭐⭐
        # =========================================================================
        pop = toolbox.population(n=100)  # จำนวนประชากรพอร์ต (Population) = 100
        hof = tools.HallOfFame(1)
        ngen = 50 # จำนวนรุ่นในการวิวัฒนาการ (Generations) = 50 รุ่น
        cxpb, mutpb = 0.8, 0.1 # โอกาสผสมพันธุ์ (Crossover) 80%, โอกาสกลายพันธุ์ (Mutation) 10%

        print(f"\n🚀 เริ่มต้น GA (จำนวนหุ้นสูงสุด: {max_stocks}, เป้าหมาย Beta: {target_beta})")
        print("-" * 65)

        for gen in range(ngen):
            offspring = algorithms.varAnd(pop, toolbox, cxpb=cxpb, mutpb=mutpb)
            fits = toolbox.map(toolbox.evaluate, offspring)  # type: ignore
            for ind, fit in zip(offspring, fits):
                ind.fitness.values = fit
            pop = toolbox.select(offspring, k=len(pop))  # type: ignore
            hof.update(pop)  # อัปเดตพอร์ตแชมป์ถ้ารุ่นนี้มีตัวที่ดีกว่าเดิม

            # แสดงความคืบหน้าทุก 10 รุ่น และรุ่นสุดท้าย เพื่อติดตามการเรียนรู้
            if gen % 10 == 0 or gen == ngen - 1:
                best_val = hof[0].fitness.values[0]  # ดึงค่า Fitness ดีที่สุดในรุ่นนี้
                print(f"🧬 Generation {gen:03d}: Best Fitness = {best_val:.4f}")

        print("-" * 65)
        print("✅ กระบวนการ Genetic Algorithm เสร็จสมบูรณ์!")

        # ดึงพอร์ตแชมป์ที่ดีที่สุดตลอด 50 รุ่นออกมาเป็น array น้ำหนักหุ้น
        best_w = np.array(hof[0])
        best_w = np.maximum(best_w, 0)  # ตัดน้ำหนักติดลบออก (ไม่มีการ Short Sell)

        # ── ขั้นตอนสุดท้าย: บังคับให้มีจำนวนหุ้นไม่เกิน max_stocks ──
        if np.count_nonzero(best_w) > max_stocks:  # ถ้ามีหุ้นในพอร์ตเกินที่กำหนด
            best_w_temp = best_w.copy()             # สำเนาน้ำหนักไว้ทำงานชั่วคราว
            if locked_indices:
                best_w_temp[locked_indices] += 1000.0  # บวก 1000 ให้หุ้น locked ไม่ถูกตัดทิ้ง
            threshold = np.sort(best_w_temp)[-max_stocks]  # หาค่าขีดแบ่ง top N หุ้น
            best_w[best_w_temp < threshold] = 0.0           # หุ้นที่น้อยกว่าขีดแบ่ง → ตัดออก

        # ── บังคับหุ้น locked ให้ติดอยู่ในพอร์ตเสมอ (น้ำหนักขั้นต่ำ 5%) ──
        if locked_indices:
            best_w[locked_indices] = np.maximum(best_w[locked_indices], 0.05)

        # ── Normalize น้ำหนักให้รวมกันได้ 100% พอดี ──
        if np.sum(best_w) > 0:
            best_w /= np.sum(best_w)  # หารด้วยผลรวม → ทุกตัวรวมกัน = 1.0 (100%)
            # ตรวจสอบซ้ำว่าหลัง normalize หุ้นที่ล็อกต้องมีน้ำหนักอย่างน้อย 3% เสมอ
            if locked_indices:
                for l_idx in locked_indices:
                    if best_w[l_idx] < 0.03:
                        best_w[l_idx] = 0.03
                best_w /= np.sum(best_w)
        else:
            best_w = np.ones(len(tickers)) / len(tickers)  # กรณีพิเศษ: แจกเท่ากันทุกหุ้น

        # ── คำนวณตัวเลขสรุปของพอร์ตที่ดีที่สุด เพื่อแสดงผลและส่งกลับ ──
        final_ret  = float(np.dot(best_w, bl_returns))                          # ผลตอบแทนรายปีที่คาดหวัง
        final_vol  = float(np.sqrt(np.dot(best_w.T, np.dot(cov, best_w))))      # ความผันผวน (std dev) รายปี  # type: ignore
        final_beta = float(np.dot(best_w, asset_betas))                         # Beta รวมของพอร์ต  # type: ignore
        print(f"📈 ผลตอบแทนคาดหวังรายปี: {final_ret:.2%}")
        print(f"🛡️ ค่าความเสี่ยงพอร์ต (Beta): {final_beta:.4f}")

        # ── สร้าง DataFrame สรุปพอร์ต และคืนค่ากลับให้ main.py นำไป Backtest และบันทึก DB ──
        portfolio_df = pd.DataFrame({'Ticker': tickers, 'Weight': best_w, 'Beta': asset_betas})  # type: ignore
        return portfolio_df, final_ret, final_vol  # ส่ง: ตารางพอร์ต, ผลตอบแทน, ความผันผวน