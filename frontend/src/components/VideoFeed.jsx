import React from 'react';

const VideoFeed = () => {
  const API_URL = import.meta.env.VITE_API_URL || "https://crime-ranking.onrender.com";

  return (
    <div className="video-feed-container">
      <div className="video-wrapper">
        <img 
          src={`${API_URL}/video_feed?camera=1&cb=${Date.now()}`} 
          alt="Live Security Feed Camera 1" 
          className="live-video"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          onLoad={(e) => {
            e.target.style.display = 'block';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'none';
            }
          }}
        />
        <div className="video-placeholder" style={{ display: 'none', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a202c', color: '#a0aec0' }}>
          <span>Camera feed offline or loading...</span>
        </div>
        <div className="camera-overlay">
          <span className="cam-label">CAM 01 - MAIN INT</span>
          <span className="rec-indicator"><span className="red-dot blinking"></span> REC</span>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
