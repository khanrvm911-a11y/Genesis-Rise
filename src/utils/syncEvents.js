export const TODAYS_WORKOUT_CHANGED = 'gr-todays-workout-changed';
export const STORAGE_KEY_TODAYS_WORKOUT = 'gr_todays_workout';

export function dispatchTodaysWorkoutChanged() {
  try {
    window.dispatchEvent(new CustomEvent(TODAYS_WORKOUT_CHANGED));
  } catch {
    // silent
  }
}

export function syncWorkoutToTracker(entry) {
  if (entry && entry.type === 'workout') {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysWorkout = {
      date: todayStr,
      name: entry.name,
      exercises: entry.exercises.map(e => ({
        exerciseId: e.exerciseId,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight,
        difficulty: e.difficulty,
        xpReward: e.xpReward,
        muscleGroup: e.muscleGroup,
        trackingType: e.trackingType,
        equipment: e.equipment,
      })),
    };
    localStorage.setItem(STORAGE_KEY_TODAYS_WORKOUT, JSON.stringify(todaysWorkout));
  } else {
    localStorage.removeItem(STORAGE_KEY_TODAYS_WORKOUT);
  }
  dispatchTodaysWorkoutChanged();
}
