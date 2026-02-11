"""
TEMPLATE for Pipeline Scripts

Copy this template for each new script in your pipeline.
Replace XX with your script number (03, 04, 05, etc.)

Instructions:
1. Copy this file and rename it (e.g., 03_my_analysis.py)
2. Update INPUT_CSV to read from the previous script's output
3. Update OUTPUT_CSV with a new name for this script's output
4. Add your processing logic in STEP 2
5. Run scripts in order: 01 → 02 → 03 → ... → 22
"""

import pandas as pd
from pathlib import Path

# ============================================================================
# CONFIGURATION - UPDATE THESE FOR EACH SCRIPT
# ============================================================================
# Input: Which output file from the previous script?
# Example: If this is script 03, read from 02's output
INPUT_CSV = Path(__file__).parent.parent / "outputs" / "XX_previous_output.csv"

# Output: What should this script save?
OUTPUT_CSV = Path(__file__).parent.parent / "outputs" / "XX_your_output.csv"
# Add more outputs if needed (graphs, text files, etc.)
# OUTPUT_GRAPH = Path(__file__).parent.parent / "outputs" / "XX_graph.png"

# ============================================================================
# STEP 1: READ DATA
# ============================================================================
print("=" * 80)
print(f"SCRIPT XX: [Describe what this script does]")
print("=" * 80)

# Check if input exists
if not INPUT_CSV.exists():
    print(f"ERROR: Input file not found: {INPUT_CSV}")
    print("Make sure to run the previous script first!")
    exit(1)

# Read data from previous step
df = pd.read_csv(INPUT_CSV)
print(f"Loaded data: {df.shape[0]} rows, {df.shape[1]} columns")

# ============================================================================
# STEP 2: YOUR PROCESSING LOGIC HERE
# ============================================================================
print("\nProcessing data...")

# TODO: Add your analysis code here
result_df = df.copy()
# Example:
# result_df['new_column'] = df['old_column'] * 2
# result_df = result_df.groupby('category').sum()

print(f"Processing complete: {len(result_df)} rows")

# ============================================================================
# STEP 3: SAVE OUTPUTS
# ============================================================================
print("\nSaving outputs...")

# Save main CSV output
result_df.to_csv(OUTPUT_CSV, index=False)
print(f"✓ Saved: {OUTPUT_CSV}")

# If you create graphs or other outputs:
# import matplotlib.pyplot as plt
# plt.figure()
# plt.plot(result_df['x'], result_df['y'])
# plt.savefig(OUTPUT_GRAPH)
# print(f"✓ Saved: {OUTPUT_GRAPH}")

print("\n✓ DONE! Ready for next script.")
