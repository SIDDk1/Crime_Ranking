import React from "react";
import Navbar from "./components/Homepage/Navbar1";
import Hero from "./components/Homepage/Hero";
import StatsCard from "./components/Homepage/StartCards";
import MapSection from "./components/Homepage/MapSection";
import HowItWorks from "./components/Homepage/HowitWorks";
import Footer from "./components/Homepage/footer";
import "./components/Homepage/Homepage.css";

export default function CrimeAI({ onNavigateToAuth }) {
  return (
    <div className="crimeai-page">
      <Navbar onNavigateToAuth={onNavigateToAuth} />

      <main className="crimeai-main">
        <StatsCard />
        <Hero onNavigateToAuth={onNavigateToAuth} />
        <MapSection onNavigateToAuth={onNavigateToAuth} />
        <HowItWorks />
        <Footer onNavigateToAuth={onNavigateToAuth} />
      </main>
    </div>
  );
}
