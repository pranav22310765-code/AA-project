/**
 * Priority Assignment Logic
 * Assigns priority level (1-4) based on medical condition
 * Order: Critical (1) > High (2) > Moderate (3) > Mild (4)
 * 1 = Critical (Highest Priority)
 * 2 = High
 * 3 = Moderate
 * 4 = Mild (Lowest Priority)
 */

const assignPriority = (condition) => {
  const priorityMap = {
    critical: 1,   // Highest
    high: 2,       // High
    moderate: 3,   // Moderate
    mild: 4,       // Lowest
  };

  return priorityMap[condition] || 4;
};

module.exports = { assignPriority };
