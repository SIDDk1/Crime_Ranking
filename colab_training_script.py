"""
GOOGLE COLAB TRAINING SCRIPT
----------------------------
Instructions for use:
1. Open Google Colab (colab.research.google.com) and create a New Notebook.
2. Copy and paste entirely this code into a new cell.
3. Replace 'your_kaggle_dataset.csv' with the actual filename of your Kaggle CSV.
4. Run the cell. Your browser will prompt you to download 'model.pkl'.
5. Drop 'model.pkl' into your local backend/ folder to replace the generated one.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle

# --- Step 1: Ingest Crime Datasets ---
# Option A: Download directly from Kaggle API (Recommended to expand knowledge)
# Keep ensuring that any new dataset has a 'City' column to group by correctly!
try:
    import kagglehub
    import os
    import glob
    print("Downloading 'rajanand/crime-in-india' from KaggleHub...")
    
    # Download latest version to local Colab cache
    path = kagglehub.dataset_download("rajanand/crime-in-india")
    print("Path to dataset files:", path)
    
    # Locate the physically downloaded CSV files in the folder
    csv_files = sorted(glob.glob(os.path.join(path, "**/*.csv"), recursive=True))
    
    if not csv_files:
        raise FileNotFoundError("No CSV files found in the downloaded Kaggle dataset!")
        
    print(f"Found {len(csv_files)} dataset files.")
    
    # Intelligently find a relevant dataset (avoiding generic ones like 'court_trials.csv')
    # We look for files focusing on 'district' or core 'IPC' crimes.
    target_file = csv_files[0]
    for file in csv_files:
        fname = os.path.basename(file).lower()
        if 'district' in fname or 'city' in fname or ('crime' in fname and 'ipc' in fname):
            target_file = file
            break
            
    print(f"Automatically analyzing logical CSV: {os.path.basename(target_file)}")
    
    # Load the targeted CSV into Pandas
    df_kaggle = pd.read_csv(target_file, low_memory=False)
    
    # Different datasets use different names for regions. 
    # Force auto-correct mapping so the group pipeline doesn't crash throwing KeyErrors.
    df_kaggle.columns = [c.upper() for c in df_kaggle.columns] # Normalize column casing
    if 'CITY' not in df_kaggle.columns:
        if 'DISTRICT' in df_kaggle.columns:
            df_kaggle.rename(columns={'DISTRICT': 'CITY'}, inplace=True)
        elif 'AREA_NAME' in df_kaggle.columns:
            df_kaggle.rename(columns={'AREA_NAME': 'CITY'}, inplace=True)
        elif 'CITY/TOWN' in df_kaggle.columns:
            df_kaggle.rename(columns={'CITY/TOWN': 'CITY'}, inplace=True)
        elif 'STATE/UT' in df_kaggle.columns:
             df_kaggle.rename(columns={'STATE/UT': 'CITY'}, inplace=True)
    
    # Optionally load your original manually uploaded CSV and seamlessly merge them!
    try:
        df_local = pd.read_csv('your_kaggle_dataset.csv')
        df_local.columns = [c.upper() for c in df_local.columns]
        if 'DISTRICT' in df_local.columns and 'CITY' not in df_local.columns:
            df_local.rename(columns={'DISTRICT': 'CITY'}, inplace=True)
            
        df = pd.concat([df_kaggle, df_local], ignore_index=True)
        print("Successfully MERGED KaggleHub API data with local CSV data!")
    except FileNotFoundError:
        df = df_kaggle
        print("Using purely KaggleHub API data.")
        
    print(f"Dataset securely compiled! Total Rows: {len(df)}")
    
except ImportError:
    print("kagglehub module not found. Run '!pip install kagglehub[pandas-datasets]'.")
    df = pd.DataFrame()

if not df.empty and 'CITY' in df.columns:
    # --- Step 2: Feature Engineering & Aggregation ---
    print("Aggregating REAL physical crime variables strictly per City...")
    
    # We dynamically find core columns regardless of exact naming schema
    core_cols = ['CITY']
    sum_cols = []
    
    for real_col in ['MURDER', 'ROBBERY', 'THEFT', 'RAPE', 'KIDNAPPING']:
        # Find any matching column containing these keywords natively
        matching = [c for c in df.columns if real_col in c]
        if matching:
            sum_cols.append(matching[0])
            
    if not sum_cols:
        raise ValueError("FATAL ERROR: The downloaded dataset does not contain expected IPC crimes (Murder, Robbery, etc.). Please select a different CSV from Kaggle folder or rename columns.")

    core_cols.extend(sum_cols)
    
    # 1. Group strictly by City and intelligently SUM the total history of specific severe crimes
    df_clean = df[core_cols].copy()
    
    # Clean string issues
    for col in sum_cols:
        df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0)
        
    area_stats = df_clean.groupby('CITY')[sum_cols].sum().reset_index()
    
    df = area_stats
    features = sum_cols

    # --- Step 3: Automatically classify Danger Rank based on historical Big Data percentiles ---
    if 'LABEL' not in df.columns:
        # Calculate a cumulative danger score based on the weighted sum of specific crimes
        danger_scores = np.zeros(len(df))
        for col in sum_cols:
            if 'MURDER' in col or 'RAPE' in col:
                danger_scores += (df[col] * 3.0)  # Heavy weighting for violent crimes
            else:
                danger_scores += (df[col] * 1.0)  # Standard weighting for theft/property
                
        df['DANGER_SCORE'] = danger_scores
        
        # Rank cities dynamically: Top 25% are Worst, Bottom 50% are Best, Middle is Good
        q75 = df['DANGER_SCORE'].quantile(0.85)
        q40 = df['DANGER_SCORE'].quantile(0.40)
        
        conditions = [
            (df['DANGER_SCORE'] > q75),
            (df['DANGER_SCORE'] > q40)
        ]
        choices = ['Worst', 'Good']
        df['LABEL'] = np.select(conditions, choices, default='Best')

    X = df[features]
    y = df['LABEL']

    print("\nClass Distribution:")
    print(y.value_counts())

    # --- Step 3: Train / Test Split ---
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # --- Step 4: Model Training ---
    print("\nTraining Random Forest Classifier on Kaggle data...")
    # You can also change this to XGBoost (import xgboost as xgb; model = xgb.XGBClassifier())
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    
    model.fit(X_train, y_train)

    # --- Step 5: Evaluation ---
    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy on Test Set: {accuracy * 100:.2f}%")

    # --- Step 6: Export & Download Model ---
    file_name = 'model.pkl'
    with open(file_name, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"\nModel strictly saved as {file_name}.")
    
    # Prompt the browser to download the file automatically
    try:
        from google.colab import files
        files.download(file_name)
        print("Download initiated! Please move this file inside your 'backend' folder locally.")
    except ImportError:
        print("Not running in Colab. File generated locally.")
