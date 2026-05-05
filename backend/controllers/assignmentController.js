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
    console.log('\n=== STEP 0: Get Sorted Patient Queue ===');
    
    // STEP 1: Select waiting patient
    console.log('STEP 1: Selecting waiting patient...');
    const waitingPatient = await Patient.findOne({ status: 'waiting' })
      .sort({ priority: 1, arrivalTime: 1 });

    if (!waitingPatient) {
      console.log('❌ No waiting patients in queue');
      return res.status(400).json({
        success: false,
        message: 'No waiting patients in queue',
      });
    }
    console.log(`✓ Selected: ${waitingPatient.name} (Priority: ${waitingPatient.priority}, Arrival: ${waitingPatient.arrivalTime})`);

    // STEP 2: Get available doctors
    console.log('\nSTEP 2: Getting available doctors...');
    const availableDoctors = await Doctor.find({ status: 'available' })
      .sort({ currentLoad: 1 });

    console.log(`Found ${availableDoctors.length} available doctor(s):`);
    availableDoctors.forEach(d => {
      console.log(`  - ${d.name}: Load ${d.currentLoad}/${d.maxCapacity}`);
    });

    if (availableDoctors.length === 0) {
      console.log('❌ No available doctors');
      return res.status(400).json({
        success: false,
        message: 'No available doctors to assign',
      });
    }

    // STEP 3: Find least loaded doctor
    console.log('\nSTEP 3: Finding least loaded doctor...');
    const leastLoadedDoctor = availableDoctors[0]; // Already sorted by load
    console.log(`✓ Selected: ${leastLoadedDoctor.name} (Load: ${leastLoadedDoctor.currentLoad}/${leastLoadedDoctor.maxCapacity})`);

    // STEP 4: Check capacity
    console.log('\nSTEP 4: Checking doctor capacity...');
    if (leastLoadedDoctor.currentLoad >= leastLoadedDoctor.maxCapacity) {
      console.log(`❌ Doctor ${leastLoadedDoctor.name} is at capacity`);
      return res.status(400).json({
        success: false,
        message: `Doctor ${leastLoadedDoctor.name} is at capacity`,
      });
    }
    console.log(`✓ Doctor has capacity (${leastLoadedDoctor.currentLoad}/${leastLoadedDoctor.maxCapacity})`);

    // STEP 5: Assign patient
    console.log('\nSTEP 5: Assigning patient...');
    waitingPatient.status = 'assigned';
    waitingPatient.assignedDoctor = leastLoadedDoctor._id;
    await waitingPatient.save();
    console.log(`✓ Patient status updated to "assigned"`);

    // STEP 6: Update doctor load
    console.log('\nSTEP 6: Updating doctor load...');
    leastLoadedDoctor.assignedPatients.push(waitingPatient._id);
    leastLoadedDoctor.currentLoad += 1;
    await leastLoadedDoctor.save();
    console.log(`✓ Doctor load updated: ${leastLoadedDoctor.currentLoad}/${leastLoadedDoctor.maxCapacity}`);

    console.log('\n=== Assignment Complete ===\n');

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
    console.error('❌ Error assigning patient:', error.message);
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
    console.log('\n\n╔════════════════════════════════════════╗');
    console.log('║  BULK ASSIGNMENT PROCESS STARTED       ║');
    console.log('╚════════════════════════════════════════╝\n');

    const { count = 5 } = req.body;

    // STEP 0: Get sorted queue
    console.log('STEP 0: Getting sorted patient queue...');
    const waitingPatients = await Patient.find({ status: 'waiting' })
      .sort({ priority: 1, arrivalTime: 1 })
      .limit(count);

    console.log(`✓ Found ${waitingPatients.length} waiting patients:\n`);
    waitingPatients.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - Priority: ${p.priority}, Arrival: ${new Date(p.arrivalTime).toLocaleTimeString()}`);
    });

    if (waitingPatients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No waiting patients to assign',
      });
    }

    const assignments = [];
    let assignmentCount = 0;

    // STEP 7: Continue loop - Process each patient
    for (let patientIndex = 0; patientIndex < waitingPatients.length; patientIndex++) {
      const patient = waitingPatients[patientIndex];
      console.log(`\n${'─'.repeat(50)}`);
      console.log(`\nProcessing Patient ${patientIndex + 1}/${waitingPatients.length}: ${patient.name}`);
      console.log(`${'─'.repeat(50)}`);

      try {
        // STEP 1: Select patient (check if waiting)
        console.log(`\n[STEP 1] Checking patient status...`);
        if (patient.status !== 'waiting') {
          console.log(`⚠️  Patient status is "${patient.status}", skipping...`);
          continue;
        }
        console.log(`✓ Patient status is "waiting"`);

        // STEP 2: Get available doctors
        console.log(`\n[STEP 2] Getting available doctors...`);
        const availableDoctors = await Doctor.find({ status: 'available' })
          .sort({ currentLoad: 1 });

        console.log(`Found ${availableDoctors.length} available doctor(s):`);
        availableDoctors.forEach(d => {
          console.log(`  • ${d.name}: ${d.currentLoad}/${d.maxCapacity}`);
        });

        if (availableDoctors.length === 0) {
          console.log(`❌ No available doctors, skipping patient...`);
          continue;
        }

        // STEP 3: Find least loaded doctor
        console.log(`\n[STEP 3] Finding least loaded doctor...`);
        const leastLoadedDoctor = availableDoctors[0]; // Already sorted
        console.log(`✓ Selected: ${leastLoadedDoctor.name}`);

        // STEP 4: Check capacity
        console.log(`\n[STEP 4] Checking doctor capacity...`);
        if (leastLoadedDoctor.currentLoad >= leastLoadedDoctor.maxCapacity) {
          console.log(`❌ Doctor at capacity (${leastLoadedDoctor.currentLoad}/${leastLoadedDoctor.maxCapacity}), skipping...`);
          continue;
        }
        console.log(`✓ Doctor has capacity (${leastLoadedDoctor.currentLoad}/${leastLoadedDoctor.maxCapacity})`);

        // IMPORTANT: Fetch fresh doctor data from database before updating
        // This ensures we have the latest currentLoad value
        console.log(`\n[STEP 4.5] Fetching fresh doctor data from database...`);
        const freshDoctor = await Doctor.findById(leastLoadedDoctor._id);
        
        // Check capacity again with fresh data
        if (freshDoctor.currentLoad >= freshDoctor.maxCapacity) {
          console.log(`❌ Doctor now at capacity after refresh (${freshDoctor.currentLoad}/${freshDoctor.maxCapacity}), trying next doctor...`);
          continue;
        }
        console.log(`✓ Fresh doctor load: ${freshDoctor.currentLoad}/${freshDoctor.maxCapacity}`);

        // STEP 5: Assign patient
        console.log(`\n[STEP 5] Assigning patient...`);
        patient.status = 'assigned';
        patient.assignedDoctor = freshDoctor._id;
        await patient.save();
        console.log(`✓ Patient status → "assigned"`);

        // STEP 6: Update doctor load
        console.log(`\n[STEP 6] Updating doctor load...`);
        freshDoctor.assignedPatients.push(patient._id);
        freshDoctor.currentLoad += 1;
        await freshDoctor.save();
        console.log(`✓ Doctor load updated → ${freshDoctor.currentLoad}/${freshDoctor.maxCapacity}`);

        assignments.push({
          patientId: patient._id,
          patientName: patient.name,
          doctorId: freshDoctor._id,
          doctorName: freshDoctor.name,
          doctorLoad: `${freshDoctor.currentLoad}/${freshDoctor.maxCapacity}`,
        });

        assignmentCount++;
        console.log(`\n✅ ${patient.name} → ${freshDoctor.name}`);

      } catch (err) {
        console.error(`❌ Error processing patient ${patient.name}:`, err.message);
      }
    }

    console.log(`\n\n╔════════════════════════════════════════╗`);
    console.log(`║  ASSIGNMENT COMPLETE                   ║`);
    console.log(`║  Assigned: ${assignmentCount}/${waitingPatients.length}                         ║`);
    console.log(`╚════════════════════════════════════════╝\n`);

    res.status(200).json({
      success: true,
      message: `${assignmentCount} patient(s) assigned successfully`,
      assignmentCount,
      assignments,
    });
  } catch (error) {
    console.error('❌ Error in bulk assignment:', error.message);
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
