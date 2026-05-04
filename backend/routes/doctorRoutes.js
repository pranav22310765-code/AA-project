const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// POST - Register a new doctor
router.post('/register', doctorController.registerDoctor);

// GET - Get all doctors
router.get('/', doctorController.getAllDoctors);

// GET - Get doctors sorted by current load (least loaded first)
router.get('/by-load', doctorController.getDoctorsByLoad);

// GET - Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

// PUT - Update doctor status
router.put('/:id/status', doctorController.updateDoctorStatus);

module.exports = router;
