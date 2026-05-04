import React, { useState } from 'react';
import PatientRegistration from './components/PatientRegistration';
import LiveQueueDashboard from './components/LiveQueueDashboard';
import DoctorManagement from './components/DoctorManagement';
import LoadBalancingDashboard from './components/LoadBalancingDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('queue');

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">🏥 Patient Queue Manager</div>
          <div className="navbar-menu">
            <button
              className={`nav-btn ${currentView === 'queue' ? 'active' : ''}`}
              onClick={() => setCurrentView('queue')}
            >
              🔴 Live Queue
            </button>
            <button
              className={`nav-btn ${currentView === 'register' ? 'active' : ''}`}
              onClick={() => setCurrentView('register')}
            >
              ➕ Register Patient
            </button>
            <button
              className={`nav-btn ${currentView === 'doctors' ? 'active' : ''}`}
              onClick={() => setCurrentView('doctors')}
            >
              👨‍⚕️ Doctors
            </button>
            <button
              className={`nav-btn ${currentView === 'balancing' ? 'active' : ''}`}
              onClick={() => setCurrentView('balancing')}
            >
              ⚖️ Load Balancing
            </button>
          </div>
        </div>
      </nav>

      {/* Views */}
      <div className="view-container">
        {currentView === 'queue' && <LiveQueueDashboard />}
        {currentView === 'register' && <PatientRegistration />}
        {currentView === 'doctors' && <DoctorManagement />}
        {currentView === 'balancing' && <LoadBalancingDashboard />}
      </div>
    </div>
  );
}

export default App;
