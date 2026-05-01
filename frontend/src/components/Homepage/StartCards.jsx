import { useEffect } from "react";

const stats = [
  { label: "Districts Live", value: "10", target: 10, helper: "As launched" },
  { label: "Dashboards / District", value: "32", target: 32, helper: "Static" },
  { label: "Crime Data Points", value: "2,377", target: 2377, helper: "Every 5-30 min" },
  { label: "Districts Coming", value: "770", target: 770, helper: "As launched" }
];

export default function StatsCard() {
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
  }, []);

  return (
    <section className="stats-section" id="stats">
      <div className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <div className="count-up stat-value" data-target={stat.target}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-helper">{stat.helper}</div>
          </article>
        ))}

        <article className="stat-card stat-card-last">
          <div className="stat-value muted">• 5h ago</div>
          <div className="stat-label">Last Refresh</div>
          <div className="stat-helper">Every cron cycle</div>
        </article>
      </div>
    </section>
  );
}
