import { useState, useEffect, useRef } from 'react';
import { Trophy, SkipForward, CheckCircle, Cloud, CloudOff, Loader, Target, Activity, Play, Flame } from 'lucide-react';
import { calculateExerciseCalories } from '../../utils/calorieUtils';
import { saveCompletedSet } from '../../utils/autoSaveUtils';
import RestTimer from './RestTimer';
import PersonalRecords from './PersonalRecords';

const MUSCLE_COLORS = {
  Chest: 'from-red-500/20 to-red-600/10 border-red-500/30',
  Back: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  Legs: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  Shoulders: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  Arms: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  Core: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  Cardio: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
  FullBody: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
};

const MUSCLE_BADGE_COLORS = {
  Chest: 'bg-red-500/20 text-red-300',
  Back: 'bg-blue-500/20 text-blue-300',
  Legs: 'bg-emerald-500/20 text-emerald-300',
  Shoulders: 'bg-purple-500/20 text-purple-300',
  Arms: 'bg-orange-500/20 text-orange-300',
  Core: 'bg-yellow-500/20 text-yellow-300',
  Cardio: 'bg-pink-500/20 text-pink-300',
  FullBody: 'bg-cyan-500/20 text-cyan-300',
};

export default function ActiveWorkoutMode({
  exercise,
  exerciseIndex,
  totalExercises,
  workoutName,
  workoutExercises,
  onGoToNextExercise,
  onCompleteWorkout,
  onUpdateSets,
  checkForNewPR,
  userSettings,
  initialSets,
  initialStarted,
  initialActiveTime,
  initialIsResting,
  onWorkoutStarted,
  userId,
  sessionId,
}) {
  const [completedSets, setCompletedSets] = useState(initialSets || []);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [isResting, setIsResting] = useState(initialIsResting || false);
  const [setInProgress, setSetInProgress] = useState(false);

  const [activeTime, setActiveTime] = useState(initialActiveTime || 0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  const [latestPRs, setLatestPRs] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  const weightRef = useRef(null);
  const repsRef = useRef(null);
  const notifiedStartedRef = useRef(false);

  const assignedSets = exercise.sets ?? 3;
  const allSetsDone = completedSets.length >= assignedSets;
  const isLastExercise = exerciseIndex >= totalExercises - 1;
  const currentWeight = userSettings?.weight || 70;

  const totalCalories = calculateExerciseCalories(
    exercise.exerciseId || exercise.id,
    exercise.trackingType || 'weight',
    completedSets,
    currentWeight
  );
  const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const activeMinutes = Math.floor(activeTime / 60);
  const activeSeconds = activeTime % 60;
  const exerciseProgress = totalExercises > 0 ? (exerciseIndex + (allSetsDone ? 1 : completedSets.length / assignedSets)) / totalExercises : 0;

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setActiveTime(prev => prev + 1);
      }, 1000);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [timerRunning]);

  useEffect(() => {
    if (!isResting && !allSetsDone) {
      if (weightRef.current) weightRef.current.focus();
    }
  }, [isResting, exerciseIndex, completedSets.length, allSetsDone]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && timerRunning) setTimerRunning(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [timerRunning]);

  const latestSnapshot = useRef(null);
  useEffect(() => {
    if (!workoutExercises || workoutExercises.length === 0) return;
    latestSnapshot.current = {
      workoutName, exercises: workoutExercises,
      currentExerciseIndex: exerciseIndex, started: true,
      activeTime, isResting, setInProgress, lastUpdated: Date.now(),
    };
    localStorage.setItem('gr_active_workout_session', JSON.stringify(latestSnapshot.current));
  });

  useEffect(() => {
    const handleSave = () => {
      if (latestSnapshot.current) {
        localStorage.setItem('gr_active_workout_session', JSON.stringify({
          ...latestSnapshot.current, lastUpdated: Date.now(),
        }));
      }
    };
    window.addEventListener('beforeunload', handleSave);
    window.addEventListener('pagehide', handleSave);
    return () => {
      window.removeEventListener('beforeunload', handleSave);
      window.removeEventListener('pagehide', handleSave);
      handleSave();
    };
  }, []);

  const handleStartSet = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (w <= 0 && r <= 0) return;
    if (isResting) setIsResting(false);
    setTimerRunning(true);
    setSetInProgress(true);
    if (onWorkoutStarted && !notifiedStartedRef.current) {
      notifiedStartedRef.current = true;
      onWorkoutStarted();
    }
  };

  const handleCompleteSet = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (w <= 0 && r <= 0) return;

    setTimerRunning(false);
    setSetInProgress(false);
    const newSet = { weight: w, reps: r, timestamp: Date.now() };
    const updatedSets = [...completedSets, newSet];
    setCompletedSets(updatedSets);
    setWeight('');
    setReps('');

    if (onUpdateSets) onUpdateSets(exerciseIndex, updatedSets);

    if (checkForNewPR) {
      const prs = checkForNewPR(exercise.exerciseId || exercise.id, w, r);
      if (prs.length > 0) {
        setLatestPRs(prs);
        setTimeout(() => setLatestPRs(null), 4000);
      }
    }

    setSyncStatus('saving');
    saveCompletedSet({
      sessionId, userId,
      exerciseId: exercise.exerciseId || exercise.id,
      exerciseName: exercise.name,
      setIndex: completedSets.length, weight: w, reps: r,
      completedAt: new Date().toISOString(),
    }).then(result => {
      setSyncStatus(result.synced ? 'synced' : 'offline');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }).catch(() => {
      setSyncStatus('offline');
      setTimeout(() => setSyncStatus('idle'), 3000);
    });

    if (updatedSets.length < assignedSets) {
      setIsResting(true);
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
  };

  const handleRestSkip = () => {
    setIsResting(false);
  };

  const handleNextExercise = () => {
    setTimerRunning(false);
    if (isLastExercise) {
      if (onCompleteWorkout) onCompleteWorkout(activeTime);
    } else {
      if (onGoToNextExercise) onGoToNextExercise();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (setInProgress) handleCompleteSet();
      else if (weight && reps) handleStartSet();
      else if (e.target === weightRef.current) repsRef.current?.focus();
    }
  };

  const muscleBg = MUSCLE_COLORS[exercise.muscleGroup] || 'from-sl-purple/20 to-sl-purple/10 border-sl-purple/30';
  const muscleBadge = MUSCLE_BADGE_COLORS[exercise.muscleGroup] || 'bg-sl-purple/20 text-sl-purple-light';

  return (
    <div className="space-y-4 pb-4">
      {latestPRs && (
        <div className="fixed top-20 right-4 z-50 w-[300px] animate-slide-up">
          <PersonalRecords prs={latestPRs} exerciseName={exercise.name} compact />
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">
          <span>{workoutName || 'Workout'}</span>
          <span>Exercise {exerciseIndex + 1}/{totalExercises}</span>
        </div>
        <div className="w-full bg-sl-gray/30 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sl-purple via-sl-red to-yellow-400 rounded-full transition-all duration-500 ease-out"
               style={{ width: `${Math.min(100, exerciseProgress * 100)}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">Active Time</p>
          <p className={`text-2xl font-bold tabular-nums ${timerRunning ? 'text-white' : 'text-sl-gray-light'}`}>
            {activeMinutes}:{String(activeSeconds).padStart(2, '0')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncStatus === 'saving' && (
            <div className="flex items-center gap-1 text-xs text-sl-gray-light"><Loader className="w-3 h-3 animate-spin" /><span>Saving</span></div>
          )}
          {syncStatus === 'synced' && (
            <div className="flex items-center gap-1 text-xs text-emerald-400"><Cloud className="w-3 h-3" /><span>Saved</span></div>
          )}
          {syncStatus === 'offline' && (
            <div className="flex items-center gap-1 text-xs text-yellow-400"><CloudOff className="w-3 h-3" /><span>Saved locally</span></div>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">Volume</p>
          <p className="text-lg font-bold text-white">{(totalVolume / 1000).toFixed(1)}k</p>
        </div>
      </div>

      <div className={`mobile-card bg-gradient-to-br ${muscleBg}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-0.5">{exercise.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${muscleBadge}`}>{exercise.muscleGroup}</span>
              {exercise.equipment && (
                <span className="text-[10px] text-sl-gray-light">{exercise.equipment}</span>
              )}
              <span className="text-[10px] text-sl-gray-light">{exercise.difficulty}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-sl-gray-light font-semibold">Sets</p>
            <p className="text-xl font-bold text-white">{completedSets.length}/{assignedSets}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/20 rounded-xl p-2.5 text-center">
            <Target className="w-3.5 h-3.5 mx-auto mb-0.5 text-sl-purple-light" />
            <p className="text-[10px] text-sl-gray-light font-semibold">Target</p>
            <p className="text-sm font-bold text-white">{exercise.weight || 0}kg</p>
          </div>
          <div className="bg-black/20 rounded-xl p-2.5 text-center">
            <Activity className="w-3.5 h-3.5 mx-auto mb-0.5 text-sl-red-light" />
            <p className="text-[10px] text-sl-gray-light font-semibold">Reps</p>
            <p className="text-sm font-bold text-white">{exercise.reps || 0}</p>
          </div>
          <div className="bg-black/20 rounded-xl p-2.5 text-center">
            <Flame className="w-3.5 h-3.5 mx-auto mb-0.5 text-sl-red-light" />
            <p className="text-[10px] text-sl-gray-light font-semibold">Calories</p>
            <p className="text-sm font-bold text-sl-red-light">{totalCalories}</p>
          </div>
        </div>
      </div>

      {allSetsDone ? (
        <div className="mobile-card border-sl-purple/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-emerald-400">Exercise Complete</h3>
          </div>
          <div className="space-y-1.5 mb-4">
            {completedSets.map((set, i) => (
              <div key={i} className="flex justify-between items-center bg-sl-gray/20 rounded-xl p-3">
                <span className="text-xs font-bold text-sl-gray-light">Set {i + 1}</span>
                <span className="text-sm font-semibold text-white">{set.weight} kg &times; {set.reps} reps</span>
                <span className="text-xs font-semibold text-sl-purple-light">{(set.weight * set.reps / 1000).toFixed(2)}k</span>
              </div>
            ))}
          </div>
          <button onClick={handleNextExercise}
            className="w-full holo-button holo-button-primary text-base py-4 font-bold"
          >
            {isLastExercise ? 'Complete Workout' : (
              <span className="flex items-center justify-center gap-2">
                Next Exercise <SkipForward className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      ) : isResting ? (
        <RestTimer
          key={`rest-${exerciseIndex}-${completedSets.length}`}
          onComplete={handleRestComplete}
          onSkip={handleRestSkip}
          autoStart={true}
          defaultDuration={60}
        />
      ) : (
        <div className="mobile-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">
              Set {completedSets.length + 1} of {assignedSets}
            </h3>
            {exercise.weight > 0 && (
              <span className="text-xs bg-sl-purple/20 text-sl-purple-light px-2 py-1 rounded-full font-semibold">
                Target: {exercise.weight}kg &times; {exercise.reps}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-sl-gray-light mb-1.5 font-semibold">Weight (kg)</label>
              <input ref={weightRef} type="number" step="0.5" min="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                onKeyDown={handleKeyDown}
                className="holo-input text-center text-xl font-bold py-3"
                placeholder={exercise.weight > 0 ? String(exercise.weight) : '0'}
              />
            </div>
            <div>
              <label className="block text-xs text-sl-gray-light mb-1.5 font-semibold">Reps</label>
              <input ref={repsRef} type="number" min="0"
                value={reps}
                onChange={e => setReps(e.target.value)}
                onKeyDown={handleKeyDown}
                className="holo-input text-center text-xl font-bold py-3"
                placeholder={exercise.reps > 0 ? String(exercise.reps) : '0'}
              />
            </div>
          </div>

          <button onClick={setInProgress ? handleCompleteSet : handleStartSet}
            disabled={!setInProgress && (!weight || !reps)}
            className="w-full holo-button text-base py-4 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: setInProgress ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            {setInProgress ? (
              <><CheckCircle className="w-5 h-5" /> Complete Set</>
            ) : (
              <><Play className="w-5 h-5" /> Start Set</>
            )}
          </button>
        </div>
      )}

      {completedSets.length > 0 && !allSetsDone && (
        <div className="mobile-card">
          <h3 className="text-lg font-bold text-white mb-3">Completed Sets</h3>
          <div className="space-y-2">
            {completedSets.map((set, i) => {
              const vol = set.weight * set.reps;
              return (
                <div key={i} className="flex items-center gap-2 bg-sl-gray/20 rounded-xl p-3">
                  <span className="text-sl-gray-light font-bold text-xs w-5 shrink-0">#{i + 1}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">{set.weight} kg</span>
                    <span className="text-sl-gray-light">&times;</span>
                    <span className="text-sm font-semibold text-white">{set.reps} reps</span>
                    <span className="text-xs font-semibold text-sl-purple-light ml-auto">{(vol / 1000).toFixed(2)}k</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
