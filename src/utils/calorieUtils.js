const MET_VALUES = {
  chest_pushup: 3.8,
  chest_bench_press: 6.0,
  chest_dumbbell_press: 5.5,
  chest_incline_press: 5.5,
  chest_flyes: 4.0,
  chest_dips: 5.0,
  back_pullups: 8.0,
  back_chinups: 8.0,
  back_barbell_row: 6.0,
  back_dumbbell_row: 5.5,
  back_lat_pulldown: 5.0,
  back_deadlift: 7.0,
  legs_squat: 5.0,
  legs_barbell_squat: 8.0,
  legs_front_squat: 8.0,
  legs_lunge: 5.0,
  legs_leg_press: 5.0,
  legs_leg_curl: 4.0,
  legs_calf_raise: 3.5,
  shoulders_overhead_press: 6.0,
  shoulders_dumbbell_press: 5.5,
  shoulders_lateral_raise: 3.5,
  shoulders_front_raise: 3.5,
  shoulders_rear_delt_fly: 3.5,
  shoulders_shrugs: 4.0,
  arms_bicep_curl: 3.5,
  arms_hammer_curl: 3.5,
  arms_tricep_extension: 3.5,
  arms_tricep_pushdown: 3.5,
  arms_close_grip_bench: 5.0,
  arms_wrist_curl: 2.5,
  core_situp: 3.5,
  core_crunch: 3.0,
  core_plank: 2.5,
  core_side_plank: 2.5,
  core_leg_raise: 3.0,
  core_russian_twist: 3.5,
  core_bicycle_crunch: 4.0,
  cardio_running: 9.8,
  cardio_cycling: 7.0,
  cardio_jumping_rope: 10.0,
  cardio_swimming: 8.0,
  cardio_hiit: 9.0,
  fullbody_burpee: 8.0,
  fullbody_kettlebell_swing: 5.5,
  fullbody_medicine_ball_slam: 6.0,
  default_weight: 5.0,
  default_bodyweight: 3.8,
  default_cardio: 7.0,
  default: 4.0,
};

export const getMetValue = (exerciseId, trackingType) => {
  if (MET_VALUES[exerciseId]) {
    return MET_VALUES[exerciseId];
  }
  switch (trackingType) {
    case 'weight': return MET_VALUES.default_weight;
    case 'reps': return MET_VALUES.default_bodyweight;
    case 'time':
    case 'distance': return MET_VALUES.default_cardio;
    default: return MET_VALUES.default;
  }
};

export const calculateCaloriesFromMet = (metValue, weightKg, durationMinutes) => {
  if (!weightKg || weightKg <= 0 || !durationMinutes || durationMinutes <= 0) return 0;
  const caloriesPerMinute = (metValue * weightKg * 3.5) / 200;
  return Math.round(caloriesPerMinute * durationMinutes);
};

export const calculateExerciseCalories = (exerciseId, trackingType, sets, userWeightKg) => {
  if (!userWeightKg || userWeightKg <= 0) return 0;
  if (!sets || !Array.isArray(sets) || sets.length === 0) return 0;

  const met = getMetValue(exerciseId, trackingType);

  let totalDurationMinutes = 0;
  let intensityMultiplier = 1.0;

  if (trackingType === 'weight') {
    const avgWeight = sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0) / sets.length;
    totalDurationMinutes = sets.length * 0.75;
    intensityMultiplier = 1.0 + (avgWeight / 100) * 0.3;
  } else if (trackingType === 'reps') {
    const avgReps = sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0) / sets.length;
    totalDurationMinutes = sets.length * 0.5;
    intensityMultiplier = 1.0 + Math.min(0.5, avgReps / 40);
  } else if (trackingType === 'time') {
    totalDurationMinutes = sets.reduce((sum, s) => sum + (parseInt(s.duration) || 0), 0) / 60;
  } else if (trackingType === 'distance') {
    const totalDistance = sets.reduce((sum, s) => sum + (parseFloat(s.distance) || 0), 0);
    totalDurationMinutes = totalDistance * 6;
    intensityMultiplier = 1.0;
  } else {
    totalDurationMinutes = sets.length * 0.5;
  }

  const effectiveMet = met * intensityMultiplier;
  return calculateCaloriesFromMet(effectiveMet, userWeightKg, totalDurationMinutes);
};

export const calculateWorkoutCalories = (workout, weightKg) => {
  if (!weightKg || weightKg <= 0) return 0;
  if (!workout || !workout.exercises) return 0;

  let totalCalories = 0;

  workout.exercises.forEach(exerciseLog => {
    const exercise = exerciseLog.exerciseData || {};
    const exerciseId = exerciseLog.exerciseId || exercise.id || '';
    const trackingType = exercise.trackingType || 'weight';
    const sets = exerciseLog.sets || [];

    totalCalories += calculateExerciseCalories(exerciseId, trackingType, sets, weightKg);
  });

  return Math.round(totalCalories);
};

export const estimateWorkoutDuration = (workout) => {
  if (!workout || !workout.exercises) return 0;

  let totalMinutes = 0;

  workout.exercises.forEach(exerciseLog => {
    const setsCount = (exerciseLog.sets || []).length;
    const exerciseTimeSeconds = (setsCount * 45) + 60;
    totalMinutes += exerciseTimeSeconds / 60;
  });

  if (workout.exercises.length > 0) {
    totalMinutes -= 1;
  }

  return Math.max(0, Math.round(totalMinutes));
};

export const calculateCaloriesPerMinute = (exerciseId, trackingType, weightKg) => {
  const met = getMetValue(exerciseId, trackingType);
  return Math.round((met * weightKg * 3.5) / 200);
};
