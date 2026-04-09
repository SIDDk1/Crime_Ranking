import React, { useState, useEffect } from 'react';
import DashboardMap from './components/DashboardMap';
import VideoFeed from './components/VideoFeed';
import AlertPopup from './components/AlertPopup';
import CrimeReport from './components/CrimeReport';
import { Shield, AlertTriangle, LayoutDashboard, BrainCircuit, FileBarChart } from 'lucide-react';
import './App.css';

function App() {
  const [areas, setAreas] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(null);

  useEffect(() => {
    // 1. Fetch Area Data
    fetch('http://localhost:8000/api/areas')
      .then(res => res.json())
      .then(data => setAreas(data))
      .catch(err => console.error("Error fetching areas: ", err));

    // 2. Poll for Data Alerts (if any area became 'Worst')
    // In a real app we might recalculate this periodically
  }, []);

  useEffect(() => {
    // 3. Listen for Real-Time Video Alerts via SSE
    const eventSource = new EventSource('http://localhost:8000/api/alerts');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.alert) {
        triggerAlert(data.message);
      }
    };

    return () => eventSource.close();
  }, []);

  const triggerAlert = (message) => {
    const newAlert = { id: Date.now(), msg: message, time: new Date().toLocaleTimeString() };
    setCurrentAlert(newAlert);
    setAlerts(prev => [newAlert, ...prev]);
    
    // Auto dismiss popup after 5 seconds
    setTimeout(() => {
      setCurrentAlert(null);
    }, 5000);
  };

  const activeAlertCount = alerts.length;

  return (
    <div className="app-container">
      {currentAlert && <AlertPopup message={currentAlert.msg} onClose={() => setCurrentAlert(null)} />}
      
      {/* Sidebar */}
      <aside className="sidebar pulse-border">
        <div className="logo">
          <Shield className="logo-icon" size={32} />
          <h2>Aegis<span className="accent">Vision</span></h2>
        </div>
        
        <nav className="nav-menu">
          <a href="#" className="active"><LayoutDashboard size={20} /> Dashboard</a>
          <a href="#"><FileBarChart size={20} /> Reports</a>
          <a href="#"><BrainCircuit size={20} /> AI Models</a>
          <a href="#" className={activeAlertCount > 0 ? "text-red" : ""}><AlertTriangle size={20} /> Alert History {activeAlertCount > 0 && <span className="badge">{activeAlertCount}</span>}</a>
        </nav>

        <div className="alert-log panel">
          <h3>Recent Logs</h3>
          <ul className="log-list">
            {alerts.length === 0 ? <li className="empty-state">System Normal</li> :
              alerts.slice(0, 5).map(alert => (
                <li key={alert.id} className="log-item critical">
                  <span className="time">{alert.time}</span>
                  <p>{alert.msg}</p>
                </li>
              ))
            }
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="status-indicator">
            <span className="pulse-dot green"></span> Live Surveillance Active
          </div>
          <div className="user-profile">
            <span className="avatar">OC</span>
            <span>Operations Center</span>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="panel map-panel">
            <div className="panel-header">
              <h3>City Crime Risk Map</h3>
              <p className="subtitle">Driven by Random Forest Predictions</p>
            </div>
            <DashboardMap areas={areas} />
          </div>

          <div className="panel video-panel">
            <div className="panel-header">
              <h3>Live Video Analytics</h3>
              <p className="subtitle">OpenCV Anomaly Detection</p>
            </div>
            <VideoFeed />
          </div>
        </div>
        
        <div className="report-section" style={{ marginTop: '1.5rem' }}>
          <CrimeReport />
        </div>
      </main>
    </div>
  );
}

export default App;
