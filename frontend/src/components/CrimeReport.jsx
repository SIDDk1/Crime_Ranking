import React, { useState, useEffect } from 'react';
import { FileText, MapPin, AlertOctagon, Download } from 'lucide-react';

const CrimeReport = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = () => {
    fetch('https://crime-ranking.onrender.com/api/generate-report')
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.error("Error fetching report:", err));
  };

  if (!report) {
    return <div className="panel crime-report-panel"><p>Loading Police Summary...</p></div>;
  }

  return (
    <div className="panel crime-report-panel">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3><FileText size={18} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} /> Police Summary Report</h3>
          <p className="subtitle">Admin Actionable Insights</p>
        </div>
        <button onClick={fetchReport} className="refresh-btn">Refresh</button>
      </div>

      <div className="report-stats">
        <div className="stat-card">
          <AlertOctagon className="stat-icon red" size={28} />
          <div className="stat-info">
            <span className="stat-value">{report.total_alerts}</span>
            <span className="stat-label">Total Anomalies Detected</span>
          </div>
        </div>
      </div>

      <div className="worst-areas-list">
        <h4>High-Risk Areas (Worst Rank)</h4>
        {report.worst_areas.length === 0 ? (
          <p className="empty-state">No areas are currently ranked 'Worst'.</p>
        ) : (
          <ul className="area-list">
            {report.worst_areas.map(area => (
              <li key={area.id} className="area-item">
                <MapPin size={16} className="text-red" />
                <div className="area-details">
                  <span className="area-name">{area.name}</span>
                  <div className="area-meta">
                    Density: {area.density} | Prior Incidents: {area.past_crimes}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <button className="primary-btn mt-4">
        <Download size={16} /> Export PDF
      </button>
    </div>
  );
};

export default CrimeReport;
