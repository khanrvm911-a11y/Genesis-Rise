// Utility functions for calculating XP and level from workouts

/**
 * Calculate XP gained from a single workout
 * Formula: base XP for logging + duration/10 + calories/20
 * @param {Object} workout - { duration: number (minutes), calories: number }
 * @returns {number} XP gained
 */
export const calculateWorkoutXP = (workout) => {
  const baseXP = 10; // for logging any workout
  const durationXP = Math.floor(workout.duration / 10); // 1 XP per 10 minutes
  const caloriesXP = Math.floor(workout.calories / 20); // 1 XP per 20 calories
  return baseXP + durationXP + caloriesXP;
};

/**
 * Calculate total XP from an array of workouts
 * @param {Array} workouts - Array of workout objects
 * @returns {number} Total XP
 */
export const calculateTotalXP = (workouts) => {
  return workouts.reduce((total, w) => total + calculateWorkoutXP(w), 0);
};

/**
 * Calculate level based on total XP
 * Level thresholds: Level 1 = 0 XP, Level 2 = 100, Level 3 = 250, Level 4 = 450, etc.
 * Formula: level = floor((sqrt(2 * XP / 50 + 0.25) + 0.5))  (derived from sum of series)
 * For simplicity, we use incremental thresholds: each level requires 50 * level more XP than previous.
 * Total XP needed for level L: 25 * L * (L-1)
 * Inverse: solve for L given XP.
 * @param {number} totalXP
 * @returns {number} Level (starting at 1)
 */
export const calculateLevelFromXP = (totalXP) => {
  if (totalXP < 0) return 1;
  // Solve 25 * L * (L-1) <= totalXP
  // Approximate using quadratic formula: L^2 - L - totalXP/25 <= 0
  const a = 1;
  const b = -1;
  const c = -totalXP / 25;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 1;
  const L = Math.floor((-b + Math.sqrt(discriminant)) / (2 * a));
  return Math.max(1, L);
};

/**
 * Get XP needed for next level
 * @param {number} currentLevel
 * @returns {number} XP required to reach next level
 */
export const getXPForNextLevel = (currentLevel) => {
  // XP needed for level L+1 minus XP needed for level L
  // XP for level L: 25 * L * (L-1)
  const xpForCurrent = 25 * currentLevel * (currentLevel - 1);
  const xpForNext = 25 * (currentLevel + 1) * currentLevel;
  return xpForNext - xpForCurrent;
};

/**
 * Get current level progress (0 to 1)
 * @param {number} totalXP
 * @param {number} currentLevel
 * @returns {number} Progress fraction
 */
export const getLevelProgress = (totalXP, currentLevel) => {
  const xpForCurrent = 25 * currentLevel * (currentLevel - 1);
  const xpNeeded = getXPForNextLevel(currentLevel);
  const xpIntoLevel = totalXP - xpForCurrent;
  return xpIntoLevel / xpNeeded;
};
