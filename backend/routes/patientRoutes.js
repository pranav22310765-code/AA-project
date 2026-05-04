const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// POST - Register a new patient
router.post('/register', patientController.registerPatient);

// GET - Get all patients (sorted by priority and arrival time)
router.get('/', patientController.getAllPatients);

// GET - Get patient by ID
router.get('/:id', patientController.getPatientById);

// PUT - Update patient status
router.put('/:id/status', patientController.updatePatientStatus);

module.exports = router;
