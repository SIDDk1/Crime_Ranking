import pandas as pd
import numpy as np
from geopy.geocoders import Nominatim
import time
import os
import json
import glob

CACHE_PATH = "logs/cities_cache.json"

def get_processed_areas():
    # If we already built the geocoded json, return it instantly
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, 'r') as f:
            return json.load(f)
            
    try:
        import kagglehub
        print("Backend starting: Downloading 'rajanand/crime-in-india' from KaggleHub natively...")
        path = kagglehub.dataset_download("rajanand/crime-in-india")
    except Exception as e:
        print(f"Failed to load kagglehub. Error: {e}")
        return []

    csv_files = sorted(glob.glob(os.path.join(path, "**/*.csv"), recursive=True))
    if not csv_files:
        return []
        
    target_file = csv_files[0]
    for file in csv_files:
        fname = os.path.basename(file).lower()
        if 'district' in fname or 'city' in fname or ('crime' in fname and 'ipc' in fname):
            target_file = file
            break
            
    print(f"Backend processing real CSV: {os.path.basename(target_file)}")
    try:
        df = pd.read_csv(target_file, low_memory=False)
    except Exception as e:
        print(f"Error reading dataset: {e}")
        return []
    
    # Feature Alignment matching the Colab script perfectly
    df.columns = [c.upper() for c in df.columns]
    if 'CITY' not in df.columns:
        if 'DISTRICT' in df.columns:
            df.rename(columns={'DISTRICT': 'CITY'}, inplace=True)
        elif 'AREA_NAME' in df.columns:
            df.rename(columns={'AREA_NAME': 'CITY'}, inplace=True)
        elif 'CITY/TOWN' in df.columns:
            df.rename(columns={'CITY/TOWN': 'CITY'}, inplace=True)
        elif 'STATE/UT' in df.columns:
             df.rename(columns={'STATE/UT': 'CITY'}, inplace=True)

    if 'CITY' not in df.columns:
        print("ERROR: Could not resolve 'CITY' column natively.")
        return []

    sum_cols = []
    for real_col in ['MURDER', 'ROBBERY', 'THEFT', 'RAPE', 'KIDNAPPING']:
        matching = [c for c in df.columns if real_col in c]
        if matching:
            sum_cols.append(matching[0])

    if not sum_cols:
        print("ERROR: Kaggle CSV missing IPC crime metrics natively.")
        return []

    # Clean and Group exactly like Colab Map
    for col in sum_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
    area_stats = df.groupby('CITY')[sum_cols].sum().reset_index()

    geolocator = Nominatim(user_agent="crime_mapping_prototype_xyz")
    areas = []
    print(f"Geocoding {len(area_stats)} cities containing real crime histories...")
    
    # We slice to the top 40 cities with the most crimes to avoid a 5-minute geocoding wait 
    # since there are ~800+ districts in India and Nominatim is 1 req/sec.
    area_stats['total_crime'] = area_stats[sum_cols].sum(axis=1)
    area_stats = area_stats.sort_values(by='total_crime', ascending=False).head(40)

    for idx, row in area_stats.iterrows():
        city_name = row['CITY']
        try:
            location = geolocator.geocode(f"{city_name}, India", timeout=10)
            if location:
                # Dynamically construct output based strictly on IPC properties found
                city_data = {
                    "id": int(idx + 1),
                    "name": str(city_name),
                    "lat": float(location.latitude),
                    "lng": float(location.longitude),
                }
                
                # Push every found real crime sum into the dictionary!
                for col in sum_cols:
                    city_data[col] = int(row[col])
                
                # Also pass an ordered list of keys so the frontend knows what to render randomly
                city_data['crime_keys'] = sum_cols
                    
                areas.append(city_data)
                print(f"Mapped Real Crime: {city_name} -> {location.latitude}, {location.longitude}")
            else:
                print(f"Could not map coordinate for: {city_name}")
            time.sleep(1.2)
        except Exception as e:
            print(f"Geocoding failure on {city_name}: {e}")
            time.sleep(2)
            
    if areas:
        os.makedirs('logs', exist_ok=True)
        with open(CACHE_PATH, 'w') as f:
            json.dump(areas, f)
        
    return areas
