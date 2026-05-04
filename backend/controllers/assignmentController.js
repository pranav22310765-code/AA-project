const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

/**
 * Auto-assign next waiting patient to doctor with least load
 * Load Balancing Algorithm:
 * 1. Get next waiting patient (from sorted queue)
 * 2. Find doctor with least assigned patients (available)
 * 3. Assign patient to doctor
 * 4. Update patient status = "assigned"
 * 5. Update doctor's currentLoad and assignedPatients
 */
exports.assignPatientToDoctor = async (req, res) => {
  try {
    // Get next waiting patient (sorted by priority, then arrival time)
    const waitingPatient = await Patient.findOne({ status: 'waiting' })
      .sort({ priority: 1, arrivalTime: 1 });

    if (!waitingPatient) {
      return res.status(400).json({
        success: false,
        message: 'No waiting patients in queue',
      });
    }

    // Find doctor with least load (available and not offline)
    const leastLoadedDoctor = await Doctor.findOne({
      status: { $ne: 'offline' },
      currentLoad: { $lt: '$maxCapacity' }, // Load is less than capacity
    })
      .sort({ currentLoad: 1 });

    if (!leastLoadedDoctor) {
      return res.status(400).json({
        success: false,
        message: 'No available doctors to assign',
      });
    }

    // Check if doctor is at capacity
    if (leastLoadedDoctor.currentLoad >= leastLoadedDoctor.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'All doctors are at capacity',
      });
    }

    // Update patient
    waitingPatient.status = 'assigned';
    waitingPatient.assignedDoctor = leastLoadedDoctor._id;
    await waitingPatient.save();

    // Update doctor
    leastLoadedDoctor.assignedPatients.push(waitingPatient._id);
    leastLoadedDoctor.currentLoad += 1;
    await leastLoadedDoctor.save();

    res.status(200).json({
      success: true,
      message: 'Patient assigned to doctor successfully',
      data: {
        patientId: waitingPatient._id,
        patientName: waitingPatient.name,
        patientStatus: waitingPatient.status,
        doctorId: leastLoadedDoctor._id,
        doctorName: leastLoadedDoctor.name,
        doctorLoad: `${leastLoadedDoctor.currentLoad}/${leastLoadedDoctor.maxCapacity}`,
      },
    });
  } catch (error) {
    console.error('Error assigning patient to doctor:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning patient to doctor',
      error: error.message,
    });
  }
};

/**
 * Auto-assign multiple waiting patients (bulk assignment)
 * Assigns all waiting patients to least-loaded doctors
 */
exports.bulkAssignPatients = async (req, res) => {
  try {
    const { count = 5 } = req.body; // Default: assign 5 patients

    // Get waiting patients
    const waitingPatients = await Patient.find({ status: 'waiting' })
      .sort({ priority: 1, arrivalTime: 1 })
      .limit(count);

    if (waitingPatients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No waiting patients to assign',
      });
    }

    const assignments = [];
    let assignmentCount = 0;

    for (const patient of waitingPatients) {
      try {
        // Find least-loaded doctor
        const doctor = await Doctor.findOne({
          status: { $ne: 'offline' },
          currentLoad: { $lt: '$maxCapacity' },
        }).sort({ currentLoad: 1 });

        if (!doctor || doctor.currentLoad >= doctor.maxCapacity) {
          console.log(`No available doctor for patient ${patient._id}`);
          continue;
        }

        // Update patient
        patient.status = 'assigned';
        patient.assignedDoctor = doctor._id;
        await patient.save();

        // Update doctor
        doctor.assignedPatients.push(patient._id);
        doctor.currentLoad += 1;
        await doctor.save();

        assignments.push({
          patientId: patient._id,
          patientName: patient.name,
          doctorId: doctor._id,
          doctorName: doctor.name,
          doctorLoad: `${doctor.currentLoad}/${doctor.maxCapacity}`,
        });

        assignmentCount++;
      } catch (err) {
        console.error(`Error assigning patient ${patient._id}:`, err);
      }
    }

    res.status(200).json({
      success: true,
      message: `${assignmentCount} patient(s) assigned successfully`,
      assignmentCount,
      assignments,
    });
  } catch (error) {
    console.error('Error bulk assigning patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk assigning patients',
      error: error.message,
    });
  }
};

/**
 * Get assignment statistics
 * Shows queue status and doctor workload distribution
 */
exports.getAssignmentStats = async (req, res) => {
  try {
    const waitingCount = await Patient.countDocuments({ status: 'waiting' });
    const assignedCount = await Patient.countDocuments({ status: 'assigned' });
    const inProgressCount = await Patient.countDocuments({ status: 'in-progress' });
    const completedCount = await Patient.countDocuments({ status: 'completed' });

    const doctors = await Doctor.find({ status: { $ne: 'offline' } }).select('_id name currentLoad maxCapacity status');

    const totalCapacity = doctors.reduce((sum, doc) => sum + doc.maxCapacity, 0);
    const totalAssigned = doctors.reduce((sum, doc) => sum + doc.currentLoad, 0);
    const totalAvailableSlots = totalCapacity - totalAssigned;

    const doctorLoadDistribution = doctors.map((doc) => ({
      doctorId: doc._id,
      doctorName: doc.name,
      currentLoad: doc.currentLoad,
      maxCapacity: doc.maxCapacity,
      utilization: `${Math.round((doc.currentLoad / doc.maxCapacity) * 100)}%`,
      status: doc.status,
    }));

    res.status(200).json({
      success: true,
      stats: {
        queue: {
          waiting: waitingCount,
          assigned: assignedCount,
          inProgress: inProgressCount,
          completed: completedCount,
        },
        doctorCapacity: {
          totalCapacity,
          totalAssigned,
          totalAvailableSlots,
          utilizationPercentage: `${Math.round((totalAssigned / totalCapacity) * 100)}%`,
        },
        doctorLoadDistribution,
      },
    });
  } catch (error) {
    console.error('Error getting assignment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting assignment stats',
      error: error.message,
    });
  }
};

/**
 * Manually assign patient to specific doctor
 */
exports.assignPatientToDoctorManual = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientId and doctorId',
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check capacity
    if (doctor.currentLoad >= doctor.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Doctor ${doctor.name} is at capacity`,
      });
    }

    // Update patient
    patient.status = 'assigned';
    patient.assignedDoctor = doctor._id;
    await patient.save();

    // Update doctor
    if (!doctor.assignedPatients.includes(patient._id)) {
      doctor.assignedPatients.push(patient._id);
      doctor.currentLoad += 1;
      await doctor.save();
    }

    res.status(200).json({
      success: true,
      message: 'Patient manually assigned to doctor',
      data: {
        patientId: patient._id,
        patientName: patient.name,
        doctorId: doctor._id,
        doctorName: doctor.name,
        doctorLoad: `${doctor.currentLoad}/${doctor.maxCapacity}`,
      },
    });
  } catch (error) {
    console.error('Error manually assigning patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error manually assigning patient',
      error: error.message,
    });
  }
};
