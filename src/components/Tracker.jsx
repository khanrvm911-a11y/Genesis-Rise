import { useState, useEffect } from 'react';
import { useLevel } from '../context/LevelContext';
import { usePowerLevel } from '../context/PowerLevelContext';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import {
  calculateWorkoutXP,
  calculatePRXP,
  calculateLevelFromXP,
  getXPForNextLevel,
  getLevelProgress,
  getLevelTitle,
} from '../utils/workoutUtils';
import {
  calculateWorkoutCalories,
  calculateExerciseCalories,
} from '../utils/calorieUtils';
import WorkoutTypeSelector from './tracker/WorkoutTypeSelector';
import ExerciseLibrary from './tracker/ExerciseLibrary';
import CustomWorkoutBuilder from './tracker/CustomWorkoutBuilder';
import ActiveWorkoutMode from './tracker/ActiveWorkoutMode';
import WorkoutCompleteScreen from './tracker/WorkoutCompleteScreen';
import AnalyticsDashboard from './tracker/AnalyticsDashboard';
import { ArrowLeft } from 'lucide-react';

const MUSCLE_GROUPS = [
  { id: 'Chest', name: 'Chest Arsenal' },
  { id: 'Back', name: 'Back Arsenal' },
  { id: 'Shoulders', name: 'Shoulders' },
  { id: 'Arms', name: 'Arms' },
  { id: 'Legs', name: 'Legion Training (Legs)' },
  { id: 'Core', name: 'Core' },
  { id: 'Cardio', name: 'Cardio' },
];

