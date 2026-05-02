import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function StatsCard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/areas`);
        if (!response.ok) {
          throw new Error("Failed to load area data");
        }

        const areas = await response.json();
        const visibleAreas = Array.isArray(areas)
          ? areas.filter((area) => !String(area?.name || "").toUpperCase().includes("TOTAL"))
          : [];
        const crimeKeys = visibleAreas[0]?.crime_keys || [];
        const totalCrimePoints = visibleAreas.reduce((sum, area) => {
          const areaTotal = (area.crime_keys || []).reduce(
            (crimeSum, key) => crimeSum + (Number(area[key]) || 0),
            0
          );
          return sum + areaTotal;
        }, 0);
        const highRiskAreas = visibleAreas.filter(
          (area) => area.danger_rank === "Worst"
        ).length;

        if (!isMounted) {
          return;
        }

        setStats([
          {
            label: "Areas Loaded",
            value: visibleAreas.length.toLocaleString(),
            target: visibleAreas.length,
            helper: "From project dataset"
          },
          {
            label: "Crime Categories",
            value: crimeKeys.length.toLocaleString(),
            target: crimeKeys.length,
            helper: "Detected in project data"
          },
          {
            label: "Recorded Crime Total",
            value: totalCrimePoints.toLocaleString(),
            target: totalCrimePoints,
            helper: "Summed from loaded areas"
          },
          {
            label: "High Risk Areas",
            value: highRiskAreas.toLocaleString(),
            target: highRiskAreas,
            helper: 'Areas ranked "Worst"'
          }
        ]);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setStats([
          {
            label: "Areas Loaded",
            value: "--",
            target: 0,
            helper: "Unavailable"
          },
          {
            label: "Crime Categories",
            value: "--",
            target: 0,
            helper: "Unavailable"
          },
          {
            label: "Recorded Crime Total",
            value: "--",
            target: 0,
            helper: "Unavailable"
          },
          {
            label: "High Risk Areas",
            value: "--",
            target: 0,
            helper: "Unavailable"
          }
        ]);
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const counters = document.querySelectorAll(".count-up");

    counters.forEach((counter) => {
      const el = counter;
      const target = parseInt(el.dataset.target || "0", 10);
      const increment = Math.max(1, Math.ceil(target / 40));
      let current = 0;

      const timer = window.setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          window.clearInterval(timer);
        }
        el.innerText = current.toLocaleString();
      }, 28);
    });
  }, [stats]);

  return (
    <section className="stats-section" id="stats">
      <div className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div
              className={stat.value === "--" ? "stat-value" : "count-up stat-value"}
              data-target={stat.target}
            >
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-helper">{stat.helper}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
