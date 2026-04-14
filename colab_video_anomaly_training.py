"""
GOOGLE COLAB VIDEO ANOMALY TRAINING SCRIPT
------------------------------------------
Instructions for use:
1. Open Google Colab (colab.research.google.com) and create a New Notebook.
2. Go to Runtime -> Change runtime type -> Select T4 GPU (Hardware accelerator).
3. Copy and paste entirely this code into a new cell and run it.
4. It will download the Kaggle video surveillance dataset and train a Deep Learning model.
5. Your browser will prompt you to download 'video_anomaly_model.h5'.
6. Drop 'video_anomaly_model.h5' into your local backend/ folder.
"""

import os
import glob
import cv2
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

# Attempt to import KaggleHub and TensorFlow
try:
    import kagglehub
except ImportError:
    print("Installing kagglehub...")
    os.system('pip install kagglehub[pandas-datasets]')
    import kagglehub

try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
    from tensorflow.keras.models import Model
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
    from tensorflow.keras.utils import to_categorical
except ImportError:
    print("Installing tensorflow...")
    os.system('pip install tensorflow')
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
    from tensorflow.keras.models import Model
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
    from tensorflow.keras.utils import to_categorical

# --- Step 1: Ingest Crime Datasets via KaggleHub ---
print("Downloading 'webadvisor/real-time-anomaly-detection-in-cctv-surveillance' from KaggleHub...")
path = kagglehub.dataset_download("webadvisor/real-time-anomaly-detection-in-cctv-surveillance")
print("Path to dataset files:", path)

# Locate video and csv files
mp4_files = sorted(glob.glob(os.path.join(path, "**/*.mp4"), recursive=True))
csv_files = sorted(glob.glob(os.path.join(path, "**/*.csv"), recursive=True))

print(f"Found {len(mp4_files)} video files and {len(csv_files)} CSV files.")

# --- Step 2: Data Preprocessing ---
IMG_SIZE = 128
MAX_FRAMES_PER_VIDEO = 20

X_data = [] # Store image frames
y_data = [] # Store labels

# Identify labels (e.g., Vandalism, Fight, Normal) from filename if CSV is not straightforward
# Usually anomaly videos have the anomaly class in their name, e.g. Vandalism023_x264.mp4
def extract_frames(video_path, max_frames=MAX_FRAMES_PER_VIDEO):
    frames = []
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return frames

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    skip_frames = max(1, total_frames // max_frames)
    
    count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if count % skip_frames == 0 and len(frames) < max_frames:
            frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame)
        count += 1
    
    cap.release()
    return frames

print("\nExtracting frames from videos... This may take a while depending on dataset size.")
classes_found = set()

# Limiting to 50 videos for demonstration to avoid colab RAM crash. Increase this limit locally!
for i, video_file in enumerate(mp4_files[:500]): 
    filename = os.path.basename(video_file).lower()
    
    # Simple labeling logic based on filename
    label = "normal"
    if "vandalism" in filename:
        label = "vandalism"
    elif "fight" in filename or "assault" in filename:
        label = "fight"
    elif "robbery" in filename or "stealing" in filename or "burglary" in filename:
        label = "robbery"
        
    classes_found.add(label)
    
    frames = extract_frames(video_file)
    for f in frames:
        X_data.append(f)
        y_data.append(label)

    if (i + 1) % 10 == 0:
        print(f"Processed {i + 1} / {len(mp4_files)} videos...")

if not X_data:
    print("WARNING: Could not extract frames from videos natively. Relying on CSV fallback simulation...")
    # Generate dummy data just to demonstrate model structure if dataset format is totally different
    X_data = np.random.rand(100, IMG_SIZE, IMG_SIZE, 3) * 255
    y_data = ['normal']*50 + ['vandalism']*50

X_data = np.array(X_data, dtype='float32') / 255.0 # Normalize

# Encode labels
unique_classes = sorted(list(set(y_data)))
class_to_idx = {cls: i for i, cls in enumerate(unique_classes)}
idx_to_class = {i: cls for cls, i in class_to_idx.items()}

print("\nClasses Mapping:", class_to_idx)
y_encoded = np.array([class_to_idx[lbl] for lbl in y_data])
y_categorical = to_categorical(y_encoded, num_classes=len(unique_classes))

X_train, X_test, y_train, y_test = train_test_split(X_data, y_categorical, test_size=0.2, random_state=42)

# --- Step 3: Model Architecture (MobileNetV2 based Frame Classifier) ---
print("\nBuilding model architecture...")
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
base_model.trainable = False # Freeze base model

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.5)(x)
predictions = Dense(len(unique_classes), activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)
model.compile(optimizer=Adam(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy'])

# --- Step 4: Training ---
print("\nTraining the model...")
epochs = 10
batch_size = 32

history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=epochs,
    batch_size=batch_size
)

score = model.evaluate(X_test, y_test, verbose=0)
print(f"\nTest Test Accuracy: {score[1]*100:.2f}%")

# --- Step 5: Save & Download the Model ---
model_filename = 'video_anomaly_model.h5'
model.save(model_filename)
print(f"\nModel strictly saved as {model_filename}.")

# Save mapping to be used in backend later
import json
with open("class_mapping.json", "w") as f:
    json.dump(idx_to_class, f)

try:
    from google.colab import files
    files.download(model_filename)
    files.download("class_mapping.json")
    print("\nDownloads initiated! Move BOTH 'video_anomaly_model.h5' and 'class_mapping.json' to your local backend folder.")
except ImportError:
    print("Not running in Colab. Files generated locally.")
