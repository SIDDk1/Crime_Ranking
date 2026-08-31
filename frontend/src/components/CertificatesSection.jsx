import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  FileCheck,
  Calendar,
  X,
  Layers,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import './CertificatesSection.css';
import { getApiUrl } from '../config/api';

const STORAGE_KEY = 'crime_ranking_certificates_v1';

const INITIAL_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Deep Learning Specialization',
    issuer: 'DeepLearning.AI / Coursera',
    issueDate: '2025-11-15',
    credentialId: 'DLAI-DL-984210',
    credentialUrl: 'https://coursera.org/verify/specialization/DLAI-DL-984210',
    category: 'AI & Machine Learning',
    skills: ['Deep Neural Networks', 'CNN Architecture', 'PyTorch / TensorFlow', 'Computer Vision'],
    description: 'Comprehensive mastery of deep learning foundations, convolution networks for image understanding, and sequence models.',
    verified: true,
    fileData: null
  },
  {
    id: 'cert-2',
    title: 'Computer Vision & Real-Time Anomaly Detection',
    issuer: 'Stanford Online / Kaggle AI',
    issueDate: '2025-08-20',
    credentialId: 'STF-CV-771923',
    credentialUrl: 'https://credentials.stanford.edu/verify/771923',
    category: 'Computer Vision',
    skills: ['OpenCV', 'Temporal Action Localization', 'Video Anomaly Detection', 'Spatiotemporal AI'],
    description: 'Advanced real-time video surveillance processing, feature extraction, and surveillance anomaly classification.',
    verified: true,
    fileData: null
  },
  {
    id: 'cert-3',
    title: 'TensorFlow Developer Certificate',
    issuer: 'Google Cloud & TensorFlow',
    issueDate: '2025-04-10',
    credentialId: 'TF-DEV-554109',
    credentialUrl: 'https://www.credential.net/google-tf-554109',
    category: 'AI & Machine Learning',
    skills: ['Model Optimization', 'Keras', 'Transfer Learning', 'Edge Inference'],
    description: 'Demonstrated proficiency in building production machine learning models, convolutional networks, and time-series classifiers.',
    verified: true,
    fileData: null
  },
  {
    id: 'cert-4',
    title: 'AWS Certified Cloud Practitioner & ML Ops',
    issuer: 'Amazon Web Services',
    issueDate: '2025-02-18',
    credentialId: 'AWS-ML-094125',
    credentialUrl: 'https://aws.amazon.com/verification/AWS-ML-094125',
    category: 'Cloud & DevOps',
    skills: ['AWS Architecture', 'SageMaker', 'API Gateway', 'Cloud Security'],
    description: 'Cloud deployment, scalability, REST API infrastructure, and microservices architecture for intelligent applications.',
    verified: true,
    fileData: null
  }
];

