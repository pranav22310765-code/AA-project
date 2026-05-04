const Patient = require('../models/Patient');

/**
 * Get Live Queue
 * Fetches all patients with status="waiting"
 * Sorts by priority (ascending) then arrivalTime (ascending)
 * Returns sorted queue for live display
 */
exports.getLiveQueue = async (req, res) => {
  try {
    // Fetch all patients with status="waiting"
    const queue = await Patient.find({ status: 'waiting' })
      .sort({ priority: 1, arrivalTime: 1 }) // Sort by priority first, then arrival time
      .select('_id name age priority arrivalTime symptoms condition contact'); // Select only necessary fields

    res.status(200).json({
      success: true,
      queueLength: queue.length,
      queue: queue.map((patient, index) => ({
        position: index + 1, // Queue position (1-indexed)
        patientId: patient._id,
        name: patient.name,
        age: patient.age,
        priority: patient.priority,
        symptoms: patient.symptoms,
        condition: patient.condition,
        contact: patient.contact,
        arrivalTime: patient.arrivalTime,
        waitingTime: calculateWaitingTime(patient.arrivalTime),
      })),
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue',
      error: error.message,
    });
  }
};

/**
 * Get Queue Statistics
 * Returns stats about current queue (count by priority, average wait time, etc.)
 */
exports.getQueueStats = async (req, res) => {
  try {
    const waitingPatients = await Patient.find({ status: 'waiting' });

    const stats = {
      totalWaiting: waitingPatients.length,
      priority1: waitingPatients.filter((p) => p.priority === 1).length,
      priority2: waitingPatients.filter((p) => p.priority === 2).length,
      priority3: waitingPatients.filter((p) => p.priority === 3).length,
      averageWaitTime: calculateAverageWaitTime(waitingPatients),
      oldestWaitingTime: waitingPatients.length > 0
        ? calculateWaitingTime(waitingPatients[0].arrivalTime)
        : 0,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching queue stats',
      error: error.message,
    });
  }
};

/**
 * Helper function to calculate waiting time in minutes
 */
function calculateWaitingTime(arrivalTime) {
  const now = new Date();
  const arrivalDate = new Date(arrivalTime);
  const diffMs = now - arrivalDate;
  return Math.floor(diffMs / 60000); // Convert to minutes
}

/**
 * Helper function to calculate average waiting time
 */
function calculateAverageWaitTime(patients) {
  if (patients.length === 0) return 0;

  const totalWaitTime = patients.reduce((sum, patient) => {
    return sum + calculateWaitingTime(patient.arrivalTime);
  }, 0);

  return Math.floor(totalWaitTime / patients.length);
}
