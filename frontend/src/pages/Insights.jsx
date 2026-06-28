import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend 
} from 'recharts';
import { fetchAnalyticsData } from '../services/api';

const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchAnalyticsData();
        setData(res.insights);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <div>Generating Deep Insights...</div>
      </div>
    );
  }

  if (!data) return <div>Failed to load insights.</div>;

  // Format data for display
  const resolutionData = data.resolution_by_cause.map(item => ({
    ...item,
    cause: item.cause.replace(/_/g, ' ')
  }));

  const riskData = data.top_risk_roads.slice(0, 10).map(item => ({
    ...item,
    risk: (item.risk_score * 100).toFixed(1)
  }));

  const corridorData = data.corridor_vulnerability_surge.map(item => ({
    ...item,
    corridor: item.corridor.replace(/_/g, ' ')
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Traffic Insights & Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Post-Event Learning, Incident Resolution Times, and Network Vulnerability Deep Dives.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Risk Scores Chart */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">Top 10 Highest Risk Roads</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" />
                <YAxis dataKey="road_name" type="category" width={100} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <RechartsTooltip cursor={{ fill: 'var(--surface-hover)' }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="risk" fill="var(--danger)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Time Chart */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">Mean Resolution Time by Cause (Minutes)</div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionData} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="cause" stroke="var(--text-muted)" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" />
                <RechartsTooltip cursor={{ fill: 'var(--surface-hover)' }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="mean" name="Mean Time" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Corridor Vulnerability Area Chart */}
        <div className="panel">
          <div className="panel-header">Corridor Surge vs Tier</div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={corridorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSurge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="corridor" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--text-muted)" />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="mean_surge" name="Mean Surge Index" stroke="var(--primary)" fillOpacity={1} fill="url(#colorSurge)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Planned vs Unplanned comparison */}
        <div className="panel">
          <div className="panel-header">Planned vs Unplanned Events</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {data.planned_vs_unplanned.map((item, idx) => (
              <div key={idx} style={{ 
                padding: '1.5rem', 
                background: 'var(--bg-color)', 
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ textTransform: 'capitalize', color: 'var(--primary)', marginBottom: '4px' }}>{item.event_type}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.incidents} Incidents Logged</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{item.mean_surge.toFixed(1)}% Surge</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.mean_resolution.toFixed(0)}m Avg Resolution</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Insights;
