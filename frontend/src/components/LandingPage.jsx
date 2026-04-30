import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, Activity, Map as MapIcon, Database, 
  Eye, Crosshair, MapPin, Zap, ChevronRight, 
  BarChart3, AlertTriangle, ShieldCheck,
  Server, Cpu, Layers, GitBranch, BrainCircuit
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onNavigateToAuth }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="landing-page">
      {/* Background Effects */}
      <div className="lp-background">
        <div className="lp-grid"></div>
        <div className="lp-glow-orb lp-glow-1"></div>
        <div className="lp-glow-orb lp-glow-2"></div>
      </div>

      {/* Navigation */}
      <nav className="lp-navbar">
        <div className="lp-logo">
          <Shield size={28} />
          <span>Crime Detection & Surveillance</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#architecture" className="lp-nav-link">Architecture</a>
          <a href="#stats" className="lp-nav-link">Live Data</a>
        </div>
        <button className="lp-live-btn" onClick={onNavigateToAuth}>
          <div className="lp-live-dot"></div>
          Live Dashboard
        </button>
      </nav>

      <main className="lp-main">
        {/* Hero Section */}
        <section className="lp-hero">
          
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            India's AI-Powered Crime Intelligence Engine
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Predict. Detect. Protect. — Real-Time Surveillance Meets Machine Learning. 
            Built on a core of Scikit-Learn, OpenCV, and 40,000+ real Kaggle crime records.
          </motion.p>

          <motion.div 
            className="lp-hero-ctas"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ justifyContent: 'center' }}
          >
            <button className="lp-btn-primary" onClick={onNavigateToAuth}>
              <Activity size={20} /> View Live Dashboard
            </button>
          </motion.div>

          {/* 3D Core representation using Framer Motion & CSS */}
          <motion.div 
            className="lp-core-container"
            style={{ 
              rotateX: mousePosition.y, 
              rotateY: -mousePosition.x 
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <div className="lp-core-globe">
              {/* Hotspot Markers */}
              <div className="lp-marker" style={{ top: '20%', left: '30%', transform: 'translateZ(150px)' }}></div>
              <div className="lp-marker" style={{ top: '50%', right: '20%', transform: 'translateZ(100px)', background: '#00FF88', boxShadow: '0 0 20px #00FF88' }}></div>
              <div className="lp-marker" style={{ bottom: '30%', left: '40%', transform: 'translateZ(120px)', background: '#F5A623', boxShadow: '0 0 20px #F5A623' }}></div>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="lp-stats">
          {[
            { label: "Cities Monitored", value: "38+" },
            { label: "Crime Records Analyzed", value: "40K+" },
            { label: "Camera Streams", value: "4" },
            { label: "Map Load Time", value: "<30ms" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              className="lp-stat-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="lp-stat-value">{stat.value}</div>
              <div className="lp-stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </section>

        {/* Features Section */}
        <section id="features" className="lp-features">
          <div className="lp-section-header">
            <h2>Core Intelligence Systems</h2>
            <p>Battle-tested technologies unified for real-world law enforcement deployment.</p>
          </div>

          <div className="lp-feature-grid">
            <motion.div 
              className="lp-feature-card"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="lp-feature-icon">
                <BrainCircuit size={32} />
              </div>
              <h3>ML Crime Ranking</h3>
              <p>Predicts high-risk urban zones using Scikit-Learn models trained on 40,000+ Kaggle India crime records. Supports IPC-based crime categories like Murder, Robbery, and Theft.</p>
            </motion.div>

            <motion.div 
              className="lp-feature-card"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="lp-feature-icon">
                <Crosshair size={32} />
              </div>
              <h3>Real-Time Anomaly Detection</h3>
              <p>OpenCV MOG2 background subtraction + TensorFlow anomaly model actively monitors CCTV streams. Draws red bounding boxes around suspicious activity in milliseconds.</p>
            </motion.div>

            <motion.div 
              className="lp-feature-card"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="lp-feature-icon">
                <MapPin size={32} />
              </div>
              <h3>Interactive Crime Heatmap</h3>
              <p>OpenStreetMap integration with geopy geocoding overlays ML predictions across 38+ cities. Dynamic color-coded risk levels update as new data flows in instantly.</p>
            </motion.div>
          </div>
        </section>

        {/* Architecture Pipeline */}
        <section id="architecture" className="lp-pipeline">
          <div className="lp-section-header">
            <h2>System Architecture</h2>
            <p>A flawless pipeline from raw data ingestion to live dashboard rendering.</p>
          </div>

          <div className="lp-pipeline-flow">
            <div className="lp-pipeline-line">
              <div className="lp-pipeline-line-glow"></div>
            </div>
            
            {[
              { icon: Database, label: "Raw CSV Dataset" },
              { icon: Server, label: "FastAPI Backend" },
              { icon: GitBranch, label: "Scikit-Learn ML" },
              { icon: Layers, label: "React Dashboard" },
              { icon: MapIcon, label: "Live City Map" }
            ].map((node, i) => (
              <motion.div 
                key={i}
                className="lp-node"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: 'spring' }}
              >
                <node.icon size={28} />
                <span>{node.label}</span>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <Shield size={24} color="#0D6EFD" />
          Crime Detection & Surveillance
        </div>
        <p>Crime Detection & Area Ranking System</p>
        <div className="lp-footer-links">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAuth(); }}>Admin Login</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
