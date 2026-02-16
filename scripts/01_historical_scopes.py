"""
Script 01: Historical Scopes Calculation

This script reads the Excel data file and calculates:
- Scope 1 emissions (direct combustion + calcination)
- Scope 2 emissions (purchased electricity)
- Scope 3 emissions (transportation)

Outputs a CSV file for use by subsequent scripts.
"""

import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================
# Get the path relative to the project root
INPUT_PATH = Path(__file__).parent.parent / "data" / "Paper_Data.xlsx"
OUTPUT_CSV = Path(__file__).parent.parent / "outputs" / "01_historical_scopes.csv"

# Flag: assume calcination EF is per ton clinker (True) or per ton cement (False)
CALC_EF_IS_PER_CLINKER = True

# Weighted split for Scope 3 trucking: 60% overloaded, 40% allowed
OVERLOAD_FRAC = 0.60
ALLOWED_FRAC = 0.40

# ============================================================================
# STEP 1: INSPECT FILE STRUCTURE
# ============================================================================
print("=" * 80)
print("STEP 1: FILE INSPECTION")
print("=" * 80)

# Read Excel to inspect sheets and headers
excel_file = pd.ExcelFile(INPUT_PATH)
sheet_names = excel_file.sheet_names
print(f"\nAvailable sheets: {sheet_names}")

# Use first sheet
sheet_name = sheet_names[0]
print(f"Using sheet: '{sheet_name}'")

# Read first few rows to detect header structure
df_raw = pd.read_excel(INPUT_PATH, sheet_name=sheet_name, nrows=5)
print(f"\nFirst 5 rows (raw):\n{df_raw}\n")
print(f"Column names: {df_raw.columns.tolist()}\n")

# ============================================================================
# STEP 2: HANDLE HEADERS & READ FULL DATA
# ============================================================================
print("=" * 80)
print("STEP 2: READ FULL DATA & HANDLE HEADERS")
print("=" * 80)

# Read with single header
df = pd.read_excel(INPUT_PATH, sheet_name=sheet_name, header=0)

print(f"Data shape: {df.shape}")
print(f"\nAll columns in file:\n{df.columns.tolist()}\n")
print(f"First 3 data rows:\n{df.head(3)}\n")
print(f"Data types:\n{df.dtypes}\n")

# ============================================================================
# STEP 3: COLUMN MAPPING
# ============================================================================
print("=" * 80)
print("STEP 3: BUILD COLUMN MAPPING")
print("=" * 80)

# Strip whitespace from column names first
df.columns = df.columns.str.strip()

# Create a mapping from raw column names to standardized names
COLUMN_MAPPING = {
    'Fiscal Year - July - June': 'year',
    'Total Cement Production-Tons': 'cement_t',
    'Local dispatches (North, South)-Tons': 'local_t',
    'Total Exports-Tons': 'total_exp_t',
    'Exports (South)-Tons': 'exp_s_t',
    'Exports (North)-Tons': 'exp_n_t',
    'Coal intensity - (kg coal / ton cement)': 'coal_int_kgpt',
    'Electricity intensity - (kWh / ton cement)': 'elec_int_kwhpt',
    'Clinker ratio-%': 'clinker_ratio',
    'Coal parameters: NCV': 'ncv',
    'Coal parameters: CO2 combustion EF': 'co2_ef_tco2_per_tj',
    'Coal parameters: Oxidized carbon fraction': 'oxid_frac',
    'Calcination emission factor - (tCO2 / ton clinker)': 'calc_ef',
    'Grid electricity EF - (kgCO2 / kWh)': 'grid_ef_kg_per_kwh',
    'Truck capcity Tons- (Allowed Load)': 'cap_allowed_t',
    'Truck capcity Tons - (Over Load)': 'cap_over_t',
    'Truck emission factor - Allowed (g CO2 /km)': 'ef_allowed_gpkm',
    'Truck emission factor - OverLoad (g CO2 /km)': 'ef_over_gpkm',
    'Local Transport distances - (km)': 'dist_local_km',
    'North Export Transport distances - (km)': 'dist_exp_n_km',
    'South Export Transport distances- (km)': 'dist_exp_s_km'
}

print("Column mapping created successfully!")
print(f"Mapped {len(COLUMN_MAPPING)} columns\n")

# Rename columns
df.rename(columns=COLUMN_MAPPING, inplace=True)
print("Columns renamed to standardized names:")
print(df.columns.tolist())

# ============================================================================
# STEP 4: DATA CLEANING & VALIDATION
# ============================================================================
print("\n" + "=" * 80)
print("STEP 4: DATA CLEANING & VALIDATION")
print("=" * 80)

