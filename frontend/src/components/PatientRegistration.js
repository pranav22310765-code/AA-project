import React, { useState } from 'react';
import { registerPatient } from '../services/api';
import '../styles/PatientRegistration.css';

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    contact: '',
    email: '',
    symptoms: '',
    condition: 'mild',
    medicalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate required fields
      if (!formData.name || !formData.age || !formData.contact || !formData.symptoms) {
        setMessageType('error');
        setMessage('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate contact (10 digits)
      if (!/^[0-9]{10}$/.test(formData.contact)) {
        setMessageType('error');
        setMessage('Contact must be a valid 10-digit phone number');
        setLoading(false);
        return;
      }

      // Validate age
      if (formData.age < 0 || formData.age > 150) {
        setMessageType('error');
        setMessage('Please enter a valid age');
        setLoading(false);
        return;
      }

      const response = await registerPatient(formData);

      if (response.data.success) {
        setMessageType('success');
        setMessage(
          `Patient registered successfully! Priority: ${response.data.data.priority}, Patient ID: ${response.data.data.patientId}`
        );

        // Reset form
        setFormData({
          name: '',
          age: '',
          contact: '',
          email: '',
          symptoms: '',
          condition: 'mild',
          medicalNotes: '',
        });
      }
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Error registering patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h1>Patient Registration</h1>
        <p className="subtitle">Join the queue and get assigned a priority level</p>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Age Field */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age (years) *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                min="0"
                max="150"
                required
              />
            </div>

            {/* Contact Field */}
            <div className="form-group">
              <label htmlFor="contact">Contact (10 digits) *</label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
            />
          </div>

          {/* Symptoms Field */}
          <div className="form-group">
            <label htmlFor="symptoms">Symptoms *</label>
            <textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="Describe your symptoms"
              rows="3"
              required
            ></textarea>
          </div>

          {/* Condition Field */}
          <div className="form-group">
            <label htmlFor="condition">Medical Condition *</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <small className="condition-info">
              Your condition will determine your priority in the queue
            </small>
          </div>

          {/* Medical Notes Field */}
          <div className="form-group">
            <label htmlFor="medicalNotes">Additional Medical Notes (Optional)</label>
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleInputChange}
              placeholder="Any additional notes or medical history"
              rows="2"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register & Join Queue'}
          </button>
        </form>

        {/* Priority Legend */}
        <div className="priority-legend">
          <h3>Priority Levels</h3>
          <div className="priority-item">
            <span className="priority-badge priority-1">1</span>
            <span>Critical (Highest)</span>
          </div>
          <div className="priority-item">
            <span className="priority-badge priority-2">2</span>
            <span>High/Moderate</span>
          </div>
          <div className="priority-item">
            <span className="priority-badge priority-3">3</span>
            <span>Mild (Lowest)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
