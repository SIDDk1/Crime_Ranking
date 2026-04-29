import React, { useEffect, useMemo, useState } from 'react';
import DashboardMap from './components/DashboardMap';
import VideoFeed from './components/VideoFeed';
import AlertPopup from './components/AlertPopup';
import CrimeReport from './components/CrimeReport';
import BuildingBackground from './components/BuildingBackground';
import AIHelpDesk from './components/AIHelpDesk';
import ReportExportModal from './components/ReportExportModal';
import LandingPage from './components/LandingPage';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BrainCircuit,
  Camera,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Map,
  MoonStar,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users
} from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'crime_console_auth_token';
const THEME_KEY = 'crime_console_theme';

const navigation = [
  { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'crimes', label: 'Crimes', icon: AlertTriangle },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'profile', label: 'Profile', icon: UserCircle2 }
];

const riskOrder = { Worst: 3, Good: 2, Best: 1 };

const getDangerTone = (rank) => {
  switch (rank) {
    case 'Worst':
      return 'critical';
    case 'Good':
      return 'elevated';
    case 'Best':
      return 'stable';
    default:
      return 'neutral';
  }
};

const formatTimestamp = (value) => {
  if (!value) return 'Now';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const buildSyntheticAnalytics = (areas, liveAlerts) => {
  const totalAreas = areas.length || 1;
  const worstAreas = areas.filter((area) => area.danger_rank === 'Worst').length;
  const goodAreas = areas.filter((area) => area.danger_rank === 'Good').length;
  const bestAreas = areas.filter((area) => area.danger_rank === 'Best').length;

  return [
    {
      label: 'High Risk Zones',
      value: worstAreas,
      percent: Math.min(100, Math.round((worstAreas / totalAreas) * 100)),
      tone: 'critical'
    },
    {
      label: 'Medium Risk Zones',
      value: goodAreas,
      percent: Math.min(100, Math.round((goodAreas / totalAreas) * 100)),
      tone: 'elevated'
    },
    {
      label: 'Secure Zones',
      value: bestAreas,
      percent: Math.min(100, Math.round((bestAreas / totalAreas) * 100)),
      tone: 'stable'
    },
    {
      label: 'Live Alerts (Session)',
      value: liveAlerts.length,
      percent: Math.min(100, liveAlerts.length * 12),
      tone: liveAlerts.length > 0 ? 'critical' : 'stable'
    }
  ];
};

const DispatchButton = ({ item, isDispatched, onDispatch }) => {
  const [dispatchStatus, setDispatchStatus] = useState('idle');

  const currentStatus = isDispatched ? 'sent' : dispatchStatus;

  const handleDispatch = (e) => {
    e.stopPropagation();
    if (isDispatched) return;
    setDispatchStatus('sending');
    
    let crimeType = "Suspicious Activity";
    if (item.crime_type.toLowerCase().includes("thief") || item.crime_type.toLowerCase().includes("robbery") || item.crime_type.toLowerCase().includes("theft")) crimeType = "Robbery/Theft";
    else if (item.crime_type.toLowerCase().includes("murder")) crimeType = "Murder";
    else if (item.crime_type.toLowerCase().includes("fighting") || item.crime_type.toLowerCase().includes("fight")) crimeType = "Fighting/Assault";
    else if (item.crime_type.toLowerCase().includes("vandalism")) crimeType = "Vandalism";

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/api/dispatch-police`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        camera: item.frame_path ? parseInt(item.frame_path.replace(/[^\d]/g, '') || 1, 10) : 1,
        time: new Date(item.timestamp).toLocaleTimeString(),
        crime_type: crimeType,
        raw_message: item.crime_type
      })
    })
    .then(res => res.json())
    .then(() => { setDispatchStatus('sent'); if (onDispatch) onDispatch(item.id); })
    .catch(() => { setDispatchStatus('sent'); if (onDispatch) onDispatch(item.id); });
  };

  return (
    <button 
      onClick={handleDispatch}
      disabled={currentStatus !== 'idle'}
      style={{
        marginLeft: 'auto',
        display: 'flex', alignItems: 'center', gap: '6px', 
        backgroundColor: currentStatus === 'sent' ? '#2e7d32' : '#d32f2f',
        color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px',
        cursor: currentStatus === 'idle' ? 'pointer' : 'default',
        fontWeight: 'bold', fontSize: '0.8rem'
      }}
    >
      <Send size={12} />
      {currentStatus === 'idle' ? 'Dispatch' : currentStatus === 'sending' ? 'Sending...' : 'Sent'}
    </button>
  );
};

function App() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(THEME_KEY) || 'stealth');
  const [areas, setAreas] = useState([]);
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dispatchedAlertIds, setDispatchedAlertIds] = useState({});
  const [currentAlert, setCurrentAlert] = useState(null);
  const [activeCamera, setActiveCamera] = useState(1);
  const [activeSection, setActiveSection] = useState('overview');
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(!localStorage.getItem(TOKEN_KEY));
  const [authMode, setAuthMode] = useState('register');
  const [authForm, setAuthForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const authHeaders = useMemo(() => (
    authToken ? { Authorization: `Bearer ${authToken}` } : {}
  ), [authToken]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    if (!authToken) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    const restoreSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: authHeaders
        });
        if (!response.ok) {
          throw new Error('Session expired');
        }
        const data = await response.json();
        if (!cancelled) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setAuthToken('');
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [authHeaders, authToken]);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        const [areasRes, reportRes, usersRes, historyRes] = await Promise.all([
          fetch(`${API_URL}/api/areas`),
          fetch(`${API_URL}/api/generate-report`),
          fetch(`${API_URL}/api/users`, { headers: authHeaders }),
          fetch(`${API_URL}/api/alert-history`, { headers: authHeaders })
        ]);

        const [areasData, reportData, usersData, historyData] = await Promise.all([
          areasRes.json(),
          reportRes.json(),
          usersRes.json(),
          historyRes.json()
        ]);

        if (isMounted) {
          setAreas(Array.isArray(areasData) ? areasData : []);
          setReport(reportData);
          setUsers(Array.isArray(usersData) ? usersData : []);
          setAlertHistory(Array.isArray(historyData) ? historyData : []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();

    const eventSource = new EventSource(`${API_URL}/api/alerts`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.alert) {
        triggerAlert(data.message, data.camera);
      }
    };

    return () => {
      isMounted = false;
      eventSource.close();
    };
  }, [authHeaders, currentUser]);

  const triggerAlert = (message, cameraStr = 1) => {
    const alert = {
      id: Date.now(),
      msg: message,
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      camera: parseInt(cameraStr, 10)
    };

    setCurrentAlert(alert);
    setAlerts((previous) => [alert, ...previous]);

    window.setTimeout(() => {
      setCurrentAlert(null);
    }, 5000);
  };

  const handleAuthChange = (field, value) => {
    setAuthForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAuthenticate = async (event) => {
    event.preventDefault();
    setAuthError('');

    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthSubmitting(true);

    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = authMode === 'register'
      ? {
          full_name: authForm.fullName,
          email: authForm.email,
          password: authForm.password,
          role: 'Administrator'
        }
      : {
          email: authForm.email,
          password: authForm.password
        };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      setAuthForm({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken('');
    setCurrentUser(null);
    setUsers([]);
    setAlertHistory([]);
    setAlerts([]);
    setReport(null);
    setActiveSection('overview');
  };

  const toggleTheme = () => {
    setThemeMode((previous) => (previous === 'stealth' ? 'stealth-alt' : 'stealth'));
  };

  const sortedAreas = useMemo(() => (
    [...areas].sort((left, right) => (riskOrder[right.danger_rank] || 0) - (riskOrder[left.danger_rank] || 0))
  ), [areas]);

  const liveAlertFeed = useMemo(() => {
    const sessionAlerts = alerts.map((alert) => ({
      id: `live-${alert.id}`,
      crime_type: alert.msg,
      timestamp: alert.timestamp,
      frame_path: `CAM 0${alert.camera}`,
      isLive: true
    }));
    return [...sessionAlerts, ...alertHistory].slice(0, 12);
  }, [alertHistory, alerts]);

  const criticalAreas = sortedAreas.filter((area) => area.danger_rank === 'Worst');
  const analyticsSeries = buildSyntheticAnalytics(areas, alerts);
  const topArea = sortedAreas[0];
  const totalAlerts = (report?.total_alerts || 0) + alerts.length;

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <BuildingBackground />
        <div className="auth-loading-card">
          <ShieldCheck size={28} />
          <p>Restoring secure session...</p>
        </div>
      </div>
    );
  }

  if (showLanding && !currentUser) {
    return <LandingPage onNavigateToAuth={() => setShowLanding(false)} />;
  }

  if (!currentUser) {
    return (
      <div className="auth-page">
        <BuildingBackground />
        <div className="auth-shell">
          <section className="auth-intro">
            <div className="eyebrow">
              <ShieldCheck size={16} />
              Secure Crime Operations Suite
            </div>
            <h1>A professional command center for surveillance, alerts, and crime intelligence.</h1>
            <p>
              Register an administrator account first, then sign in to access the map, analytics,
              cameras, alerts, crimes, users, and profile sections.
            </p>

            <div className="auth-highlights">
              <div className="highlight-card">
                <span>Live Intelligence</span>
                <strong>Risk map, anomaly feeds, and alert escalation</strong>
              </div>
              <div className="highlight-card">
                <span>Admin Control</span>
                <strong>User access, reports, and operations visibility</strong>
              </div>
              <div className="highlight-card">
                <span>Sectioned Layout</span>
                <strong>Dedicated workspace for each security function</strong>
              </div>
            </div>
          </section>

          <section className="auth-card">
            <div className="auth-card-top">
              <div className="auth-tabs">
                <button
                  type="button"
                  className={authMode === 'register' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError('');
                  }}
                >
                  Register
                </button>
                <button
                  type="button"
                  className={authMode === 'login' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                >
                  Sign In
                </button>
              </div>
              <button type="button" className="theme-toggle" onClick={toggleTheme} aria-pressed={themeMode !== 'stealth'}>
                <MoonStar size={16} />
                Dark Mode
              </button>
            </div>

            <div className="auth-card-header">
              <h2>{authMode === 'register' ? 'Create Admin Account' : 'Sign In to Dashboard'}</h2>
              <p>{authMode === 'register' ? 'Set up the primary operator account for this security console.' : 'Authenticate to continue into the operations center.'}</p>
            </div>

            <form className="auth-form" onSubmit={handleAuthenticate}>
              {authMode === 'register' && (
                <label>
                  <span>Full Name</span>
                  <input
                    type="text"
                    value={authForm.fullName}
                    onChange={(event) => handleAuthChange('fullName', event.target.value)}
                    placeholder="Operations Administrator"
                    required
                  />
                </label>
              )}

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => handleAuthChange('email', event.target.value)}
                  placeholder="admin@command.local"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => handleAuthChange('password', event.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
              </label>

              {authMode === 'register' && (
                <label>
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(event) => handleAuthChange('confirmPassword', event.target.value)}
                    placeholder="Repeat your password"
                    required
                  />
                </label>
              )}

              {authError ? <div className="auth-error">{authError}</div> : null}

              <button type="submit" className="auth-submit" disabled={authSubmitting}>
                {authSubmitting ? 'Securing Access...' : authMode === 'register' ? 'Register and Enter' : 'Sign In'}
              </button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="console-page">
      <BuildingBackground />

      {currentAlert && (
        <AlertPopup
          alert={currentAlert}
          onClose={() => setCurrentAlert(null)}
          onClick={() => {
            setActiveCamera(currentAlert.camera || 1);
            setActiveSection('cameras');
            setCurrentAlert(null);
          }}
        />
      )}
      {isHelpDeskOpen && <AIHelpDesk onClose={() => setIsHelpDeskOpen(false)} />}
      {isReportModalOpen && <ReportExportModal onClose={() => setIsReportModalOpen(false)} />}

      <div className="console-shell">
        <aside className="console-sidebar">
          <div className="brand-block">
            <div className="brand-badge">
              <Shield size={24} />
            </div>
            <div>
              <p className="brand-kicker">Crime detection and survillance</p>
              <h2>Security Admin Console</h2>
            </div>
          </div>

          <nav className="section-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.id === 'alerts' && totalAlerts > 0 ? <em>{totalAlerts}</em> : null}
                </button>
              );
            })}
          </nav>

        </aside>

        <main className="console-main">
          <header className="console-topbar">
            <div>
              <div className="status-pill">
                <span className="status-dot"></span>
                Live surveillance active
              </div>
              <h1>{navigation.find((item) => item.id === activeSection)?.label || 'Admin Dashboard'}</h1>
            </div>

            <div className="topbar-actions">
              <button type="button" className="theme-toggle" onClick={() => setIsHelpDeskOpen(true)}>
                <BrainCircuit size={16} />
                AI Help Desk
              </button>
              <button type="button" className="theme-toggle" onClick={() => setIsReportModalOpen(true)}>
                <FileBarChart size={16} />
                Export Reports
              </button>
              <button type="button" className="theme-toggle" onClick={toggleTheme} aria-pressed={themeMode !== 'stealth'}>
                <MoonStar size={16} />
                Dark Mode
              </button>
              <div className="operator-card">
                <span className="operator-avatar">
                  {currentUser.full_name?.slice(0, 1)?.toUpperCase() || 'A'}
                </span>
                <div>
                  <strong>{currentUser.full_name}</strong>
                  <span>{currentUser.role}</span>
                </div>
              </div>
              <button type="button" className="logout-button" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </header>

          <section className="hero-banner">
            <div>
              <p className="hero-kicker">Command View</p>
              <h3>Separate workspaces for every operational function</h3>
              <p className="hero-copy">
                Monitor city risk, respond to live anomalies, review user access, and manage
                crime intelligence from one professional admin surface.
              </p>
            </div>
            <div className="hero-stats">
              <div>
                <span>Total Areas</span>
                <strong>{areas.length || '--'}</strong>
              </div>
              <div>
                <span>Critical Zones</span>
                <strong>{criticalAreas.length}</strong>
              </div>
              <div>
                <span>Registered Users</span>
                <strong>{users.length}</strong>
              </div>
            </div>
          </section>

          {activeSection === 'overview' && (
            <section className="content-grid">
              <div className="panel stat-panel-grid">
                {[
                  { label: 'Total Alerts', value: totalAlerts, tone: 'critical' },
                  { label: 'Active Cameras', value: 4, tone: 'stable' },
                  { label: 'Top Risk Area', value: topArea?.name || 'No data', tone: 'elevated' },
                  { label: 'System Users', value: users.length, tone: 'neutral' }
                ].map((card) => (
                  <article key={card.label} className={`stat-tile ${card.tone}`}>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                  </article>
                ))}
              </div>

              <div className="panel split-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Operations Summary</p>
                    <h3>Admin dashboard overview</h3>
                  </div>
                  <Sparkles size={18} />
                </div>
                <div className="summary-layout">
                  <div className="summary-card">
                    <h4>Priority Watchlist</h4>
                    {criticalAreas.length === 0 ? (
                      <p className="empty-copy">No locations are currently ranked as worst.</p>
                    ) : (
                      criticalAreas.slice(0, 4).map((area) => (
                        <div key={area.id} className="list-row">
                          <div>
                            <strong>{area.name}</strong>
                            <span>{area.past_crimes || 0} prior incidents</span>
                          </div>
                          <span className="tag critical">{area.danger_rank}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="summary-card">
                    <h4>Recent Alert Queue</h4>
                    {liveAlertFeed.length === 0 ? (
                      <p className="empty-copy">Alert history will appear here once activity is detected.</p>
                    ) : (
                      liveAlertFeed.slice(0, 4).map((item) => (
                        <div key={item.id} className="list-row">
                          <div>
                            <strong>{item.crime_type}</strong>
                            <span>{formatTimestamp(item.timestamp)}</span>
                          </div>
                          <span className={`tag ${item.isLive ? 'critical' : 'neutral'}`}>
                            {item.frame_path || 'Recorded'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'map' && (
            <section className="single-section-layout">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Geospatial View</p>
                    <h3>Dedicated crime risk map</h3>
                  </div>
                  <span className="tag neutral">{areas.length} areas loaded</span>
                </div>
                <DashboardMap areas={areas} />
              </div>

              <div className="panel side-list-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Risk Breakdown</p>
                    <h3>Area ranking details</h3>
                  </div>
                </div>
                <div className="stack-list">
                  {sortedAreas.slice(0, 8).map((area) => (
                    <div key={area.id} className="list-row">
                      <div>
                        <strong>{area.name}</strong>
                        <span>Density {area.density || 'N/A'} | Past crimes {area.past_crimes || 0}</span>
                      </div>
                      <span className={`tag ${getDangerTone(area.danger_rank)}`}>{area.danger_rank}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'analytics' && (
            <section className="single-section-layout">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Performance View</p>
                    <h3>System analytics</h3>
                  </div>
                </div>
                <div className="analytics-grid">
                  {analyticsSeries.map((item) => (
                    <article key={item.label} className="metric-card">
                      <div className="metric-header">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className="metric-track">
                        <div className={`metric-fill ${item.tone}`} style={{ width: `${item.percent}%` }}></div>
                      </div>
                      <p>{item.percent}% of monitored capacity</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Decision Support</p>
                    <h3>Analyst notes</h3>
                  </div>
                </div>
                <div className="insight-stack">
                  <div className="insight-card">
                    <strong>Camera response focus</strong>
                    <p>Shift immediate operator attention toward cameras serving the highest ranked zones.</p>
                  </div>
                  <div className="insight-card">
                    <strong>Patrol recommendation</strong>
                    <p>Use high-risk locations from the map section to prioritize physical patrol scheduling.</p>
                  </div>
                  <div className="insight-card">
                    <strong>User administration</strong>
                    <p>Restrict access to export and alert review functions to trusted admin users only.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'cameras' && (
            <section className="single-column">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Surveillance</p>
                    <h3>Camera monitoring section</h3>
                  </div>
                  <span className="tag stable">CAM 0{activeCamera} selected</span>
                </div>
                <VideoFeed activeCamera={activeCamera} setActiveCamera={setActiveCamera} />
              </div>
            </section>
          )}

          {activeSection === 'alerts' && (
            <section className="single-column">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Incident Feed</p>
                    <h3>Alerts and escalation history</h3>
                  </div>
                </div>
                <div className="stack-list">
                  {liveAlertFeed.length === 0 ? (
                    <p className="empty-copy">No alert history available yet.</p>
                  ) : (
                    liveAlertFeed.map((item) => (
                      <div key={item.id} className="alert-history-row" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div className={`severity-bar ${item.isLive ? 'critical' : 'neutral'}`}></div>
                        <div className="alert-history-copy">
                          <strong>{item.crime_type}</strong>
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                        <span className={`tag ${item.isLive ? 'critical' : 'neutral'}`} style={{ marginLeft: '12px' }}>
                          {item.frame_path || 'System'}
                        </span>
                        <DispatchButton 
                          item={item} 
                          isDispatched={!!dispatchedAlertIds[item.id]}
                          onDispatch={(id) => setDispatchedAlertIds(prev => ({ ...prev, [id]: true }))}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'crimes' && (
            <section className="single-column">
              <CrimeReport />
            </section>
          )}

          {activeSection === 'users' && (
            <section className="single-column">
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Access Control</p>
                    <h3>User administration section</h3>
                  </div>
                  <span className="tag neutral">{users.length} accounts</span>
                </div>
                <div className="user-table">
                  <div className="user-table-head">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Created</span>
                  </div>
                  {users.length === 0 ? (
                    <p className="empty-copy">Registered users will appear here after account creation.</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="user-row">
                        <strong>{user.full_name}</strong>
                        <span>{user.email}</span>
                        <span>{user.role}</span>
                        <span>{formatTimestamp(user.created_at)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'profile' && (
            <section className="single-column">
              <div className="panel profile-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Identity</p>
                    <h3>Profile section</h3>
                  </div>
                </div>
                <div className="profile-grid">
                  <div className="profile-identity">
                    <div className="profile-avatar">
                      {currentUser.full_name?.slice(0, 1)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <h4>{currentUser.full_name}</h4>
                      <p>{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="profile-details">
                    <div className="detail-block">
                      <span>Role</span>
                      <strong>{currentUser.role}</strong>
                    </div>
                    <div className="detail-block">
                      <span>Member Since</span>
                      <strong>{formatTimestamp(currentUser.created_at)}</strong>
                    </div>
                    <div className="detail-block">
                      <span>Current Access</span>
                      <strong>Dashboard, alerts, reports, AI help desk</strong>
                    </div>
                    <div className="detail-block">
                      <span>Security Status</span>
                      <strong>Authenticated session active</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
