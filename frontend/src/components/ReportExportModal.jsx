import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, FileDigit } from 'lucide-react';
import * as XLSX from 'xlsx';

const ReportExportModal = ({ onClose }) => {
  const [isExporting, setIsExporting] = useState(false);

  const fetchReportData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/generate-report');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching report for export:", err);
      alert("Failed to fetch report data from the backend.");
      return null;
    }
  };

  const handleExport = async (type) => {
    setIsExporting(true);
    const report = await fetchReportData();
    if (!report || report.worst_areas.length === 0) {
      alert("No high-risk areas to export.");
      setIsExporting(false);
      return;
    }

    if (type === 'csv') {
      const headers = ["ID", "Area Name", "Density", "Past Crimes", "Danger Rank", "Latitude", "Longitude"];
      const rows = report.worst_areas.map(a => [a.id, a.name, a.density, a.past_crimes, a.danger_rank, a.lat, a.lng]);
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "CrimeReport.csv";
      link.click();
    } else if (type === 'excel') {
      const data = report.worst_areas.map(a => ({
        "ID": a.id, "Area Name": a.name, "Density": a.density, "Past Crimes": a.past_crimes, "Danger Rank": a.danger_rank
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "High Risk Areas");
      XLSX.writeFile(workbook, "CrimeReport.xlsx");
    }
    
    setIsExporting(false);
    onClose();
  };

  return (
    <div className="ai-helpdesk-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <div className="panel" onClick={e => e.stopPropagation()} style={{ width: '400px', padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(59, 130, 246, 0.05)', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={24} className="accent" />
            <h3>Export System Reports</h3>
          </div>
          <button className="close-btn" onClick={onClose} disabled={isExporting}><X size={20} /></button>
        </div>
        
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Select a format to instantly generate and download the latest High-Risk Area reports from the live system memory.
          </p>
          
          <button 
            className="primary-btn" 
            onClick={() => handleExport('csv')} 
            disabled={isExporting}
            style={{ backgroundColor: '#10b981', justifyContent: 'center', padding: '0.8rem' }}
          >
            <FileText size={18} /> {isExporting ? 'Generating...' : 'Download as CSV'}
          </button>
          
          <button 
            className="primary-btn" 
            onClick={() => handleExport('excel')} 
            disabled={isExporting}
            style={{ backgroundColor: '#166534', justifyContent: 'center', padding: '0.8rem' }}
          >
            <FileSpreadsheet size={18} /> {isExporting ? 'Generating...' : 'Download as Excel (.xlsx)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;
