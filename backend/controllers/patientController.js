const Patient = require('../models/Patient');
const { assignPriority } = require('../utils/priorityAssignment');

// Register a new patient
exports.registerPatient = async (req, res) => {
  try {
    const { name, age, contact, email, symptoms, condition, medicalNotes } = req.body;

    // Validation
    if (!name || !age || !contact || !symptoms || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, age, contact, symptoms, condition',
      });
    }

    // Assign priority based on condition
    const priority = assignPriority(condition);

    // Create new patient
    const newPatient = new Patient({
      name,
      age,
      contact,
      email,
      symptoms,
      condition,
      priority,
      status: 'waiting',
      arrivalTime: new Date(),
      medicalNotes: medicalNotes || '',
    });

    // Save to database
    await newPatient.save();

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        patientId: newPatient._id,
        name: newPatient.name,
        priority: newPatient.priority,
        status: newPatient.status,
        arrivalTime: newPatient.arrivalTime,
      },
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering patient',
      error: error.message,
    });
  }
};

// Get all patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ priority: 1, arrivalTime: 1 });
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message,
    });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message,
    });
  }
};

// Update patient status
exports.updatePatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['waiting', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient status updated',
      data: updatedPatient,
    });
  } catch (error) {
    console.error('Error updating patient status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient status',
      error: error.message,
    });
  }
};
