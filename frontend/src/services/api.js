import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ===== PATIENT ENDPOINTS =====
export const registerPatient = (patientData) => {
  return api.post('/patients/register', patientData);
};

export const getAllPatients = () => {
  return api.get('/patients');
};

export const getPatientById = (id) => {
  return api.get(`/patients/${id}`);
};

export const updatePatientStatus = (id, status) => {
  return api.put(`/patients/${id}/status`, { status });
};

// ===== QUEUE ENDPOINTS =====
export const getLiveQueue = () => {
  return api.get('/queue/live');
};

export const getQueueStats = () => {
  return api.get('/queue/stats');
};

// ===== DOCTOR ENDPOINTS =====
export const registerDoctor = (doctorData) => {
  return api.post('/doctors/register', doctorData);
};

export const getAllDoctors = () => {
  return api.get('/doctors');
};

export const getDoctorById = (id) => {
  return api.get(`/doctors/${id}`);
};

export const getDoctorsByLoad = () => {
  return api.get('/doctors/by-load');
};

export const updateDoctorStatus = (id, status) => {
  return api.put(`/doctors/${id}/status`, { status });
};

// ===== ASSIGNMENT ENDPOINTS =====
export const autoAssignPatient = () => {
  return api.post('/assignment/auto-assign');
};

export const bulkAssignPatients = (count = 5) => {
  return api.post('/assignment/bulk-assign', { count });
};

export const manualAssignPatient = (patientId, doctorId) => {
  return api.post('/assignment/manual-assign', { patientId, doctorId });
};

export const getAssignmentStats = () => {
  return api.get('/assignment/stats');
};

// ===== PATIENT MANAGEMENT BY DOCTOR =====
export const getAssignedPatientsByDoctor = (doctorId) => {
  return api.get(`/patients?assignedDoctor=${doctorId}`);
};

export default api;
