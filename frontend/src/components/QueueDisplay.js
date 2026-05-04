import React, { useState, useEffect } from 'react';
import { getLiveQueue, getQueueStats } from '../services/api';
import '../styles/QueueDisplay.css';

const QueueDisplay = () => {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch live queue and stats
  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const [queueRes, statsRes] = await Promise.all([getLiveQueue(), getQueueStats()]);

      if (queueRes.data.success) {
        setQueue(queueRes.data.queue);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch queue data');
      console.error('Error fetching queue:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh queue every 3 seconds
  useEffect(() => {
    fetchQueueData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchQueueData, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getPriorityLabel = (priority) => {
    const labels = {
      1: 'Critical',
      2: 'High',
      3: 'Mild',
    };
    return labels[priority] || 'Unknown';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: '#dc3545',
      2: '#ffc107',
      3: '#28a745',
    };
    return colors[priority] || '#666';
  };

  const formatTime = (minutes) => {
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading && queue.length === 0) {
    return (
      <div className="queue-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="queue-container">
      <div className="queue-header">
        <h1>Live Queue Dashboard</h1>
        <div className="queue-controls">
          <button
            className="refresh-btn"
            onClick={fetchQueueData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-Refresh
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Queue Statistics */}
      {stats && (
        <div className="stats-panel">
          <div className="stat-card">
            <div className="stat-label">Total Waiting</div>
            <div className="stat-value">{stats.totalWaiting}</div>
          </div>
          <div className="stat-card priority-1">
            <div className="stat-label">Critical (P1)</div>
            <div className="stat-value">{stats.priority1}</div>
          </div>
          <div className="stat-card priority-2">
            <div className="stat-label">High (P2)</div>
            <div className="stat-value">{stats.priority2}</div>
          </div>
          <div className="stat-card priority-3">
            <div className="stat-label">Mild (P3)</div>
            <div className="stat-value">{stats.priority3}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Wait Time</div>
            <div className="stat-value">{formatTime(stats.averageWaitTime)}</div>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="queue-content">
        <h2>Current Queue</h2>

        {queue.length === 0 ? (
          <div className="empty-queue">
            <p>✨ No patients waiting. Queue is empty!</p>
          </div>
        ) : (
          <div className="queue-list">
            {queue.map((patient) => (
              <div key={patient.patientId} className="queue-item">
                <div className="queue-position">
                  <span className="position-number">{patient.position}</span>
                </div>

                <div className="patient-info">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-details">
                    <span className="detail">Age: {patient.age}</span>
                    <span className="detail">Contact: {patient.contact}</span>
                  </div>
                  <div className="symptoms">{patient.symptoms}</div>
                </div>

                <div className="priority-badge" style={{ backgroundColor: getPriorityColor(patient.priority) }}>
                  <div className="priority-value">P{patient.priority}</div>
                  <div className="priority-label">{getPriorityLabel(patient.priority)}</div>
                </div>

                <div className="waiting-info">
                  <div className="waiting-label">Waiting</div>
                  <div className="waiting-time">{formatTime(patient.waitingTime)}</div>
                </div>

                <div className="patient-id">ID: {patient.patientId.slice(-6)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      <div className="last-updated">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default QueueDisplay;
