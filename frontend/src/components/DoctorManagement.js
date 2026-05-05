import React, { useState, useEffect } from 'react';
import { registerDoctor, getAllDoctors, updateDoctorStatus, getAllPatients, updatePatientStatus } from '../services/api';
import '../styles/DoctorManagement.css';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    specialization: 'General',
    contact: '',
    email: '',
    licenseNumber: '',
    maxCapacity: 10,
    department: 'General',
    startTime: '09:00',
    endTime: '18:00',
  });

  // Fetch doctors and patients on mount
  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    const interval = setInterval(() => {
      fetchDoctors();
      fetchPatients();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctors();
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await getAllPatients();
      if (response.data.success) {
        setPatients(response.data.data);
        console.log(`[UI] Fetched ${response.data.data.length} patients:`);
        response.data.data.forEach(p => {
          console.log(`  - ${p.name} (Status: ${p.status}, Assigned to: ${p.assignedDoctor?._id || p.assignedDoctor || 'None'})`);
        });
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'maxCapacity' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validation
      if (!formData.name || !formData.contact || !formData.licenseNumber) {
        setMessageType('error');
        setMessage('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!/^[0-9]{10}$/.test(formData.contact)) {
        setMessageType('error');
        setMessage('Contact must be a valid 10-digit phone number');
        setLoading(false);
        return;
      }

      const response = await registerDoctor(formData);

      if (response.data.success) {
        setMessageType('success');
        setMessage(`Doctor ${response.data.data.name} registered successfully!`);
        setFormData({
          name: '',
          specialization: 'General',
          contact: '',
          email: '',
          licenseNumber: '',
          maxCapacity: 10,
          department: 'General',
          startTime: '09:00',
          endTime: '18:00',
        });
        setShowForm(false);
        fetchDoctors();
      }
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Error registering doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (doctorId, newStatus) => {
    try {
      const response = await updateDoctorStatus(doctorId, newStatus);
      if (response.data.success) {
        fetchDoctors();
      }
    } catch (err) {
      setError('Error updating doctor status');
    }
  };

  const handlePatientStatusChange = async (patientId, newStatus) => {
    try {
      const response = await updatePatientStatus(patientId, newStatus);
      if (response.data.success) {
        setMessageType('success');
        setMessage(`Patient status updated to ${newStatus}`);
        fetchPatients();
        fetchDoctors(); // Refresh doctors to update load
      }
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Error updating patient status');
    }
  };

  const getAssignedPatients = (doctorId) => {
    if (!doctorId) return [];
    
    const assigned = patients.filter((p) => {
      try {
        // Handle null/undefined assignedDoctor
        if (!p.assignedDoctor) return false;
        
        // Convert doctorId to string
        let docId = '';
        if (typeof doctorId === 'string') {
          docId = doctorId;
        } else if (doctorId && typeof doctorId === 'object') {
          docId = doctorId._id ? doctorId._id.toString() : doctorId.toString();
        } else {
          docId = String(doctorId);
        }
        
        // Convert patientDoctorId to string
        let patientDoctorId = '';
        if (typeof p.assignedDoctor === 'string') {
          patientDoctorId = p.assignedDoctor;
        } else if (p.assignedDoctor && typeof p.assignedDoctor === 'object') {
          // If it's an object with _id property (from populate)
          patientDoctorId = p.assignedDoctor._id ? p.assignedDoctor._id.toString() : p.assignedDoctor.toString();
        } else {
          patientDoctorId = String(p.assignedDoctor);
        }
        
        const isMatch = (
          patientDoctorId === docId && 
          (p.status === 'assigned' || p.status === 'in-progress')
        );
        
        if (isMatch) {
          console.log(`[MATCH] ${p.name} → Doctor ${docId}`);
        }
        
        return isMatch;
      } catch (err) {
        console.error(`[ERROR] Error comparing IDs:`, err);
        return false;
      }
    });
    
    console.log(`[FILTER] Doctor ${doctorId}: Found ${assigned.length} assigned patients`);
    return assigned;
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#28a745',
      busy: '#ffc107',
      'on-break': '#ff9800',
      offline: '#dc3545',
    };
    return colors[status] || '#666';
  };

  const getLoadColor = (currentLoad, maxCapacity) => {
    const percentage = (currentLoad / maxCapacity) * 100;
    if (percentage >= 80) return '#dc3545';
    if (percentage >= 50) return '#ffc107';
    return '#28a745';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: '#dc3545', // Critical - Red
      2: '#ff9800', // High - Orange
      3: '#ffc107', // Moderate - Yellow
      4: '#28a745', // Mild - Green
    };
    return colors[priority] || '#666';
  };

  return (
    <div className="doctor-management-container">
      <div className="doctor-header">
        <h1>👨‍⚕️ Doctor Management</h1>
        <button
          className="add-doctor-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '➕ Add Doctor'}
        </button>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}
      {error && <div className="message error">{error}</div>}

      {showForm && (
        <div className="doctor-form-card">
          <h2>Register New Doctor</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div className="form-group">
                <label>Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                >
                  <option>General</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>Pediatrics</option>
                  <option>Dermatology</option>
                  <option>Psychiatry</option>
                  <option>ENT</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact (10 digits) *</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@hospital.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  placeholder="LIC-12345"
                  required
                />
              </div>

              <div className="form-group">
                <label>Max Capacity</label>
                <input
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Availability Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Availability End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register Doctor'}
            </button>
          </form>
        </div>
      )}

      <div className="doctors-grid">
        {doctors.length === 0 ? (
          <div className="empty-state">
            <p>No doctors registered yet. Add your first doctor!</p>
          </div>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor.doctorId} className="doctor-card">
              <div className="doctor-header-info">
                <h3>{doctor.name}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(doctor.status) }}
                >
                  {doctor.status.toUpperCase()}
                </span>
              </div>

              <div className="doctor-details">
                <p>
                  <strong>Specialization:</strong> {doctor.specialization}
                </p>
                <p>
                  <strong>Contact:</strong> {doctor.contact}
                </p>
                <p>
                  <strong>Department:</strong> {doctor.department}
                </p>
              </div>

              <div className="doctor-capacity">
                <div className="capacity-info">
                  <strong>Patient Load</strong>
                  <div className="load-bar">
                    <div
                      className="load-fill"
                      style={{
                        width: `${(doctor.currentLoad / doctor.maxCapacity) * 100}%`,
                        backgroundColor: getLoadColor(doctor.currentLoad, doctor.maxCapacity),
                      }}
                    ></div>
                  </div>
                  <span className="load-text">
                    {doctor.currentLoad} / {doctor.maxCapacity} ({doctor.availableSlots} available)
                  </span>
                </div>
              </div>

              <div className="availability-info">
                <p>
                  <strong>Hours:</strong> {doctor.availability.startTime} - {doctor.availability.endTime}
                </p>
                <p>
                  <strong>Available Days:</strong> {doctor.availability.daysAvailable.join(', ')}
                </p>
              </div>

              <div className="doctor-actions">
                <select
                  value={doctor.status}
                  onChange={(e) => handleStatusChange(doctor.doctorId, e.target.value)}
                  className="status-select"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="on-break">On Break</option>
                  <option value="offline">Offline</option>
                </select>
                <button
                  className="view-patients-btn"
                  onClick={() =>
                    setExpandedDoctorId(expandedDoctorId === doctor.doctorId ? null : doctor.doctorId)
                  }
                >
                  {expandedDoctorId === doctor.doctorId ? '✖ Hide Patients' : '👥 View Patients'}
                </button>
              </div>

              {/* Assigned Patients Section */}
              {expandedDoctorId === doctor.doctorId && (
                <div className="patients-section">
                  <h4>Assigned Patients ({getAssignedPatients(doctor.doctorId).length})</h4>
                  {getAssignedPatients(doctor.doctorId).length === 0 ? (
                    <p className="no-patients">No patients assigned</p>
                  ) : (
                    <div className="patients-list">
                      {getAssignedPatients(doctor.doctorId).map((patient) => (
                        <div key={patient._id} className="patient-item">
                          <div className="patient-info">
                            <div className="patient-name">
                              <span
                                className="priority-badge"
                                style={{
                                  backgroundColor: getPriorityColor(patient.priority),
                                }}
                              >
                                P{patient.priority}
                              </span>
                              <strong>{patient.name}</strong>
                            </div>
                            <div className="patient-details">
                              <span className="condition">{patient.condition}</span>
                              <span className="status-tag">{patient.status}</span>
                            </div>
                          </div>

                          <div className="patient-actions">
                            <select
                              value={patient.status}
                              onChange={(e) => handlePatientStatusChange(patient._id, e.target.value)}
                              className="patient-status-select"
                            >
                              <option value="assigned">Assigned</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">✓ Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorManagement;
