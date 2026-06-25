import { useState, useEffect, useRef } from 'react';
import RestTimer from './RestTimer';
import PersonalRecords from './PersonalRecords';
import { calculateExerciseCalories, calculateCaloriesPerMinute } from '../../utils/calorieUtils';
import { ArrowLeft, SkipForward, Trophy } from 'lucide-react';

export default function ActiveWorkoutMode({
  exercise,
  exerciseIndex,
  totalExercises,
  workoutName,
  onSkipExercise,
  onCompleteWorkout,
  onReset,
  checkForNewPR,
  userWeight,
  userSettings,
  onUpdateSets,
}) {
  const [sets, setSets] = useState([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [showRest, setShowRest] = useState(false);
  const [newPRs, setNewPRs] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [workoutStart] = useState(Date.now());
  const [recentPR, setRecentPR] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const weightRef = useRef(null);
  const repsRef = useRef(null);

  const currentWeight = userSettings?.weight || 70;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - workoutStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStart]);

  useEffect(() => {
    if (weightRef.current) weightRef.current.focus();
  }, []);

  const calcPerMin = calculateCaloriesPerMinute(exercise.id, exercise.trackingType, currentWeight);
  const totalCalories = calculateExerciseCalories(exercise.id, exercise.trackingType, sets, currentWeight);

  const handleCompleteSet = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    if (w <= 0 && r <= 0) return;

    const newSet = { weight: w, reps: r, timestamp: Date.now() };
    const updatedSets = [...sets, newSet];
    setSets(updatedSets);

    if (checkForNewPR) {
      const prs = checkForNewPR(exercise.id, w, r);
      if (prs.length > 0) {
        setNewPRs(prev => [...prev, ...prs]);
        setRecentPR(prs[0]);
        setTimeout(() => setRecentPR(null), 3000);
      }
    }

    setWeight('');
    setReps('');
    setShowRest(true);

    if (onUpdateSets) {
      onUpdateSets(exerciseIndex, updatedSets);
    }

    setTimeout(() => {
      if (repsRef.current) repsRef.current.focus();
    }, 100);
  };

  const handleRestComplete = () => {
    setShowRest(false);
    if (weightRef.current) weightRef.current.focus();
  };

  const handleEditSet = (index, field, value) => {
    const newSets = sets.map((s, i) =>
      i === index ? { ...s, [field]: field === 'weight' ? parseFloat(value) || 0 : parseInt(value) || 0 } : s
    );
    setSets(newSets);
    if (onUpdateSets) {
      onUpdateSets(exerciseIndex, newSets);
    }
  };

  const handleDeleteSet = (index) => {
    const newSets = sets.filter((_, i) => i !== index);
    setSets(newSets);
    if (onUpdateSets) {
      onUpdateSets(exerciseIndex, newSets);
    }
  };

  const handleFinish = () => {
    if (totalExercises > 1 && exerciseIndex < totalExercises - 1) {
      onSkipExercise();
    } else {
      onCompleteWorkout();
    }
  };

  const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const elapsedMinutes = Math.floor(elapsed / 60);
  const elapsedSeconds = elapsed % 60;
  const hasMoreExercises = totalExercises > 1 && exerciseIndex < totalExercises - 1;

  return (
    <div className="space-y-4 pb-4">
      {recentPR && (
        <div className="fixed top-20 right-4 z-50 animate-slide-up bg-gradient-to-r from-yellow-500/20 to-sl-red/20 border border-yellow-500/40 rounded-xl p-4 shadow-lg max-w-[280px] backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">NEW PR</span>
          </div>
          <p className="text-white font-bold text-sm">{exercise.name}</p>
          <p className="text-yellow-300 text-xs">{recentPR.newValue}{recentPR.unit} ({recentPR.type})</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={onSkipExercise} className="flex items-center gap-1 text-sl-gray-light hover:text-white text-sm touch-target">
          <ArrowLeft className="w-4 h-4" />
          Skip
        </button>
        <div className="text-center">
          <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">Timer</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {elapsedMinutes}:{String(elapsedSeconds).padStart(2, '0')}
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
            <p className="text-lg font-bold text-white">{sets.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-sl-gray-light font-semibold">Volume</p>
            <p className="text-lg font-bold text-white">{(totalVolume / 1000).toFixed(1)}k</p>
          </div>
          <div>
            <p className="text-[10px] text-sl-gray-light font-semibold">Cal/min</p>
            <p className="text-lg font-bold text-sl-red-light">{calcPerMin}</p>
          </div>
        </div>
      </div>

      <div className="mobile-card">
        <h3 className="text-lg font-bold text-white mb-3">Set {sets.length + 1}</h3>
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
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-sl-gray-light mb-1.5 font-semibold">Reps</label>
            <input
              ref={repsRef}
              type="number" min="0"
              value={reps}
              onChange={e => setReps(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCompleteSet()}
              className="holo-input text-center text-xl font-bold py-3"
              placeholder="0"
            />
          </div>
        </div>

        <button onClick={handleCompleteSet} disabled={!weight && !reps}
          className="w-full holo-button holo-button-success text-base py-4 font-bold">
          Complete Set
        </button>
      </div>

      {showRest && (
        <RestTimer
          key={`rest-${sets.length}`}
          defaultDuration={60}
          autoStart={true}
          onComplete={handleRestComplete}
        />
      )}

      {sets.length > 0 && (
        <div className="mobile-card">
          <h3 className="text-lg font-bold text-white mb-3">Completed Sets</h3>
          <div className="space-y-2">
            {sets.map((set, i) => {
              const vol = set.weight * set.reps;
              return (
                <div key={i} className="flex items-center gap-2 bg-sl-gray/20 rounded-xl p-3 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="text-sl-gray-light font-bold text-xs w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 grid grid-cols-3 gap-1.5">
                    <input type="number" value={set.weight}
                      onChange={e => handleEditSet(i, 'weight', e.target.value)}
                      className="holo-input text-center text-sm py-1.5 px-1" />
                    <input type="number" value={set.reps}
                      onChange={e => handleEditSet(i, 'reps', e.target.value)}
                      className="holo-input text-center text-sm py-1.5 px-1" />
                    <div className="flex items-center justify-center">
                      <p className="text-xs font-semibold text-sl-purple-light">{(vol / 1000).toFixed(2)}k</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSet(i)} className="text-red-400 hover:text-red-300 text-sm shrink-0 px-1 touch-target">
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PersonalRecords prs={newPRs} exerciseName={exercise.name} />

      <button onClick={handleFinish} className="w-full holo-button holo-button-primary text-base py-4 font-bold text-center">
        {hasMoreExercises ? (
          <span className="flex items-center justify-center gap-2">
            Next Exercise <SkipForward className="w-4 h-4" />
          </span>
        ) : 'Complete Workout'}
      </button>

      <div className="text-center">
        <button onClick={() => setShowResetConfirm(true)} className="text-red-400 hover:text-red-300 text-sm underline underline-offset-2 touch-target inline-flex">
          Reset Workout
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-sl-dark border border-sl-red/30 rounded-xl p-6 max-w-sm w-full shadow-sl-glow" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2">Reset Workout?</h3>
            <p className="text-sl-gray-light text-sm mb-6">This will clear the current workout.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="holo-button flex-1 text-center">Cancel</button>
              <button onClick={() => { setShowResetConfirm(false); onReset && onReset(); }} className="holo-button holo-button-danger flex-1 text-center">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
