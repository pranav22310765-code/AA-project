import React, { useState, useEffect } from 'react';
import { getLiveQueue, getQueueStats } from '../services/api';
import '../styles/LiveQueueDashboard.css';

const LiveQueueDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFullQueue, setShowFullQueue] = useState(false);

  // Fetch queue data
  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const [queueRes, statsRes] = await Promise.all([getLiveQueue(), getQueueStats()]);

      if (queueRes.data.success && queueRes.data.queue) {
        setQueue(queueRes.data.queue);
      } else {
        setQueue([]);
      }

      if (statsRes.data.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      } else {
        setStats({
          queue: {
            waiting: 0,
            assigned: 0,
            inProgress: 0,
            completed: 0,
          },
        });
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch queue data');
      console.error('Error fetching queue:', err);
      // Set default empty stats to prevent undefined errors
      setStats({
        queue: {
          waiting: 0,
          assigned: 0,
          inProgress: 0,
          completed: 0,
        },
      });
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 2 seconds
  useEffect(() => {
    fetchQueueData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchQueueData, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'EMERGENCY', 2: 'SERIOUS', 3: 'NORMAL' };
    return labels[priority] || 'UNKNOWN';
  };

  const getPriorityColor = (priority) => {
    const colors = { 1: '#dc3545', 2: '#ffc107', 3: '#28a745' };
    return colors[priority] || '#666';
  };

  const getPriorityBackgroundColor = (priority) => {
    const colors = {
      1: 'rgba(220, 53, 69, 0.1)',
      2: 'rgba(255, 193, 7, 0.1)',
      3: 'rgba(40, 167, 69, 0.1)',
    };
    return colors[priority] || '#f0f0f0';
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
      <div className="live-queue-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading live queue...</p>
        </div>
      </div>
    );
  }

  // Current patient (first in queue or in-progress)
  const currentPatient = queue.length > 0 ? queue[0] : null;

  // Next patients (positions 2-6)
  const nextPatients = queue.slice(1, 6);

  // Remaining patients
  const remainingPatients = queue.slice(6);

  return (
    <div className="live-queue-container">
      {/* Header */}
      <div className="lq-header">
        <h1> Live Queue Monitor</h1>
        <div className="lq-controls">
          <button
            className="refresh-btn"
            onClick={fetchQueueData}
            disabled={loading}
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh Now'}
          </button>
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-Refresh</span>
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Queue Empty State */}
      {queue.length === 0 ? (
        <div className="empty-queue-state">
          <div className="empty-icon">✨</div>
          <h2>Queue is Empty!</h2>
          <p>All patients have been served. Well done! 🎉</p>
        </div>
      ) : (
        <>
          {/* Current Patient - Large Card */}
          <div className="current-patient-section">
            <h2>Currently Serving</h2>
            {currentPatient && (
              <div
                className="current-patient-card"
                style={{
                  borderLeftColor: getPriorityColor(currentPatient.priority),
                  backgroundColor: getPriorityBackgroundColor(currentPatient.priority),
                }}
              >
                <div className="current-status">
                  <div className="pulse-dot"></div>
                  <span>QUEUE POSITION</span>
                </div>

                <div className="current-position-number">
                  {currentPatient.position}
                </div>

                <div className="patient-main-info">
                  <h3>{currentPatient.name}</h3>
                  <div className="patient-meta">
                    <span className="meta-item">
                      <strong>Age:</strong> {currentPatient.age} years
                    </span>
                    <span className="meta-item">
                      <strong>Contact:</strong> {currentPatient.contact}
                    </span>
                  </div>

                  <div className="patient-condition">
                    <div className="condition-header">
                      <strong>Condition:</strong>
                      <span className="condition-badge" style={{ color: getPriorityColor(currentPatient.priority) }}>
                        {currentPatient.condition.toUpperCase()}
                      </span>
                    </div>
                    <div className="symptoms-text">{currentPatient.symptoms}</div>
                  </div>
                </div>

                <div className="current-details-grid">
                  <div className="detail-box">
                    <div className="detail-label">Priority</div>
                    <div
                      className="priority-badge-large"
                      style={{ backgroundColor: getPriorityColor(currentPatient.priority) }}
                    >
                      P{currentPatient.priority}
                    </div>
                    <div className="priority-text">{getPriorityLabel(currentPatient.priority)}</div>
                  </div>

                  <div className="detail-box">
                    <div className="detail-label">Waiting Time</div>
                    <div className="waiting-time-large">{formatTime(currentPatient.waitingTime)}</div>
                  </div>

                  <div className="detail-box">
                    <div className="detail-label">Arrival Time</div>
                    <div className="arrival-time">
                      {new Date(currentPatient.arrivalTime).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Next Patients Preview */}
          <div className="next-patients-section">
            <h2>Next in Queue ({queue.length - 1} remaining)</h2>

            {nextPatients.length > 0 ? (
              <div className="next-patients-grid">
                {nextPatients.map((patient) => (
                  <div
                    key={patient.patientId}
                    className="next-patient-card"
                    style={{
                      borderTopColor: getPriorityColor(patient.priority),
                    }}
                  >
                    <div className="position-badge">#{patient.position}</div>

                    <h4>{patient.name}</h4>

                    <div className="quick-info">
                      <span className="info-badge" style={{ backgroundColor: getPriorityColor(patient.priority) }}>
                        {getPriorityLabel(patient.priority)}
                      </span>
                      <span className="wait-time">Waiting: {formatTime(patient.waitingTime)}</span>
                    </div>

                    <div className="card-meta">
                      <small>Age: {patient.age} | {patient.condition}</small>
                    </div>

                    <div className="symptoms-preview">{patient.symptoms.substring(0, 50)}...</div>
                  </div>
                ))}

                {remainingPatients.length > 0 && (
                  <div className="more-patients-card">
                    <div className="more-count">+{remainingPatients.length}</div>
                    <p>More patients in queue</p>
                    <button
                      className="view-all-btn"
                      onClick={() => setShowFullQueue(!showFullQueue)}
                    >
                      {showFullQueue ? 'Hide Full Queue' : 'View All'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-next-patients">
                <p>🎉 No more patients waiting. Great work!</p>
              </div>
            )}
          </div>

          {/* Full Queue List (Expandable) */}
          {showFullQueue && remainingPatients.length > 0 && (
            <div className="full-queue-section">
              <h2>Complete Queue List</h2>
              <div className="full-queue-list">
                {remainingPatients.map((patient) => (
                  <div key={patient.patientId} className="full-queue-item">
                    <div className="full-position">#{patient.position}</div>

                    <div className="full-patient-info">
                      <h5>{patient.name}</h5>
                      <div className="full-details">
                        <span>Age: {patient.age}</span>
                        <span>•</span>
                        <span>{patient.condition}</span>
                        <span>•</span>
                        <span>{patient.symptoms.substring(0, 40)}...</span>
                      </div>
                    </div>

                    <div className="full-priority">
                      <span
                        className="priority-tag"
                        style={{ backgroundColor: getPriorityColor(patient.priority) }}
                      >
                        P{patient.priority}
                      </span>
                    </div>

                    <div className="full-wait-time">
                      <strong>{formatTime(patient.waitingTime)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Queue Statistics Footer */}
          {stats?.queue && (
            <div className="queue-stats-footer">
              <div className="stat-item">
                <div className="stat-icon">⏳</div>
                <div className="stat-label">Waiting</div>
                <div className="stat-number">{stats.queue.waiting || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">👨‍⚕️</div>
                <div className="stat-label">Assigned</div>
                <div className="stat-number">{stats.queue.assigned || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">⏱️</div>
                <div className="stat-label">In Progress</div>
                <div className="stat-number">{stats.queue.inProgress || 0}</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">✓</div>
                <div className="stat-label">Completed</div>
                <div className="stat-number">{stats.queue.completed || 0}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Last Updated */}
      <div className="last-updated">
        Last updated: {new Date().toLocaleTimeString()} | Auto-refresh: {autoRefresh ? 'ON (2s)' : 'OFF'}
      </div>
    </div>
  );
};

export default LiveQueueDashboard;
