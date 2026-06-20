import { useState, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { useLevel } from '../context/LevelContext';
import { calculateWorkoutXP } from '../utils/workoutUtils';
import { getExerciseById } from '../data/exercises';

const WorkoutLogger = () => {
  const { exercises, logWorkout, getPersonalRecord, suggestProgressiveOverload } = useWorkout();
  const { addXP } = useLevel();

  const [formState, setFormState] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    exercises: [] // Array of exercise logs
  });

  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseLogState, setExerciseLogState] = useState({
    sets: [{ weight: '', reps: '', duration: '', distance: '' }] // Initialize with one empty set
  });

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [lastXPGained, setLastXPGained] = useState(0);
  const [suggestion, setSuggestion] = useState(null);

  // Save workout to localStorage whenever it changes (optional, handled by context)
  useEffect(() => {
    // This is handled by the context's logWorkout function
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormState(prev => ({ ...prev, date }));
  };

  // Handle exercise selection
  const handleExerciseSelect = (e) => {
    const exerciseId = e.target.value;
    setSelectedExerciseId(exerciseId);

    // Get personal record and suggestion for this exercise
    const exercise = getExerciseById(exerciseId, exercises);
    if (exercise) {
      const personalRecord = getPersonalRecord(exerciseId, exercise.trackingType);
      const progressiveSuggestion = suggestProgressiveOverload(exerciseId);

      // Set suggestion based on PR and progressive overload
      if (personalRecord > 0) {
        setSuggestion({
          type: 'pr',
          value: `Your PR: ${personalRecord} ${exercise.trackingType === 'time' ? 'seconds' : exercise.trackingType === 'distance' ? 'km' : exercise.trackingType === 'weight' ? 'kg' : 'reps'}`
        });
      } else if (progressiveSuggestion) {
        setSuggestion(progressiveSuggestion);
      } else {
        setSuggestion(null);
      }
    } else {
      setSuggestion(null);
    }

    // Reset exercise log state when selecting a new exercise
    setExerciseLogState({
      sets: [{ weight: '', reps: '', duration: '', distance: '' }]
    });
  };

  // Handle exercise log changes (sets, reps, weight, etc.)
  const handleExerciseLogChange = (setIndex, field, value) => {
    setExerciseLogState(prev => {
      const newSets = [...prev.sets];
      if (!newSets[setIndex]) newSets[setIndex] = {};
      newSets[setIndex][field] = value;
      return { sets: newSets };
    });
  };

  // Add a new set
  const addSet = () => {
    setExerciseLogState(prev => ({
      sets: [...prev.sets, { weight: '', reps: '', duration: '', distance: '' }]
    }));
  };

  // Remove a set
  const removeSet = (setIndex) => {
    setExerciseLogState(prev => {
      if (prev.sets.length <= 1) return prev; // Keep at least one set
      const newSets = [...prev.sets];
      newSets.splice(setIndex, 1);
      return { sets: newSets };
    });
  };

  // Add the current exercise to the workout
  const addExerciseToWorkout = () => {
    if (!selectedExerciseId) return;

    const exercise = getExerciseById(selectedExerciseId, exercises);
    if (!exercise) return;

    // Validate sets
    const validSets = exerciseLogState.sets.filter(set => {
      // For weight/reps exercises, check weight and reps
      if (exercise.trackingType === 'weight' || exercise.trackingType === 'reps') {
        return set.weight !== '' && set.reps !== '';
      }
      // For time exercises, check duration
      if (exercise.trackingType === 'time') {
        return set.duration !== '';
      }
      // For distance exercises, check distance
      if (exercise.trackingType === 'distance') {
        return set.distance !== '';
      }
      return true;
    });

    if (validSets.length === 0) {
      alert('Please fill in all required fields for at least one set');
      return;
    }

    // Add exercise to workout
    setFormState(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: selectedExerciseId,
          sets: validSets
        }
      ]
    }));

    // Reset exercise log state
    setExerciseLogState({
      sets: [{ weight: '', reps: '', duration: '', distance: '' }]
    });
    setSelectedExerciseId('');
    setSuggestion(null);
  };

  // Remove an exercise from the workout
  const removeExerciseFromWorkout = (index) => {
    setFormState(prev => {
      const newExercises = [...prev.exercises];
      newExercises.splice(index, 1);
      return { exercises: newExercises };
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formState.exercises.length === 0) {
      alert('Please add at least one exercise to your workout');
      return;
    }

    // Create workout object
    const workout = {
      name: formState.name || 'Workout',
      date: formState.date,
      exercises: formState.exercises
    };

    // Log workout (this updates history and personal records)
    logWorkout(workout);

    // Calculate and add XP
    const xpGained = calculateWorkoutXP({ duration: 0, calories: 0 }); // We'll calculate XP differently for strength training
    // For now, we'll give XP based on number of exercises and sets
    const baseXP = 10;
    const exerciseXP = formState.exercises.length * 5;
    const setXP = formState.exercises.reduce((sum, ex) => sum + ex.sets.length * 2, 0);
    const totalXP = baseXP + exerciseXP + setXP;

    addXP(totalXP);
    setLastXPGained(totalXP);

    // Reset form
    setFormState({
      name: '',
      date: new Date().toISOString().split('T')[0],
      exercises: []
    });
    setSelectedExerciseId('');
    setExerciseLogState({
      sets: [{ weight: '', reps: '', duration: '', distance: '' }]
    });
    setSuggestion(null);
  };

  // Get tracking type label
  const getTrackingTypeLabel = (trackingType) => {
    switch (trackingType) {
      case 'weight': return 'Weight (kg)';
      case 'reps': return 'Reps';
      case 'time': return 'Duration (seconds)';
      case 'distance': return 'Distance (km)';
      default: return 'Value';
    }
  };

  // Get tracking type unit
  const getTrackingTypeUnit = (trackingType) => {
    switch (trackingType) {
      case 'weight': return 'kg';
      case 'reps': return '';
      case 'time': return 'sec';
      case 'distance': return 'km';
      default: return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center gradient-text animate-pulse-red mb-2">
          Advanced Workout Logger
        </h1>
        <p className="text-center text-sl-gray-light max-w-2xl mx-auto">
          Log your strength training, track sets/reps/weight, and monitor your progressive overload.
        </p>
        {lastXPGained > 0 && (
          <div className="text-center text-emerald-400 mt-4 font-bold animate-bounce">
            + {lastXPGained} XP gained! level progress updated.
          </div>
        )}
      </div>

      {/* Workout Form */}
      <form onSubmit={handleSubmit} className="bg-sl-gray/20 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-red/20 shadow-sl-glow mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Workout Name</label>
          <input
            type="text"
            name="name"
            value={formState.name}
            onChange={handleChange}
            className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
            placeholder="e.g. Chest Day, Leg Day, Full Body"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formState.date}
            onChange={e => handleDateChange(e.target.value)}
            className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
          />
        </div>

        {/* Exercise Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Add Exercise</label>
          <div className="space-y-4">
            <select
              value={selectedExerciseId}
              onChange={handleExerciseSelect}
              className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
            >
              <option value="" className="bg-sl-gray text-white">-- Select an exercise --</option>
              <optgroup label="Chest" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Chest', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Back" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Back', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Legs" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Legs', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Shoulders" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Shoulders', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Arms" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Arms', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Core" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Core', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Cardio" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Cardio', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Full Body" className="bg-sl-gray text-sl-red-light font-bold">
                {getExercisesByMuscleGroup('Full Body', exercises).map(ex => (
                  <option key={ex.id} value={ex.id} className="bg-sl-gray text-white">
                    {ex.name}
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Personal Record and Suggestion */}
            {selectedExerciseId && suggestion && (
              <div className="text-sm text-sl-gray-light/70 mt-2 p-3 bg-sl-gray/10 rounded-sl">
                {suggestion.type === 'pr' && (
                  <p><strong>Personal Record:</strong> {suggestion.value}</p>
                )}
                {(suggestion.type === 'weight' || suggestion.type === 'reps' || suggestion.type === 'time' || suggestion.type === 'distance') && (
                  <p><strong>Progressive Overload Suggestion:</strong> {suggestion.value}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Exercise Log Form */}
        {selectedExerciseId && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">
              {getExerciseById(selectedExerciseId, exercises)?.name || ''} Log
            </label>

            <div className="space-y-4">
              {/* Sets */}
              {exerciseLogState.sets.map((set, setIndex) => (
                <div key={setIndex} className="border-sl-red/10 border p-4 rounded-sl mb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sl-red-light">Set {setIndex + 1}</h4>
                    <button
                      onClick={() => removeSet(setIndex)}
                      className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10"
                      disabled={exerciseLogState.sets.length <= 1}
                    >
                      −
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Weight Input */}
                    <div>
                      <label className="block text-xs font-medium text-sl-gray-light/70 mb-1">
                        Weight
                      </label>
                      <input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => handleExerciseLogChange(setIndex, 'weight', e.target.value)}
                        className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                        placeholder="e.g. 20"
                        min="0"
                        step="0.5"
                      />
                    </div>

                    {/* Reps Input */}
                    <div>
                      <label className="block text-xs font-medium text-sl-gray-light/70 mb-1">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => handleExerciseLogChange(setIndex, 'reps', e.target.value)}
                        className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                        placeholder="e.g. 12"
                        min="0"
                      />
                    </div>

                    {/* Duration Input (for time-based exercises) */}
                    <div>
                      <label className="block text-xs font-medium text-sl-gray-light/70 mb-1">
                        Duration
                      </label>
                      <input
                        type="number"
                        value={set.duration || ''}
                        onChange={(e) => handleExerciseLogChange(setIndex, 'duration', e.target.value)}
                        className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                        placeholder="e.g. 30"
                        min="0"
                      />
                    </div>

                    {/* Distance Input (for cardio exercises) */}
                    <div>
                      <label className="block text-xs font-medium text-sl-gray-light/70 mb-1">
                        Distance
                      </label>
                      <input
                        type="number"
                        value={set.distance || ''}
                        onChange={(e) => handleExerciseLogChange(setIndex, 'distance', e.target.value)}
                        className="holo-input w-full text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                        placeholder="e.g. 5"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={addSet}
                  className="holo-button holo-button-sm px-3 py-1 mr-2"
                >
                  Add Set
                </button>
                <button
                  onClick={addExerciseToWorkout}
                  className="holo-button px-4 py-2"
                >
                  Add Exercise to Workout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Exercises in Workout */}
        {formState.exercises.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-sl-red-light mb-4">
              Exercises in Workout
            </h3>
            <div className="space-y-4">
              {formState.exercises.map((exerciseLog, index) => (
                <div key={index} className="border-sl-red/10 border p-4 rounded-sl">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sl-red-light">
                      {getExerciseById(exerciseLog.exerciseId, exercises)?.name || 'Unknown Exercise'}
                    </h4>
                    <button
                      onClick={() => removeExerciseFromWorkout(index)}
                      className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10"
                    >
                      −
                    </button>
                  </div>

                  <div className="space-y-2">
                    {exerciseLog.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex flex-wrap items-center gap-4 text-sm text-sl-gray-light/70">
                        <span className="flex-1 min-w-[80px]">Set {setIndex + 1}:</span>
                        {(getExerciseById(exerciseLog.exerciseId, exercises)?.trackingType === 'weight' ||
                          getExerciseById(exerciseLog.exerciseId, exercises)?.trackingType === 'reps') && (
                          <>
                            <span className="mr-2">Weight: {set.weight || '-'} kg</span>
                            <span className="mr-2">Reps: {set.reps || '-'}</span>
                          </>
                        )}
                        {getExerciseById(exerciseLog.exerciseId, exercises)?.trackingType === 'time' && (
                          <span className="mr-2">Duration: {set.duration || '-'} seconds</span>
                        )}
                        {getExerciseById(exerciseLog.exerciseId, exercises)?.trackingType === 'distance' && (
                          <span className="mr-2">Distance: {set.distance || '-'} km</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={formState.exercises.length === 0}
            className={`holo-button w-full py-3 ${formState.exercises.length === 0 ? 'opacity-70' : ''}`}
          >
            Log Workout & Extract XP
          </button>
        </div>
      </form>

      {/* Workout History */}
      <div className="bg-sl-gray/20 backdrop-blur-sm rounded-sl-xl border border-sl-red/20 shadow-sl-glow p-6">
        <h2 className="text-2xl font-bold text-sl-red-light mb-6 border-b border-sl-red/15 pb-2">
          Strength Training History
        </h2>

        {/* This would show detailed workout history - for now we'll use the existing Tracker component */}
        <div className="text-center text-sl-gray-light/60 py-8">
          <p>Workout history will be displayed here after logging workouts.</p>
          <p className="mt-2 text-sm">Check the Workout Tracker tab for your complete workout history.</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get exercises by muscle group (since we don't have the hook here)
const getExercisesByMuscleGroup = (muscleGroup, exercises) => {
  return exercises.filter(ex => ex.muscleGroup === muscleGroup);
};

export default WorkoutLogger;