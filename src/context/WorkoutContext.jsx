import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { DEFAULT_EXERCISES, getExerciseById } from '../data/exercises';
import { calculateExerciseCalories, calculateWorkoutCalories } from '../utils/calorieUtils';

const WorkoutContext = createContext();

const STORAGE_KEY_EXERCISES = 'sl_exercises';
const STORAGE_KEY_WORKOUT_HISTORY = 'sl_workout_history';
const STORAGE_KEY_PERSONAL_RECORDS = 'sl_personal_records';
const STORAGE_KEY_WORKOUT_TEMPLATES = 'sl_workout_templates';
const STORAGE_KEY_USER_SETTINGS = 'sl_user_settings';
const STORAGE_KEY_MISSION_PROGRESS = 'sl_mission_progress';

export const WorkoutProvider = ({ children }) => {
  const { user } = useAuth();

  const getDefaultTemplates = () => {
    return [
      {
        id: 'template_push',
        name: 'Push Day',
        muscleGroup: 'Chest',
        exercises: [
          { exerciseId: 'chest_bench_press', sets: 4, reps: 8, weight: 60 },
          { exerciseId: 'chest_incline_press', sets: 3, reps: 10, weight: 40 },
          { exerciseId: 'chest_flyes', sets: 3, reps: 12, weight: 25 },
          { exerciseId: 'shoulders_overhead_press', sets: 4, reps: 8, weight: 30 },
          { exerciseId: 'arms_tricep_extension', sets: 3, reps: 12, weight: 20 }
        ]
      },
      {
        id: 'template_pull',
        name: 'Pull Day',
        muscleGroup: 'Back',
        exercises: [
          { exerciseId: 'back_pullups', sets: 4, reps: 'max' },
          { exerciseId: 'back_barbell_row', sets: 4, reps: 8, weight: 50 },
          { exerciseId: 'back_dumbbell_row', sets: 3, reps: 10, weight: 30 },
          { exerciseId: 'arms_bicep_curl', sets: 3, reps: 12, weight: 20 },
          { exerciseId: 'core_russian_twist', sets: 3, reps: 20, weight: 10 }
        ]
      },
      {
        id: 'template_legs',
        name: 'Leg Day',
        muscleGroup: 'Legs',
        exercises: [
          { exerciseId: 'legs_barbell_squat', sets: 4, reps: 8, weight: 80 },
          { exerciseId: 'legs_leg_press', sets: 3, reps: 10, weight: 100 },
          { exerciseId: 'legs_leg_curl', sets: 3, reps: 12, weight: 40 },
          { exerciseId: 'legs_calf_raise', sets: 4, reps: 15, weight: 0 },
          { exerciseId: 'core_plank', sets: 3, reps: 45 }
        ]
      },
      {
        id: 'template_chest_blast',
        name: 'Chest Blast',
        muscleGroup: 'Chest',
        exercises: [
          { exerciseId: 'chest_bench_press', sets: 5, reps: 5, weight: 70 },
          { exerciseId: 'chest_incline_press', sets: 4, reps: 8, weight: 50 },
          { exerciseId: 'chest_dumbbell_press', sets: 3, reps: 10, weight: 30 },
          { exerciseId: 'chest_flyes', sets: 3, reps: 12, weight: 20 },
          { exerciseId: 'chest_dips', sets: 3, reps: 'max' }
        ]
      },
      {
        id: 'template_leg_destroyer',
        name: 'Leg Destroyer',
        muscleGroup: 'Legs',
        exercises: [
          { exerciseId: 'legs_barbell_squat', sets: 5, reps: 5, weight: 100 },
          { exerciseId: 'legs_leg_press', sets: 4, reps: 10, weight: 150 },
          { exerciseId: 'legs_lunge', sets: 3, reps: 12 },
          { exerciseId: 'legs_leg_curl', sets: 4, reps: 10, weight: 40 },
          { exerciseId: 'legs_calf_raise', sets: 5, reps: 15, weight: 0 }
        ]
      },
      {
        id: 'template_shoulder_pump',
        name: 'Shoulder Pump',
        muscleGroup: 'Shoulders',
        exercises: [
          { exerciseId: 'shoulders_overhead_press', sets: 4, reps: 8, weight: 40 },
          { exerciseId: 'shoulders_dumbbell_press', sets: 3, reps: 10, weight: 24 },
          { exerciseId: 'shoulders_lateral_raise', sets: 4, reps: 12, weight: 10 },
          { exerciseId: 'shoulders_front_raise', sets: 3, reps: 12, weight: 10 },
          { exerciseId: 'shoulders_rear_delt_fly', sets: 3, reps: 15, weight: 8 }
        ]
      }
    ];
  };

  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXERCISES);
    if (saved) {
      try { return JSON.parse(saved); }
      catch (e) { return DEFAULT_EXERCISES; }
    }
    return DEFAULT_EXERCISES;
  });

  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORKOUT_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [personalRecords, setPersonalRecords] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PERSONAL_RECORDS);
    return saved ? JSON.parse(saved) : {};
  });

  const [workoutTemplates, setWorkoutTemplates] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORKOUT_TEMPLATES);
    return saved ? JSON.parse(saved) : getDefaultTemplates();
  });

  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER_SETTINGS);
    return saved ? JSON.parse(saved) : {
      weight: 70,
      height: 175,
      age: 25,
      gender: 'male'
    };
  });

  const [missionProgress, setMissionProgress] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MISSION_PROGRESS);
    return saved ? JSON.parse(saved) : {
      daily: { workoutCompleted: false, waterIntake: 0, steps: 0, proteinGoalMet: false },
      weekly: { workoutsCompleted: 0, volumeLifted: 0, totalCalories: 0 },
      streak: 0,
      lastReset: new Date().toISOString().split('T')[0],
      lastWorkoutDate: ''
    };
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises)); }, [exercises]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_WORKOUT_HISTORY, JSON.stringify(workoutHistory)); }, [workoutHistory]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PERSONAL_RECORDS, JSON.stringify(personalRecords)); }, [personalRecords]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_WORKOUT_TEMPLATES, JSON.stringify(workoutTemplates)); }, [workoutTemplates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_USER_SETTINGS, JSON.stringify(userSettings)); }, [userSettings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_MISSION_PROGRESS, JSON.stringify(missionProgress)); }, [missionProgress]);

  const addUserExercise = (exercise) => {
    const exists = exercises.some(ex => ex.id === exercise.id);
    if (exists) {
      setExercises(prev => prev.map(ex => ex.id === exercise.id ? exercise : ex));
    } else {
      setExercises(prev => [...prev, { ...exercise, id: `user_${Date.now()}` }]);
    }
  };

  const removeUserExercise = (id) => {
    const isDefault = DEFAULT_EXERCISES.some(ex => ex.id === id);
    if (isDefault) return;
    setExercises(prev => prev.filter(ex => ex.id !== id));
    setPersonalRecords(prev => {
      const newRecords = { ...prev };
      delete newRecords[id];
      return newRecords;
    });
  };

  const logWorkout = (workout) => {
    const newWorkout = {
      ...workout,
      id: Date.now(),
      date: workout.date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };
    setWorkoutHistory(prev => [newWorkout, ...prev]);
    updatePersonalRecordsFromWorkout(newWorkout);
    updateMissionProgress(newWorkout);
    updateWeeklyProgress(newWorkout);
  };

  const updatePersonalRecordsFromWorkout = (workout) => {
    setPersonalRecords(prev => {
      const newRecords = { ...prev };

      (workout.exercises || []).forEach(exerciseLog => {
        const exerciseId = exerciseLog.exerciseId;
        const exercise = exerciseLog.exerciseData || getExerciseById(exerciseId, exercises);
        if (!exercise) return;

        if (!newRecords[exerciseId]) {
          newRecords[exerciseId] = { best: {}, history: [] };
        }

        let volume = 0;
        let maxWeight = 0;
        let maxReps = 0;

        (exerciseLog.sets || []).forEach(set => {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          volume += weight * reps;
          if (weight > maxWeight) maxWeight = weight;
          if (reps > maxReps) maxReps = reps;
        });

        const trackingType = exercise.trackingType || 'weight';

        if (trackingType === 'weight') {
          if (maxWeight > (newRecords[exerciseId].best.weight || 0)) {
            newRecords[exerciseId].best.weight = maxWeight;
            newRecords[exerciseId].best.weightDate = workout.date;
          }
          if (volume > (newRecords[exerciseId].best.volume || 0)) {
            newRecords[exerciseId].best.volume = volume;
            newRecords[exerciseId].best.volumeDate = workout.date;
          }
        } else if (trackingType === 'reps') {
          if (maxReps > (newRecords[exerciseId].best.reps || 0)) {
            newRecords[exerciseId].best.reps = maxReps;
            newRecords[exerciseId].best.repsDate = workout.date;
          }
        }

        newRecords[exerciseId].history.push({
          date: workout.date,
          volume,
          weight: maxWeight,
          reps: maxReps
        });

        if (newRecords[exerciseId].history.length > 100) {
          newRecords[exerciseId].history = newRecords[exerciseId].history.slice(-100);
        }
      });

      return newRecords;
    });
  };

  const updateMissionProgress = (workout) => {
    setMissionProgress(prev => {
      const today = new Date().toISOString().split('T')[0];
      let dailyProgress = prev.daily;
      if (prev.lastReset !== today) {
        dailyProgress = { workoutCompleted: false, waterIntake: 0, steps: 0, proteinGoalMet: false };
      }
      dailyProgress.workoutCompleted = true;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = prev.streak;
      if (prev.lastWorkoutDate !== today) {
        if (prev.lastWorkoutDate === yesterdayStr) {
          newStreak = prev.streak + 1;
        } else {
          newStreak = 1;
        }
      }

      return { ...prev, daily: dailyProgress, lastReset: today, lastWorkoutDate: today, streak: newStreak };
    });
  };

  const updateWeeklyProgress = (workout) => {
    setMissionProgress(prev => {
      const totalCalories = workout.totalCalories || workout.calories || 0;
      let weeklyVolume = 0;
      if (workout.exercises) {
        workout.exercises.forEach(ex => {
          if (ex.sets) {
            ex.sets.forEach(set => {
              weeklyVolume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
            });
          }
        });
      }
      return {
        ...prev,
        weekly: {
          workoutsCompleted: (prev.weekly.workoutsCompleted || 0) + 1,
          volumeLifted: (prev.weekly.volumeLifted || 0) + weeklyVolume,
          totalCalories: (prev.weekly.totalCalories || 0) + totalCalories
        }
      };
    });
  };

  const getPersonalRecord = (exerciseId, trackingType) => {
    const record = personalRecords[exerciseId];
    if (record && record.best) {
      return record.best[trackingType] || 0;
    }
    return 0;
  };

  const getPersonalRecordDetail = (exerciseId, trackingType) => {
    const record = personalRecords[exerciseId];
    if (record && record.best) {
      const value = record.best[trackingType];
      if (value) {
        let unit = 'kg';
        if (trackingType === 'reps') unit = 'reps';
        else if (trackingType === 'time') unit = 'seconds';
        else if (trackingType === 'distance') unit = 'km';
        return { value, unit, date: record.best[`${trackingType}Date`] };
      }
    }
    return null;
  };

  const getPersonalRecordFull = (exerciseId) => {
    return personalRecords[exerciseId] || null;
  };

  const checkForNewPR = (exerciseId, weight, reps) => {
    const record = personalRecords[exerciseId];
    const prs = [];

    if (record) {
      const currentWeight = record.best?.weight || 0;
      const currentReps = record.best?.reps || 0;
      const currentVolume = record.best?.volume || 0;

      if (weight > currentWeight) {
        prs.push({ type: 'weight', newValue: weight, oldValue: currentWeight, unit: 'kg' });
      }
      if (reps > currentReps) {
        prs.push({ type: 'reps', newValue: reps, oldValue: currentReps, unit: 'reps' });
      }
      const volume = weight * reps;
      if (volume > currentVolume) {
        prs.push({ type: 'volume', newValue: volume, oldValue: currentVolume, unit: 'kg' });
      }
    } else {
      if (weight > 0) prs.push({ type: 'weight', newValue: weight, oldValue: 0, unit: 'kg' });
      if (reps > 0) prs.push({ type: 'reps', newValue: reps, oldValue: 0, unit: 'reps' });
      const volume = weight * reps;
      if (volume > 0) prs.push({ type: 'volume', newValue: volume, oldValue: 0, unit: 'kg' });
    }

    return prs;
  };

  const getExerciseHistory = (exerciseId) => {
    const record = personalRecords[exerciseId];
    return record ? record.history : [];
  };

  const suggestProgressiveOverload = (exerciseId) => {
    const exercise = getExerciseById(exerciseId, exercises);
    if (!exercise) return null;

    const history = getExerciseHistory(exerciseId);
    if (history.length === 0) {
      if (exercise.trackingType === 'weight') {
        return { type: 'weight', value: 'Start with a weight you can control for 8 reps' };
      } else if (exercise.trackingType === 'reps') {
        return { type: 'reps', value: 'Start with 8-12 reps' };
      }
      return null;
    }

    const latest = history[history.length - 1];
    const trackingType = exercise.trackingType || 'weight';

    if (trackingType === 'weight' && latest.weight) {
      return { type: 'weight', value: `Try ${latest.weight + 2.5}kg (was ${latest.weight}kg)` };
    } else if (trackingType === 'reps' && latest.reps) {
      return { type: 'reps', value: `Try ${Math.round(latest.reps * 1.1)} reps (was ${latest.reps})` };
    }

    return null;
  };

  const getLastPerformance = (exerciseId) => {
    const record = personalRecords[exerciseId];
    if (record && record.history && record.history.length > 0) {
      const last = record.history[record.history.length - 1];
      return last;
    }
    return null;
  };

  const calculateCaloriesBurned = (workout, userWeightKg) => {
    return calculateWorkoutCalories(workout, userWeightKg);
  };

  const addWorkoutTemplate = (template) => {
    const newTemplate = { ...template, id: `template_${Date.now()}` };
    setWorkoutTemplates(prev => [...prev, newTemplate]);
  };

  const removeWorkoutTemplate = (id) => {
    setWorkoutTemplates(prev => prev.filter(t => t.id !== id));
  };

  const updateUserSettings = (settings) => {
    setUserSettings(prev => ({ ...prev, ...settings }));
  };

  const resetDailyMission = () => {
    setMissionProgress(prev => ({
      ...prev,
      daily: { workoutCompleted: false, waterIntake: 0, steps: 0, proteinGoalMet: false },
      lastReset: new Date().toISOString().split('T')[0]
    }));
  };

  const updateWaterIntake = (liters) => {
    setMissionProgress(prev => ({
      ...prev,
      daily: { ...prev.daily, waterIntake: Math.min(10, prev.daily.waterIntake + liters) }
    }));
  };

  const updateSteps = (steps) => {
    setMissionProgress(prev => ({
      ...prev,
      daily: { ...prev.daily, steps: Math.min(50000, prev.daily.steps + steps) }
    }));
  };

  const setProteinGoalMet = (met) => {
    setMissionProgress(prev => ({
      ...prev,
      daily: { ...prev.daily, proteinGoalMet: met }
    }));
  };

  const clearWorkoutHistory = () => {
    setWorkoutHistory([]);
    setPersonalRecords({});
    localStorage.removeItem(STORAGE_KEY_WORKOUT_HISTORY);
    localStorage.removeItem(STORAGE_KEY_PERSONAL_RECORDS);
  };

  const value = {
    exercises,
    workoutHistory,
    personalRecords,
    workoutTemplates,
    userSettings,
    missionProgress,
    addUserExercise,
    removeUserExercise,
    logWorkout,
    getPersonalRecord,
    getPersonalRecordDetail,
    getPersonalRecordFull,
    checkForNewPR,
    getExerciseHistory,
    suggestProgressiveOverload,
    getLastPerformance,
    calculateCaloriesBurned,
    addWorkoutTemplate,
    removeWorkoutTemplate,
    updateUserSettings,
    resetDailyMission,
    updateWaterIntake,
    updateSteps,
    setProteinGoalMet,
    clearWorkoutHistory,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
