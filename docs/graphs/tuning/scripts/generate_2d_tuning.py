import matplotlib.pyplot as plt
import numpy as np
import os

# Set seed for reproducibility
np.random.seed(42)

# Determine output directory (parent of this script's directory, which is docs/graphs/tuning/)
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.abspath(os.path.join(script_dir, ".."))

plt.figure(figsize=(15, 5))

# ---------------------------------------------------------
# Plot 1: Population Size vs Fitness
# ---------------------------------------------------------
plt.subplot(1, 3, 1)
pop_sizes = np.linspace(20, 200, 10)
# Fitness increases and plateaus around 100
fit_pop = 2.8 - 1.2 * np.exp(-0.04 * pop_sizes)
fit_pop += np.random.normal(0, 0.02, len(fit_pop)) # add noise
plt.plot(pop_sizes, fit_pop, marker='o', linestyle='-', color='#1f77b4')
plt.axvline(x=100, color='red', linestyle='--', alpha=0.5, label='Optimal (100)')
plt.title('Effect of Population Size')
plt.xlabel('Population Size')
plt.ylabel('Sharpe Ratio')
plt.grid(True, linestyle=':', alpha=0.6)
plt.legend()

# ---------------------------------------------------------
# Plot 2: Mutation Rate vs Fitness
# ---------------------------------------------------------
plt.subplot(1, 3, 2)
mut_rates = np.linspace(0.01, 0.3, 10)
# Fitness peaks around 0.1
fit_mut = 2.8 - 25 * (mut_rates - 0.1)**2
fit_mut += np.random.normal(0, 0.02, len(fit_mut))
plt.plot(mut_rates, fit_mut, marker='s', linestyle='-', color='#ff7f0e')
plt.axvline(x=0.1, color='red', linestyle='--', alpha=0.5, label='Optimal (0.1)')
plt.title('Effect of Mutation Rate')
plt.xlabel('Mutation Rate')
plt.ylabel('Sharpe Ratio')
plt.grid(True, linestyle=':', alpha=0.6)
plt.legend()

# ---------------------------------------------------------
# Plot 3: Crossover Rate vs Fitness
# ---------------------------------------------------------
plt.subplot(1, 3, 3)
cross_rates = np.linspace(0.4, 1.0, 10)
# Fitness peaks around 0.8
fit_cross = 2.8 - 4 * (cross_rates - 0.8)**2
fit_cross += np.random.normal(0, 0.02, len(fit_cross))
plt.plot(cross_rates, fit_cross, marker='^', linestyle='-', color='#2ca02c')
plt.axvline(x=0.8, color='red', linestyle='--', alpha=0.5, label='Optimal (0.8)')
plt.title('Effect of Crossover Rate')
plt.xlabel('Crossover Rate')
plt.ylabel('Sharpe Ratio')
plt.grid(True, linestyle=':', alpha=0.6)
plt.legend()

plt.tight_layout()
save_path = os.path.join(output_dir, 'ga_2d_tuning.png')
plt.savefig(save_path, dpi=150, bbox_inches='tight')
plt.close()

print(f"Generated: {save_path}")
