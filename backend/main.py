from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import asyncio
import db
import data_ingestor

from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load secret API keys from hidden .env
load_dotenv()

# Configure Gemini AI with the provided API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
model = genai.GenerativeModel('gemini-flash-latest')

from model import get_danger_rank
from video import VideoProcessor

app = FastAPI(title="Crime Ranking API")

@app.get("/")
async def root():
    """Health check endpoint for cron-job pinging."""
    return {"status": "online", "message": "Crime Ranking API is running"}

# Setup CORS for React frontend (Wildcard origins allowed only if credentials are False)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize multiple camera processors mapped to IDs (Shared AI Model handles memory)
camera_processors = {
    1: VideoProcessor('demo_video.mp4'),
    2: VideoProcessor('demo_video_2.mp4'),
    3: VideoProcessor('demo_video_3.mp4'),
    4: VideoProcessor('demo_video_4.mp4')
}

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
async def video_feed(camera: int = 1):
    """Stream OpenCV processed video frames targeting a specific camera."""
    # Retrieve the correct active camera, default to 1 if out of bounds
    processor = camera_processors.get(camera, camera_processors[1])
    return StreamingResponse(processor.generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

# 3. Real-time Alerts Notification Endpoint (SSE)
@app.get("/api/alerts")
async def alert_stream():
    """Server-Sent Events endpoint to push alerts when ANY camera detects video anomaly."""
    async def event_generator():
        last_alert_states = {cam_id: False for cam_id in camera_processors.keys()}
        while True:
            for cam_id, processor in camera_processors.items():
                current_state = processor.check_anomaly()
                
                # If changed from False to True, trigger an alert for this specific camera
                if current_state and not last_alert_states[cam_id]:
                    yield {
                        "event": "message",
                        "data": f'{{"alert": true, "message": "CRITICAL: Suspicious Activity Detected on CAM 0{cam_id}", "type": "video", "camera": {cam_id}}}'
                    }
                
                last_alert_states[cam_id] = current_state
            
            await asyncio.sleep(1) # Check every 1 second

    return EventSourceResponse(event_generator())

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(chat: ChatMessage):
    """Handle chat messages for the AI Help Desk."""
    try:
        # Fetch current project data to use as context
        areas = await get_areas()
        context_data = "\n".join([
            f"Area: {a.get('name', 'Unknown')}, Danger Rank: {a.get('danger_rank', 'Unknown')}, Density: {a.get('density', 'N/A')}, Past Crimes: {a.get('past_crimes', 'N/A')}" 
            for a in areas
        ])
        
        system_prompt = f"""
You are the AI Help Desk assistant for the AegisVision Crime Ranking and Surveillance System.
You must answer questions according to the project data ONLY. Do not invent data. If the user asks something outside the scope of this system or the data provided, apologize and clarify your purpose.

Current System Data:
{context_data}

User Request: {chat.message}
"""
        response = model.generate_content(system_prompt)
        return {"response": response.text}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback Mock for Presentation if API quota is exceeded
        mock_response = "I am currently running in Offline Presentation Mode because the AI API quota is exceeded.\n\n"
        mock_response += "Based on our current dataset:\n"
        for area in areas[:3]: # limit to 3 to not clutter
            mock_response += f"- **{area.get('name', 'Unknown')}** has a Danger Rank of **{area.get('danger_rank', 'Unknown')}** with a density of {area.get('density', 'N/A')}.\n"
        mock_response += "\nIf you are an admin, please check your Google Gemini billing plan!"
        return {"response": mock_response}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
