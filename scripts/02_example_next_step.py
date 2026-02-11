"""
Example script showing how to read from previous step and create output for next step.

This script demonstrates the pipeline pattern:
1. Read the output from the previous script (01_first_analysis.py)
2. Process the data
3. Save output for the next script (03_...)
"""

import pandas as pd
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================
# Input: Read the output from the previous script
INPUT_CSV = Path(__file__).parent.parent / "outputs" / "01_outputs_historical_scopes.csv"

# Output: Save results for the next script
OUTPUT_CSV = Path(__file__).parent.parent / "outputs" / "02_processed_results.csv"
OUTPUT_GRAPH = Path(__file__).parent.parent / "outputs" / "02_graph.png"

# ============================================================================
# STEP 1: READ DATA FROM PREVIOUS SCRIPT
# ============================================================================
print("=" * 80)
print("STEP 1: READING DATA FROM PREVIOUS SCRIPT")
print("=" * 80)

# Check if input file exists
if not INPUT_CSV.exists():
    print(f"ERROR: Input file not found at: {INPUT_CSV}")
    print("Please run 01_first_analysis.py first!")
    exit(1)

# Read the CSV output from previous step
df = pd.read_csv(INPUT_CSV)
print(f"Loaded data shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFirst few rows:\n{df.head()}\n")

# ============================================================================
# STEP 2: PROCESS YOUR DATA
# ============================================================================
print("=" * 80)
print("STEP 2: PROCESSING DATA")
print("=" * 80)

# Example: Do some calculations
# Replace this with your actual analysis
processed_df = df.copy()
# ... your processing logic here ...

print(f"Processed {len(processed_df)} rows")

# ============================================================================
# STEP 3: SAVE OUTPUTS FOR NEXT SCRIPT
# ============================================================================
print("=" * 80)
print("STEP 3: SAVING OUTPUTS")
print("=" * 80)

# Save CSV output (for next script to read)
processed_df.to_csv(OUTPUT_CSV, index=False)
print(f"✓ Saved CSV to: {OUTPUT_CSV}")

# If you create graphs, save them too
# import matplotlib.pyplot as plt
# plt.figure()
# ... create your graph ...
# plt.savefig(OUTPUT_GRAPH)
# print(f"✓ Saved graph to: {OUTPUT_GRAPH}")

print("\n" + "=" * 80)
print("DONE! Output files are ready for the next script.")
print("=" * 80)
