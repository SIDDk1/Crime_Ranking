from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import asyncio
import db
import data_ingestor

from model import get_danger_rank
from video import VideoProcessor

app = FastAPI(title="Crime Ranking API")

# Setup CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only. Should restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

video_processor = VideoProcessor('demo_video.mp4')

# 1. Area Ranking Data Endpoint
@app.get("/api/areas")
async def get_areas():
    """Return actual Kaggle dataset cities dynamically geocoded via OpenStreetMap."""
    areas = data_ingestor.get_processed_areas()
    
    # Fallback to defaults if the CSV isn't found or parsed
    if not areas:
        areas = [
            {"id": 1, "name": "New Delhi", "lat": 28.6139, "lng": 77.2090, "density": 11320, "past_crimes": 45, "income_level": 2, "lighting_quality": 1},
            {"id": 2, "name": "Noida", "lat": 28.5355, "lng": 77.3910, "density": 4000, "past_crimes": 12, "income_level": 2, "lighting_quality": 1},
        ]

    # Calculate Danger Rank using our ML Model against REAL historical IPC values!
    for area in areas:
        # Dynamically build feature array exactly matching how Colab trained it
        feature_values = []
        if 'crime_keys' in area:
            for key in area['crime_keys']:
                feature_values.append(area[key])
                
        if feature_values:
            area["danger_rank"] = get_danger_rank(feature_values)
        else:
            area["danger_rank"] = "Unknown"
        
    return areas

@app.get("/api/generate-report")
async def generate_report():
    areas = await get_areas()
    worst_areas = [area for area in areas if area["danger_rank"] == "Worst"]
    
    total_alerts = db.get_total_alerts()
    
    return {
        "total_alerts": total_alerts,
        "worst_areas": worst_areas
    }

# 2. Video Streaming Endpoint
@app.get("/video_feed")
async def video_feed():
    """Stream OpenCV processed video frames."""
    return StreamingResponse(video_processor.generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

# 3. Real-time Alerts Notification Endpoint (SSE)
@app.get("/api/alerts")
async def alert_stream():
    """Server-Sent Events endpoint to push alerts when video anomaly is detected."""
    async def event_generator():
        last_alert_state = False
        while True:
            # Check if video processor found something
            current_alert_state = video_processor.check_anomaly()
            
            # If changed from False to True, trigger an alert to the frontend
            if current_alert_state and not last_alert_state:
                yield {
                    "event": "message",
                    "data": '{"alert": true, "message": "CRITICAL: Suspicious Activity Detected on Camera 1", "type": "video"}'
                }
            
            last_alert_state = current_alert_state
            await asyncio.sleep(1) # Check every 1 second

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
