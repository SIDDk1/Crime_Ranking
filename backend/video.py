import cv2
import time
import asyncio
import os
import db
import numpy as np
import json
import threading

# Global Singleton AI Model state to prevent duplicate loading across 4 cameras
GLOBAL_DL_MODEL = None
GLOBAL_IDX_TO_CLASS = None
GLOBAL_DL_ENABLED = False
GLOBAL_LOADING_STARTED = False
_model_lock = threading.Lock()

def _async_load_keras_model_singleton():
    """Asynchronously boots TensorFlow globally so FastAPI connects instantly."""
    global GLOBAL_DL_MODEL, GLOBAL_IDX_TO_CLASS, GLOBAL_DL_ENABLED
    try:
        import tensorflow as tf
        if os.path.exists('video_anomaly_model.h5'):
            GLOBAL_DL_MODEL = tf.keras.models.load_model('video_anomaly_model.h5', compile=False)
            if os.path.exists('class_mapping.json'):
                with open('class_mapping.json', 'r') as f:
                    GLOBAL_IDX_TO_CLASS = json.load(f)
            else:
                GLOBAL_IDX_TO_CLASS = {"0": "normal", "1": "fight", "2": "robbery", "3": "vandalism"}
            
            GLOBAL_DL_ENABLED = True
            print("\n[SUCCESS] Deep Learning Model successfully loaded globally! All cameras now have AI context.")
    except Exception as e:
        print("\n[WARNING] DL model not automatically loaded. Running seamlessly on standard motion tracking. Error:", e)

class VideoProcessor:
    def __init__(self, video_path='demo_video.mp4'):
        self.video_path = video_path
        self.anomaly_detected = False
        self.last_log_time = 0
        self.anomaly_message = "SUSPICIOUS ACTIVITY DETECTED"
        self.detected_crime = None
        self.current_frame_bytes = None
        
        with _model_lock:
            global GLOBAL_LOADING_STARTED
            if not GLOBAL_LOADING_STARTED:
                GLOBAL_LOADING_STARTED = True
                threading.Thread(target=_async_load_keras_model_singleton, daemon=True).start()
                
        # Start background processing thread immediately for 24/7 analysis
        threading.Thread(target=self._run_continuous_processing, daemon=True).start()

    def _run_continuous_processing(self):
        # Localize these variables purely to this specific stream connection so they don't corrupt in multi-threading
        bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=50, varThreshold=50, detectShadows=False)
        frame_count = 0
        
        # Create a dummy colored image if video doesn't exist to avoid crashing
        if not os.path.exists(self.video_path):
            print(f"Warning: {self.video_path} not found. Generating dummy feed.")
            while True:
                frame = cv2.resize(cv2.imread(cv2.samples.findFile('starry_night.jpg', required=False)) if cv2.imread(cv2.samples.findFile('starry_night.jpg', required=False)) is not None else np.zeros((480, 640, 3), dtype=np.uint8), (640, 480))
                
                # Simulate detection
                frame_count += 1
                self._process_frame(frame, bg_subtractor, frame_count)
                
                ret, buffer = cv2.imencode('.jpg', frame)
                self.current_frame_bytes = buffer.tobytes()
                time.sleep(0.1)

        cap = cv2.VideoCapture(self.video_path)
        try:
            while True:
                success, frame = cap.read()
                if not success:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0) # Loop video
                    time.sleep(0.1) # Fix CPU freeze on corrupt frames
                    continue
                    
                frame = cv2.resize(frame, (640, 480))
                frame_count += 1
                self._process_frame(frame, bg_subtractor, frame_count)

                ret, buffer = cv2.imencode('.jpg', frame)
                self.current_frame_bytes = buffer.tobytes()

                # Control frame rate
                time.sleep(0.04)
        finally:
            cap.release()

    def generate_frames(self):
        """HTTP Streams use this to grab the latest actively processed frame natively."""
        while True:
            if self.current_frame_bytes:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + self.current_frame_bytes + b'\r\n')
            time.sleep(0.05)

    def _process_frame(self, frame, bg_subtractor, frame_count):
        # 2. Always locate the moving objects (suspects) dynamically using OpenCV
        fg_mask = bg_subtractor.apply(frame)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        motion_boxes = []
        for contour in contours:
            if cv2.contourArea(contour) > 2000:
                x, y, w, h = cv2.boundingRect(contour)
                motion_boxes.append((x, y, w, h))
                
        # 1. Advanced DL Processing (Throttled to prevent lag/freezing)
        if GLOBAL_DL_ENABLED and GLOBAL_DL_MODEL:
            # Predict more frequently (every 10 frames) for responsive UI
            if frame_count % 10 == 0:
                try:
                    # Resize to 128x128 as defined in training
                    input_frame = cv2.resize(frame, (128, 128))
                    input_frame = cv2.cvtColor(input_frame, cv2.COLOR_BGR2RGB)
                    input_frame = np.expand_dims(input_frame, axis=0)
                    input_frame = input_frame.astype('float32') / 255.0
                    
                    prediction = GLOBAL_DL_MODEL.predict(input_frame, verbose=0)
                    class_idx = np.argmax(prediction[0])
                    class_label = GLOBAL_IDX_TO_CLASS.get(str(class_idx), "normal").upper()
                    
                    # Confidence threshold check > 35% for the demo
                    if class_label != "NORMAL" and np.max(prediction[0]) > 0.35:
                        self.anomaly_detected = True
                        self.detected_crime = class_label
                        self.anomaly_message = f"{class_label} DETECTED"
                    else:
                        # Fallback: Track normal large motion as suspicious if no explicit crime identified
                        if len(motion_boxes) > 0:
                            self.anomaly_detected = True
                            self.detected_crime = "Suspicious Behavior"
                            self.anomaly_message = "SUSPICIOUS BEHAVIOR TRACKED"
                        else:
                            self.anomaly_detected = False
                except Exception as e:
                    pass
        else:
            # 3. Handle Fallback if Deep Learning is missing
            if len(motion_boxes) > 0:
                self.anomaly_detected = True
                self.detected_crime = "Suspicious Activity"
                self.anomaly_message = "SUSPICIOUS ACTIVITY DETECTED"
            else:
                self.anomaly_detected = False

        # 4. Draw Specific Target Red Boxes
        if self.anomaly_detected:
            # Draw precise red boxes around the people actually generating the movement
            for (x, y, w, h) in motion_boxes:
                # Main Red Bounding Box
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)
                # Label right above the targeted box
                cv2.putText(frame, self.anomaly_message, (x, y - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # If no motion box exists perfectly but AI flagged it, put label on top left
            if not motion_boxes:
                 cv2.putText(frame, self.anomaly_message, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                 
            # Add security camera red border for cinematic context
            cv2.rectangle(frame, (0,0), (frame.shape[1], frame.shape[0]), (0, 0, 255), 4)

            # Rate limit database logging to 1 frame per 5 seconds
            current_time = time.time()
            if current_time - self.last_log_time > 5:
                os.makedirs('logs/frames', exist_ok=True)
                frame_filename = f"logs/frames/anomaly_{int(current_time)}.jpg"
                cv2.imwrite(frame_filename, frame)
                
                db.log_anomaly(self.detected_crime if self.detected_crime else "Anomaly", frame_filename)
                self.last_log_time = current_time

    def check_anomaly(self):
        """Used by API to see if an alert should be triggered via SSE."""
        return self.anomaly_detected
