import React, { useState } from 'react';
import { Search, BrainCircuit, Info, MapPin } from 'lucide-react';

const AISearch = ({ areas }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    const normalizedQuery = query.trim().toLowerCase();
    
    // Find matching city
    const foundArea = areas.find(a => a.name && a.name.toLowerCase() === normalizedQuery);
    
    if (foundArea) {
      setResult(foundArea);
    } else {
      setResult(null);
    }
  };

  const availableCities = areas.map(a => a.name).filter(name => name && !name.toUpperCase().includes('TOTAL'));

  return (
    <section className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow-text">AI Intelligence</p>
          <h3>City Record</h3>
        </div>
        <BrainCircuit size={18} className="accent" />
      </div>

      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              list="city-options"
              placeholder="Search or select city name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px 10px 8px 30px', 
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
            <datalist id="city-options">
              {availableCities.sort().map((city, idx) => (
                <option key={idx} value={city} />
              ))}
            </datalist>
          </div>
          <button 
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
              color: '#08100d',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Search
          </button>
        </form>
      </div>

      <div style={{ flex: 1, borderTop: hasSearched ? '1px solid var(--line)' : 'none', paddingTop: hasSearched ? '16px' : '0' }}>
        {hasSearched && (
          result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} className="accent" />
                  {result.name}
                </h3>
                <span className={`tag ${result.danger_rank === 'Worst' ? 'critical' : result.danger_rank === 'Good' ? 'elevated' : 'stable'}`}>
                  {result.danger_rank} Risk
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Population Density</span>
                  <strong style={{ display: 'block', fontSize: '1rem', marginTop: '2px' }}>{result.density || 'N/A'}</strong>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical Incidents</span>
                  <strong style={{ display: 'block', fontSize: '1rem', marginTop: '2px' }}>{result.past_crimes || 'N/A'}</strong>
                </div>
              </div>

              {result.crime_keys && result.crime_keys.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Machine Learning Intelligence</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.crime_keys.map(key => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                        <strong style={{ fontSize: '0.85rem' }}>{result[key]}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
              <Info size={32} style={{ opacity: 0.5, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}><strong>No Information Found</strong></p>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                This city is not under surveillance or we do not have information about this city in our project's dataset.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default AISearch;
