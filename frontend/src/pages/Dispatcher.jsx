import React, { useState } from 'react';
import { runPrediction } from '../services/api';

const Dispatcher = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const payload = {
        road_name: "MG Road",
        latitude: 12.9754,
        longitude: 77.6067,
        event_type: "unplanned",
        event_cause: "accident",
        priority: "High",
        status: "active",
        corridor: "Non-corridor",
        estimated_impact_scale: 5.0,
        requires_road_closure: true,
        start_time: "09:00",
        day_of_week: "Monday",
        planned_event_lead_time_hours: 0.0
      };
      const res = await runPrediction(payload);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Live Resource Dispatcher</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Predictive model dispatch generator.
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="panel">
          <div className="panel-header">Incident Configuration</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Demo incident configuration.</p>
          <button 
            className="btn btn-primary" 
            onClick={handlePredict}
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict with AI'}
          </button>
        </div>
        
        <div className="panel">
          <div className="panel-header">Dispatch Output</div>
          {result ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ensemble Surge Prediction</span>
                <div className="val-red" style={{ fontSize: '2rem', fontWeight: 800 }}>{result.prediction.ensemble}%</div>
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</span>
                <div style={{ fontWeight: 700 }}>{result.dispatch.status}</div>
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                <pre style={{ color: 'var(--success)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {JSON.stringify(result.dispatch.dispatch_plan, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Run a prediction to see the dispatch output.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dispatcher;
