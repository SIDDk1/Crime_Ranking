import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os

# Create or load CSV data
def generate_local_data():
    csv_file = 'agra_crime_data.csv'
    if os.path.exists(csv_file):
        return pd.read_csv(csv_file)
        
    np.random.seed(42)
    n_samples = 1000
    
    # Generate realistic IPC feature bounds for local fallback testing
    murder = np.random.randint(0, 50, n_samples)
    robbery = np.random.randint(10, 150, n_samples)
    theft = np.random.randint(50, 500, n_samples)
    rape = np.random.randint(0, 40, n_samples)
    kidnapping = np.random.randint(0, 60, n_samples)
    
    # Mathematical weighting mimicking Colab structure
    danger_scores = (murder * 3) + (rape * 3) + robbery + theft + kidnapping
    
    crime_labels = []
    q75 = np.percentile(danger_scores, 85)
    q40 = np.percentile(danger_scores, 40)
    for score in danger_scores:
        if score > q75:
            crime_labels.append('Worst')
        elif score > q40:
            crime_labels.append('Good')
        else:
            crime_labels.append('Best')
            
    df = pd.DataFrame({
        'MURDER': murder,
        'ROBBERY': robbery,
        'THEFT': theft,
        'RAPE': rape,
        'KIDNAPPING': kidnapping,
        'LABEL': crime_labels
    })
    
    df.to_csv(csv_file, index=False)
    print(f"Generated local fallback dataset: {csv_file}")
    return df

def train_model():
    print("Loading actual/simulated CSV dataset...")
    df = generate_local_data()
    
    X = df[['MURDER', 'ROBBERY', 'THEFT', 'RAPE', 'KIDNAPPING']]
    y = df['LABEL']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier natively on IPC values...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Save the model
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model saved to model.pkl")

def get_danger_rank(feature_values):
    """Predict Danger Rank for an area given its extracted continuous feature array."""
    if not os.path.exists('model.pkl'):
        print("Model not found. Building fallback IPC model...")
        train_model()
        
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
        
    # Get probability/prediction using ordered dynamic attributes
    features = np.array([feature_values])
    prediction = model.predict(features)[0]
    
    return prediction
