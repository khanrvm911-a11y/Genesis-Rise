import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLevel } from '../context/LevelContext';
import { useWorkout } from '../context/WorkoutContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MUSCLE_GROUPS = [
  { id: 'Chest', name: 'Chest Arsenal' },
  { id: 'Back', name: 'Back Arsenal' },
  { id: 'Shoulders', name: 'Shoulders' },
  { id: 'Arms', name: 'Arms' },
  { id: 'Legs', name: 'Legion Training' },
  { id: 'Core', name: 'Core' },
  { id: 'Cardio', name: 'Cardio' },
];

const MUSCLE_GROUP_CARDS = [
  { id: 'Chest', name: 'Chest Arsenal', icon: 'M12 3C7 3 3 8 3 14s3 8 9 8 9-2 9-8-4-11-9-11z M6 10c4 2 8 2 12 0 M6 14c4 1.5 8 1.5 12 0', color: 'border-red-500/30', bg: 'bg-red-950/10', text: 'text-red-400' },
  { id: 'Back', name: 'Back Arsenal', icon: 'M12 3C7 3 2 9 2 15s4 7 10 7 10-1 10-7-5-12-10-12z M5 8c4.7 2.3 9.3 2.3 14 0 M5 13c4.7 1.3 9.3 1.3 14 0', color: 'border-blue-500/30', bg: 'bg-blue-950/10', text: 'text-blue-400' },
  { id: 'Shoulders', name: 'Shoulders', icon: 'M12 4C8 4 5 7 5 12s3 8 7 8 7-3 7-8-3-8-7-8z M12 4v16 M5 12h14', color: 'border-yellow-500/30', bg: 'bg-yellow-950/10', text: 'text-yellow-400' },
  { id: 'Arms', name: 'Arms', icon: 'M6 7c0-4 3-7 7-5 4-2 7 1 7 5v8c0 4-3 7-7 5-4 2-7-1-7-5V7z', color: 'border-orange-500/30', bg: 'bg-orange-950/10', text: 'text-orange-400' },
  { id: 'Legs', name: 'Legion Training', icon: 'M7 4C5 4 4 8 4 13v6c0 1 1 2 3 2s3-1 3-2v-6c0-5-1-9-3-9z M17 4c2 0 3 4 3 9v6c0 1-1 2-3 2s-3-1-3-2v-6c0-5 1-9 3-9z', color: 'border-emerald-500/30', bg: 'bg-emerald-950/10', text: 'text-emerald-400' },
  { id: 'Core', name: 'Core', icon: 'M12 4C8 4 5 8 5 13c0 4 2 7 7 7s7-3 7-7c0-5-3-9-7-9z M7 9h10 M7 13h10 M7 17h10', color: 'border-purple-500/30', bg: 'bg-purple-950/10', text: 'text-purple-400' },
  { id: 'Cardio', name: 'Cardio', icon: 'M3 20l5-4 3 2 4-7 5 3-2 5-5-2-4 6-6-3z M18 5a2 2 0 11-4 0 2 2 0 014 0z', color: 'border-pink-500/30', bg: 'bg-pink-950/10', text: 'text-pink-400' },
  { id: 'Recovery', name: 'Recovery', icon: 'M12 21c-6-5-8-9-8-13 0-3 2-5 4-5s4 1 4 4c0-3 2-4 4-4s4 2 4 5-2 8-8 13z', color: 'border-teal-500/30', bg: 'bg-teal-950/10', text: 'text-teal-400' },
];

