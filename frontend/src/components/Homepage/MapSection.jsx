import React from "react";
import HomeDrillDown from "../HomeDrillDown.v3";

export default function MapSection({ onNavigateToAuth }) {
  return (
    <section className="map-section" id="map">
      <div className="section-heading">
        <h2>Map</h2>
        <p>Drill into states and districts to inspect risk and coverage.</p>
      </div>

      <HomeDrillDown locale="en" heroShown onNavigateToAuth={onNavigateToAuth} />
    </section>
  );
}
