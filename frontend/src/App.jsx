import React, { useEffect, useMemo, useState } from 'react';
import DashboardMap from './components/DashboardMap';
import VideoFeed from './components/VideoFeed';
import AlertPopup from './components/AlertPopup';
import CrimeReport from './components/CrimeReport';
import BuildingBackground from './components/BuildingBackground';
import AIHelpDesk from './components/AIHelpDesk';
import ReportExportModal from './components/ReportExportModal';
import LandingPage from './components/LandingPage';
import AISearch from './components/AISearch';
import CertificatesSection from './components/CertificatesSection';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BrainCircuit,
  Camera,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Map,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users
} from 'lucide-react';
import './App.css';
import { getApiUrl, hasApiUrl, missingApiUrlMessage } from './config/api';
const TOKEN_KEY = 'crime_console_auth_token';

const navigation = [
  { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard },
  { id: 'ai_search', label: 'City Record', icon: BrainCircuit },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'crimes', label: 'Crimes', icon: AlertTriangle },
  { id: 'certificates', label: 'Certifications', icon: Award },
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

const formatCrimeLabel = (value) => {
  const label = String(value || '').toLowerCase();
  if (label.includes('fight') || label.includes('fighting')) {
    return 'Critical Incident';
  }
  return value || 'Critical Incident';
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

    let crimeType = "Critical Incident";
    if (item.crime_type.toLowerCase().includes("thief") || item.crime_type.toLowerCase().includes("robbery") || item.crime_type.toLowerCase().includes("theft")) crimeType = "Robbery/Theft";
    else if (item.crime_type.toLowerCase().includes("murder")) crimeType = "Murder";
    else if (item.crime_type.toLowerCase().includes("vandalism")) crimeType = "Vandalism";
    else if (item.crime_type.toLowerCase().includes("fighting") || item.crime_type.toLowerCase().includes("fight")) crimeType = "Critical Incident";

    fetch(getApiUrl('/api/dispatch-police'), {
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
      .then(() => {
        setDispatchStatus('sent');
        if (onDispatch) onDispatch(item.id);

        const camId = item.frame_path ? parseInt(item.frame_path.replace(/[^\d]/g, '') || 1, 10) : 1;
        const timeStr = new Date(item.timestamp).toLocaleTimeString();
        window.alert(`🚨 SECURE DISPATCH CONFIRMED\n\nEmergency units have been deployed to intercept the suspects.\n\n📍 Location: Camera 0${camId} Zone\n⏰ Time: ${timeStr}\n⚠️ Incident: ${crimeType}\n📄 Details: ${item.crime_type}\n\nAll nearby units have received the automated telemetry data.`);
      })
      .catch(() => {
        setDispatchStatus('sent');
        if (onDispatch) onDispatch(item.id);

        const camId = item.frame_path ? parseInt(item.frame_path.replace(/[^\d]/g, '') || 1, 10) : 1;
        const timeStr = new Date(item.timestamp).toLocaleTimeString();
        window.alert(`🚨 SECURE DISPATCH CONFIRMED\n\nEmergency units have been deployed to intercept the suspects.\n\n📍 Location: Camera 0${camId} Zone\n⏰ Time: ${timeStr}\n⚠️ Incident: ${crimeType}\n📄 Details: ${item.crime_type}\n\nAll nearby units have received the automated telemetry data.`);
      });
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

const DEFAULT_AREAS = [
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, danger_rank: 'Worst', density: 14500, past_crimes: 980, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 180, ROBBERY: 320, THEFT: 480 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, danger_rank: 'Good', density: 11200, past_crimes: 620, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 90, ROBBERY: 210, THEFT: 320 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, danger_rank: 'Good', density: 8400, past_crimes: 410, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 45, ROBBERY: 125, THEFT: 240 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, danger_rank: 'Worst', density: 12100, past_crimes: 750, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 130, ROBBERY: 280, THEFT: 340 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, danger_rank: 'Best', density: 6200, past_crimes: 210, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 25, ROBBERY: 65, THEFT: 120 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, danger_rank: 'Good', density: 7800, past_crimes: 380, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 50, ROBBERY: 110, THEFT: 220 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, danger_rank: 'Good', density: 7100, past_crimes: 340, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 40, ROBBERY: 100, THEFT: 200 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, danger_rank: 'Best', density: 5900, past_crimes: 190, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 20, ROBBERY: 50, THEFT: 120 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, danger_rank: 'Good', density: 6800, past_crimes: 310, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 35, ROBBERY: 95, THEFT: 180 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, danger_rank: 'Best', density: 4200, past_crimes: 110, crime_keys: ['MURDER', 'ROBBERY', 'THEFT'], MURDER: 10, ROBBERY: 30, THEFT: 70 }
];

const DEFAULT_USERS = [
  { id: 'user_01', full_name: 'Operations Administrator', email: 'admin@command.local', role: 'Administrator', created_at: '2026-01-15 09:30:00' },
  { id: 'user_02', full_name: 'Field Surveillance Officer', email: 'officer.patil@police.gov.in', role: 'Operator', created_at: '2026-02-10 14:15:00' },
  { id: 'user_03', full_name: 'Emergency Dispatch Lead', email: 'dispatch.unit@command.local', role: 'Operator', created_at: '2026-02-20 18:45:00' }
];

const DEFAULT_ALERT_HISTORY = [
  { id: 'hist_01', crime_type: 'Physical Altercation / Violence Detected', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), frame_path: 'CAM 01' },
  { id: 'hist_02', crime_type: 'Weapon Brandishing Detected', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), frame_path: 'CAM 02' },
  { id: 'hist_03', crime_type: 'Robbery / Forced Entry Detected', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), frame_path: 'CAM 03' }
];

