import React, { useEffect, useRef } from 'react';
import { Shield, Activity, Target, AlertTriangle, Eye, ArrowRight, BrainCircuit, Server, Lock } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onNavigateToAuth }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { width, height, left, top } = heroRef.current.getBoundingClientRect();
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      heroRef.current.style.setProperty('--mouse-x', `${x * 100}%`);
      heroRef.current.style.setProperty('--mouse-y', `${y * 100}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="bg-glow"></div>
        <div className="bg-grid"></div>
      </div>

      <nav className="landing-nav">
        <div className="nav-brand">
          <Shield className="brand-icon" size={28} />
          <span>Crime detection and survillance</span>
        </div>
        <button className="nav-login-btn" onClick={onNavigateToAuth}>
          Access System
        </button>
      </nav>

      <main>
        <section className="hero-section" ref={heroRef}>
          <div className="hero-content">
            <div className="badge">
              <span className="pulse-dot"></span>
              Live AI Intelligence
            </div>
            <h1 className="hero-title">
              Crime Detection & <br />
              <span className="text-gradient">Surveillance System</span>
            </h1>
            <p className="hero-subtitle">
              A real-time surveillance and crime analytics dashboard. Utilizing Machine Learning to rank city zones based on actual IPC data and Deep Learning to detect video anomalies on live camera feeds.
            </p>
            <div className="hero-actions">
              <button className="primary-cta" onClick={onNavigateToAuth}>
                Enter Command Center
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="glass-panel main-panel">
              <div className="panel-header">
                <Activity size={18} />
                <span>Live Feed Analysis</span>
              </div>
              <div className="panel-body">
                <div className="video-container">
                  <video src="/demo_video_5.mp4" autoPlay loop muted playsInline className="demo-video"></video>
                  <div className="scanner-line"></div>
                </div>
                <div className="threat-indicator">
                  <AlertTriangle size={16} className="text-critical" />
                  <span>Threat Detected: Fighting / Theft Activity (CAM 02)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="section-header">
            <h2>Why Crime detection and survillance Matters</h2>
            <p>Moving beyond passive recording to proactive crime prevention.</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Target size={24} />
              </div>
              <h3>Granular Crime Ranking (Scikit-Learn)</h3>
              <p>We analyze historical IPC data (Murder, Robbery, Theft, Rape, Kidnapping) using a Scikit-Learn Random Forest Classifier to dynamically rank city zones as 'Best', 'Good', or 'Worst'.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Eye size={24} />
              </div>
              <h3>24/7 Anomaly Detection (TensorFlow)</h3>
              <p>Our multi-threaded FastAPI backend continuously scans 4 simulated camera feeds using OpenCV background subtraction and a custom-trained TensorFlow/Keras deep learning model to detect fighting, robbery, and vandalism.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <BrainCircuit size={24} />
              </div>
              <h3>AI-Driven Help Desk (Local Ollama AI)</h3>
              <p>Operators can query the system using natural language. The system securely leverages your local Ollama model (qwen2.5-coder:1.5b) to analyze current zone rankings and area density data completely offline.</p>
            </div>
          </div>
        </section>

        <section className="requirements-section">
          <div className="requirements-container">
            <div className="req-text">
              <h2>System Architecture & Requirements</h2>
              <p>Built for scale, speed, and absolute reliability in mission-critical environments.</p>
              <ul className="req-list">
                <li>
                  <Server size={20} />
                  <span><strong>Backend Infrastructure:</strong> A high-performance FastAPI server handling concurrent ML inferences, video streaming via OpenCV frame encoding, and SQLite database logging.</span>
                </li>
                <li>
                  <Activity size={20} />
                  <span><strong>Frontend Infrastructure:</strong> Built with React (Vite) and styled with custom CSS. Uses local storage for JWT token session management and real-time Server-Sent Events (SSE) for instant threat notifications.</span>
                </li>
                <li>
                  <Lock size={20} />
                  <span><strong>Machine Learning Pipeline:</strong> Dual-model architecture featuring a Scikit-learn Random Forest model for tabular dataset ingestion and a TensorFlow Keras model for frame-by-frame video classification.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Shield size={20} />
            <span>Crime detection and survillance</span>
          </div>
          <p>Next-Generation Crime Operations Suite. Secured & Encrypted.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
