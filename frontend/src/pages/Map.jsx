import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAnalyticsData } from '../services/api';

const MapView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bengaluru coordinates
  const center = [12.9716, 77.5946];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchAnalyticsData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getSurgeColor = (surge) => {
    if (surge > 75) return 'var(--danger)'; // Red
    if (surge > 50) return 'var(--warning)'; // Yellow
    return 'var(--success)'; // Green
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1 className="page-title">Spatial Congestion Intelligence</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Live incident mapping and DBSCAN hotspot density zones.
        </p>
      </div>

      <div className="panel" style={{ flex: 1, padding: '1rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <div>Loading Map Data...</div>
          </div>
        ) : (
          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border)' }}>
            <MapContainer 
              center={center} 
              zoom={12} 
              style={{ height: '100%', width: '100%', background: '#F5EBE0' }}
            >
              {/* Retro/Vintage styled map tiles */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
              />

              {/* Render Hotspots (Large pulsing circles) */}
              {data?.hotspots?.map((hotspot) => (
                <CircleMarker
                  key={`hs-${hotspot.hotspot_id}`}
                  center={[hotspot.centroid_latitude, hotspot.centroid_longitude]}
                  radius={Math.max(20, hotspot.mean_surge_index / 2)}
                  pathOptions={{
                    fillColor: getSurgeColor(hotspot.mean_surge_index),
                    fillOpacity: 0.3,
                    color: getSurgeColor(hotspot.mean_surge_index),
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                    <div style={{ padding: '4px', fontFamily: 'Outfit' }}>
                      <strong style={{ fontSize: '1.1rem' }}>Anomaly Cluster #{hotspot.hotspot_id}</strong><br />
                      Mean Surge: <strong>{hotspot.mean_surge_index.toFixed(1)}%</strong><br />
                      Active Incidents: {hotspot.incident_count}
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}

              {/* Render Individual Incidents (Small solid dots) */}
              {data?.incidents?.map((incident) => (
                <CircleMarker
                  key={`inc-${incident.id}`}
                  center={[incident.latitude, incident.longitude]}
                  radius={5}
                  pathOptions={{
                    fillColor: getSurgeColor(incident.congestion_surge_index),
                    fillOpacity: 0.9,
                    color: '#fff',
                    weight: 1
                  }}
                >
                  <Tooltip direction="bottom" offset={[0, 10]} opacity={0.9}>
                    <div style={{ padding: '4px', fontFamily: 'Outfit' }}>
                      <strong>{incident.road_name}</strong><br />
                      Cause: {incident.event_cause.replace(/_/g, ' ')}<br />
                      Priority: {incident.priority}<br />
                      Surge: {incident.congestion_surge_index.toFixed(1)}%
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