# Check for missing values
missing = df.isnull().sum()
if missing.sum() > 0:
    print("\nWarning: Missing values found:")
    print(missing[missing > 0])
else:
    print("\n✓ No missing values detected")

# Convert percentages if needed (clinker_ratio is likely in % format)
if df['clinker_ratio'].max() > 1.5:
    print("\nConverting clinker_ratio from percentage to decimal...")
    df['clinker_ratio'] = df['clinker_ratio'] / 100.0

print(f"\nData summary:")
print(f"  Years covered: {df['year'].min()} to {df['year'].max()}")
print(f"  Total records: {len(df)}")
print(f"  Total cement production range: {df['cement_t'].min():,.0f} - {df['cement_t'].max():,.0f} tons")

# ============================================================================
# STEP 5: CALCULATE SCOPE 1 EMISSIONS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 5: CALCULATE SCOPE 1 EMISSIONS")
print("=" * 80)

# Scope 1a: Coal combustion emissions
# Formula: (coal_intensity * cement_prod * NCV * CO2_EF * oxidation_frac) / 1e6
# Units: (kg/t * t * TJ/kt * tCO2/TJ * fraction) / 1e6 = tCO2
df['scope1a_combustion_tco2'] = (
    df['coal_int_kgpt'] *      # kg coal per ton cement
    df['cement_t'] *            # tons cement
    df['ncv'] *                 # TJ/kt (net calorific value)
    df['co2_ef_tco2_per_tj'] *  # tCO2/TJ
    df['oxid_frac']             # oxidation fraction
) / 1e6  # Convert kg to kt in denominator

print("✓ Scope 1a (combustion) calculated")

# Scope 1b: Calcination emissions
# Formula depends on whether calc_ef is per ton clinker or per ton cement
if CALC_EF_IS_PER_CLINKER:
    # calc_ef is per ton clinker, so multiply by clinker produced
    df['clinker_t'] = df['cement_t'] * df['clinker_ratio']
    df['scope1b_calcination_tco2'] = df['clinker_t'] * df['calc_ef']
    print("✓ Scope 1b (calcination) calculated - using clinker basis")
else:
    # calc_ef is per ton cement, so multiply by cement produced
    df['scope1b_calcination_tco2'] = df['cement_t'] * df['calc_ef']
    print("✓ Scope 1b (calcination) calculated - using cement basis")

# Total Scope 1
df['scope1_total_tco2'] = df['scope1a_combustion_tco2'] + df['scope1b_calcination_tco2']
print(f"✓ Scope 1 total calculated")
print(f"  Average Scope 1: {df['scope1_total_tco2'].mean():,.0f} tCO2/year")

# ============================================================================
# STEP 6: CALCULATE SCOPE 2 EMISSIONS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 6: CALCULATE SCOPE 2 EMISSIONS")
print("=" * 80)

# Scope 2: Purchased electricity emissions
# Formula: (elec_intensity * cement_prod * grid_EF) / 1000
# Units: (kWh/t * t * kgCO2/kWh) / 1000 = tCO2
df['scope2_electricity_tco2'] = (
    df['elec_int_kwhpt'] *      # kWh per ton cement
    df['cement_t'] *            # tons cement
    df['grid_ef_kg_per_kwh']    # kgCO2 per kWh
) / 1000  # Convert kg to tons

print("✓ Scope 2 (electricity) calculated")
print(f"  Average Scope 2: {df['scope2_electricity_tco2'].mean():,.0f} tCO2/year")

# ============================================================================
# STEP 7: CALCULATE SCOPE 3 EMISSIONS (TRANSPORTATION)
# ============================================================================
print("\n" + "=" * 80)
print("STEP 7: CALCULATE SCOPE 3 EMISSIONS (TRANSPORTATION)")
print("=" * 80)

# Scope 3: Transportation emissions
# Weighted average of allowed and overloaded trucks

# Local dispatches
df['trips_local_allowed'] = df['local_t'] / df['cap_allowed_t']
df['trips_local_over'] = df['local_t'] / df['cap_over_t']
df['scope3_local_allowed_kgco2'] = (
    df['trips_local_allowed'] * df['dist_local_km'] * df['ef_allowed_gpkm']
)
df['scope3_local_over_kgco2'] = (
    df['trips_local_over'] * df['dist_local_km'] * df['ef_over_gpkm']
)
df['scope3_local_tco2'] = (
    ALLOWED_FRAC * df['scope3_local_allowed_kgco2'] +
    OVERLOAD_FRAC * df['scope3_local_over_kgco2']
) / 1e6  # Convert g to tons

