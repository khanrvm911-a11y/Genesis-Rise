import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_EXERCISES, getExerciseById } from '../data/exercises';

const WorkoutContext = createContext();

// Storage keys
const STORAGE_KEY_EXERCISES = 'sl_exercises'; // all exercises (default + user)
const STORAGE_KEY_WORKOUT_HISTORY = 'sl_workout_history';
const STORAGE_KEY_PERSONAL_RECORDS = 'sl_personal_records';
const STORAGE_KEY_WORKOUT_TEMPLATES = 'sl_workout_templates';

export const WorkoutProvider = ({ children }) => {
  // Function to get default workout templates
  const getDefaultTemplates = () => {
    return [
      {
        id: 'template_full_body',
        name: 'Full Body Beginner',
        exercises: [
          { exerciseId: 'chest_pushup', defaultSets: 3, defaultReps: 10 },
          { exerciseId: 'back_pullups', defaultSets: 3, defaultReps: 8 },
          { exerciseId: 'legs_squat', defaultSets: 3, defaultReps: 12 },
          { exerciseId: 'core_plank', defaultSets: 3, defaultReps: 30 }, // time in seconds
          { exerciseId: 'cardio_jumping_rope', defaultSets: 3, defaultReps: 60 } // time in seconds
        ]
      },
      {
        id: 'template_upper_lower',
        name: 'Upper/Lower Split (Day 1: Upper)',
        exercises: [
          { exerciseId: 'chest_bench_press', defaultSets: 4, defaultReps: 10, defaultWeight: 20 },
          { exerciseId: 'back_barbell_row', defaultSets: 4, defaultReps: 10, defaultWeight: 20 },
          { exerciseId: 'shoulders_overhead_press', defaultSets: 3, defaultReps: 12, defaultWeight: 10 },
          { exerciseId: 'arms_bicep_curl', defaultSets: 3, defaultReps: 15, defaultWeight: 8 },
          { exerciseId: 'arms_tricep_extension', defaultSets: 3, defaultReps: 15, defaultWeight: 8 }
        ]
      },
      {
        id: 'template_hiit',
        name: 'HIIT Finisher',
        exercises: [
          { exerciseId: 'fullbody_burpee', defaultSets: 4, defaultReps: 15 },
          { exerciseId: 'cardio_jumping_rope', defaultSets: 4, defaultReps: 45 }, // seconds
          { exerciseId: 'core_mountain_climber', defaultSets: 4, defaultReps: 30 } // seconds
        ]
      }
    ];
  };

  // Initialize exercises from localStorage or defaults
  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXERCISES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse exercises from localStorage', e);
        return DEFAULT_EXERCISES;
      }
    }
    return DEFAULT_EXERCISES;
  });

  // Initialize workout history
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORKOUT_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize personal records
  const [personalRecords, setPersonalRecords] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PERSONAL_RECORDS);
    return saved ? JSON.parse(saved) : {};
  });

  // Initialize workout templates
  const [workoutTemplates, setWorkoutTemplates] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORKOUT_TEMPLATES);
    return saved ? JSON.parse(saved) : getDefaultTemplates();
  });

  // Persist exercises to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
  }, [exercises]);

  // Persist workout history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORKOUT_HISTORY, JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Persist personal records
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PERSONAL_RECORDS, JSON.stringify(personalRecords));
  }, [personalRecords]);

  // Persist workout templates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORKOUT_TEMPLATES, JSON.stringify(workoutTemplates));
  }, [workoutTemplates]);

  // Function to add a user-defined exercise
  const addUserExercise = (exercise) => {
    // Check if exercise with same id already exists (user exercise)
    const exists = exercises.some(ex => ex.id === exercise.id);
    if (exists) {
      // Update existing exercise
      setExercises(prev => prev.map(ex => ex.id === exercise.id ? exercise : ex));
    } else {
      // Add new exercise
      setExercises(prev => [...prev, exercise]);
    }
  };

  // Function to remove a user-defined exercise (by id)
  const removeUserExercise = (id) => {
    // Don't allow removing default exercises
    const isDefault = DEFAULT_EXERCISES.some(ex => ex.id === id);
    if (isDefault) {
      console.warn('Cannot remove default exercise');
      return;
    }
    setExercises(prev => prev.filter(ex => ex.id !== id));
    // Also remove from personal records if exists
    setPersonalRecords(prev => {
      const newRecords = { ...prev };
      delete newRecords[id];
      return newRecords;
    });
  };

  // Function to log a workout
  const logWorkout = (workout) => {
    // Add workout to history
    const newWorkout = {
      ...workout,
      id: Date.now(),
      date: workout.date || new Date().toISOString().split('T')[0]
    };
    setWorkoutHistory(prev => [newWorkout, ...prev]); // newest first

    // Update personal records based on the workout
    updatePersonalRecordsFromWorkout(newWorkout);
  };

  // Function to update personal records from a logged workout
  const updatePersonalRecordsFromWorkout = (workout) => {
    setPersonalRecords(prev => {
      const newRecords = { ...prev };

      workout.exercises.forEach(exerciseLog => {
        const exerciseId = exerciseLog.exerciseId;
        const exercise = getExerciseById(exerciseId, exercises);
        if (!exercise) return;

        // Initialize record for this exercise if not exists
        if (!newRecords[exerciseId]) {
          newRecords[exerciseId] = {
            best: {},
            history: []
          };
        }

        // Calculate volume or best value based on tracking type
        let volume = 0;
        let bestValue = null;

        if (exercise.trackingType === 'weight') {
          // For weight exercises, calculate max weight lifted in any set
          const maxWeight = Math.max(...exerciseLog.sets.map(set => set.weight || 0));
          volume = exerciseLog.sets.reduce((sum, set) => {
            return sum + ((set.weight || 0) * (set.reps || 0));
          }, 0);
          bestValue = maxWeight;
        } else if (exercise.trackingType === 'reps') {
          // For rep exercises, calculate max reps in any set
          const maxReps = Math.max(...exerciseLog.sets.map(set => set.reps || 0));
          volume = exerciseLog.sets.reduce((sum, set) => sum + (set.reps || 0), 0);
          bestValue = maxReps;
        } else if (exercise.trackingType === 'time') {
          // For time exercises, calculate max time in any set
          const maxTime = Math.max(...exerciseLog.sets.map(set => set.duration || 0));
          volume = exerciseLog.sets.reduce((sum, set) => sum + (set.duration || 0), 0);
          bestValue = maxTime;
        } else if (exercise.trackingType === 'distance') {
          // For distance exercises, calculate total distance
          volume = exerciseLog.sets.reduce((sum, set) => sum + (set.distance || 0), 0);
          bestValue = volume; // total distance is the best value for cardio
        }

        // Update best value if this is better
        if (bestValue !== null) {
          const currentBest = newRecords[exerciseId].best[exercise.trackingType] || 0;
          if (bestValue > currentBest) {
            newRecords[exerciseId].best[exercise.trackingType] = bestValue;
          }
        }

        // Add to history
        newRecords[exerciseId].history.push({
          date: workout.date,
          volume: volume,
          // Also store the specific metric for tracking type
          [exercise.trackingType]: bestValue
        });

        // Limit history to last 50 entries
        if (newRecords[exerciseId].history.length > 50) {
          newRecords[exerciseId].history = newRecords[exerciseId].history.slice(-50);
        }
      });

      return newRecords;
    });
  };

  // Function to get personal record for an exercise and tracking type
  const getPersonalRecord = (exerciseId, trackingType) => {
    const record = personalRecords[exerciseId];
    if (record && record.best) {
      return record.best[trackingType] || 0;
    }
    return 0;
  };

  // Function to get workout history for an exercise
  const getExerciseHistory = (exerciseId) => {
    const record = personalRecords[exerciseId];
    return record ? record.history : [];
  };

  // Function to suggest progressive overload for an exercise
  const suggestProgressiveOverload = (exerciseId) => {
    const exercise = getExerciseById(exerciseId, exercises);
    if (!exercise) return null;

    const history = getExerciseHistory(exerciseId);
    if (history.length === 0) {
      // No history, suggest starting point based on exercise type
      if (exercise.trackingType === 'weight') {
        return { type: 'weight', value: 'Start with light weight (e.g., 5kg)' };
      } else if (exercise.trackingType === 'reps') {
        return { type: 'reps', value: 'Start with 8-12 reps' };
      } else if (exercise.trackingType === 'time') {
        return { type: 'time', value: 'Start with 20-30 seconds' };
      } else if (exercise.trackingType === 'distance') {
        return { type: 'distance', value: 'Start with 1km' };
      }
      return null;
    }

    // Get latest entry
    const latest = history[history.length - 1];
    let suggestion = null;

    if (exercise.trackingType === 'weight') {
      // Suggest adding 2.5kg or 5lb
      suggestion = {
        type: 'weight',
        value: `Increase weight by 2.5kg (current: ${latest.weight || latest[exercise.trackingType]}kg)`
      };
    } else if (exercise.trackingType === 'reps') {
      // Suggest adding 2 reps
      suggestion = {
        type: 'reps',
        value: `Add 2 reps (current: ${latest.reps || latest[exercise.trackingType]} reps)`
      };
    } else if (exercise.trackingType === 'time') {
      // Suggest adding 10 seconds
      suggestion = {
        type: 'time',
        value: `Add 10 seconds (current: ${latest.duration || latest[exercise.trackingType]} seconds)`
      };
    } else if (exercise.trackingType === 'distance') {
      // Suggest adding 0.5km
      suggestion = {
        type: 'distance',
        value: `Add 0.5km (current: ${latest.distance || latest[exercise.trackingType]}km)`
      };
    }

    return suggestion;
  };

  // Function to add a workout template
  const addWorkoutTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: Date.now() // simple id generation
    };
    setWorkoutTemplates(prev => [...prev, newTemplate]);
  };

  // Function to remove a workout template
  const removeWorkoutTemplate = (id) => {
    setWorkoutTemplates(prev => prev.filter(t => t.id !== id));
  };

  const value = {
    // State
    exercises,
    workoutHistory,
    personalRecords,
    workoutTemplates,

    // Actions
    addUserExercise,
    removeUserExercise,
    logWorkout,
    getPersonalRecord,
    getExerciseHistory,
    suggestProgressiveOverload,
    addWorkoutTemplate,
    removeWorkoutTemplate
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