import { useState, useEffect, useRef } from 'react';
import { Trophy, SkipForward, CheckCircle } from 'lucide-react';
import { calculateExerciseCalories } from '../../utils/calorieUtils';

const REST_OPTIONS = [30, 60, 90, 120];

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
}) {
  const [started, setStarted] = useState(true);
  const [completedSets, setCompletedSets] = useState(initialSets || []);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [isResting, setIsResting] = useState(false);
  const [setInProgress, setSetInProgress] = useState(false);

  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [restDuration, setRestDuration] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const restIntervalRef = useRef(null);

  const [activeTime, setActiveTime] = useState(initialActiveTime || 0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerIntervalRef = useRef(null);

  const [latestPR, setLatestPR] = useState(null);

  const weightRef = useRef(null);
  const repsRef = useRef(null);
  const notifiedStartedRef = useRef(false);

  const assignedSets = exercise.sets || 3;
  const allSetsDone = completedSets.length >= assignedSets;
  const isLastExercise = exerciseIndex >= totalExercises - 1;

  const currentWeight = userSettings?.weight || 70;

  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch { /* audio context not available */ }
  };

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setActiveTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  useEffect(() => {
    if (restRunning && restTimeLeft > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current);
            setRestRunning(false);
            beep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restRunning, restTimeLeft]);

  useEffect(() => {
    if (started && !isResting && weightRef.current) {
      weightRef.current.focus();
    }
  }, [started, isResting, exerciseIndex, completedSets.length]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && timerRunning) {
        setTimerRunning(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [timerRunning]);

  const latestSnapshot = useRef(null);

  useEffect(() => {
    if (!workoutExercises || workoutExercises.length === 0) return;
    latestSnapshot.current = {
      workoutName,
      exercises: workoutExercises,
      currentExerciseIndex: exerciseIndex,
      started: true,
      activeTime,
      isResting,
      setInProgress,
      lastUpdated: Date.now(),
    };
    localStorage.setItem('gr_active_workout_session', JSON.stringify(latestSnapshot.current));
  });

  useEffect(() => {
    const handleSave = () => {
      if (latestSnapshot.current) {
        localStorage.setItem('gr_active_workout_session', JSON.stringify({
          ...latestSnapshot.current,
          lastUpdated: Date.now(),
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

    if (isResting) {
      setRestRunning(false);
      setIsResting(false);
    }

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

    if (onUpdateSets) {
      onUpdateSets(exerciseIndex, updatedSets);
    }

    if (checkForNewPR) {
      const prs = checkForNewPR(exercise.exerciseId || exercise.id, w, r);
      if (prs.length > 0) {
        setLatestPR(prs[0]);
        setTimeout(() => setLatestPR(null), 3000);
      }
    }

    if (updatedSets.length < assignedSets) {
      setIsResting(true);
      setRestDuration(60);
      setRestTimeLeft(60);
      setRestRunning(true);
    }
  };

  const handleNextSet = () => {
    setRestRunning(false);
    setIsResting(false);
    setTimerRunning(true);
  };

  const handleSkipRest = () => {
    setRestRunning(false);
    setIsResting(false);
  };

  const changeRestDuration = (secs) => {
    setRestDuration(secs);
    setRestTimeLeft(secs);
    setRestRunning(true);
  };

  const handleNextExercise = () => {
    setTimerRunning(false);
    setRestRunning(false);
    if (isLastExercise) {
      if (onCompleteWorkout) onCompleteWorkout(activeTime);
    } else {
      if (onGoToNextExercise) onGoToNextExercise();
    }
  };

  const restMinutes = Math.floor(restTimeLeft / 60);
  const restSeconds = restTimeLeft % 60;
  const restProgress = restDuration > 0 ? 1 - (restTimeLeft / restDuration) : 0;

  const totalCalories = calculateExerciseCalories(
    exercise.exerciseId || exercise.id,
    exercise.trackingType || 'weight',
    completedSets,
    currentWeight
  );

  const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const activeMinutes = Math.floor(activeTime / 60);
  const activeSeconds = activeTime % 60;

  return (
    <div className="space-y-4 pb-4">
      {latestPR && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up bg-gradient-to-r from-yellow-500/20 to-sl-red/20 border border-yellow-500/40 rounded-xl p-4 shadow-lg max-w-[280px] backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">NEW PR</span>
          </div>
          <p className="text-white font-bold text-sm">{exercise.name}</p>
          <p className="text-yellow-300 text-xs">
            {latestPR.type === 'weight' ? `${latestPR.newValue}${latestPR.unit}` : ''}
            {latestPR.type === 'reps' ? `${latestPR.newValue} reps` : ''}
            {latestPR.type === 'volume' ? `${(latestPR.newValue / 1000).toFixed(1)}k kg` : ''}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">Active Time</p>
          <p className={`text-2xl font-bold tabular-nums ${timerRunning ? 'text-white' : 'text-sl-gray-light'}`}>
            {activeMinutes}:{String(activeSeconds).padStart(2, '0')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">Calories</p>
          <p className="text-lg font-bold text-sl-red-light">{totalCalories}</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">
          {workoutName || 'Workout'} &middot; {exerciseIndex + 1}/{totalExercises}
        </p>
      </div>

      <div className="mobile-card text-center">
        <h2 className="text-2xl font-bold text-white mb-1">{exercise.name}</h2>
        <p className="text-sm text-sl-gray-light">{exercise.muscleGroup} &middot; {exercise.equipment}</p>
        <div className="flex justify-center gap-4 mt-3">
          <div>
            <p className="text-[10px] text-sl-gray-light font-semibold">Sets</p>
            <p className="text-lg font-bold text-white">{completedSets.length}/{assignedSets}</p>
          </div>
          <div>
            <p className="text-[10px] text-sl-gray-light font-semibold">Volume</p>
            <p className="text-lg font-bold text-white">{(totalVolume / 1000).toFixed(1)}k</p>
          </div>
          <div>
            <p className="text-[10px] text-sl-gray-light font-semibold">Cal/min</p>
            <p className="text-lg font-bold text-sl-red-light">
              {totalCalories > 0 && activeTime > 0
                ? (totalCalories / (activeTime / 60)).toFixed(1)
                : '0.0'}
            </p>
          </div>
        </div>
      </div>

      {allSetsDone ? (
        <div className="mobile-card border-sl-purple/30 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-bold text-emerald-400">Exercise Complete</h3>
          </div>
          <p className="text-sm text-sl-gray-light mb-4">
            {completedSets.length} sets completed for {exercise.name}
          </p>
          <div className="space-y-2">
            {completedSets.map((set, i) => (
              <div key={i} className="flex justify-between items-center bg-sl-gray/20 rounded-xl p-3">
                <span className="text-xs font-bold text-sl-gray-light">Set {i + 1}</span>
                <span className="text-sm font-semibold text-white">{set.weight} kg &times; {set.reps} reps</span>
                <span className="text-xs font-semibold text-sl-purple-light">{(set.weight * set.reps / 1000).toFixed(2)}k</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleNextExercise}
            className="w-full holo-button holo-button-primary text-base py-4 font-bold mt-4"
          >
            {isLastExercise ? 'Complete Workout' : (
              <span className="flex items-center justify-center gap-2">
                Next Exercise <SkipForward className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      ) : isResting ? (
        <div className="mobile-card border-sl-red/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white">Rest Timer</h3>
            <div className="flex gap-1.5">
              {REST_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => changeRestDuration(opt)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all touch-target ${
                    restDuration === opt
                      ? 'bg-sl-red text-white shadow-sl-glow-red'
                      : 'bg-sl-gray/30 text-sl-gray-light hover:bg-sl-gray/50'
                  }`}
                >
                  {opt}s
                </button>
              ))}
            </div>
          </div>

          <div className="text-center py-3">
            <p className="text-4xl font-bold text-white tabular-nums">
              {restMinutes}:{String(restSeconds).padStart(2, '0')}
            </p>
            <div className="w-full bg-sl-gray/40 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-500"
                style={{ width: `${restProgress * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-center gap-2">
              {restRunning ? (
                <button onClick={() => setRestRunning(false)} className="holo-button text-sm py-2 px-4">
                  Pause
                </button>
              ) : restTimeLeft > 0 ? (
                <button onClick={() => setRestRunning(true)} className="holo-button text-sm py-2 px-4">
                  Resume
                </button>
              ) : null}
              <button onClick={handleSkipRest} className="holo-button text-sm py-2 px-4">
                Skip
              </button>
            </div>

            <button
              onClick={handleStartSet}
              disabled={!weight && !reps}
              className="w-full holo-button holo-button-success text-base py-4 font-bold disabled:opacity-50"
            >
              Start Set
            </button>
          </div>
        </div>
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
              <input
                ref={weightRef}
                type="number" step="0.5" min="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && repsRef.current?.focus()}
                className="holo-input text-center text-xl font-bold py-3"
                placeholder={exercise.weight > 0 ? String(exercise.weight) : '0'}
              />
            </div>
            <div>
              <label className="block text-xs text-sl-gray-light mb-1.5 font-semibold">Reps</label>
              <input
                ref={repsRef}
                type="number" min="0"
                value={reps}
                onChange={e => setReps(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (setInProgress ? handleCompleteSet() : handleStartSet())}
                className="holo-input text-center text-xl font-bold py-3"
                placeholder={exercise.reps > 0 ? String(exercise.reps) : '0'}
              />
            </div>
          </div>

          <button
            onClick={setInProgress ? handleCompleteSet : handleStartSet}
            disabled={!setInProgress && !weight && !reps}
            className="w-full holo-button holo-button-success text-base py-4 font-bold disabled:opacity-50"
          >
            {setInProgress ? 'Complete Set' : 'Start Set'}
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
                <div
                  key={i}
                  className="flex items-center gap-2 bg-sl-gray/20 rounded-xl p-3"
                >
                  <span className="text-sl-gray-light font-bold text-xs w-5 shrink-0">#{i + 1}</span>
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
