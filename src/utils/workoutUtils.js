export const calculateWorkoutXP = (workout) => {
  const baseXP = 10;
  const durationXP = Math.floor(workout.duration / 10);
  const caloriesXP = Math.floor(workout.calories / 20);
  const volumeXP = Math.floor((workout.totalVolume || 0) / 500);
  const exercisesXP = (workout.exercisesCount || 0) * 5;
  const setsXP = (workout.totalSets || 0) * 2;
  return baseXP + durationXP + caloriesXP + volumeXP + exercisesXP + setsXP;
};

export const calculateExerciseXP = (exercise) => {
  const baseMap = { Beginner: 10, Intermediate: 20, Advanced: 30 };
  return baseMap[exercise.difficulty] || 15;
};

export const calculatePRXP = (prType) => {
  const bonus = { weight: 50, reps: 30, volume: 40 };
  return bonus[prType] || 25;
};

export const calculateMissionXP = (missionDifficulty) => {
  const map = { daily: 25, weekly: 100, achievement: 200 };
  return map[missionDifficulty] || 25;
};

export const calculateLevelFromXP = (totalXP) => {
  if (totalXP < 0) return 1;
  const a = 1;
  const b = -1;
  const c = -totalXP / 25;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return 1;
  const L = Math.floor((-b + Math.sqrt(discriminant)) / (2 * a));
  return Math.max(1, L);
};

export const getXPForNextLevel = (currentLevel) => {
  const xpForCurrent = 25 * currentLevel * (currentLevel - 1);
  const xpForNext = 25 * (currentLevel + 1) * currentLevel;
  return xpForNext - xpForCurrent;
};

export const getLevelProgress = (totalXP, currentLevel) => {
  const xpForCurrent = 25 * currentLevel * (currentLevel - 1);
  const xpNeeded = getXPForNextLevel(currentLevel);
  const xpIntoLevel = totalXP - xpForCurrent;
  return xpIntoLevel / xpNeeded;
};

export const getLevelTitle = (level) => {
  const titles = [
    { min: 1, max: 10, title: 'Initiate' },
    { min: 11, max: 20, title: 'Bronze' },
    { min: 21, max: 30, title: 'Elite' },
    { min: 31, max: 40, title: 'Diamond' },
    { min: 41, max: 50, title: 'Ascendant' },
    { min: 51, max: 70, title: 'Genesis' },
    { min: 71, max: 90, title: 'Mythic' },
    { min: 91, max: 100, title: 'Legend' },
  ];
  const found = titles.find(t => level >= t.min && level <= t.max);
  return found ? found.title : 'Legend';
};

export const calculatePowerLevel = (stats) => {
  const { workoutHistory, personalRecords, missionProgress } = stats;

  const strengthScore = calculateStrengthScore(personalRecords);
  const frequencyScore = calculateFrequencyScore(workoutHistory);
  const consistencyScore = calculateConsistencyScore(missionProgress, workoutHistory);
  const volumeScore = calculateVolumeScore(workoutHistory);
  const achievementScore = calculateAchievementScore({ personalRecords, workoutHistory, missionProgress });

  const totalPower = strengthScore + frequencyScore + consistencyScore + volumeScore + achievementScore;
  return Math.min(1000, Math.max(0, Math.round(totalPower)));
};

export const calculateWeeklyChange = (stats) => {
  const { workoutHistory, personalRecords, missionProgress } = stats;
  const current = calculatePowerLevel(stats);

  const now = Date.now();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const oldStats = {
    ...stats,
    workoutHistory: (workoutHistory || []).filter(w => {
      const t = new Date(w.timestamp || w.date);
      return t >= twoWeeksAgo && t < oneWeekAgo;
    }),
    missionProgress: { ...missionProgress, streak: Math.max(0, (missionProgress?.streak || 0) - 7) }
  };

  const previous = calculatePowerLevel(oldStats);
  return current - previous;
};

export const calculateMonthlyChange = (stats) => {
  const current = calculatePowerLevel(stats);

  const now = Date.now();
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const oldStats = {
    ...stats,
    workoutHistory: (stats.workoutHistory || []).filter(w => {
      const t = new Date(w.timestamp || w.date);
      return t >= twoMonthsAgo && t < oneMonthAgo;
    }),
  };

  const previous = calculatePowerLevel(oldStats);
  return current - previous;
};

const calculateStrengthScore = (personalRecords) => {
  let score = 0;
  const keyLifts = ['chest_bench_press', 'back_deadlift', 'legs_barbell_squat', 'shoulders_overhead_press'];

  keyLifts.forEach(exerciseId => {
    const record = personalRecords?.[exerciseId];
    if (record && record.best?.weight) {
      const normalizedWeight = Math.min(50, (record.best.weight / 400) * 50);
      score += normalizedWeight;
    }
  });

  return Math.min(200, (score / keyLifts.length) * 4);
};

