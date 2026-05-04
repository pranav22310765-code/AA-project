const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

/**
 * Register a new doctor
 */
exports.registerDoctor = async (req, res) => {
  try {
    const { name, specialization, contact, email, licenseNumber, availability, maxCapacity, department } = req.body;

    // Validation
    if (!name || !specialization || !contact || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, specialization, contact, licenseNumber',
      });
    }

    // Check if license number already exists
    const existingDoctor = await Doctor.findOne({ licenseNumber });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this license number already exists',
      });
    }

    const newDoctor = new Doctor({
      name,
      specialization,
      contact,
      email: email || '',
      licenseNumber,
      availability: availability || {
        startTime: '09:00',
        endTime: '18:00',
        daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      maxCapacity: maxCapacity || 10,
      department: department || 'General',
    });

    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.name,
        specialization: newDoctor.specialization,
        currentLoad: newDoctor.currentLoad,
        maxCapacity: newDoctor.maxCapacity,
      },
    });
  } catch (error) {
    console.error('Error registering doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering doctor',
      error: error.message,
    });
  }
};

/**
 * Get all doctors
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('_id name specialization contact currentLoad maxCapacity status availability department')
      .sort({ currentLoad: 1 }); // Sort by current load (least loaded first)

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors.map((doc) => ({
        doctorId: doc._id,
        name: doc.name,
        specialization: doc.specialization,
        contact: doc.contact,
        currentLoad: doc.currentLoad,
        maxCapacity: doc.maxCapacity,
        availableSlots: doc.maxCapacity - doc.currentLoad,
        status: doc.status,
        availability: doc.availability,
        department: doc.department,
      })),
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message,
    });
  }
};

/**
 * Get doctor by ID
 */
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).populate('assignedPatients', 'name age priority status');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        doctorId: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        contact: doctor.contact,
        email: doctor.email,
        licenseNumber: doctor.licenseNumber,
        currentLoad: doctor.currentLoad,
        maxCapacity: doctor.maxCapacity,
        availableSlots: doctor.maxCapacity - doctor.currentLoad,
        status: doctor.status,
        availability: doctor.availability,
        department: doctor.department,
        assignedPatients: doctor.assignedPatients,
      },
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message,
    });
  }
};

/**
 * Update doctor status
 */
exports.updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'busy', 'on-break', 'offline'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor status updated',
      data: updatedDoctor,
    });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor status',
      error: error.message,
    });
  }
};

/**
 * Get doctors sorted by current load (least loaded first)
 */
exports.getDoctorsByLoad = async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: { $ne: 'offline' } })
      .select('_id name specialization currentLoad maxCapacity status')
      .sort({ currentLoad: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors.map((doc) => ({
        doctorId: doc._id,
        name: doc.name,
        specialization: doc.specialization,
        currentLoad: doc.currentLoad,
        maxCapacity: doc.maxCapacity,
        availableSlots: doc.maxCapacity - doc.currentLoad,
        status: doc.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching doctors by load:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors by load',
      error: error.message,
    });
  }
};
