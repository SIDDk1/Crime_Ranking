import React, { useState } from 'react';

const VideoFeed = () => {
  const [activeCamera, setActiveCamera] = useState(1);
  const API_URL = import.meta.env.VITE_API_URL || "https://crime-ranking.onrender.com";

  return (
    <div className="video-feed-container">
      <div className="camera-controls" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        {[1, 2, 3, 4].map((camNum) => (
          <button 
            key={camNum}
            onClick={() => setActiveCamera(camNum)}
            className={`cam-btn ${activeCamera === camNum ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              backgroundColor: activeCamera === camNum ? '#e53e3e' : '#2d3748',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.2s',
              flex: 1
            }}
          >
            CAM 0{camNum}
          </button>
        ))}
      </div>
      <div className="video-wrapper">
        <img 
          src={`${API_URL}/video_feed?camera=${activeCamera}&cb=${Date.now()}`} 
          alt={`Live Security Feed Camera ${activeCamera}`} 
          className="live-video"
          key={activeCamera}
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
          <span className="cam-label">CAM 0{activeCamera} - {activeCamera === 1 ? 'MAIN INT' : activeCamera === 2 ? 'PARKING LOG' : activeCamera === 3 ? 'BACK ALLEY' : 'LOBBY VIEW'}</span>
          <span className="rec-indicator"><span className="red-dot blinking"></span> REC</span>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
