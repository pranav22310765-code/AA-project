/**
 * Priority Assignment Logic
 * Assigns priority level (1-3) based on medical condition
 * 1 = Highest Priority (Critical)
 * 2 = Medium Priority (High/Moderate)
 * 3 = Low Priority (Mild)
 */

const assignPriority = (condition) => {
  const priorityMap = {
    critical: 1,
    high: 2,
    moderate: 2,
    mild: 3,
  };

  return priorityMap[condition] || 3;
};

module.exports = { assignPriority };
