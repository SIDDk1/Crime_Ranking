import React, { useState } from "react";

function Footer({ onNavigateToAuth }) {
  const [rating, setRating] = useState(0);

  const columns = [
    {
      title: "Team",
      links: [
        { name: "Abhishek Kaushik", url: "https://github.com/Abhi999k" },
        { name: "Siddharth Kaushik", url: "https://siddk1-portfolio.vercel.app/" },
        { name: "Saurabh Pandey", url: "https://github.com/mrsaurabh2312" },
        { name: "Shivam Sharma", url: "https://portfolio-vxrf.vercel.app/" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", url: "https://docs.google.com/document/d/1x-ATAZ8QcvCwjRpwLWIq5BNKbmpGtalzVwODBLAz4RY/edit?usp=sharing" },
        { name: "API Reference", url: "#" },
        { name: "Community Forum", url: "#" }
      ]
    },
    {
      title: "Connect",
      links: [{ name: "Twitter", url: "https://x.com/sidd2004_sk" }],
      isSocial: true
    }
  ];

  return (
    <footer className="home-footer">
      <div className="home-footer-inner">
        <div className="home-footer-left">
          <h3>
            Secure Your Area <br />
            in Minutes, <br />
            Not Days.
          </h3>

          <div className="rating-pill">
            <span>Rate your experience</span>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`star-button ${i < rating ? "is-active" : ""}`}
                  onClick={() => setRating(i + 1)}
                  aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
                  aria-pressed={i < rating}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="home-footer-columns">
          {columns.map((col) => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.url}
                      target={item.url !== "#" ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col">
            <h4>Dashboard</h4>
            <button type="button" className="footer-login" onClick={() => onNavigateToAuth?.()}>
              Admin Login
            </button>
          </div>
        </div>
      </div>

      <div className="home-footer-bottom">
        <div className="footer-brand">CRIMEAI</div>
        <p>© 2026 CrimeAI. Powered by AI.</p>
      </div>
    </footer>
  );
}

export default Footer;