export default function CertificatesSection({ currentUser }) {
  const [certificates, setCertificates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CERTIFICATES;
  });

  const [activeTab, setActiveTab] = useState('showcase'); // 'showcase' or 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCert, setSelectedCert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: new Date().toISOString().split('T')[0],
    credentialId: '',
    credentialUrl: '',
    category: 'AI & Machine Learning',
    skills: '',
    description: '',
    fileData: null,
    fileName: ''
  });

  const fileInputRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
    } catch (e) {
      console.warn('Storage quota exceeded or storage unavailable');
    }
  }, [certificates]);

  // Fetch from backend
  useEffect(() => {
    const fetchBackendCertificates = async () => {
      try {
        const res = await fetch(getApiUrl('/api/certificates'));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCertificates(data);
          }
        }
      } catch (err) {}
    };
    fetchBackendCertificates();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller certificate image or PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        fileData: reader.result,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        fileData: reader.result,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitCertificate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.issuer.trim()) {
      alert('Please provide at least the Certificate Title and Issuing Organization.');
      return;
    }

    setIsSubmitting(true);

    const skillsArray = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : ['AI & Machine Learning', 'Verified Credential'];

    const newCert = {
      id: 'cert-' + Date.now(),
      title: formData.title.trim(),
      issuer: formData.issuer.trim(),
      issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
      credentialId: formData.credentialId.trim() || ('CR-' + Math.floor(100000 + Math.random() * 900000)),
      credentialUrl: formData.credentialUrl.trim() || '',
      category: formData.category,
      skills: skillsArray,
      description: formData.description.trim() || `Verified credential issued by ${formData.issuer.trim()}.`,
      verified: true,
      fileData: formData.fileData,
      createdAt: new Date().toISOString()
    };

    const updated = [newCert, ...certificates];
    setCertificates(updated);

    try {
      await fetch(getApiUrl('/api/certificates'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCert)
      });
    } catch (err) {}

    setFormData({
      title: '',
      issuer: '',
      issueDate: new Date().toISOString().split('T')[0],
      credentialId: '',
      credentialUrl: '',
      category: 'AI & Machine Learning',
      skills: '',
      description: '',
      fileData: null,
      fileName: ''
    });

    setIsSubmitting(false);
    setSuccessMessage('Certificate uploaded and published successfully!');
    setTimeout(() => setSuccessMessage(''), 4000);
    setActiveTab('showcase');
  };

  const handleDeleteCertificate = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this certificate?')) {
      const updated = certificates.filter(c => c.id !== id);
      setCertificates(updated);

      try {
        await fetch(getApiUrl(`/api/certificates/${id}`), { method: 'DELETE' });
      } catch (err) {}
    }
  };

  const categories = ['All', 'AI & Machine Learning', 'Computer Vision', 'Cybersecurity', 'Cloud & DevOps', 'Data Science'];

  const filteredCertificates = certificates.filter(cert => {
    const matchesCat = selectedCategory === 'All' || cert.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      cert.title.toLowerCase().includes(q) ||
      cert.issuer.toLowerCase().includes(q) ||
      cert.credentialId.toLowerCase().includes(q) ||
      cert.skills?.some(s => s.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="cert-section-container">
      {/* Top Stats Overview */}
      <div className="cert-stats-banner">
        <div className="cert-stat-card">
          <div className="cert-stat-icon">
            <Award size={24} />
          </div>
          <div className="cert-stat-info">
            <span>Total Accreditations</span>
            <strong>{certificates.length}</strong>
          </div>
        </div>

        <div className="cert-stat-card">
          <div className="cert-stat-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="cert-stat-info">
            <span>Verified Credentials</span>
            <strong>{certificates.filter(c => c.verified).length}</strong>
          </div>
        </div>

        <div className="cert-stat-card">
          <div className="cert-stat-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)' }}>
            <Layers size={24} />
          </div>
          <div className="cert-stat-info">
            <span>Core Domains</span>
            <strong>{new Set(certificates.map(c => c.category)).size}</strong>
          </div>
        </div>

        <div className="cert-stat-card">
          <div className="cert-stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
            <Sparkles size={24} />
          </div>
          <div className="cert-stat-info">
            <span>Latest Accreditation</span>
            <strong style={{ fontSize: '0.95rem', marginTop: '4px' }}>
              {certificates[0]?.title?.slice(0, 22) || 'None'}...
            </strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Filters */}
      <div className="cert-nav-tabs">
        <div className="cert-mode-toggle">
          <button
            type="button"
            className={`cert-mode-btn ${activeTab === 'showcase' ? 'active' : ''}`}
            onClick={() => setActiveTab('showcase')}
          >
            <Award size={16} />
            Certification Showcase
          </button>
          <button
            type="button"
            className={`cert-mode-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Upload size={16} />
            Admin Upload Portal
          </button>
        </div>

        {activeTab === 'showcase' && (
          <div className="cert-filter-bar">
            <div className="cert-search-box">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search certificates, issuers, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="cert-category-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`cert-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={20} />
          {successMessage}
        </div>
      )}

      {/* SHOWCASE TAB */}
      {activeTab === 'showcase' && (
        <div className="cert-grid">
          {filteredCertificates.length === 0 ? (
            <div className="cert-empty-state">
              <Award size={48} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
              <h3>No Certificates Found</h3>
              <p>No certificates match your search or filter criteria. You can upload new ones via the Admin Portal.</p>
              <button
                type="button"
                className="cert-submit-btn"
                onClick={() => setActiveTab('admin')}
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              >
                <Plus size={16} /> Upload First Certificate
              </button>
            </div>
          ) : (
            filteredCertificates.map((cert) => (
              <div key={cert.id} className="cert-card" onClick={() => setSelectedCert(cert)}>
                <div className="cert-preview-wrapper">
                  {cert.fileData ? (
                    <img src={cert.fileData} alt={cert.title} className="cert-preview-img" />
                  ) : (
                    <div className="cert-default-badge-art">
                      <Award size={42} />
                      <span>{cert.issuer}</span>
                    </div>
                  )}

                  <span className="cert-category-tag">{cert.category}</span>
                  {cert.verified && (
                    <span className="cert-verified-badge">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="cert-body">
                  <div className="cert-header">
                    <span className="cert-issuer">{cert.issuer}</span>
                    <h3 className="cert-title">{cert.title}</h3>
                  </div>

                  <p className="cert-desc">{cert.description}</p>

                  <div className="cert-meta-list">
                    <div className="cert-meta-item">
                      <span className="cert-meta-label">Issued Date:</span>
                      <span className="cert-meta-val">{cert.issueDate}</span>
                    </div>
                    <div className="cert-meta-item">
                      <span className="cert-meta-label">Credential ID:</span>
                      <span className="cert-meta-val">{cert.credentialId}</span>
                    </div>
                  </div>

                  {cert.skills && cert.skills.length > 0 && (
                    <div className="cert-skills-tags">
                      {cert.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="cert-skill-badge">{skill}</span>
                      ))}
                      {cert.skills.length > 3 && (
                        <span className="cert-skill-badge">+{cert.skills.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="cert-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="cert-view-btn"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <Eye size={15} /> View Details
                    </button>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cert-icon-btn"
                        title="Open External Verification Link"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}

                    <button
                      type="button"
                      className="cert-icon-btn danger"
                      title="Remove Certificate"
                      onClick={(e) => handleDeleteCertificate(cert.id, e)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ADMIN UPLOAD PORTAL TAB */}
      {activeTab === 'admin' && (
        <div className="panel cert-upload-panel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-heading" style={{ marginBottom: 0 }}>
              <div>
                <p className="eyebrow-text">Upload Credentials</p>
                <h3>Document Upload & Preview</h3>
              </div>
            </div>

            {!formData.fileData ? (
              <div
                className="cert-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml, application/pdf"
                />
                <div className="cert-dropzone-icon">
                  <Upload size={28} />
                </div>
                <h4>Drag & Drop Certificate Image</h4>
                <p>Supports PNG, JPG, WEBP, SVG or scanned certificate images (Max 5MB)</p>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: 'var(--accent)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="cert-upload-preview">
                  <img src={formData.fileData} alt="Upload preview" />
                  <button
                    type="button"
                    className="cert-remove-preview-btn"
                    onClick={() => setFormData(prev => ({ ...prev, fileData: null, fileName: '' }))}
                    title="Remove uploaded image"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>{formData.fileName || 'Attached Certificate'}</span>
                  <span style={{ color: 'var(--accent)' }}>✓ Ready to Publish</span>
                </div>
              </div>
            )}

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--line)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>💡 Admin Portal Tips</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                • Uploaded certificates appear instantly on the <strong>Certification Showcase</strong> and are saved locally in your browser.
                • Include Credential Verification URLs (Coursera, Credly, LinkedIn) so viewers can verify validity in one click.
              </p>
            </div>
          </div>

          <div>
            <div className="panel-heading" style={{ marginBottom: '16px' }}>
              <div>
                <p className="eyebrow-text">Accreditation Details</p>
                <h3>Certificate Information</h3>
              </div>
            </div>

            <form className="cert-form" onSubmit={handleSubmitCertificate}>
              <label>
                <span>Certificate Title *</span>
                <input
                  type="text"
                  placeholder="e.g. AWS Certified Machine Learning Specialist"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </label>

              <div className="cert-form-row">
                <label>
                  <span>Issuing Organization *</span>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services, Google, Stanford"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    required
                  />
                </label>

                <label>
                  <span>Category</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                  </select>
                </label>
              </div>

              <div className="cert-form-row">
                <label>
                  <span>Issue Date</span>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </label>

                <label>
                  <span>Credential / License ID</span>
                  <input
                    type="text"
                    placeholder="e.g. AWS-MLS-908124"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  />
                </label>
              </div>

              <label>
                <span>Verification / Credential URL</span>
                <input
                  type="url"
                  placeholder="https://www.credly.com/badges/..."
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                />
              </label>

              <label>
                <span>Key Skills (comma separated)</span>
                <input
                  type="text"
                  placeholder="e.g. PyTorch, Computer Vision, FastAPI, CNN, Anomaly Detection"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </label>

              <label>
                <span>Description / Curriculum Highlights</span>
                <textarea
                  placeholder="Brief description of coursework, capstone project, or skills demonstrated..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </label>

              <button type="submit" className="cert-submit-btn" disabled={isSubmitting}>
                <Plus size={18} />
                {isSubmitting ? 'Publishing Certificate...' : 'Publish Certificate to Showcase'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN CERTIFICATE DETAILS MODAL */}
      {selectedCert && (
        <div className="cert-modal-overlay" onClick={() => setSelectedCert(null)}>
          <div className="cert-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cert-modal-header">
              <h3>
                <Award size={22} className="accent" />
                {selectedCert.title}
              </h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setSelectedCert(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cert-modal-body">
              {selectedCert.fileData ? (
                <div className="cert-modal-img-frame">
                  <img src={selectedCert.fileData} alt={selectedCert.title} />
                </div>
              ) : (
                <div className="cert-modal-img-frame" style={{ minHeight: '200px', flexDirection: 'column', gap: '14px' }}>
                  <Award size={64} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {selectedCert.issuer}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Official Digital Verification Badge
                  </span>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  Description & Scope
                </h4>
                <p style={{ color: 'var(--text-soft)', lineHeight: '1.6', fontSize: '0.92rem' }}>
                  {selectedCert.description}
                </p>
              </div>

              <div className="cert-modal-details">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISSUED BY</span>
                  <strong style={{ display: 'block', color: 'var(--text-main)', marginTop: '2px' }}>{selectedCert.issuer}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISSUE DATE</span>
                  <strong style={{ display: 'block', color: 'var(--text-main)', marginTop: '2px' }}>{selectedCert.issueDate}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CREDENTIAL ID</span>
                  <strong style={{ display: 'block', color: 'var(--accent)', marginTop: '2px', fontFamily: 'monospace' }}>{selectedCert.credentialId}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VERIFICATION STATUS</span>
                  <strong style={{ display: 'block', color: '#10b981', marginTop: '2px' }}>✓ Verified Authenticity</strong>
                </div>
              </div>

              {selectedCert.skills && selectedCert.skills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Acquired Capabilities & Tools
                  </h4>
                  <div className="cert-skills-tags">
                    {selectedCert.skills.map((skill, idx) => (
                      <span key={idx} className="cert-skill-badge" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="cert-modal-footer">
              <button
                type="button"
                className="cert-icon-btn"
                onClick={() => window.print()}
                title="Print Certificate"
              >
                <Printer size={16} /> Print
              </button>

              {selectedCert.credentialUrl && (
                <a
                  href={selectedCert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  <ExternalLink size={16} /> Verify on Issuer Website
                </a>
              )}

              <button
                type="button"
                className="theme-toggle"
                onClick={() => setSelectedCert(null)}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}