const calculateFrequencyScore = (workoutHistory) => {
  if (!workoutHistory || workoutHistory.length === 0) return 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentWorkouts = workoutHistory.filter(w => {
    const t = new Date(w.timestamp || w.date);
    return t >= thirtyDaysAgo;
  });

  const weeks = 30 / 7;
  const weeklyAverage = recentWorkouts.length / weeks;
  return Math.min(200, weeklyAverage * 20);
};

const calculateConsistencyScore = (missionProgress, workoutHistory) => {
  let score = 0;
  const streakScore = Math.min(100, Math.floor((missionProgress?.streak || 0) / 7) * 15);
  score += streakScore;

  if (workoutHistory && workoutHistory.length >= 2) {
    const sorted = [...workoutHistory].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    const gaps = [];

    for (let i = 0; i < Math.min(5, sorted.length - 1); i++) {
      const gapDays = (new Date(sorted[i].timestamp || sorted[i].date) - new Date(sorted[i + 1].timestamp || sorted[i + 1].date)) / (1000 * 60 * 60 * 24);
      if (gapDays > 0) gaps.push(gapDays);
    }

    if (gaps.length > 0) {
      const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
      const regularityScore = Math.max(0, 100 - Math.max(0, (avgGap - 2.5) * 15));
      score += regularityScore;
    }
  }

  return Math.min(200, score);
};

const calculateVolumeScore = (workoutHistory) => {
  if (!workoutHistory || workoutHistory.length === 0) return 0;

  let totalVolume = 0;
  workoutHistory.forEach(workout => {
    if (workout.exercises) {
      workout.exercises.forEach(exerciseLog => {
        if (exerciseLog.sets) {
          exerciseLog.sets.forEach(set => {
            const weight = parseFloat(set.weight) || 0;
            const reps = parseInt(set.reps) || 0;
            totalVolume += weight * reps;
          });
        }
      });
    }
  });

  return Math.min(200, (totalVolume / 500000) * 200);
};

const calculateAchievementScore = (stats) => {
  let score = 0;
  const { personalRecords, workoutHistory, missionProgress } = stats;

  let prCount = 0;
  if (personalRecords) {
    Object.values(personalRecords).forEach(record => {
      if (record?.best && Object.values(record.best).some(v => v > 0)) {
        prCount++;
      }
    });
  }
  score += Math.min(50, prCount * 5);

  return Math.min(50, score);
};

export const calculateVolume = (sets) => {
  if (!sets || !Array.isArray(sets)) return 0;
  return sets.reduce((total, set) => {
    return total + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
  }, 0);
};

export const calculateRecoveryPercentage = (workoutHistory, muscleGroup) => {
  if (!workoutHistory || workoutHistory.length === 0) return 100;

  const now = Date.now();
  const lastWorkout = workoutHistory.find(w => {
    if (!w.exercises) return false;
    return w.exercises.some(ex => {
      const exData = ex.exerciseData || {};
      return exData.muscleGroup === muscleGroup;
    });
  });

  if (!lastWorkout) return 100;

  const lastDate = new Date(lastWorkout.timestamp || lastWorkout.date).getTime();
  const daysSince = (now - lastDate) / (1000 * 60 * 60 * 24);

  if (daysSince >= 3) return 100;
  if (daysSince >= 2) return 85;
  if (daysSince >= 1) return 60;
  return Math.max(20, 100 - (daysSince < 0 ? 0 : (1 - daysSince) * 80));
};

export const getWorkoutStats = (workoutHistory) => {
  if (!workoutHistory || workoutHistory.length === 0) {
    return {
      totalWorkouts: 0,
      totalVolume: 0,
      totalCalories: 0,
      totalTime: 0,
      averageDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const totalWorkouts = workoutHistory.length;
  let totalVolume = 0;
  let totalCalories = 0;
  let totalTime = 0;

  workoutHistory.forEach(w => {
    totalCalories += w.totalCalories || w.calories || 0;
    totalTime += w.duration || 0;

    if (w.exercises) {
      w.exercises.forEach(ex => {
        if (ex.sets) {
          ex.sets.forEach(set => {
            totalVolume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
          });
        }
      });
    }
  });

  const averageDuration = totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0;

  const sorted = [...workoutHistory].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const dates = [...new Set(sorted.map(w => {
    const d = new Date(w.timestamp || w.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))];

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const yesterdayDate = new Date(today);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

      if (dates[i] === dateStr || dates[i] === yesterdayStr) {
        tempStreak = 1;
        currentStreak = 1;
      }
    } else {
      const dateA = new Date(dates[i - 1]);
      const dateB = new Date(dates[i]);
      const diffDays = Math.round((dateA - dateB) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (i === 1) currentStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }
  }

  if (tempStreak > longestStreak) longestStreak = tempStreak;

  return {
    totalWorkouts,
    totalVolume,
    totalCalories,
    totalTime,
    averageDuration,
    currentStreak,
    longestStreak,
  };
};

export const calculateWeeklyCalories = (workoutHistory) => {
  if (!workoutHistory) return 0;
  const now = Date.now();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  return workoutHistory
    .filter(w => new Date(w.timestamp || w.date) >= oneWeekAgo)
    .reduce((sum, w) => sum + (w.totalCalories || w.calories || 0), 0);
};
