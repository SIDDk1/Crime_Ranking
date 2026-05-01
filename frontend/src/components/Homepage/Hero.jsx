import React from "react";
import { ArrowRight, MapPinned, ShieldCheck } from "lucide-react";

export default function Hero({ onNavigateToAuth }) {
  const scrollToMap = () => {
    const el = document.getElementById("map");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">
          <ShieldCheck size={14} />
          National crime intelligence
        </div>

        <h1>
          Your district. Your <span className="gradient-text">crime data</span>. Your safety.
        </h1>

        <p>
          India&apos;s AI-powered crime detection and transparency platform for public safety teams, district monitoring, and live surveillance.
        </p>

        <div className="hero-actions">
          <button className="hero-btn primary" type="button" onClick={scrollToMap}>
            Explore the whole India <MapPinned size={16} />
          </button>
          <button className="hero-btn secondary" type="button" onClick={() => onNavigateToAuth?.()}>
            Go to dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="hero-orbit">
        <div className="hero-core">
          <span className="hero-core-ring hero-ring-a" />
          <span className="hero-core-ring hero-ring-b" />
          <span className="hero-core-ring hero-ring-c" />
          <span className="hero-core-dot hero-dot-a" />
          <span className="hero-core-dot hero-dot-b" />
          <span className="hero-core-dot hero-dot-c" />
        </div>
      </div>
    </section>
  );
}