print(f"✓ Scope 3 - Local transport calculated (split: {ALLOWED_FRAC*100:.0f}% allowed, {OVERLOAD_FRAC*100:.0f}% overload)")

# North exports
df['trips_exp_n_allowed'] = df['exp_n_t'] / df['cap_allowed_t']
df['trips_exp_n_over'] = df['exp_n_t'] / df['cap_over_t']
df['scope3_exp_n_allowed_kgco2'] = (
    df['trips_exp_n_allowed'] * df['dist_exp_n_km'] * df['ef_allowed_gpkm']
)
df['scope3_exp_n_over_kgco2'] = (
    df['trips_exp_n_over'] * df['dist_exp_n_km'] * df['ef_over_gpkm']
)
df['scope3_exp_n_tco2'] = (
    ALLOWED_FRAC * df['scope3_exp_n_allowed_kgco2'] +
    OVERLOAD_FRAC * df['scope3_exp_n_over_kgco2']
) / 1e6  # Convert g to tons

print("✓ Scope 3 - North exports calculated")

# South exports
df['trips_exp_s_allowed'] = df['exp_s_t'] / df['cap_allowed_t']
df['trips_exp_s_over'] = df['exp_s_t'] / df['cap_over_t']
df['scope3_exp_s_allowed_kgco2'] = (
    df['trips_exp_s_allowed'] * df['dist_exp_s_km'] * df['ef_allowed_gpkm']
)
df['scope3_exp_s_over_kgco2'] = (
    df['trips_exp_s_over'] * df['dist_exp_s_km'] * df['ef_over_gpkm']
)
df['scope3_exp_s_tco2'] = (
    ALLOWED_FRAC * df['scope3_exp_s_allowed_kgco2'] +
    OVERLOAD_FRAC * df['scope3_exp_s_over_kgco2']
) / 1e6  # Convert g to tons

print("✓ Scope 3 - South exports calculated")

# Total Scope 3
df['scope3_total_tco2'] = (
    df['scope3_local_tco2'] +
    df['scope3_exp_n_tco2'] +
    df['scope3_exp_s_tco2']
)

print(f"✓ Scope 3 total calculated")
print(f"  Average Scope 3: {df['scope3_total_tco2'].mean():,.0f} tCO2/year")

# ============================================================================
# STEP 8: CALCULATE TOTAL EMISSIONS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 8: CALCULATE TOTAL EMISSIONS")
print("=" * 80)

df['total_emissions_tco2'] = (
    df['scope1_total_tco2'] +
    df['scope2_electricity_tco2'] +
    df['scope3_total_tco2']
)

print("✓ Total emissions calculated")
print(f"\nEmissions Summary:")
print(f"  Average Scope 1: {df['scope1_total_tco2'].mean():,.0f} tCO2/year ({df['scope1_total_tco2'].mean()/df['total_emissions_tco2'].mean()*100:.1f}%)")
print(f"  Average Scope 2: {df['scope2_electricity_tco2'].mean():,.0f} tCO2/year ({df['scope2_electricity_tco2'].mean()/df['total_emissions_tco2'].mean()*100:.1f}%)")
print(f"  Average Scope 3: {df['scope3_total_tco2'].mean():,.0f} tCO2/year ({df['scope3_total_tco2'].mean()/df['total_emissions_tco2'].mean()*100:.1f}%)")
print(f"  Average Total:   {df['total_emissions_tco2'].mean():,.0f} tCO2/year")

# ============================================================================
# STEP 9: SAVE OUTPUTS
# ============================================================================
print("\n" + "=" * 80)
print("STEP 9: SAVE OUTPUTS")
print("=" * 80)

# Create outputs directory if it doesn't exist
OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)

# Select key columns for output
output_columns = [
    'year',
    'cement_t',
    'local_t',
    'exp_n_t',
    'exp_s_t',
    'total_exp_t',
    'scope1a_combustion_tco2',
    'scope1b_calcination_tco2',
    'scope1_total_tco2',
    'scope2_electricity_tco2',
    'scope3_local_tco2',
    'scope3_exp_n_tco2',
    'scope3_exp_s_tco2',
    'scope3_total_tco2',
    'total_emissions_tco2'
]

# Save to CSV
df[output_columns].to_csv(OUTPUT_CSV, index=False)
print(f"✓ Saved: {OUTPUT_CSV}")
print(f"  Rows: {len(df)}")
print(f"  Columns: {len(output_columns)}")

print("\n" + "=" * 80)
print("✓✓✓ SCRIPT 01 COMPLETE ✓✓✓")
print("=" * 80)
print(f"\nOutput file ready for next script: {OUTPUT_CSV.name}")
print("You can now run script 02 to continue the pipeline.\n")
