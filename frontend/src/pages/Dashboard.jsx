import React, { useEffect, useState } from 'react';
import { fetchAnalyticsData } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <div>Loading Traffic Data...</div>
      </div>
    );
  }

  if (!data) return <div>Failed to load data.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          TrafficPulse Dashboard
          <span className="badge badge-live">LIVE</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Bengaluru Smart City Command Interface - Event-Driven Congestion Predictive Dispatch Engine
        </p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Monitored Incidents</div>
          <div className="kpi-value val-red">{data.summary.total_incidents.toLocaleString()}</div>
          <div className="kpi-hint">Filtered event logs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Hotspots</div>
          <div className="kpi-value val-yellow">{data.summary.hotspots_count}</div>
          <div className="kpi-hint">DBSCAN density zones</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Mean Surge Index</div>
          <div className="kpi-value val-red">{data.summary.average_surge}%</div>
          <div className="kpi-hint">Network gridlock avg</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">High Priority</div>
          <div className="kpi-value val-red">{data.summary.high_priority_pct}%</div>
          <div className="kpi-hint">Critical Events</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Top Congested Roads</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.top_roads.map((road, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 500 }}>{road.name}</span>
              <span style={{ color: road.surge > 65 ? 'var(--primary)' : 'var(--warning)', fontWeight: 700 }}>
                {road.surge}% Surge
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
