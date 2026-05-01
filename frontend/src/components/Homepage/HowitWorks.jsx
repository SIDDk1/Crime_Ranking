import React from "react";
import { FileText, BrainCircuit, Eye } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "We Collect",
    description: "Data from official crime portals, NCRB, and state police databases every 5-30 minutes."
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "We Analyze with AI",
    description: "AI detects crime patterns, predicts hotspots, and organizes dashboards."
  },
  {
    number: "03",
    icon: Eye,
    title: "You See",
    description: "Real-time crime data, safety scores, and insights."
  }
];

export default function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-heading">
        <h2>How it works</h2>
        <p>Real data. Real-time. Real-public.</p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.number} className="step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">
                <Icon size={20} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          );
        })}
      </div>

      <div className="source-note">
        Sources: data.gov.in, ncrb.gov.in, statepolice.gov.in
      </div>
    </section>
  );
}
