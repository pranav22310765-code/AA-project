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
    const patients = await Patient.find()
      .populate('assignedDoctor', 'name specialization') // Populate doctor info
      .sort({ priority: 1, arrivalTime: 1 });
    
    console.log(`[FETCH] Retrieved ${patients.length} patients`);
    patients.forEach(p => {
      if (p.assignedDoctor) {
        console.log(`  - ${p.name}: assigned to ${p.assignedDoctor.name} (ID: ${p.assignedDoctor._id})`);
      } else {
        console.log(`  - ${p.name}: no assigned doctor (status: ${p.status})`);
      }
    });
    
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

    if (!['waiting', 'assigned', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: waiting, assigned, in-progress, completed, cancelled',
      });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const oldStatus = patient.status;
    patient.status = status;

    // IMPORTANT: Handle doctor load updates
    if (status === 'completed' || status === 'cancelled') {
      // When patient is completed or cancelled, decrease doctor's load
      if (patient.assignedDoctor) {
        const Doctor = require('../models/Doctor');
        const doctor = await Doctor.findById(patient.assignedDoctor);

        if (doctor) {
          // Remove patient from doctor's assigned list
          doctor.assignedPatients = doctor.assignedPatients.filter(
            pId => pId.toString() !== patient._id.toString()
          );

          // Decrease doctor's load
          doctor.currentLoad = Math.max(0, doctor.currentLoad - 1);
          await doctor.save();

          console.log(`[LOAD UPDATE] Patient "${patient.name}" marked as "${status}"`);
          console.log(`  Doctor "${doctor.name}" load: ${doctor.currentLoad + 1} → ${doctor.currentLoad}`);
        }
      }
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message: `Patient status updated from "${oldStatus}" to "${status}"`,
      data: {
        patientId: patient._id,
        patientName: patient.name,
        oldStatus,
        newStatus: patient.status,
        assignedDoctor: patient.assignedDoctor,
      },
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
