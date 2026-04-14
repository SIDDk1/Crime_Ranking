import cv2
import time
import os
import db
import numpy as np
import json

class VideoProcessor:
    def __init__(self, video_path='demo_video.mp4'):
        self.video_path = video_path
        self.anomaly_detected = False
        self.frame_count = 0
        self.anomaly_duration = 0
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=50, detectShadows=True)
        self.last_log_time = 0
        self.anomaly_message = "MOTION ANOMALY DETECTED"
        
        # Deep Learning Support Integration
        self.dl_model = None
        self.idx_to_class = None
        self.dl_enabled = False
        
        try:
            import tensorflow as tf
            if os.path.exists('video_anomaly_model.h5'):
                self.dl_model = tf.keras.models.load_model('video_anomaly_model.h5', compile=False)
                if os.path.exists('class_mapping.json'):
                    with open('class_mapping.json', 'r') as f:
                        self.idx_to_class = json.load(f)
                else:
                    self.idx_to_class = {"0": "normal", "1": "fight", "2": "robbery", "3": "vandalism"}
                
                self.dl_enabled = True
                print("Deep Learning Video Anomaly Model structure successfully loaded!")
        except Exception as e:
            print("DL model not loaded. Falling back to simple background subtractor. Error:", e)

    def generate_frames(self):
        # Create a dummy colored image if video doesn't exist to avoid crashing
        if not os.path.exists(self.video_path):
            print(f"Warning: {self.video_path} not found. Generating dummy feed.")
            while True:
                frame = cv2.resize(cv2.imread(cv2.samples.findFile('starry_night.jpg', required=False)) if cv2.imread(cv2.samples.findFile('starry_night.jpg', required=False)) is not None else np.zeros((480, 640, 3), dtype=np.uint8), (640, 480))
                
                # Simulate detection
                self._process_frame(frame)
                
                ret, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                time.sleep(0.1)

        cap = cv2.VideoCapture(self.video_path)
        while True:
            success, frame = cap.read()
            if not success:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0) # Loop video
                continue
                
            frame = cv2.resize(frame, (640, 480))
            self._process_frame(frame)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            # Control frame rate slightly
            time.sleep(0.03)

    def _process_frame(self, frame):
        self.frame_count += 1
        
        motion_detected = False
        detected_crime = None
        
        # 1. Advanced DL Fall-forward logic
        if self.dl_enabled and self.dl_model and self.frame_count % 10 == 0:
            # Run Deep Learning inference every 10 frames to classify action optimally
            try:
                # Resize to 128x128 as defined in training
                input_frame = cv2.resize(frame, (128, 128))
                input_frame = cv2.cvtColor(input_frame, cv2.COLOR_BGR2RGB)
                input_frame = np.expand_dims(input_frame, axis=0)
                input_frame = input_frame.astype('float32') / 255.0
                
                prediction = self.dl_model.predict(input_frame, verbose=0)
                class_idx = np.argmax(prediction[0])
                class_label = self.idx_to_class.get(str(class_idx), "normal").upper()
                
                # Confidence threshold check > 60%
                if class_label != "NORMAL" and np.max(prediction[0]) > 0.6:
                    motion_detected = True
                    detected_crime = class_label
                    self.anomaly_message = f"{class_label} CRIME DETECTED"
            except Exception as e:
                pass
                
        # 2. Traditional Motion detection Fallback
        if not motion_detected and not self.dl_enabled:
            # Apply Background Subtraction
            fg_mask = self.bg_subtractor.apply(frame)
            
            # Clean up the mask using morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                # Filter by area to avoid small noises triggering anomaly
                if cv2.contourArea(contour) > 2000:
                    motion_detected = True
                    self.anomaly_message = "MOTION ANOMALY DETECTED"
                    detected_crime = "Motion Anomaly"
                    x, y, w, h = cv2.boundingRect(contour)
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)

        if motion_detected:
            self.anomaly_detected = True
            cv2.putText(frame, self.anomaly_message, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Optionally draw a big red border around the whole frame for AI alerts
            if self.dl_enabled:
                cv2.rectangle(frame, (0,0), (frame.shape[1], frame.shape[0]), (0, 0, 255), 5)
            
            # Rate limit logging to max 1 per 5 seconds
            current_time = time.time()
            if current_time - self.last_log_time > 5:
                # Ensure logs directory exists
                os.makedirs('logs/frames', exist_ok=True)
                frame_filename = f"logs/frames/anomaly_{int(current_time)}.jpg"
                cv2.imwrite(frame_filename, frame)
                
                # Use detected_crime if string is set, otherwise default
                db.log_anomaly(detected_crime if detected_crime else "Motion Anomaly", frame_filename)
                self.last_log_time = current_time
        else:
            self.anomaly_detected = False

    def check_anomaly(self):
        """Used by API to see if an alert should be triggered via SSE."""
        if self.anomaly_detected:
            return True
        return False