const POPULAR_SPLITS = [
  { id: 'push', name: 'Push Day', groups: ['Chest', 'Shoulders', 'Arms'], icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z', desc: 'Chest, Shoulders, Triceps' },
  { id: 'pull', name: 'Pull Day', groups: ['Back', 'Arms'], icon: 'M5 10l7-7 7 7M5 19l7-7 7 7', desc: 'Back, Biceps' },
  { id: 'legs', name: 'Leg Day', groups: ['Legs'], icon: 'M17 2l4 4-4 4M7 2l-4 4 4 4M12 10v12M8 14l4-4 4 4', desc: 'Quads, Hamstrings, Glutes, Calves' },
  { id: 'ppl', name: 'Push Pull Legs', groups: ['Chest', 'Back', 'Legs'], icon: 'M12 2l3 7h7l-5 4 2 7-7-4-7 4 2-7-5-4h7z', desc: 'Full body split' },
  { id: 'upper', name: 'Upper Body', groups: ['Chest', 'Back', 'Shoulders', 'Arms'], icon: 'M12 2a10 10 0 0110 10c0 5-4 8-10 8S2 17 2 12 7 2 12 2z', desc: 'Everything above waist' },
  { id: 'lower', name: 'Lower Body', groups: ['Legs', 'Core'], icon: 'M17 2l4 4-4 4M7 2l-4 4 4 4M12 10v12', desc: 'Legs and Core focus' },
  { id: 'arnold', name: 'Arnold Split', groups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'], icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', desc: 'Champion-level volume' },
  { id: 'bro', name: 'Bro Split', groups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'], icon: 'M4 12h16M12 4v16M20 12l-4-4M20 12l-4 4M4 12l4-4M4 12l4 4', desc: 'Each muscle group once per week' },
  { id: 'fullbody', name: 'Full Body', groups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'], icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Total body training' },
];

const DAY_TYPES = [
  { id: 'workout', label: 'Workout Day', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'rest', label: 'Rest Day', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
  { id: 'recovery', label: 'Recovery Day', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'cardio', label: 'Cardio Day', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const STORAGE_KEY_SCHEDULE = 'gr_workout_schedule';

const getWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
};

const calcEstimatedDuration = (exercises) => {
  if (!exercises || exercises.length === 0) return 0;
  return exercises.reduce((acc, ex) => acc + (ex.sets || 3) * 5, 0);
};

const calcEstimatedCalories = (exercises) => {
  if (!exercises || exercises.length === 0) return 0;
  return exercises.reduce((acc, ex) => {
    const sets = ex.sets || 3;
    const reps = ex.reps || 10;
    return acc + sets * reps * 0.5;
  }, 0);
};

const calcXPReward = (exercises) => {
  if (!exercises || exercises.length === 0) return 0;
  return exercises.reduce((acc, ex) => acc + (ex.xpReward || 15) * (ex.sets || 3), 0);
};

const calcDifficulty = (exercises) => {
  if (!exercises || exercises.length === 0) return 'Beginner';
  const diffMap = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  const avg = exercises.reduce((acc, ex) => acc + (diffMap[ex.difficulty] || 1), 0) / exercises.length;
  if (avg >= 2.5) return 'Advanced';
  if (avg >= 1.5) return 'Intermediate';
  return 'Beginner';
};

const getDifficultyColor = (diff) => {
  switch (diff) {
    case 'Beginner': return { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/20' };
    case 'Intermediate': return { border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-950/20' };
    case 'Advanced': return { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-950/20' };
    default: return { border: 'border-gray-500', text: 'text-gray-400', bg: 'bg-gray-950/10' };
  }
};

const getDayTypeStyle = (type) => {
  switch (type) {
    case 'rest': return { border: 'border-blue-500/30', bg: 'bg-blue-950/10', text: 'text-blue-400', label: 'Rest Day' };
    case 'recovery': return { border: 'border-emerald-500/30', bg: 'bg-emerald-950/10', text: 'text-emerald-400', label: 'Recovery Day' };
    case 'cardio': return { border: 'border-orange-500/30', bg: 'bg-orange-950/10', text: 'text-orange-400', label: 'Cardio Day' };
    default: return null;
  }
};

const Planner = () => {
  const navigate = useNavigate();
  const { addXP } = useLevel();
  const { exercises, workoutTemplates, workoutHistory } = useWorkout();

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    return saved ? JSON.parse(saved) : {};
  });

  const [activeDay, setActiveDay] = useState(null);
  const [modalTab, setModalTab] = useState('templates');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [customWorkoutName, setCustomWorkoutName] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [mgActiveGroup, setMgActiveGroup] = useState(null);
  const [mgSelectedExercises, setMgSelectedExercises] = useState([]);
  const [mgActiveSplit, setMgActiveSplit] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const todaySchedule = schedule[todayName];

  const getWorkoutExercises = (entry) => {
    if (!entry || entry.type !== 'workout' || !entry.exercises) return [];
    return entry.exercises;
  };

  const todayExercises = getWorkoutExercises(todaySchedule);

  const todayWorkout = todaySchedule?.type === 'workout' ? todaySchedule : null;

  const weeklyStats = useMemo(() => {
    const { monday, sunday } = getWeekRange();
    const plannedWorkouts = DAYS.filter(day => {
      const entry = schedule[day];
      return entry && entry.type === 'workout';
    }).length;

    const completedThisWeek = workoutHistory.filter(w => {
      const d = new Date(w.date || w.timestamp);
      return d >= monday && d <= sunday;
    });

    const completedDays = [...new Set(completedThisWeek.map(w => {
      const d = new Date(w.date || w.timestamp);
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    }))];

    const completionRate = plannedWorkouts > 0
      ? Math.round((completedDays.length / plannedWorkouts) * 100)
      : 0;

    return {
      plannedWorkouts,
      completedDays: completedDays.length,
      completionRate,
    };
  }, [schedule, workoutHistory]);

  const getPlanForDay = (day) => {
    return schedule[day] || null;
  };

  const handleAssignDayType = (day, type) => {
    if (type === 'workout') {
      setActiveDay(day);
      setModalTab('templates');
      setSelectedMuscleGroup(null);
      setSelectedExercises([]);
      setCustomWorkoutName('');
      setMgActiveGroup(null);
      setMgSelectedExercises([]);
      setMgActiveSplit(null);
    } else {
      setSchedule(prev => ({
        ...prev,
        [day]: { type },
      }));
      setActiveDay(null);
    }
  };

  const handleAssignTemplate = (day, template) => {
    const exercisesWithDetails = template.exercises.map(e => {
      const exData = exercises.find(ex => ex.id === e.exerciseId);
      return {
        exerciseId: e.exerciseId,
        name: exData?.name || e.name || 'Unknown',
        sets: e.sets || 3,
        reps: e.reps || 10,
        weight: e.weight || 0,
        difficulty: exData?.difficulty || 'Beginner',
        xpReward: exData?.xpReward || 10,
        muscleGroup: exData?.muscleGroup || template.muscleGroup || 'Other',
      };
    });

    setSchedule(prev => ({
      ...prev,
      [day]: {
        type: 'workout',
        source: 'template',
        templateId: template.id,
        name: template.name,
        muscleGroup: template.muscleGroup || 'Full Body',
        exercises: exercisesWithDetails,
      },
    }));
    setActiveDay(null);
  };

  const handleRemovePlan = (day) => {
    setSchedule(prev => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });
  };

  const handleAddExercise = (ex) => {
    if (selectedExercises.some(e => e.exerciseId === ex.id)) return;
    setSelectedExercises(prev => [...prev, {
      exerciseId: ex.id,
      name: ex.name,
      sets: 3,
      reps: 10,
      weight: ex.trackingType === 'weight' ? 20 : 0,
      difficulty: ex.difficulty || 'Beginner',
      xpReward: ex.xpReward || 10,
      muscleGroup: ex.muscleGroup || selectedMuscleGroup,
    }]);
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises(prev => prev.filter(e => e.exerciseId !== exerciseId));
  };

  const handleUpdateExercise = (exerciseId, field, value) => {
    setSelectedExercises(prev => prev.map(e =>
      e.exerciseId === exerciseId ? { ...e, [field]: value } : e
    ));
  };

  const handleAssignCustomWorkout = () => {
    if (selectedExercises.length === 0 || !activeDay) return;
    const name = customWorkoutName.trim() || `${selectedMuscleGroup || 'Full Body'} Workout`;
    setSchedule(prev => ({
      ...prev,
      [activeDay]: {
        type: 'workout',
        source: 'custom',
        name,
        muscleGroup: selectedMuscleGroup || 'Full Body',
        exercises: [...selectedExercises],
      },
    }));
    setActiveDay(null);
  };

  const handleStartWorkout = () => {
    if (!todayWorkout) return;
    const bridgeData = {
      name: todayWorkout.name,
      exercises: todayWorkout.exercises.map(e => ({
        exerciseId: e.exerciseId,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight,
      })),
    };
    localStorage.setItem('gr_today_workout', JSON.stringify(bridgeData));
    localStorage.setItem('gr_auto_start_workout', 'true');
    navigate('/tracker');
  };

  const handleMarkCompleted = () => {
    if (!todayWorkout) return;
    const xpGained = calcXPReward(todayExercises);
    addXP(xpGained);
    setShowCompleted(true);
    setTimeout(() => setShowCompleted(false), 4000);
  };

  const getDefaultExercisesForGroup = (groupId, count = 5) => {
    const groupExercises = exercises.filter(ex => ex.muscleGroup === groupId);
    return groupExercises.slice(0, count).map(ex => ({
      exerciseId: ex.id,
      name: ex.name,
      sets: 3,
      reps: 10,
      weight: ex.trackingType === 'weight' ? 20 : 0,
      difficulty: ex.difficulty || 'Beginner',
      xpReward: ex.xpReward || 10,
      muscleGroup: ex.muscleGroup || groupId,
    }));
  };

  const handleAssignMuscleGroupWorkout = (day, groupId, exercisesToAssign) => {
    const exList = exercisesToAssign && exercisesToAssign.length > 0
      ? exercisesToAssign
      : getDefaultExercisesForGroup(groupId);
    const mgCard = MUSCLE_GROUP_CARDS.find(c => c.id === groupId);
    setSchedule(prev => ({
      ...prev,
      [day]: {
        type: 'workout',
        source: 'muscleGroup',
        name: mgCard?.name || groupId,
        muscleGroup: groupId,
        exercises: exList,
      },
    }));
    setActiveDay(null);
  };

  const handleAssignSplitWorkout = (day, split) => {
    const allExercises = [];
    const maxPerGroup = Math.max(2, Math.floor(6 / split.groups.length));
    split.groups.forEach(groupId => {
      const groupExs = exercises.filter(ex => ex.muscleGroup === groupId);
      const selected = groupExs.slice(0, maxPerGroup).map(ex => ({
        exerciseId: ex.id,
        name: ex.name,
        sets: 3,
        reps: 10,
        weight: ex.trackingType === 'weight' ? 20 : 0,
        difficulty: ex.difficulty || 'Beginner',
        xpReward: ex.xpReward || 10,
        muscleGroup: ex.muscleGroup || groupId,
      }));
      allExercises.push(...selected);
    });
    setSchedule(prev => ({
      ...prev,
      [day]: {
        type: 'workout',
        source: 'split',
        name: split.name,
        muscleGroup: split.groups.join(', '),
        exercises: allExercises,
      },
    }));
    setActiveDay(null);
  };

  const handleToggleMgExercise = (exId) => {
    setMgSelectedExercises(prev =>
      prev.includes(exId)
        ? prev.filter(id => id !== exId)
        : [...prev, exId]
    );
  };

  const handleSelectAllMg = (groupId) => {
    const all = exercises.filter(ex => ex.muscleGroup === groupId).map(ex => ex.id);
    setMgSelectedExercises(all);
  };

  const mgFilteredExercises = useMemo(() => {
    if (!mgActiveGroup || !exercises) return [];
    return exercises.filter(ex => ex.muscleGroup === mgActiveGroup);
  }, [mgActiveGroup, exercises]);

  const filteredExercises = useMemo(() => {
    if (!selectedMuscleGroup || !exercises) return [];
    return exercises.filter(ex => ex.muscleGroup === selectedMuscleGroup);
  }, [selectedMuscleGroup, exercises]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center gradient-text mb-2">
          Workout Planner
        </h1>
        <p className="text-center text-sl-gray-light max-w-2xl mx-auto">
          Plan your training schedule, assign workouts, and stay consistent.
        </p>
      </div>

      {/* Weekly Progress Card */}
      <div className="bg-sl-gray/20 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow mb-8">
        <h2 className="text-xl font-bold text-sl-purple-light mb-4">Weekly Progress</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{weeklyStats.plannedWorkouts}</div>
            <div className="text-sm text-sl-gray-light mt-1">Planned Workouts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{weeklyStats.completedDays}</div>
            <div className="text-sm text-sl-gray-light mt-1">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-sl-purple-light">{weeklyStats.completionRate}%</div>
            <div className="text-sm text-sl-gray-light mt-1">Completion Rate</div>
          </div>
        </div>
        <div className="mt-4 w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sl-purple to-sl-red rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, weeklyStats.completionRate)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Weekly Workout Schedule */}
        <div className="lg:col-span-2 bg-sl-gray/20 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow">
          <h2 className="text-2xl font-bold text-sl-purple-light mb-6 border-b border-sl-purple/15 pb-2">
            Weekly Workout Schedule
          </h2>

          <div className="space-y-3">
            {DAYS.map(day => {
              const plan = getPlanForDay(day);
              const isToday = day === todayName;
              const dayTypeStyle = plan ? getDayTypeStyle(plan.type) : null;

              return (
                <div
                  key={day}
                  className={`p-4 rounded-sl-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
                    isToday
                      ? 'border-sl-purple/50 bg-sl-purple/5 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                      : 'border-sl-purple/10 bg-sl-gray/10 hover:bg-sl-gray/15'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-28 shrink-0">
                      <span className={`font-bold text-lg ${isToday ? 'text-sl-purple-light' : 'text-white'}`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="block text-[10px] text-sl-purple-light font-bold uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      {dayTypeStyle ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${dayTypeStyle.border} ${dayTypeStyle.text} ${dayTypeStyle.bg}`}>
                          {dayTypeStyle.label}
                        </span>
                      ) : plan?.type === 'workout' ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded border border-sl-purple/30 text-sl-purple-light bg-sl-purple/20">
                            {plan.muscleGroup || 'Full Body'}
                          </span>
                          <span className="text-sm font-semibold text-sl-gray-light/95 truncate">
                            {plan.name}
                          </span>
                          <span className="text-xs text-sl-gray-light/60">
                            {plan.exercises?.length || 0} exercises
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-sl-gray-light/45 italic">No workout assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 self-stretch md:self-auto justify-end shrink-0">
                    <button
                      onClick={() => handleAssignDayType(day, 'workout')}
                      className="bg-sl-purple/10 hover:bg-sl-purple/25 text-sl-purple-light border border-sl-purple/20 px-3 py-1.5 rounded-sl-lg text-xs font-semibold transition"
                    >
                      {plan?.type === 'workout' ? 'Change' : 'Assign Workout'}
                    </button>
                    <div className="relative group">
                      <button className="bg-sl-gray/20 hover:bg-sl-gray/30 text-sl-gray-light border border-sl-gray/20 px-2 py-1.5 rounded-sl-lg text-xs transition">
                        ...
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-sl-dark border border-sl-purple/30 rounded-xl shadow-xl z-30 hidden group-hover:block min-w-40">
                        {DAY_TYPES.filter(dt => dt.id !== 'workout').map(dt => (
                          <button
                            key={dt.id}
                            onClick={() => handleAssignDayType(day, dt.id)}
                            className="w-full text-left px-3 py-2 text-xs text-sl-gray-light hover:bg-sl-purple/10 transition flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={dt.icon} />
                            </svg>
                            {dt.label}
                          </button>
                        ))}
                        {plan && (
                          <>
                            <div className="border-t border-sl-purple/10" />
                            <button
                              onClick={() => handleRemovePlan(day)}
                              className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 transition flex items-center gap-2 rounded-b-xl"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Today's Planned Workout */}
        <div className="bg-sl-gray/20 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow flex flex-col">
          <h2 className="text-2xl font-bold text-sl-purple-light mb-6 border-b border-sl-purple/15 pb-2">
            Today's Planned Workout
          </h2>

          {!todaySchedule || todaySchedule.type !== 'workout' ? (
            <div className="flex flex-col items-center justify-center flex-grow text-center py-12">
              <div className="w-16 h-16 bg-sl-purple/5 rounded-full flex items-center justify-center border border-sl-purple/20 animate-pulse mb-4">
                <svg className="w-8 h-8 text-sl-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sl-gray-light font-medium">
                {todaySchedule?.type === 'rest'
                  ? "Today is a Rest Day. Time to recover!"
                  : todaySchedule?.type === 'recovery'
                  ? "Today is a Recovery Day. Focus on mobility and light activity."
                  : todaySchedule?.type === 'cardio'
                  ? "Today is a Cardio Day. Get your heart pumping!"
                  : "No workout planned for today."}
              </p>
              {(!todaySchedule || todaySchedule.type === 'workout') && (
                <p className="text-xs text-sl-gray-light/50 mt-1 max-w-xs">
                  Assign a workout to {todayName} in the schedule to see it here.
                </p>
              )}
            </div>
          ) : showCompleted ? (
            <div className="flex flex-col items-center justify-center flex-grow text-center py-12">
              <div className="w-16 h-16 bg-emerald-950/20 rounded-full flex items-center justify-center border border-emerald-500/30 mb-4 animate-bounce">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-emerald-400 font-bold text-lg">Workout Complete!</p>
              <p className="text-xs text-sl-gray-light/60 mt-1">
                You earned {calcXPReward(todayExercises)} XP. Keep up the consistency!
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getDifficultyColor(calcDifficulty(todayExercises)).border} ${getDifficultyColor(calcDifficulty(todayExercises)).text} ${getDifficultyColor(calcDifficulty(todayExercises)).bg}`}>
                    {calcDifficulty(todayExercises)}
                  </span>
                  <h3 className="font-semibold text-white text-lg truncate">{todayWorkout.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-sl-gray/10 rounded-lg p-2.5 text-center border border-sl-purple/10">
                    <div className="text-lg font-bold text-white">{todayExercises.length}</div>
                    <div className="text-[10px] text-sl-gray-light">Exercises</div>
                  </div>
                  <div className="bg-sl-gray/10 rounded-lg p-2.5 text-center border border-sl-purple/10">
                    <div className="text-lg font-bold text-white">{calcEstimatedDuration(todayExercises)} min</div>
                    <div className="text-[10px] text-sl-gray-light">Duration</div>
                  </div>
                  <div className="bg-sl-gray/10 rounded-lg p-2.5 text-center border border-sl-purple/10">
                    <div className="text-lg font-bold text-orange-400">{Math.round(calcEstimatedCalories(todayExercises))}</div>
                    <div className="text-[10px] text-sl-gray-light">Calories</div>
                  </div>
                  <div className="bg-sl-gray/10 rounded-lg p-2.5 text-center border border-sl-purple/10">
                    <div className="text-lg font-bold text-sl-purple-light">+{calcXPReward(todayExercises)}</div>
                    <div className="text-[10px] text-sl-gray-light">XP Reward</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-sl-gray-light/70 uppercase tracking-wider font-semibold mb-2">Exercises</p>
                  {todayExercises.map((ex, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-sl-gray/10 border border-sl-purple/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-sl-purple-light/60 font-mono shrink-0">{idx + 1}.</span>
                        <span className="text-sm font-medium text-white truncate">{ex.name}</span>
                      </div>
                      <span className="text-xs text-sl-gray-light/80 font-bold shrink-0 ml-2">
                        {ex.sets}x{ex.reps}{ex.weight > 0 ? ` @ ${ex.weight}kg` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleStartWorkout}
                  className="holo-button w-full py-3 text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Workout
                </button>
                <button
                  onClick={handleMarkCompleted}
                  className="w-full py-2 text-xs text-sl-gray-light/60 hover:text-sl-gray-light/80 transition border border-sl-purple/10 rounded-sl-lg"
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assign Workout Modal */}
      {activeDay && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-sl-dark border border-sl-purple/30 p-6 rounded-sl-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-sl-glow-purple">
            <h3 className="text-2xl font-bold text-sl-purple-light mb-4 border-b border-sl-purple/25 pb-2">
              Assign Workout for {activeDay}
            </h3>

            {/* Quick Day Type Options */}
            <div className="flex gap-2 mb-6">
              {DAY_TYPES.map(dt => (
                <button
                  key={dt.id}
                  onClick={() => handleAssignDayType(activeDay, dt.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-sl-lg text-xs font-semibold transition bg-sl-gray/20 hover:bg-sl-gray/30 text-sl-gray-light border border-sl-gray/20"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={dt.icon} />
                  </svg>
                  {dt.label}
                </button>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-sl-purple/15 pb-2">
              <button
                onClick={() => { setModalTab('templates'); setMgActiveGroup(null); setMgActiveSplit(null); }}
                className={`text-sm font-semibold pb-2 border-b-2 transition -mb-[10px] ${
                  modalTab === 'templates'
                    ? 'text-sl-purple-light border-sl-purple'
                    : 'text-sl-gray-light border-transparent hover:text-white'
                }`}
              >
                Saved Templates
              </button>
              <button
                onClick={() => { setModalTab('custom'); setMgActiveGroup(null); setMgActiveSplit(null); }}
                className={`text-sm font-semibold pb-2 border-b-2 transition -mb-[10px] ${
                  modalTab === 'custom'
                    ? 'text-sl-purple-light border-sl-purple'
                    : 'text-sl-gray-light border-transparent hover:text-white'
                }`}
              >
                Custom Workout
              </button>
              <button
                onClick={() => { setModalTab('musclegroups'); setMgActiveGroup(null); setMgActiveSplit(null); setMgSelectedExercises([]); }}
                className={`text-sm font-semibold pb-2 border-b-2 transition -mb-[10px] ${
                  modalTab === 'musclegroups'
                    ? 'text-sl-purple-light border-sl-purple'
                    : 'text-sl-gray-light border-transparent hover:text-white'
                }`}
              >
                Muscle Groups
              </button>
            </div>

            {modalTab === 'templates' ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {workoutTemplates.length === 0 ? (
                  <p className="text-sm text-sl-gray-light/45 italic py-4 text-center">
                    No saved templates yet. Create one in the Tracker first.
                  </p>
                ) : (
                  workoutTemplates.map(t => {
                    const exCount = t.exercises?.length || 0;
                    const totalSets = t.exercises?.reduce((acc, e) => acc + (e.sets || 3), 0) || 0;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleAssignTemplate(activeDay, t)}
                        className="w-full text-left p-3 rounded-sl-lg border border-sl-purple/10 bg-sl-gray/10 hover:bg-sl-purple/5 hover:border-sl-purple/30 transition flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded border border-sl-purple/30 text-sl-purple-light bg-sl-purple/10">
                              {t.muscleGroup || 'Full Body'}
                            </span>
                            <span className="text-sm font-semibold text-white">{t.name}</span>
                          </div>
                          <p className="text-xs text-sl-gray-light/70 mt-1">
                            {exCount} exercises · {totalSets} total sets
                          </p>
                        </div>
                        <span className="text-xs font-bold text-sl-purple-light shrink-0 ml-2">Assign</span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : modalTab === 'musclegroups' ? (
              <div className="space-y-5">
                {!mgActiveGroup && !mgActiveSplit ? (
                  <>
                    {/* Muscle Group Cards */}
                    <div>
                      <p className="text-xs text-sl-purple/60 uppercase tracking-widest font-bold mb-3">
                        Train by Muscle Group
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {MUSCLE_GROUP_CARDS.map(mg => (
                          <button
                            key={mg.id}
                            onClick={() => { setMgActiveGroup(mg.id); setMgSelectedExercises([]); }}
                            className={`p-4 rounded-sl-xl border ${mg.color} ${mg.bg} hover:bg-sl-purple/10 hover:border-sl-purple/40 transition-all group text-center`}
                          >
                            <svg className={`w-8 h-8 mx-auto mb-2 ${mg.text} group-hover:scale-110 transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={mg.icon} />
                            </svg>
                            <span className={`text-xs font-bold ${mg.text}`}>{mg.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Popular Splits */}
                    <div>
                      <p className="text-xs text-sl-purple/60 uppercase tracking-widest font-bold mb-3">
                        Popular Splits
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {POPULAR_SPLITS.map(split => (
                          <button
                            key={split.id}
                            onClick={() => handleAssignSplitWorkout(activeDay, split)}
                            className="p-3 rounded-sl-lg border border-sl-purple/10 bg-sl-gray/10 hover:bg-sl-purple/5 hover:border-sl-purple/30 transition text-left"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="w-4 h-4 text-sl-purple-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={split.icon} />
                              </svg>
                              <span className="text-sm font-semibold text-white">{split.name}</span>
                            </div>
                            <p className="text-[10px] text-sl-gray-light/60">{split.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : mgActiveGroup ? (
                  <div>
                    <button
                      onClick={() => { setMgActiveGroup(null); setMgSelectedExercises([]); }}
                      className="text-xs text-sl-purple-light hover:text-white transition mb-3 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to all groups
                    </button>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-white">
                        {MUSCLE_GROUP_CARDS.find(c => c.id === mgActiveGroup)?.name || mgActiveGroup}
                      </p>
                      <button
                        onClick={() => handleSelectAllMg(mgActiveGroup)}
                        className="text-[10px] text-sl-purple-light/60 hover:text-sl-purple-light transition"
                      >
                        Select All
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto mb-4">
                      {mgFilteredExercises.map(ex => {
                        const isSelected = mgSelectedExercises.includes(ex.id);
                        return (
                          <button
                            key={ex.id}
                            onClick={() => handleToggleMgExercise(ex.id)}
                            className={`w-full text-left p-2.5 rounded-sl-lg border transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-sl-purple/15 border-sl-purple/40'
                                : 'bg-sl-gray/10 border-sl-purple/10 hover:bg-sl-gray/20'
                            }`}
                          >
                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-sl-gray-light'}`}>
                              {ex.name}
                            </span>
                            {isSelected && (
                              <svg className="w-4 h-4 text-sl-purple-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                      {mgFilteredExercises.length === 0 && (
                        <p className="text-xs text-sl-gray-light/45 italic py-2">No exercises found for this group.</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const selected = mgSelectedExercises.length > 0
                          ? exercises.filter(ex => mgSelectedExercises.includes(ex.id)).map(ex => ({
                              exerciseId: ex.id,
                              name: ex.name,
                              sets: 3,
                              reps: 10,
                              weight: ex.trackingType === 'weight' ? 20 : 0,
                              difficulty: ex.difficulty || 'Beginner',
                              xpReward: ex.xpReward || 10,
                              muscleGroup: ex.muscleGroup || mgActiveGroup,
                            }))
                          : [];
                        handleAssignMuscleGroupWorkout(activeDay, mgActiveGroup, selected);
                      }}
                      className="w-full bg-sl-purple/20 hover:bg-sl-purple/30 text-sl-purple-light border border-sl-purple/30 px-4 py-2.5 rounded-sl-lg text-sm font-semibold transition"
                    >
                      Assign {MUSCLE_GROUP_CARDS.find(c => c.id === mgActiveGroup)?.name || mgActiveGroup}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Step 1: Muscle Group */}
                <div>
                  <p className="text-xs text-sl-purple/60 uppercase tracking-widest font-bold mb-2">Step 1: Select Muscle Group</p>
                  <div className="flex flex-wrap gap-2">
                    {MUSCLE_GROUPS.map(mg => (
                      <button
                        key={mg.id}
                        onClick={() => {
                          setSelectedMuscleGroup(mg.id);
                          setSelectedExercises([]);
                        }}
                        className={`px-3 py-1.5 rounded-sl-lg text-xs font-semibold transition border ${
                          selectedMuscleGroup === mg.id
                            ? 'bg-sl-purple/20 border-sl-purple/50 text-sl-purple-light'
                            : 'bg-sl-gray/20 border-sl-gray/20 text-sl-gray-light hover:bg-sl-gray/30'
                        }`}
                      >
                        {mg.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Select Exercises */}
                {selectedMuscleGroup && (
                  <div>
                    <p className="text-xs text-sl-purple/60 uppercase tracking-widest font-bold mb-2">
                      Step 2: Choose Exercises
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {filteredExercises.map(ex => {
                        const isSelected = selectedExercises.some(e => e.exerciseId === ex.id);
                        return (
                          <button
                            key={ex.id}
                            onClick={() => isSelected ? handleRemoveExercise(ex.id) : handleAddExercise(ex)}
                            className={`p-2 rounded-sl-lg border text-left transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-sl-purple/15 border-sl-purple/40'
                                : 'bg-sl-gray/10 border-sl-purple/10 hover:bg-sl-gray/20'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="text-sm font-medium text-white truncate block">{ex.name}</span>
                              <span className="text-[10px] text-sl-gray-light/60">{ex.equipment}</span>
                            </div>
                            {isSelected && (
                              <svg className="w-4 h-4 text-sl-purple-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                      {filteredExercises.length === 0 && (
                        <p className="text-xs text-sl-gray-light/45 italic py-2 col-span-2">No exercises found for this muscle group.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Configure */}
                {selectedExercises.length > 0 && (
                  <div>
                    <p className="text-xs text-sl-purple/60 uppercase tracking-widest font-bold mb-2">Step 3: Configure Workout</p>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Workout name (e.g. Chest Arsenal Blast)"
                        value={customWorkoutName}
                        onChange={e => setCustomWorkoutName(e.target.value)}
                        className="holo-input text-sm w-full"
                      />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedExercises.map(ex => (
                        <div key={ex.exerciseId} className="p-2.5 rounded-sl-lg bg-sl-gray/10 border border-sl-purple/10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-white">{ex.name}</span>
                            <button
                              onClick={() => handleRemoveExercise(ex.exerciseId)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-sl-gray-light block mb-0.5">Sets</label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={ex.sets}
                                onChange={e => handleUpdateExercise(ex.exerciseId, 'sets', parseInt(e.target.value) || 1)}
                                className="holo-input text-center text-xs py-1"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-sl-gray-light block mb-0.5">Reps</label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={ex.reps}
                                onChange={e => handleUpdateExercise(ex.exerciseId, 'reps', parseInt(e.target.value) || 1)}
                                className="holo-input text-center text-xs py-1"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-sl-gray-light block mb-0.5">Weight (kg)</label>
                              <input
                                type="number"
                                min="0"
                                max="999"
                                value={ex.weight}
                                onChange={e => handleUpdateExercise(ex.exerciseId, 'weight', parseFloat(e.target.value) || 0)}
                                className="holo-input text-center text-xs py-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveDay(null)}
                className="bg-sl-gray/30 hover:bg-sl-gray/40 text-sl-gray-light px-4 py-2 rounded-sl-lg text-sm font-semibold transition"
              >
                Cancel
              </button>
              {modalTab === 'custom' && selectedExercises.length > 0 && (
                <button
                  onClick={handleAssignCustomWorkout}
                  className="bg-sl-purple/20 hover:bg-sl-purple/30 text-sl-purple-light border border-sl-purple/30 px-4 py-2 rounded-sl-lg text-sm font-semibold transition"
                >
                  Assign Workout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
