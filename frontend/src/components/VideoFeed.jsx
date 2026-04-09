import React from 'react';

const VideoFeed = () => {
  return (
    <div className="video-feed-container">
      <div className="video-wrapper">
        <img 
          src="http://localhost:8000/video_feed" 
          alt="Live Security Feed" 
          className="live-video"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="video-placeholder" style={{ display: 'none' }}>
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