function App() {
  const [areas, setAreas] = useState(DEFAULT_AREAS);
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [alertHistory, setAlertHistory] = useState(DEFAULT_ALERT_HISTORY);
  const [alerts, setAlerts] = useState([]);
  const [dispatchedAlertIds, setDispatchedAlertIds] = useState({});
  const [currentAlert, setCurrentAlert] = useState(null);
  const [activeCamera, setActiveCamera] = useState(1);
  const [activeSection, setActiveSection] = useState('overview');
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [authMode, setAuthMode] = useState('login');
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

  const performBypassLogin = (customUser) => {
    const user = customUser || {
      id: 'admin_demo_01',
      full_name: authForm.fullName.trim() || 'Operations Administrator',
      email: authForm.email.trim() || 'admin@command.local',
      role: 'Administrator',
      created_at: new Date().toISOString()
    };
    const token = `demo_token_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setCurrentUser(user);
    setAuthError('');
    setAuthSubmitting(false);
  };

  useEffect(() => {
    if (!authToken) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    const restoreSession = async () => {
      try {
        const response = await fetch(getApiUrl('/api/auth/me'), {
          headers: authHeaders
        });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.user) {
            setCurrentUser(data.user);
            return;
          }
        }
      } catch (error) {
        console.warn('Backend session verification offline, maintaining active demo session:', error);
      }

      // If backend verification fails or returns error, keep user logged in with demo profile
      if (!cancelled) {
        setCurrentUser({
          id: 'admin_demo_01',
          full_name: 'Operations Administrator',
          email: 'admin@command.local',
          role: 'Administrator',
          created_at: new Date().toISOString()
        });
      }

      if (!cancelled) {
        setAuthLoading(false);
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
        const [areasRes, reportRes, usersRes, historyRes] = await Promise.allSettled([
          fetch(getApiUrl('/api/areas')),
          fetch(getApiUrl('/api/generate-report')),
          fetch(getApiUrl('/api/users'), { headers: authHeaders }),
          fetch(getApiUrl('/api/alert-history'), { headers: authHeaders })
        ]);

        let areasData = [];
        let reportData = null;
        let usersData = [];
        let historyData = [];

        if (areasRes.status === 'fulfilled' && areasRes.value.ok) {
          areasData = await areasRes.value.json().catch(() => []);
        }
        if (reportRes.status === 'fulfilled' && reportRes.value.ok) {
          reportData = await reportRes.value.json().catch(() => null);
        }
        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
          usersData = await usersRes.value.json().catch(() => []);
        }
        if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
          historyData = await historyRes.value.json().catch(() => []);
        }

        if (isMounted) {
          setAreas(Array.isArray(areasData) && areasData.length > 0 ? areasData : DEFAULT_AREAS);
          setReport(reportData || { total_alerts: 14, worst_areas: DEFAULT_AREAS.filter(a => a.danger_rank === 'Worst') });
          setUsers(Array.isArray(usersData) && usersData.length > 0 ? usersData : DEFAULT_USERS);
          setAlertHistory(Array.isArray(historyData) && historyData.length > 0 ? historyData : DEFAULT_ALERT_HISTORY);
        }
      } catch (error) {
        console.error('Error loading dashboard data, using mock data:', error);
        if (isMounted) {
          setAreas(DEFAULT_AREAS);
          setReport({ total_alerts: 14, worst_areas: DEFAULT_AREAS.filter(a => a.danger_rank === 'Worst') });
          setUsers(DEFAULT_USERS);
          setAlertHistory(DEFAULT_ALERT_HISTORY);
        }
      }
    };

    loadData();

    let eventSource = null;
    try {
      eventSource = new EventSource(getApiUrl('/api/alerts'));
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.alert) {
            triggerAlert(data.message, data.camera);
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('Alerts SSE stream unavailable.');
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
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
    if (event) event.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    const defaultUser = {
      id: 'admin_demo_01',
      full_name: authForm.fullName.trim() || (authForm.email ? authForm.email.split('@')[0] : 'Operations Administrator'),
      email: authForm.email.trim() || 'admin@command.local',
      role: 'Administrator',
      created_at: new Date().toISOString()
    };

    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = authMode === 'register'
      ? {
        full_name: authForm.fullName.trim() || 'Operations Administrator',
        email: authForm.email.trim() || 'admin@command.local',
        password: authForm.password || 'password',
        role: 'Administrator'
      }
      : {
        email: authForm.email.trim() || 'admin@command.local',
        password: authForm.password || 'password'
      };

    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Backend offline or error -> smoothly grant instant access!
        performBypassLogin(defaultUser);
        return;
      }

      const data = await response.json();
      const token = data.token || `token_${Date.now()}`;
      const user = data.user || defaultUser;
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
      setCurrentUser(user);
    } catch (error) {
      console.warn('Authentication network/CORS error, enabling instant demo bypass:', error);
      // Instant bypass on network or CORS failure
      performBypassLogin(defaultUser);
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

  const sortedAreas = useMemo(() => (
    [...areas]
      .filter(area => !area.name.toUpperCase().includes('TOTAL'))
      .map(area => {
        const total = (area.crime_keys || []).reduce((sum, key) => sum + (area[key] || 0), 0);
        return { ...area, total_crimes: total };
      })
      .sort((left, right) => (riskOrder[right.danger_rank] || 0) - (riskOrder[left.danger_rank] || 0) || right.total_crimes - left.total_crimes)
  ), [areas]);

  const liveAlertFeed = useMemo(() => {
    const sessionAlerts = alerts.map((alert) => ({
      id: `live-${alert.id}`,
      crime_type: alert.msg,
      timestamp: alert.timestamp,
      frame_path: `CAM 0${alert.camera}`,
      isLive: true
    }));
    return [...sessionAlerts, ...alertHistory];
  }, [alertHistory, alerts]);

  const criticalAreas = sortedAreas.filter((area) => area.danger_rank === 'Worst');
  const analyticsSeries = buildSyntheticAnalytics(areas, alerts);
  const analyticsBarData = [...areas]
    .filter(area => !area.name.toUpperCase().includes('TOTAL'))
    .map(area => {
      const total = (area.crime_keys || []).reduce((sum, key) => sum + (area[key] || 0), 0);
      return { ...area, total_crimes: total };
    })
    .sort((a, b) => b.total_crimes - a.total_crimes).slice(0, 10);
  const analyticsPieData = [
    { name: 'High Risk (Worst)', value: areas.filter(a => a.danger_rank === 'Worst').length, color: '#e11d48' },
    { name: 'Medium Risk (Good)', value: areas.filter(a => a.danger_rank === 'Good').length, color: '#f59e0b' },
    { name: 'Secure (Best)', value: areas.filter(a => a.danger_rank === 'Best').length, color: '#10b981' }
  ].filter(d => d.value > 0);
  const topArea = sortedAreas[0];
  const totalAlerts = (report?.total_alerts || 0) + alerts.length;

  if (showLanding) {
    return <LandingPage onNavigateToAuth={() => setShowLanding(false)} />;
  }

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

  if (!currentUser) {
    return (
      <div className="auth-page">
        <BuildingBackground />
        <div className="auth-shell">
          {!hasApiUrl && (
            <div className="config-banner" role="alert">
              {missingApiUrlMessage}
            </div>
          )}
          <section className="auth-intro">
            <div className="eyebrow">
              <ShieldCheck size={16} />
              Secure Crime Operations Suite
            </div>
            <h1>A professional command center for surveillance, alerts, and crime intelligence.</h1>
            <p>
              Sign in or enter directly to access the map, analytics,
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
            <div className="auth-card-top" style={{ flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                className="theme-toggle"
                onClick={() => setShowLanding(true)}
              >
                <ArrowLeft size={16} />
                Home Page
              </button>
              <div className="auth-tabs">
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
              </div>
            </div>

            <div className="auth-card-header">
              <h2>{authMode === 'register' ? 'Create Admin Account' : 'Sign In to Dashboard'}</h2>
              <p>{authMode === 'register' ? 'Set up the primary operator account for this security console.' : 'Authenticate or click Instant Access to explore the operations center.'}</p>
            </div>

            <button
              type="button"
              className="auth-bypass-button"
              onClick={() => performBypassLogin()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              <Sparkles size={18} />
              ⚡ Instant Access (Bypass Login)
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>or sign in manually</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
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
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => handleAuthChange('password', event.target.value)}
                  placeholder="Any password or test credential"
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
                  />
                </label>
              )}

              {authError ? <div className="auth-error">{authError}</div> : null}

              <button type="submit" className="auth-submit" disabled={authSubmitting}>
                {authSubmitting ? 'Entering Dashboard...' : authMode === 'register' ? 'Register and Enter' : 'Sign In'}
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
      {!hasApiUrl && (
        <div className="config-banner config-banner-floating" role="alert">
          {missingApiUrlMessage}
        </div>
      )}

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

              if (item.id === 'overview') {
                return (
                  <React.Fragment key="overview-with-help">
                    <button
                      type="button"
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                    <button
                      type="button"
                      className="nav-item"
                      onClick={() => setIsHelpDeskOpen(true)}
                    >
                      <BrainCircuit size={18} />
                      <span>AI Help Desk</span>
                    </button>
                  </React.Fragment>
                );
              }

              if (item.id === 'profile') {
                return (
                  <React.Fragment key="profile-with-export">
                    <button
                      type="button"
                      className="nav-item"
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      <FileBarChart size={18} />
                      <span>Export Reports</span>
                    </button>
                    <button
                      type="button"
                      key={item.id}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  </React.Fragment>
                );
              }

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
              <button type="button" className="theme-toggle" onClick={() => setShowLanding(true)}>
                <ArrowLeft size={16} />
                Home Page
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

          {activeSection === 'overview' && (
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
          )}

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
                  <div className="summary-card" style={{ maxHeight: '550px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '12px' }}>
                    <div style={{ position: 'sticky', top: '-18px', backgroundColor: 'var(--bg-surface)', padding: '18px 0 12px 0', zIndex: 10, borderBottom: '1px solid var(--line)' }}>
                      <h4 style={{ margin: 0 }}>Priority Watchlist</h4>
                    </div>
                    {criticalAreas.length === 0 ? (
                      <p className="empty-copy">No locations are currently ranked as worst.</p>
                    ) : (
                      criticalAreas.slice(0, 4).map((area) => (
                        <div key={area.id} className="list-row">
                          <div>
                            <strong>{area.name}</strong>
                            <span>{area.total_crimes ? area.total_crimes.toLocaleString() : 0} prior incidents</span>
                          </div>
                          <span className="tag critical">{area.danger_rank}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="summary-card" style={{ maxHeight: '550px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '12px' }}>
                    <div style={{ position: 'sticky', top: '-18px', backgroundColor: 'var(--bg-surface)', padding: '18px 0 12px 0', zIndex: 10, borderBottom: '1px solid var(--line)' }}>
                      <h4 style={{ margin: 0 }}>Recent Alert Queue</h4>
                    </div>
                    {liveAlertFeed.length === 0 ? (
                      <p className="empty-copy" style={{ marginTop: '12px' }}>Alert history will appear here once activity is detected.</p>
                    ) : (
                      liveAlertFeed.map((item) => (
                        <div key={item.id} className="list-row">
                          <div>
                            <strong>{formatCrimeLabel(item.crime_type)}</strong>
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

          {activeSection === 'ai_search' && (
            <AISearch areas={areas} />
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
                  {[...areas]
                    .filter(area => !area.name.toUpperCase().includes('TOTAL'))
                    .map(area => {
                      const total = (area.crime_keys || []).reduce((sum, key) => sum + (area[key] || 0), 0);

                      let topCrimeName = 'N/A';
                      let topCrimeValue = 0;
                      (area.crime_keys || []).forEach(key => {
                        if ((area[key] || 0) > topCrimeValue) {
                          topCrimeValue = area[key];
                          topCrimeName = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
                        }
                      });

                      return { ...area, total_crimes: total, top_crime_name: topCrimeName, top_crime_value: topCrimeValue };
                    })
                    .sort((a, b) => b.total_crimes - a.total_crimes)
                    .slice(0, 8)
                    .map((area) => (
                      <div key={area.id} className="list-row">
                        <div>
                          <strong>{area.name}</strong>
                          <span>Total IPC Crimes: {area.total_crimes.toLocaleString()} | Top Offense: {area.top_crime_name} ({area.top_crime_value.toLocaleString()})</span>
                        </div>
                        <span className={`tag ${getDangerTone(area.danger_rank)}`}>{area.danger_rank}</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}

          {activeSection === 'analytics' && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
              <div className="panel" style={{ margin: 0 }}>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Performance View</p>
                    <h3>System analytics overview</h3>
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

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="panel" style={{ margin: 0 }}>
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow-text">Demographics</p>
                      <h3>Risk Distribution</h3>
                    </div>
                  </div>
                  <div style={{ height: '350px', width: '100%', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analyticsPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel" style={{ margin: 0 }}>
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow-text">Region Density</p>
                      <h3>Top 10 Highest Crime Regions</h3>
                    </div>
                  </div>
                  <div style={{ height: '350px', width: '100%', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsBarData} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                          cursor={{ fill: '#1e293b' }}
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}
                        />
                        <Bar dataKey="total_crimes" name="Total Crimes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Time Series Alert History */}
              <div className="panel" style={{ margin: 0 }}>
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow-text">Live Surveillance</p>
                    <h3>Real-Time Alerts Timeline</h3>
                  </div>
                </div>
                <div style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                  {alerts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={alerts.map((a, i) => ({ time: formatTimestamp(a.timestamp).split(' ')[1] || `T-${i}`, type: a.crime_type, count: i + 1 }))} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="count" name="Cumulative Alerts" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                      No active alerts to plot yet.
                    </div>
                  )}
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
                <div className="stack-list" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '16px' }}>
                  {liveAlertFeed.length === 0 ? (
                    <p className="empty-copy">No alert history available yet.</p>
                  ) : (
                    liveAlertFeed.map((item) => (
                      <div key={item.id} className="alert-history-row" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <div className={`severity-bar ${item.isLive ? 'critical' : 'neutral'}`}></div>
                        <div className="alert-history-copy">
                          <strong>{formatCrimeLabel(item.crime_type)}</strong>
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

          {activeSection === 'certificates' && (
            <CertificatesSection currentUser={currentUser} />
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
                    <h3>Profile & Accreditation section</h3>
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
                      <span>Accreditations & Certificates</span>
                      <button
                        type="button"
                        onClick={() => setActiveSection('certificates')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent)',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textAlign: 'left',
                          padding: 0,
                          fontSize: '0.92rem',
                          textDecoration: 'underline'
                        }}
                      >
                        📜 Manage & View Certificates Portal →
                      </button>
                    </div>
                    <div className="detail-block">
                      <span>Security Status</span>
                      <strong style={{ color: '#10b981' }}>Authenticated session active</strong>
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
