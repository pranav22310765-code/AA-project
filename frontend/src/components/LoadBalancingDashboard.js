import React, { useState, useEffect } from 'react';
import { getAssignmentStats, autoAssignPatient, bulkAssignPatients } from '../services/api';
import '../styles/LoadBalancing.css';

const LoadBalancingDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Auto-refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getAssignmentStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    setAssignmentLoading(true);
    try {
      const response = await autoAssignPatient();
      if (response.data.success) {
        setMessageType('success');
        setMessage(`✓ ${response.data.data.patientName} assigned to ${response.data.data.doctorName}`);
        fetchStats();
      }
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Error assigning patient');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    setAssignmentLoading(true);
    try {
      const response = await bulkAssignPatients(5);
      if (response.data.success) {
        setMessageType('success');
        setMessage(`✓ ${response.data.assignmentCount} patient(s) assigned successfully!`);
        fetchStats();
      }
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Error in bulk assignment');
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="load-balancing-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading assignment statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="load-balancing-container">
        <div className="error-message">Error loading statistics</div>
      </div>
    );
  }

  const { queue, doctorCapacity, doctorLoadDistribution } = stats;

  return (
    <div className="load-balancing-container">
      <div className="lb-header">
        <h1>📊 Load Balancing Dashboard</h1>
        <div className="lb-actions">
          <button
            className="assign-btn single"
            onClick={handleAutoAssign}
            disabled={assignmentLoading || queue.waiting === 0}
          >
            {assignmentLoading ? 'Assigning...' : '🔄 Assign Next Patient'}
          </button>
          <button
            className="assign-btn bulk"
            onClick={handleBulkAssign}
            disabled={assignmentLoading || queue.waiting === 0}
          >
            {assignmentLoading ? 'Assigning...' : '📋 Bulk Assign (5)'}
          </button>
        </div>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      {/* Queue Status */}
      <div className="stats-section">
        <h2>Queue Status</h2>
        <div className="queue-stats-grid">
          <div className="stat-box waiting">
            <div className="stat-icon">⏳</div>
            <div className="stat-label">Waiting</div>
            <div className="stat-value">{queue.waiting}</div>
          </div>
          <div className="stat-box assigned">
            <div className="stat-icon">👨‍⚕️</div>
            <div className="stat-label">Assigned</div>
            <div className="stat-value">{queue.assigned}</div>
          </div>
          <div className="stat-box in-progress">
            <div className="stat-icon">⏱️</div>
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{queue.inProgress}</div>
          </div>
          <div className="stat-box completed">
            <div className="stat-icon">✓</div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{queue.completed}</div>
          </div>
        </div>
      </div>

      {/* Doctor Capacity Overview */}
      <div className="stats-section">
        <h2>Overall Doctor Capacity</h2>
        <div className="capacity-overview">
          <div className="capacity-chart">
            <div className="capacity-bar">
              <div
                className="capacity-fill"
                style={{
                  width: `${(doctorCapacity.totalAssigned / doctorCapacity.totalCapacity) * 100}%`,
                }}
              ></div>
            </div>
            <div className="capacity-text">
              <strong>{doctorCapacity.totalAssigned} / {doctorCapacity.totalCapacity}</strong> slots occupied
            </div>
          </div>
          <div className="capacity-stats">
            <div className="capacity-item">
              <span>Utilization:</span>
              <strong>{doctorCapacity.utilizationPercentage}</strong>
            </div>
            <div className="capacity-item">
              <span>Available Slots:</span>
              <strong>{doctorCapacity.totalAvailableSlots}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Doctor Loads */}
      <div className="stats-section">
        <h2>Doctor Workload Distribution</h2>
        <div className="doctor-load-grid">
          {doctorLoadDistribution.map((doctor) => {
            const isLeastLoaded = doctor.currentLoad === Math.min(...doctorLoadDistribution.map((d) => d.currentLoad));

            return (
              <div
                key={doctor.doctorId}
                className={`doctor-load-card ${isLeastLoaded ? 'least-loaded' : ''}`}
              >
                <div className="doctor-load-header">
                  <h3>{doctor.doctorName}</h3>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor:
                        doctor.status === 'available'
                          ? '#28a745'
                          : doctor.status === 'busy'
                          ? '#ffc107'
                          : '#dc3545',
                    }}
                  >
                    {doctor.status.toUpperCase()}
                  </span>
                </div>

                <div className="load-visualization">
                  <div className="load-bar-container">
                    <div
                      className="load-bar-fill"
                      style={{
                        width: `${(doctor.currentLoad / doctor.maxCapacity) * 100}%`,
                        backgroundColor:
                          (doctor.currentLoad / doctor.maxCapacity) * 100 >= 80
                            ? '#dc3545'
                            : (doctor.currentLoad / doctor.maxCapacity) * 100 >= 50
                            ? '#ffc107'
                            : '#28a745',
                      }}
                    ></div>
                  </div>
                  <div className="load-info">
                    <span className="load-numbers">
                      {doctor.currentLoad} / {doctor.maxCapacity}
                    </span>
                    <span className="load-percentage">{doctor.utilization}</span>
                  </div>
                </div>

                {isLeastLoaded && (
                  <div className="badge-least-loaded">⭐ LEAST LOADED (Next assignment)</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="algorithm-info">
        <h3>Load Balancing Algorithm</h3>
        <div className="algorithm-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <strong>Find Waiting Patients</strong>
              <p>Get next patient from sorted queue (priority + arrival time)</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <strong>Find Least-Loaded Doctor</strong>
              <p>Sort doctors by currentLoad (ascending)</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <strong>Assign Patient</strong>
              <p>Assign patient to doctor with minimum load</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <strong>Update Records</strong>
              <p>Set status="assigned" and increment doctor's load</p>
            </div>
          </div>
        </div>
      </div>

      <div className="last-updated">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default LoadBalancingDashboard;
