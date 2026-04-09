import cv2
import time
import os
import db
import numpy as np

class VideoProcessor:
    def __init__(self, video_path='demo_video.mp4'):
        self.video_path = video_path
        self.anomaly_detected = False
        self.frame_count = 0
        self.anomaly_duration = 0
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=50, detectShadows=True)
        self.last_log_time = 0

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
        
        # Apply Background Subtraction
        fg_mask = self.bg_subtractor.apply(frame)
        
        # Clean up the mask using morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        motion_detected = False
        for contour in contours:
            # Filter by area to avoid small noises triggering anomaly
            if cv2.contourArea(contour) > 2000:
                motion_detected = True
                x, y, w, h = cv2.boundingRect(contour)
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)
                
        if motion_detected:
            self.anomaly_detected = True
            cv2.putText(frame, "MOTION ANOMALY DETECTED", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Rate limit logging to max 1 per 5 seconds
            current_time = time.time()
            if current_time - self.last_log_time > 5:
                frame_filename = f"logs/frames/anomaly_{int(current_time)}.jpg"
                cv2.imwrite(frame_filename, frame)
                db.log_anomaly("Motion Anomaly", frame_filename)
                self.last_log_time = current_time
        else:
            self.anomaly_detected = False

    def check_anomaly(self):
        """Used by API to see if an alert should be triggered via SSE."""
        if self.anomaly_detected:
            return True
        return False
