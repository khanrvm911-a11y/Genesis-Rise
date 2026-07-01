import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Planner = lazy(() => import('./Planner'));
import { useLevel } from '../context/LevelContext';
import { usePowerLevel } from '../context/PowerLevelContext';
import { useWorkout } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { TODAYS_WORKOUT_CHANGED } from '../utils/syncEvents';
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
import {
  createWorkoutSession,
  completeWorkoutSession,
  setupAutoSync,
  syncOfflineQueue,
  getOfflineQueueSize,
} from '../utils/autoSaveUtils';
import ActiveWorkoutMode from './tracker/ActiveWorkoutMode';
import WorkoutCompleteScreen from './tracker/WorkoutCompleteScreen';
import AnalyticsDashboard from './tracker/AnalyticsDashboard';
import { ArrowLeft, Dumbbell, Moon, CloudOff } from 'lucide-react';

const STORAGE_KEY_SESSION = 'gr_active_workout_session';
const STORAGE_KEY_TODAYS_WORKOUT = 'gr_todays_workout';
const STORAGE_KEY_SCHEDULE = 'gr_workout_schedule';
const STORAGE_KEY_COMPLETED_WORKOUT = 'gr_todays_completed_workout';

const getLocalDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDateStrFromISO = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const motionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function Tracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { level, xp, progress, addXP, title } = useLevel();
  const { powerLevel, addPowerLevel } = usePowerLevel();
  const { addNotification } = useNotification();
  const {
    exercises,
    logWorkout,
    workoutHistory,
    personalRecords,
    checkForNewPR,
    updateUserSettings,
    missionProgress,
    resetDailyMission,
    userSettings,
  } = useWorkout();

  const [workflowStep, setWorkflowStep] = useState('idle');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutCompleteData, setWorkoutCompleteData] = useState(null);
  const [todaysCompletedWorkout, setTodaysCompletedWorkout] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLETED_WORKOUT);
      if (saved) {
        const parsed = JSON.parse(saved);
        const localToday = getLocalDateStr();
        const completedDate = parsed.completedAt
          ? getDateStrFromISO(parsed.completedAt)
          : localToday;
        if (completedDate === localToday) return parsed;
        localStorage.removeItem(STORAGE_KEY_COMPLETED_WORKOUT);
      }
    } catch {}
    return null;
  });

  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionActiveTime, setSessionActiveTime] = useState(0);
  const [sessionIsResting, setSessionIsResting] = useState(false);
  const [isTodayCompleted, setIsTodayCompleted] = useState(false);
  const [todayDayType, setTodayDayType] = useState(null);
  const [syncKey, setSyncKey] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [offlineQueueSize, setOfflineQueueSize] = useState(0);
  const [showPlanner, setShowPlanner] = useState(false);
  const syncCleanupRef = useRef(null);

  useEffect(() => {
    const handler = () => setSyncKey(k => k + 1);
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') setSyncKey(k => k + 1);
    };
    window.addEventListener(TODAYS_WORKOUT_CHANGED, handler);
    document.addEventListener('visibilitychange', refreshOnFocus);
    window.addEventListener('focus', refreshOnFocus);

    setOfflineQueueSize(getOfflineQueueSize());
    syncCleanupRef.current = setupAutoSync((result) => {
      setOfflineQueueSize(0);
    });

    return () => {
      window.removeEventListener(TODAYS_WORKOUT_CHANGED, handler);
      document.removeEventListener('visibilitychange', refreshOnFocus);
      window.removeEventListener('focus', refreshOnFocus);
      if (syncCleanupRef.current) syncCleanupRef.current();
    };
  }, []);

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

  const loadExercisesWithData = (data) => {
    return data.exercises.map(e => {
      const exData = exercises.find(ex => ex.id === e.exerciseId);
      const fallback = {
        id: e.exerciseId,
        name: e.name || 'Unknown',
        trackingType: e.trackingType || 'weight',
        difficulty: e.difficulty || 'Intermediate',
        xpReward: e.xpReward || 20,
        muscleGroup: e.muscleGroup || 'Other',
        equipment: e.equipment || '',
      };
      return {
        exerciseId: e.exerciseId,
        name: (exData || fallback).name,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight,
        trackingType: (exData || fallback).trackingType,
        muscleGroup: (exData || fallback).muscleGroup,
        equipment: (exData || fallback).equipment,
        difficulty: (exData || fallback).difficulty,
        xpReward: (exData || fallback).xpReward,
        exerciseData: exData || fallback,
        _sets: e._sets || [],
      };
    });
  };

  useEffect(() => {
    const todayLocal = getLocalDateStr();

    const savedCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED_WORKOUT);
    let hasCompleted = false;
    if (savedCompleted) {
      try {
        const parsed = JSON.parse(savedCompleted);
        const completedDate = parsed.completedAt
          ? getDateStrFromISO(parsed.completedAt)
          : todayLocal;
        if (completedDate === todayLocal) {
          setTodaysCompletedWorkout(parsed);
          hasCompleted = true;
        } else {
          localStorage.removeItem(STORAGE_KEY_COMPLETED_WORKOUT);
          setTodaysCompletedWorkout(null);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY_COMPLETED_WORKOUT);
        setTodaysCompletedWorkout(null);
      }
    }

    const completedList = JSON.parse(localStorage.getItem('gr_completed_workouts') || '[]');

    if (hasCompleted) {
      localStorage.removeItem(STORAGE_KEY_SESSION);
      setWorkflowStep('idle');
      setTodayDayType(null);
      setIsTodayCompleted(true);
    } else {
      const activeSession = localStorage.getItem(STORAGE_KEY_SESSION);
      if (activeSession) {
        try {
          const data = JSON.parse(activeSession);
          const age = Date.now() - (data.lastUpdated || 0);
          if (age < 86400000 && data.exercises?.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            const loaded = loadExercisesWithData(data);
            setWorkoutExercises(loaded);
            setWorkoutName(data.workoutName || 'Workout');
            setCurrentExerciseIndex(data.currentExerciseIndex || 0);
            setSessionStarted(data.started || false);
            setSessionActiveTime(data.activeTime || 0);
            setSessionIsResting(data.isResting || false);
            setWorkflowStep('activeWorkout');
            return;
          }
          localStorage.removeItem(STORAGE_KEY_SESSION);
        } catch { /* invalid session data */ }
      }
    }

    setIsTodayCompleted(completedList.includes(todayLocal));

    const todayWorkout = localStorage.getItem(STORAGE_KEY_TODAYS_WORKOUT);
    if (todayWorkout) {
      try {
        const data = JSON.parse(todayWorkout);
        if (data.date === todayLocal && data.exercises?.length > 0) {
          const loaded = loadExercisesWithData(data);
          setWorkoutExercises(loaded);
          setWorkoutName(data.name || "Today's Workout");
          setWorkflowStep('idle');
          return;
        }
      } catch { /* invalid today workout data */ }
    }

    if (!hasCompleted) {
      setWorkoutExercises([]);
      setWorkoutName('');
      setWorkflowStep('idle');

      const schedule = JSON.parse(localStorage.getItem(STORAGE_KEY_SCHEDULE) || '{}');
      const todayPlan = schedule[todayLocal];
      if (todayPlan && todayPlan.type !== 'workout' && !completedList.includes(todayLocal)) {
        setTodayDayType(todayPlan.type);
      } else {
        setTodayDayType(null);
      }
    }
  }, [syncKey]);

  const resetWorkoutState = () => {
    setCurrentExerciseIndex(0);
    setWorkoutExercises([]);
    setWorkoutName('');
    setWorkoutCompleteData(null);
    setTodaysCompletedWorkout(null);
    setSessionStarted(false);
    setSessionActiveTime(0);
    setSessionIsResting(false);
    setSessionId(null);
    setShowPlanner(false);
  };

  const handleBack = () => {
    navigate('/planner');
  };

  const handleUpdateExerciseSets = (index, sets) => {
    setWorkoutExercises(prev => prev.map((ex, i) =>
      i === index ? { ...ex, _sets: sets } : ex
    ));
  };

  const handleGoToNextExercise = () => {
    if (currentExerciseIndex < workoutExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setSessionIsResting(false);
    } else {
      handleCompleteWorkout();
    }
  };

  const handleCompleteWorkout = (finalActiveTime) => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_TODAYS_WORKOUT);
    resetWorkoutState();

    setSessionStarted(false);
    setSessionIsResting(false);

    const finalExercises = workoutExercises;

    const exerciseLogs = finalExercises.map(ex => ({
      exerciseId: ex.exerciseId || ex.id,
      exerciseData: ex.exerciseData || ex,
      sets: ex._sets || [],
    }));

    const durationSeconds = finalActiveTime || 0;
    const durationMinutes = Math.max(1, Math.floor(durationSeconds / 60));

    const workoutForCalories = { exercises: exerciseLogs };
    const userWeight = userSettings.weight || 70;
    const totalCalories = calculateWorkoutCalories(workoutForCalories, userWeight);

    let totalVolume = 0;
    let totalSets = 0;

    finalExercises.forEach(ex => {
      (ex._sets || []).forEach(set => {
        totalVolume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
        totalSets++;
      });
    });

    const workoutXP = calculateWorkoutXP({
      duration: durationMinutes,
      calories: totalCalories,
      totalVolume,
      exercisesCount: finalExercises.length,
      totalSets,
    });

    const prsFound = [];
    finalExercises.forEach(ex => {
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
      exercisesCount: finalExercises.length,
    };

    logWorkout(workoutToLog);
    addXP(totalXP);

    addNotification(
      'Workout Completed',
      `Great job! You earned ${totalXP} XP ${prsFound.length > 0 ? `and set ${prsFound.length} new PR${prsFound.length > 1 ? 's' : ''}` : ''}.`,
      'workout',
      'workout',
      '/tracker'
    );

    const levelAfter = calculateLevelFromXP(xp + totalXP);
    if (levelAfter > level) {
      addNotification(
        'Level Up!',
        `Congratulations! You reached Level ${levelAfter}.`,
        'achievement',
        'achievement',
        '/profile'
      );
    }

    const powerGain = Math.floor(totalVolume * 0.005) + Math.floor(durationMinutes / 5) + prsFound.length * 10;
    addPowerLevel(powerGain);

    const calorieBreakdown = finalExercises.map(ex => {
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

    const completedPayload = {
      duration: durationMinutes,
      totalVolume,
      totalCalories,
      xpGained: totalXP,
      prXP,
      powerGain,
      exercisesCompleted: finalExercises.filter(ex => (ex._sets || []).length > 0).length,
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
      exercises: finalExercises.map(ex => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: (ex._sets || []).map(s => ({ weight: s.weight, reps: s.reps })),
      })),
      completedAt: new Date().toISOString(),
    };

    setWorkoutCompleteData(completedPayload);
    localStorage.setItem(STORAGE_KEY_COMPLETED_WORKOUT, JSON.stringify(completedPayload));
    setTodaysCompletedWorkout(completedPayload);

    completeWorkoutSession(sessionId, {
      durationSeconds,
      totalVolume,
      totalCalories,
      totalXP,
      totalSets,
      exercisesCount: finalExercises.length,
    });

    syncOfflineQueue().then(() => setOfflineQueueSize(0));

    setWorkflowStep('complete');

    const todayStr = new Date().toISOString().split('T')[0];
    const completed = JSON.parse(localStorage.getItem('gr_completed_workouts') || '[]');
    if (!completed.includes(todayStr)) {
      completed.push(todayStr);
      localStorage.setItem('gr_completed_workouts', JSON.stringify(completed));
    }
  };

  const handleNewWorkout = () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_TODAYS_WORKOUT);
    setCurrentExerciseIndex(0);
    setWorkoutExercises([]);
    setWorkoutName('');
    setSessionStarted(false);
    setSessionActiveTime(0);
    setSessionIsResting(false);
    setSessionId(null);
    setWorkflowStep('idle');
    setShowPlanner(true);
  };

  const handleViewAnalytics = () => {
    setWorkflowStep('analytics');
  };

  const handleReturnToPlanner = () => {
    setShowPlanner(true);
  };

  const handleBackFromAnalytics = () => {
    setWorkflowStep(workoutCompleteData ? 'complete' : 'idle');
  };

  const handleWorkoutStarted = () => {
    setSessionStarted(true);
    setSessionActiveTime(0);
    setSessionIsResting(false);
    if (user?.id) {
      createWorkoutSession(user.id, workoutName).then(id => {
        if (id) setSessionId(id);
      });
    }
  };

  const stepTitle = () => {
    switch (workflowStep) {
      case 'idle': return 'Tracker';
      case 'activeWorkout': return workoutName || 'Active Workout';
      case 'complete': return 'Workout Complete';
      case 'analytics': return 'Analytics';
      default: return 'Tracker';
    }
  };

  const showBackButton = workflowStep === 'activeWorkout';
  const todaysWorkoutName = workoutExercises.length > 0 ? workoutName : null;

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button onClick={handleBack} className="flex items-center gap-1 text-sl-gray-light hover:text-white text-sm touch-target">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl font-bold gradient-text">
              {stepTitle()}
            </h1>
          </div>
          {(workflowStep === 'complete' || (workflowStep === 'idle' && todaysCompletedWorkout)) && !showPlanner && (
            <button onClick={handleReturnToPlanner} className="holo-button px-4 py-2 text-sm">
              Plan Next Workout
            </button>
          )}
          {showPlanner && (
            <button onClick={() => setShowPlanner(false)} className="holo-button px-4 py-2 text-sm">
              Hide Planner
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {workflowStep === 'idle' && (
            <motion.div key="idle" variants={motionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2, ease: 'easeOut' }}>
              {todaysCompletedWorkout && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
                  <WorkoutCompleteScreen
                    data={todaysCompletedWorkout}
                    onNewWorkout={handleNewWorkout}
                    onViewAnalytics={handleViewAnalytics}
                    onReturnToPlanner={handleReturnToPlanner}
                  />
                  {showPlanner && (
                    <div className="mt-6 border-t border-sl-purple/20 pt-6">
                      <Suspense fallback={
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin w-6 h-6 border-2 border-sl-purple border-t-transparent rounded-full" />
                        </div>
                      }>
                        <Planner />
                      </Suspense>
                    </div>
                  )}
                </motion.div>
              )}

              {todaysCompletedWorkout && todaysWorkoutName && (
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sl-purple/30 to-sl-purple/20"></div>
                  <span className="text-[10px] text-sl-gray-light/50 uppercase tracking-[0.2em] font-semibold">Next Session</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-sl-purple/20 via-sl-purple/30 to-transparent"></div>
                </div>
              )}

              {todaysWorkoutName ? (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-16 h-16 bg-sl-purple/10 rounded-full flex items-center justify-center border border-sl-purple/30 mb-4">
                    <Dumbbell className="w-8 h-8 text-sl-purple-light" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">Today's Workout</h2>
                  <p className="text-sm text-sl-gray-light mb-5">{todaysWorkoutName}</p>
                  <div className="w-full max-w-xs space-y-2 mb-4">
                    {workoutExercises.map((ex, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-sl-gray/20 rounded-xl px-4 py-2.5">
                        <span className="text-sm font-medium text-white">{ex.name}</span>
                        <span className="text-xs text-sl-gray-light font-semibold">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full max-w-xs">
                    <button onClick={() => { setWorkflowStep('activeWorkout'); handleWorkoutStarted(); }} className="w-full holo-button holo-button-primary text-lg py-4 font-bold">
                      Start Workout
                    </button>
                    {offlineQueueSize > 0 && (
                      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-red-400">
                        <CloudOff className="w-3.5 h-3.5" />
                        <span>{offlineQueueSize} unsynced set{offlineQueueSize > 1 ? 's' : ''} — will sync when online</span>
                      </div>
                    )}
                    <p className="text-[10px] text-amber-400/70 text-center mt-2 leading-relaxed">
                       Warning! Your active set will be lost if you navigate away or close this page. STAY FOCUSED...
                    </p>
                  </div>
                </div>
              ) : !todaysCompletedWorkout ? (
                todayDayType ? (
                  <div className="flex flex-col items-center text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-sl-purple/5 flex items-center justify-center border border-sl-purple/20 mb-4">
                      <Moon className="w-10 h-10 text-sl-purple" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-3">Rest Day</h2>
                    <p className="text-sm text-sl-gray-light max-w-xs leading-relaxed">
                      Today is your scheduled rest day. Take time to relax, stay hydrated, stretch lightly, and prepare for tomorrow's workout.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16">
                    <div className="w-20 h-20 bg-sl-purple/5 rounded-full flex items-center justify-center border border-sl-purple/20 mb-4">
                      <svg className="w-10 h-10 text-sl-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">No Workout Assigned</h2>
                    <p className="text-sm text-sl-gray-light mb-6 max-w-xs">
                      Head to the Planner to assign a workout for today.
                    </p>
                    <button onClick={() => navigate('/planner')} className="holo-button holo-button-primary px-6 py-3 text-sm">
                      Go to Planner
                    </button>
                  </div>
                )
              ) : null}
            </motion.div>
          )}

          {workflowStep === 'activeWorkout' && workoutExercises.length > 0 && (
            <motion.div key="activeWorkout" variants={motionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2, ease: 'easeOut' }}>
              <ActiveWorkoutMode
                key={`exercise-${currentExerciseIndex}`}
                exercise={workoutExercises[currentExerciseIndex]}
                exerciseIndex={currentExerciseIndex}
                totalExercises={workoutExercises.length}
                workoutName={workoutName}
                workoutExercises={workoutExercises}
                onGoToNextExercise={handleGoToNextExercise}
                onCompleteWorkout={handleCompleteWorkout}
                onUpdateSets={handleUpdateExerciseSets}
                checkForNewPR={checkForNewPR}
                userSettings={userSettings}
                initialSets={workoutExercises[currentExerciseIndex]._sets || []}
                initialStarted={sessionStarted}
                initialActiveTime={sessionActiveTime}
                initialIsResting={sessionIsResting}
                onWorkoutStarted={handleWorkoutStarted}
                userId={user?.id}
                sessionId={sessionId}
              />
            </motion.div>
          )}

          {workflowStep === 'complete' && workoutCompleteData && (
            <motion.div key="complete" variants={motionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2, ease: 'easeOut' }}>
              <WorkoutCompleteScreen
                data={workoutCompleteData}
                onNewWorkout={handleNewWorkout}
                onViewAnalytics={handleViewAnalytics}
                onReturnToPlanner={handleReturnToPlanner}
              />
              {showPlanner && (
                <div className="mt-6 border-t border-sl-purple/20 pt-6">
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-6 h-6 border-2 border-sl-purple border-t-transparent rounded-full" />
                    </div>
                  }>
                    <Planner />
                  </Suspense>
                </div>
              )}
            </motion.div>
          )}

          {workflowStep === 'analytics' && (
            <motion.div key="analytics" variants={motionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2, ease: 'easeOut' }}>
              <div className="space-y-4">
                <AnalyticsDashboard
                  workoutHistory={workoutHistory}
                  personalRecords={personalRecords}
                  userSettings={userSettings}
                  missionProgress={missionProgress}
                  level={level}
                  xp={xp}
                  title={title}
                  progress={progress}
                  powerLevel={powerLevel}
                  onBack={handleBackFromAnalytics}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
