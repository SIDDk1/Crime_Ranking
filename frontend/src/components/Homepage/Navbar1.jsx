import React from "react";
import { Shield, Menu, ArrowRight } from "lucide-react";

const tickerItems = [
  { label: "Theft Cases", value: "2,45,892", trend: "▼ -3.2%", trendClass: "trend-down" },
  { label: "Cyber Crime", value: "1,89,234", trend: "▲ +1.8%", trendClass: "trend-up" },
  { label: "Traffic Violations", value: "3,12,456" },
  { label: "Fraud Cases", value: "5,67,890", trend: "▼ -0.8%", trendClass: "trend-down" },
  { label: "Property Crime", value: "4,23,100", trend: "▲ +2.1%", trendClass: "trend-up" },
  { label: "Violent Crime", value: "1,34,567", trend: "▼ -1.5%", trendClass: "trend-down" }
];

export default function Navbar({ onNavigateToAuth }) {
  return (
    <nav className="home-navbar">
      <div className="home-navbar-inner">
        <div className="home-brand">
          <Shield size={22} />
          <span>CrimeAI<span className="brand-accent">.in</span></span>
        </div>

        <div className="home-nav-links">
          <a href="#stats">Stats</a>
          <a href="#map">Map</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="home-nav-actions">
          <button className="home-ghost-btn" type="button">
            IN <Menu size={14} />
          </button>
          <button className="home-primary-btn" type="button" onClick={() => onNavigateToAuth?.()}>
            Live Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="home-ticker">
        <span className="live-pill">Live</span>
        <div className="ticker-viewport">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item.label}-${index}`} className="ticker-item">
                {item.label} <strong>{item.value}</strong> {item.trend ? <em className={item.trendClass}>{item.trend}</em> : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
