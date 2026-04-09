import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const AlertPopup = ({ message, onClose }) => {
  return (
    <div className="alert-popup-overlay">
      <div className="alert-popup-box slide-down">
        <div className="alert-icon-container blinking-bg">
          <AlertCircle size={32} color="white" />
        </div>
        <div className="alert-content">
          <h4>POLICE ALERT</h4>
          <p>{message}</p>
        </div>
        <button className="close-btn" onClick={onClose}><X size={20}/></button>
      </div>
    </div>
  );
};

export default AlertPopup;
