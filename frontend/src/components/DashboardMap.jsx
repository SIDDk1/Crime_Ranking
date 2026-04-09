import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DashboardMap = ({ areas }) => {
  const center = [28.6139, 77.2090]; // New Delhi / Regional Center

  const getColor = (rank) => {
    switch (rank) {
      case 'Worst': return '#ef4444'; // Red
      case 'Good': return '#eab308';  // Yellow
      case 'Best': return '#22c55e';  // Green
      default: return '#3b82f6';
    }
  };

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {areas.map(area => (
          <CircleMarker
            key={area.id}
            center={[area.lat, area.lng]}
            radius={25}
            pathOptions={{ 
              fillColor: getColor(area.danger_rank),
              color: getColor(area.danger_rank),
              weight: 2,
              fillOpacity: 0.4
            }}
          >
            <Popup className="dark-popup">
              <div className="popup-content">
                <strong>{area.name}</strong><br/>
                Status: <span style={{color: getColor(area.danger_rank)}}>{area.danger_rank}</span><br/>
                {area.crime_keys ? (
                  <div style={{marginTop: '5px', fontSize: '0.9em', color: '#9ca3af'}}>
                    {area.crime_keys.map(key => (
                       <span key={key} style={{display: 'block'}}>{key}: <b>{area[key]}</b></span>
                    ))}
                  </div>
                ) : (
                  <>
                    Density: {area.density}<br/>
                    Prior Incidents: {area.past_crimes}
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