export default function Tracker() {
  const { user } = useAuth();
  const { level, xp, progress, addXP, title } = useLevel();
  const { powerLevel, weeklyChange, addPowerLevel } = usePowerLevel();
  const {
    exercises,
    logWorkout,
    workoutHistory,
    personalRecords,
    getPersonalRecord,
    getPersonalRecordDetail,
    getPersonalRecordFull,
    checkForNewPR,
    suggestProgressiveOverload,
    updateUserSettings,
    getLastPerformance,
    missionProgress,
    resetDailyMission,
    workoutTemplates,
    addWorkoutTemplate,
    removeWorkoutTemplate,
    userSettings,
  } = useWorkout();

  const [workflowStep, setWorkflowStep] = useState('workoutType');
  const [workoutType, setWorkoutType] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutCompleteData, setWorkoutCompleteData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (user && (!userSettings.weight || userSettings.weight <= 0)) {
      updateUserSettings({ weight: 70, height: 175, age: 25, gender: 'male' });
    }
  }, [user, userSettings]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (missionProgress.lastReset !== today) {
      resetDailyMission();
    }
  }, [missionProgress.lastReset]);

  const resetWorkoutState = () => {
    setWorkoutType(null);
    setSelectedMuscleGroup(null);
    setSelectedExercise(null);
    setWorkoutExercises([]);
    setCurrentExerciseIndex(0);
    setWorkoutStartTime(null);
    setWorkoutName('');
    setWorkoutCompleteData(null);
  };

  const handleWorkoutTypeSelect = (type) => {
    setWorkoutType(type);
    if (type === 'prebuilt') {
      setSelectedMuscleGroup(MUSCLE_GROUPS[0].id);
      setWorkflowStep('exerciseSelection');
    } else {
      setWorkflowStep('customWorkout');
    }
  };

  const handleBackToHome = () => {
    resetWorkoutState();
    setWorkflowStep('workoutType');
  };

  const handleMuscleGroupSelect = (group) => {
    setSelectedMuscleGroup(group);
  };

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setWorkoutExercises([exercise]);
    setCurrentExerciseIndex(0);
    setWorkoutStartTime(Date.now());
    setWorkoutName(exercise.name);
    setWorkflowStep('activeWorkout');
  };

  const handleCustomWorkoutComplete = (workout) => {
    if (!workout.exercises || workout.exercises.length === 0) return;

    const exercisesWithData = workout.exercises.map(e => {
      const exData = exercises.find(ex => ex.id === e.exerciseId);
      const data = exData || { id: e.exerciseId, name: e.name || 'Unknown', trackingType: 'weight', difficulty: 'Intermediate', xpReward: 20, muscleGroup: 'Other', equipment: 'Free Weight' };
      return {
        ...e,
        id: data.id,
        name: data.name,
        trackingType: data.trackingType,
        muscleGroup: data.muscleGroup,
        equipment: data.equipment,
        difficulty: data.difficulty,
        xpReward: data.xpReward,
        exerciseData: data,
        _sets: [],
      };
    });

    setWorkoutExercises(exercisesWithData);
    setWorkoutName(workout.name || 'Custom Workout');
    setCurrentExerciseIndex(0);
    setSelectedExercise(exercisesWithData[0]);
    setWorkoutStartTime(Date.now());
    setWorkflowStep('activeWorkout');
  };

  const handleUpdateExerciseSets = (index, sets) => {
    setWorkoutExercises(prev => prev.map((ex, i) =>
      i === index ? { ...ex, _sets: sets } : ex
    ));
  };

  const handleGoToNextExercise = () => {
    if (currentExerciseIndex < workoutExercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setSelectedExercise(workoutExercises[nextIndex]);
    } else {
      handleCompleteWorkout();
    }
  };

  const handleCompleteWorkout = () => {
    const endTime = Date.now();
    const durationMs = workoutStartTime ? (endTime - workoutStartTime) : 0;
    const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));

    const exerciseLogs = workoutExercises.map(ex => ({
      exerciseId: ex.exerciseId || ex.id,
      exerciseData: ex.exerciseData || ex,
      sets: ex._sets || [],
    }));

    const workoutForCalories = { exercises: exerciseLogs };
    const userWeight = userSettings.weight || 70;
    const totalCalories = calculateWorkoutCalories(workoutForCalories, userWeight);

    let totalVolume = 0;
    let totalSets = 0;

    workoutExercises.forEach(ex => {
      (ex._sets || []).forEach(set => {
        totalVolume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
        totalSets++;
      });
    });

    const workoutXP = calculateWorkoutXP({
      duration: durationMinutes,
      calories: totalCalories,
      totalVolume,
      exercisesCount: workoutExercises.length,
      totalSets,
    });

    const prsFound = [];
    workoutExercises.forEach(ex => {
      (ex._sets || []).forEach(set => {
        const weight = parseFloat(set.weight) || 0;
        const reps = parseInt(set.reps) || 0;
        if (weight > 0 || reps > 0) {
          const prs = checkForNewPR(ex.exerciseId || ex.id, weight, reps);
          prs.forEach(pr => {
            const existing = prsFound.find(p => p.exercise === ex.name && p.type === pr.type);
            if (!existing || pr.newValue > existing.newValue) {
              if (!existing) {
                prsFound.push({ ...pr, exercise: ex.name });
              } else {
                Object.assign(existing, pr, { exercise: ex.name });
              }
            }
          });
        }
      });
    });

    const prXP = prsFound.reduce((sum, pr) => sum + calculatePRXP(pr.type), 0);
    const totalXP = workoutXP + prXP;

    const workoutToLog = {
      name: workoutName,
      exercises: exerciseLogs,
      duration: durationMinutes,
      totalVolume,
      totalCalories,
      xpGained: totalXP,
      prs: prsFound,
      totalSets,
      exercisesCount: workoutExercises.length,
    };

    logWorkout(workoutToLog);
    addXP(totalXP);

    const powerGain = Math.floor(totalVolume * 0.005) + Math.floor(durationMinutes / 5) + prsFound.length * 10;
    addPowerLevel(powerGain);

    const calorieBreakdown = workoutExercises.map(ex => {
      const sets = ex._sets || [];
      const exCalories = calculateExerciseCalories(
        ex.exerciseId || ex.id,
        ex.exerciseData?.trackingType || 'weight',
        sets,
        userWeight
      );
      return { name: ex.name, calories: exCalories };
    });

    const xpForNext = getXPForNextLevel(level);
    const newProgress = getLevelProgress(xp + totalXP, level);

    setWorkoutCompleteData({
      duration: durationMinutes,
      totalVolume,
      totalCalories,
      xpGained: totalXP,
      prXP,
      powerGain,
      exerciseName: workoutExercises.map(e => e.name).join(', '),
      exercisesCompleted: workoutExercises.filter(ex => (ex._sets || []).length > 0).length,
      totalSets,
      newPRs: prsFound,
      progressBefore: progress,
      progressAfter: newProgress,
      powerBefore: powerLevel,
      powerAfter: powerLevel + powerGain,
      xpBefore: xp,
      xpAfter: xp + totalXP,
      levelBefore: level,
      levelAfter: calculateLevelFromXP(xp + totalXP),
      titleBefore: getLevelTitle(level),
      titleAfter: getLevelTitle(calculateLevelFromXP(xp + totalXP)),
      calorieBreakdown,
      xpForNext,
      workoutName,
    });

    setWorkflowStep('complete');
  };

  const handleNewWorkout = () => {
    resetWorkoutState();
    setWorkflowStep('workoutType');
  };

  const handleViewAnalytics = () => {
    setShowAnalytics(true);
    setWorkflowStep('analytics');
  };

  const handleBackFromAnalytics = () => {
    setShowAnalytics(false);
    setWorkflowStep(workoutCompleteData ? 'complete' : 'workoutType');
  };

  const getExercisesByGroup = (group) => {
    if (!group || !exercises) return [];
    return exercises.filter(ex => ex.muscleGroup === group);
  };

  const stepTitle = () => {
    switch (workflowStep) {
      case 'workoutType': return 'Tracker';
      case 'exerciseSelection': return selectedMuscleGroup ? `${selectedMuscleGroup} Exercises` : 'Select Muscle Group';
      case 'customWorkout': return 'Custom Workout';
      case 'activeWorkout': return workoutName || 'Active Workout';
      case 'complete': return 'Workout Complete';
      case 'analytics': return 'Analytics';
      default: return 'Tracker';
    }
  };

  const showBackButton = workflowStep !== 'workoutType' && workflowStep !== 'analytics';

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button onClick={handleBackToHome} className="flex items-center gap-1 text-sl-gray-light hover:text-white text-sm touch-target">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl font-bold gradient-text">
              {stepTitle()}
            </h1>
          </div>
          {workflowStep === 'complete' && (
            <button onClick={handleNewWorkout} className="holo-button holo-button-primary px-4 py-2 text-sm">
              New Workout
            </button>
          )}
        </div>

        {workflowStep === 'workoutType' && (
          <WorkoutTypeSelector
            onSelect={handleWorkoutTypeSelect}
            onViewAnalytics={() => {
              setShowAnalytics(true);
              setWorkflowStep('analytics');
            }}
          />
        )}

        {workflowStep === 'exerciseSelection' && (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none -mx-1 px-1">
              {MUSCLE_GROUPS.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedMuscleGroup(group.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap touch-target ${
                    selectedMuscleGroup === group.id
                      ? 'bg-sl-purple text-white shadow-lg'
                      : 'bg-sl-gray/20 text-sl-gray-light hover:bg-sl-gray/30'
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>

            <ExerciseLibrary
              muscleGroup={selectedMuscleGroup}
              onSelectExercise={handleExerciseSelect}
              onBack={handleBackToHome}
              exercises={getExercisesByGroup(selectedMuscleGroup)}
              getLastPerformance={getLastPerformance}
            />
          </div>
        )}

        {workflowStep === 'customWorkout' && (
          <CustomWorkoutBuilder
            onComplete={handleCustomWorkoutComplete}
            onBack={handleBackToHome}
            onReset={handleBackToHome}
            exercises={exercises}
            templates={workoutTemplates}
            addWorkoutTemplate={addWorkoutTemplate}
            removeWorkoutTemplate={removeWorkoutTemplate}
          />
        )}

        {workflowStep === 'activeWorkout' && selectedExercise && (
          <ActiveWorkoutMode
            key={`exercise-${currentExerciseIndex}`}
            exercise={selectedExercise}
            exerciseIndex={currentExerciseIndex}
            totalExercises={workoutExercises.length}
            workoutName={workoutName}
            onSkipExercise={handleGoToNextExercise}
            onCompleteWorkout={handleCompleteWorkout}
            onReset={handleBackToHome}
            checkForNewPR={checkForNewPR}
            userSettings={userSettings}
            userWeight={userSettings.weight || 70}
            onUpdateSets={handleUpdateExerciseSets}
          />
        )}

        {workflowStep === 'complete' && workoutCompleteData && (
          <WorkoutCompleteScreen
            data={workoutCompleteData}
            onNewWorkout={handleNewWorkout}
            onViewAnalytics={handleViewAnalytics}
            level={level}
            xp={xp}
            progress={progress}
            title={title}
          />
        )}

        {workflowStep === 'analytics' && (
          <div className="space-y-4">
            <AnalyticsDashboard
              workoutHistory={workoutHistory}
              personalRecords={personalRecords}
              userSettings={userSettings}
              onBack={handleBackFromAnalytics}
            />
          </div>
        )}
      </div>
    </div>
  );
}
