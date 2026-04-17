import React, { useState } from 'react';

const VideoFeed = ({ activeCamera, setActiveCamera }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const cameras = [
    { id: 1, label: "MAIN INT" },
    { id: 2, label: "EAST WING" },
    { id: 3, label: "NORTH EXIT" },
    { id: 4, label: "PARKING" }
  ];

  const currentCam = cameras.find(c => c.id === activeCamera);

  return (
    <div className="video-feed-container">
      <div className="video-wrapper">
        <img 
          src={`${API_URL}/video_feed?camera=${activeCamera}&cb=${Date.now()}`} 
          alt={`Live Security Feed Camera ${activeCamera}`} 
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
          <span className="cam-label">CAM 0{activeCamera} - {currentCam.label}</span>
          <span className="rec-indicator"><span className="red-dot blinking"></span> REC</span>
        </div>
      </div>
      
      <div className="camera-controls" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        {cameras.map(cam => (
          <button 
            key={cam.id} 
            onClick={() => setActiveCamera(cam.id)}
            style={{
              padding: '6px 12px',
              backgroundColor: activeCamera === cam.id ? 'var(--accent-blue)' : 'var(--glass-bg)',
              color: activeCamera === cam.id ? 'white' : 'var(--text-muted)',
              border: `1px solid ${activeCamera === cam.id ? 'var(--accent-blue)' : 'var(--border-color)'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
          >
            CAM 0{cam.id}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VideoFeed;
