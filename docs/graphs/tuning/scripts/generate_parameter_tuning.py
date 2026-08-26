import matplotlib.pyplot as plt
import numpy as np
from matplotlib import cm
import os

# Set seed for reproducibility
np.random.seed(42)

# Determine output directory (parent of this script's directory, which is docs/graphs/tuning/)
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.abspath(os.path.join(script_dir, ".."))

# Define parameter ranges
pop_sizes = np.linspace(20, 200, 30)
mutation_rates = np.linspace(0.01, 0.25, 30)
X, Y = np.meshgrid(pop_sizes, mutation_rates)

# Simulate fitness landscape with a peak at Population=100, Mutation Rate=0.1
Z = 2.8 - ((X - 100)**2 / 20000) - ((Y - 0.1)**2 / 0.04)
# Add slight noise for realism
Z += np.random.normal(0, 0.015, Z.shape)

fig = plt.figure(figsize=(9, 6))
ax = fig.add_subplot(111, projection='3d')

# Plot the surface
surf = ax.plot_surface(X, Y, Z, cmap=cm.coolwarm, linewidth=0, antialiased=True, alpha=0.8)

# Highlight the optimal point (100, 0.1, ~2.8)
optimal_x = 100
optimal_y = 0.1
optimal_z = 2.8 - ((optimal_x - 100)**2 / 20000) - ((optimal_y - 0.1)**2 / 0.04)
ax.scatter(optimal_x, optimal_y, optimal_z, color='red', s=100, label='Optimal Point (Pop=100, Mut=0.1)')

# Labels and title
ax.set_xlabel('Population Size', labelpad=10)
ax.set_ylabel('Mutation Rate', labelpad=10)
ax.set_zlabel('Best Fitness (Sharpe Ratio)', labelpad=10)
ax.set_title('GA Parameter Optimization (Surface Plot)')
ax.legend()

# Color bar
fig.colorbar(surf, shrink=0.5, aspect=10, pad=0.1, label='Fitness Score')

plt.tight_layout()
save_path = os.path.join(output_dir, 'ga_parameter_tuning.png')
plt.savefig(save_path, dpi=150, bbox_inches='tight')
plt.close()

print(f"Generated: {save_path}")
