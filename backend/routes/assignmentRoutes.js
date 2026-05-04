const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// POST - Auto-assign next waiting patient to least-loaded doctor
router.post('/auto-assign', assignmentController.assignPatientToDoctor);

// POST - Bulk assign multiple patients
router.post('/bulk-assign', assignmentController.bulkAssignPatients);

// POST - Manually assign patient to specific doctor
router.post('/manual-assign', assignmentController.assignPatientToDoctorManual);

// GET - Get assignment statistics
router.get('/stats', assignmentController.getAssignmentStats);

module.exports = router;
