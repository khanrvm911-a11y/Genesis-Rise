import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLevel } from '../context/LevelContext';
import { useNotification } from '../context/NotificationContext';
import { useWorkout } from '../context/WorkoutContext';
import { ChevronDown, ChevronLeft, Check, X, Moon } from 'lucide-react';
import { dispatchTodaysWorkoutChanged } from '../utils/syncEvents';

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
  { id: 'push', name: 'Push Day', groups: ['Chest', 'Shoulders'], icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z', desc: 'Chest, Shoulders, Triceps' },
  { id: 'pull', name: 'Pull Day', groups: ['Back', 'Arms'], icon: 'M5 10l7-7 7 7M5 19l7-7 7 7', desc: 'Back, Biceps' },
  { id: 'legs', name: 'Leg Day', groups: ['Legs'], icon: 'M17 2l4 4-4 4M7 2l-4 4 4 4M12 10v12M8 14l4-4 4 4', desc: 'Quads, Hamstrings, Glutes, Calves' },
  { id: 'ppl', name: 'Push Pull Legs', groups: ['Chest', 'Back', 'Legs'], icon: 'M12 2l3 7h7l-5 4 2 7-7-4-7 4 2-7-5-4h7z', desc: 'Full body split' },
  { id: 'upper', name: 'Upper Body', groups: ['Chest', 'Back', 'Shoulders', 'Arms'], icon: 'M12 2a10 10 0 0110 10c0 5-4 8-10 8S2 17 2 12 7 2 12 2z', desc: 'Everything above waist' },
  { id: 'lower', name: 'Lower Body', groups: ['Legs', 'Core'], icon: 'M17 2l4 4-4 4M7 2l-4 4 4 4M12 10v12', desc: 'Legs and Core focus' },
  { id: 'arnold', name: 'Arnold Split', groups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'], icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', desc: 'High volume split' },
  { id: 'bro', name: 'Bro Split', groups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'], icon: 'M4 12h16M12 4v16M20 12l-4-4M20 12l-4 4M4 12l4-4M4 12l4 4', desc: 'Each muscle group once per week' },
  { id: 'fullbody', name: 'Full Body', groups: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'], icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z', desc: 'Total body training' },
];

const DAY_TYPES = [
  { id: 'workout', label: 'Workout Day', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'rest', label: 'Rest Day', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
  { id: 'recovery', label: 'Rest Day', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'cardio', label: 'Rest Day', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const STORAGE_KEY_SCHEDULE = 'gr_workout_schedule';
const STORAGE_KEY_COMPLETED = 'gr_completed_workouts';
const STORAGE_KEY_TODAYS_WORKOUT = 'gr_todays_workout';

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
    case 'recovery': return { border: 'border-emerald-500/30', bg: 'bg-emerald-950/10', text: 'text-emerald-400', label: 'Rest Day' };
    case 'cardio': return { border: 'border-orange-500/30', bg: 'bg-orange-950/10', text: 'text-orange-400', label: 'Rest Day' };
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
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseSets, setCustomExerciseSets] = useState(1);
  const [setsError, setSetsError] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editExerciseName, setEditExerciseName] = useState('');

  const [completedWorkouts, setCompletedWorkouts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedWorkouts));
  }, [completedWorkouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const { addNotification } = useNotification();
  const prevTodayRef = useRef(schedule[todayName]);
  const isInitialMount = useRef(true);

  const saveTodaysWorkout = (entry) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (entry && entry.type === 'workout') {
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
    }
  };

  useEffect(() => {
    const todayEntry = schedule[todayName];
    const prevEntry = prevTodayRef.current;
    prevTodayRef.current = todayEntry;

    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      const prevType = prevEntry?.type;
      const currType = todayEntry?.type;
      if (currType && currType !== prevType) {
        if (currType === 'workout') {
          addNotification('Workout Assigned', `Today's workout: ${todayEntry.name}`, 'planner', 'planner', '/planner');
        } else if (['rest', 'recovery', 'cardio'].includes(currType)) {
          addNotification('Rest Day', 'Today is your scheduled rest day. Take time to recover.', 'rest_day', 'rest_day', '/planner');
        }
      } else if (currType === 'workout' && todayEntry.name !== prevEntry?.name) {
        addNotification('Workout Changed', `Today's workout has been updated to: ${todayEntry.name}`, 'planner', 'planner', '/planner');
      }
    }

    if (todayEntry && todayEntry.type === 'workout') {
      saveTodaysWorkout(todayEntry);
    } else {
      localStorage.removeItem(STORAGE_KEY_TODAYS_WORKOUT);
      localStorage.removeItem('gr_active_workout_session');
    }
    dispatchTodaysWorkoutChanged();
  }, [schedule[todayName], addNotification]);

  const todaySchedule = schedule[todayName];

  const getWorkoutExercises = (entry) => {
    if (!entry || entry.type !== 'workout' || !entry.exercises) return [];
    return entry.exercises;
  };

  const todayExercises = getWorkoutExercises(todaySchedule);

  const todayWorkout = todaySchedule?.type === 'workout' ? todaySchedule : null;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompleted = completedWorkouts.includes(todayStr);

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
      setCustomExerciseName('');
      setCustomExerciseSets(1);
      setEditingExerciseId(null);
      setEditExerciseName('');
    } else {
      setSchedule(prev => ({ ...prev, [day]: { type } }));
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
        trackingType: exData?.trackingType || 'weight',
        equipment: exData?.equipment || '',
      };
    });

    const entry = { type: 'workout', source: 'template', templateId: template.id, name: template.name, muscleGroup: template.muscleGroup || 'Full Body', exercises: exercisesWithDetails };
    setSchedule(prev => ({ ...prev, [day]: entry }));
    if (day === todayName) { saveTodaysWorkout(entry); dispatchTodaysWorkoutChanged(); }
    setActiveDay(null);
  };

  const handleRemovePlan = (day) => {
    setSchedule(prev => { const copy = { ...prev }; delete copy[day]; return copy; });
  };

  const handleAssignExercise = (ex) => {
    if (selectedExercises.some(e => e.exerciseId === ex.id)) return;
    if (selectedExercises.length >= 10) return;
    setSelectedExercises(prev => [...prev, { exerciseId: ex.id, name: ex.name, sets: 3, reps: 10, weight: ex.trackingType === 'weight' ? 20 : 0, difficulty: ex.difficulty || 'Beginner', xpReward: ex.xpReward || 10, muscleGroup: ex.muscleGroup || selectedMuscleGroup }]);
  };

  const handleRemoveExercise = (exerciseId) => {
    setSelectedExercises(prev => prev.filter(e => e.exerciseId !== exerciseId));
  };

  const handleUpdateExercise = (exerciseId, field, value) => {
    setSelectedExercises(prev => prev.map(e => e.exerciseId === exerciseId ? { ...e, [field]: value } : e));
  };

  const handleStartEdit = (ex) => {
    setEditExerciseName(ex.name);
    setEditingExerciseId(ex.exerciseId);
  };

  const handleSaveEdit = () => {
    const name = editExerciseName.trim();
    if (!name || !editingExerciseId) return;
    handleUpdateExercise(editingExerciseId, 'name', name);
    setEditingExerciseId(null);
    setEditExerciseName('');
  };

  const handleAssignCustomExercise = () => {
    const name = customExerciseName.trim();
    if (!name || selectedExercises.length >= 10) return;
    setSelectedExercises(prev => [...prev, {
      exerciseId: `custom-${Date.now()}`,
      name,
      sets: customExerciseSets || 1,
      reps: 10,
      weight: 0,
      difficulty: 'Beginner',
      xpReward: 10,
      muscleGroup: selectedMuscleGroup || 'Other',
      trackingType: 'weight',
      equipment: '',
    }]);
    setCustomExerciseName('');
    setCustomExerciseSets(1);
  };

  const handleAssignCustomWorkout = () => {
    if (selectedExercises.length === 0 || !activeDay) return;
    const name = customWorkoutName.trim() || `${selectedMuscleGroup || 'Full Body'} Workout`;
    const entry = { type: 'workout', source: 'custom', name, muscleGroup: selectedMuscleGroup || 'Full Body', exercises: [...selectedExercises] };
    setSchedule(prev => ({ ...prev, [activeDay]: entry }));
    if (activeDay === todayName) { saveTodaysWorkout(entry); dispatchTodaysWorkoutChanged(); }
    setActiveDay(null);
  };

  const handleStartWorkout = () => {
    if (!todayWorkout) return;
    saveTodaysWorkout(todaySchedule);
    dispatchTodaysWorkoutChanged();
    localStorage.removeItem('gr_active_workout_session');
    navigate('/tracker');
  };

  const handleMarkCompleted = () => {
    if (!todayWorkout) return;
    const xpGained = calcXPReward(todayExercises);
    addXP(xpGained);
    addNotification('Workout Completed', `Great job! You earned ${xpGained} XP.`, 'workout', 'workout', '/tracker');
    const todayStr = new Date().toISOString().split('T')[0];
    setCompletedWorkouts(prev => prev.includes(todayStr) ? prev : [...prev, todayStr]);
    localStorage.removeItem(STORAGE_KEY_TODAYS_WORKOUT);
    dispatchTodaysWorkoutChanged();
    const completed = JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLETED) || '[]');
    if (!completed.includes(todayStr)) {
      completed.push(todayStr);
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completed));
    }
    setShowCompleted(true);
    setTimeout(() => setShowCompleted(false), 4000);
  };

  const handleRepeatWorkout = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setCompletedWorkouts(prev => prev.filter(d => d !== todayStr));
    handleStartWorkout();
  };

  const getDefaultExercisesForGroup = (groupId, count = 5) => {
    const groupExercises = exercises.filter(ex => ex.muscleGroup === groupId);
    return groupExercises.slice(0, count).map(ex => ({ exerciseId: ex.id, name: ex.name, sets: 3, reps: 10, weight: ex.trackingType === 'weight' ? 20 : 0, difficulty: ex.difficulty || 'Beginner', xpReward: ex.xpReward || 10, muscleGroup: ex.muscleGroup || groupId }));
  };

  const handleAssignMuscleGroupWorkout = (day, groupId, exercisesToAssign) => {
    const exList = exercisesToAssign && exercisesToAssign.length > 0 ? exercisesToAssign : getDefaultExercisesForGroup(groupId);
    const mgCard = MUSCLE_GROUP_CARDS.find(c => c.id === groupId);
    const entry = { type: 'workout', source: 'muscleGroup', name: mgCard?.name || groupId, muscleGroup: groupId, exercises: exList };
    setSchedule(prev => ({ ...prev, [day]: entry }));
    if (day === todayName) { saveTodaysWorkout(entry); dispatchTodaysWorkoutChanged(); }
    setActiveDay(null);
  };

  const handleAssignSplitWorkout = (day, split) => {
    const allExercises = [];
    const maxPerGroup = Math.max(2, Math.floor(6 / split.groups.length));
    split.groups.forEach(groupId => {
      const groupExs = exercises.filter(ex => ex.muscleGroup === groupId);
      const selected = groupExs.slice(0, maxPerGroup).map(ex => ({ exerciseId: ex.id, name: ex.name, sets: 3, reps: 10, weight: ex.trackingType === 'weight' ? 20 : 0, difficulty: ex.difficulty || 'Beginner', xpReward: ex.xpReward || 10, muscleGroup: ex.muscleGroup || groupId }));
      allExercises.push(...selected);
    });
    const entry = { type: 'workout', source: 'split', name: split.name, muscleGroup: split.groups.join(', '), exercises: allExercises };
    setSchedule(prev => ({ ...prev, [day]: entry }));
    if (day === todayName) { saveTodaysWorkout(entry); dispatchTodaysWorkoutChanged(); }
    setActiveDay(null);
  };

  const handleToggleMgExercise = (exId) => {
    setMgSelectedExercises(prev => prev.includes(exId) ? prev.filter(id => id !== exId) : [...prev, exId]);
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
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold gradient-text text-center">Workout Planner</h1>
          <p className="text-xs text-sl-gray-light text-center mt-0.5">Plan your training schedule</p>
        </div>

        <div className="mobile-card mb-4 p-4">
          <h2 className="text-base font-bold text-sl-purple-light mb-3">Weekly Progress</h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{weeklyStats.plannedWorkouts}</div>
              <div className="text-[10px] text-sl-gray-light font-semibold mt-0.5">Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{weeklyStats.completedDays}</div>
              <div className="text-[10px] text-sl-gray-light font-semibold mt-0.5">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sl-purple-light">{weeklyStats.completionRate}%</div>
              <div className="text-[10px] text-sl-gray-light font-semibold mt-0.5">Rate</div>
            </div>
          </div>
          <div className="w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red rounded-full transition-all duration-500" style={{ width: `${Math.min(100, weeklyStats.completionRate)}%` }} />
          </div>
        </div>

        <div className="mobile-card mb-4 p-4">
          <h2 className="text-base font-bold text-sl-purple-light mb-3 border-b border-sl-purple/15 pb-2">Weekly Schedule</h2>
          <div className="space-y-2">
            {DAYS.map(day => {
              const plan = getPlanForDay(day);
              const isToday = day === todayName;
              const dayTypeStyle = plan ? getDayTypeStyle(plan.type) : null;

              return (
                <div key={day} className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all duration-300 ${isToday ? 'border-sl-purple/50 bg-sl-purple/5 shadow-[0_0_10px_rgba(139,92,246,0.2)]' : 'border-sl-purple/10 bg-sl-gray/10'}`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="min-w-[60px] shrink-0">
                      <span className={`font-bold text-xs ${isToday ? 'text-sl-purple-light' : 'text-white'}`}>{day.slice(0, 3)}</span>
                      {isToday && <span className="block text-[8px] text-sl-purple-light font-bold uppercase">Today</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      {dayTypeStyle ? (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${dayTypeStyle.border} ${dayTypeStyle.text} ${dayTypeStyle.bg}`}>{dayTypeStyle.label}</span>
                      ) : plan?.type === 'workout' ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-sl-purple/30 text-sl-purple-light bg-sl-purple/10">{plan.muscleGroup || 'Full Body'}</span>
                          <span className="text-xs font-semibold text-sl-gray-light truncate">{plan.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-sl-gray-light/45 italic">Empty</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => handleAssignDayType(day, 'workout')} className="bg-sl-purple/10 hover:bg-sl-purple/25 text-sl-purple-light border border-sl-purple/20 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition touch-target">
                      Assign
                    </button>
                    {plan && (
                      <button onClick={() => handleRemovePlan(day)} className="bg-red-950/10 hover:bg-red-950/20 text-red-400 border border-red-500/20 px-1.5 py-1.5 rounded-lg transition touch-target">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    <div className="relative group">
                      <button className="bg-sl-gray/20 hover:bg-sl-gray/30 text-sl-gray-light border border-sl-gray/20 px-1.5 py-1.5 rounded-lg text-xs transition touch-target">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-sl-dark border border-sl-purple/30 rounded-xl shadow-xl z-30 hidden group-hover:block min-w-[140px]">
                        {DAY_TYPES.filter(dt => dt.id !== 'workout' && dt.id !== 'rest' && dt.id !== 'cardio').map(dt => (
                          <button key={dt.id} onClick={() => handleAssignDayType(day, dt.id)}
                            className="w-full text-left px-3 py-2 text-xs text-sl-gray-light hover:bg-sl-purple/10 transition flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={dt.icon} /></svg>
                            {dt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mobile-card p-4">
          <h2 className="text-base font-bold text-sl-purple-light mb-3 border-b border-sl-purple/15 pb-2">Today's Plan</h2>
          {todaySchedule && todaySchedule.type !== 'workout' ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-sl-purple/5 flex items-center justify-center border border-sl-purple/20 mb-4">
                <Moon className="w-8 h-8 text-sl-purple" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rest Day</h3>
              <p className="text-sm text-sl-gray-light max-w-xs leading-relaxed">
                Today is your scheduled rest day. Take time to relax, stay hydrated, stretch lightly, and prepare for tomorrow's workout.
              </p>
            </div>
          ) : !todaySchedule ? (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 bg-sl-purple/5 rounded-full flex items-center justify-center border border-sl-purple/20 mb-3">
                <svg className="w-6 h-6 text-sl-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-sm text-sl-gray-light font-medium mb-4">No workout planned for today.</p>
              <button onClick={() => {
                setActiveDay(todayName);
                setModalTab('templates');
                setSelectedMuscleGroup(null);
                setSelectedExercises([]);
                setCustomWorkoutName('');
                setMgActiveGroup(null);
                setMgSelectedExercises([]);
                setMgActiveSplit(null);
                setCustomExerciseName('');
                setCustomExerciseSets(1);
                setEditingExerciseId(null);
                setEditExerciseName('');
              }} className="holo-button holo-button-primary px-6 py-3 text-sm">
                Assign Today's Workout
              </button>
            </div>
          ) : todayCompleted || showCompleted ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 bg-emerald-950/20 rounded-full flex items-center justify-center border border-emerald-500/30 mb-3 animate-slide-up">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-bold text-lg">Workout Complete!</p>
              <p className="text-xs text-sl-gray-light mt-1 mb-4">+{calcXPReward(todayExercises)} XP earned</p>
              <button onClick={handleRepeatWorkout} className="holo-button holo-button-primary w-full py-3 text-sm text-center">
                Repeat Workout
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getDifficultyColor(calcDifficulty(todayExercises)).border} ${getDifficultyColor(calcDifficulty(todayExercises)).text} ${getDifficultyColor(calcDifficulty(todayExercises)).bg}`}>
                  {calcDifficulty(todayExercises)}
                </span>
                <h3 className="font-semibold text-white text-sm truncate">{todayWorkout.name}</h3>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mb-3">
                <div className="bg-sl-gray/10 rounded-lg p-2 text-center border border-sl-purple/10">
                  <div className="text-base font-bold text-white">{todayExercises.length}</div>
                  <div className="text-[8px] text-sl-gray-light font-semibold">Exs</div>
                </div>
                <div className="bg-sl-gray/10 rounded-lg p-2 text-center border border-sl-purple/10">
                  <div className="text-base font-bold text-white">{calcEstimatedDuration(todayExercises)} min</div>
                  <div className="text-[8px] text-sl-gray-light font-semibold">Time</div>
                </div>
                <div className="bg-sl-gray/10 rounded-lg p-2 text-center border border-sl-purple/10">
                  <div className="text-base font-bold text-orange-400">{Math.round(calcEstimatedCalories(todayExercises))}</div>
                  <div className="text-[8px] text-sl-gray-light font-semibold">Cal</div>
                </div>
                <div className="bg-sl-gray/10 rounded-lg p-2 text-center border border-sl-purple/10">
                  <div className="text-base font-bold text-sl-purple-light">+{calcXPReward(todayExercises)}</div>
                  <div className="text-[8px] text-sl-gray-light font-semibold">XP</div>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                {todayExercises.map((ex, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-sl-gray/10 border border-sl-purple/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-sl-purple-light/60 font-mono shrink-0">{idx + 1}.</span>
                      <span className="text-xs font-medium text-white truncate">{ex.name}</span>
                    </div>
                    <span className="text-[10px] text-sl-gray-light font-bold shrink-0 ml-1">{ex.sets}x{ex.reps}{ex.weight > 0 ? ` @ ${ex.weight}kg` : ''}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <button onClick={handleStartWorkout} className="holo-button holo-button-primary w-full py-3 text-sm text-center">
                  Start Workout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeDay && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center backdrop-blur-sm">
          <div className="bg-sl-dark border border-sl-purple/30 p-5 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-sl-glow-purple animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-sl-purple-light">Assign for {activeDay}</h3>
              <button onClick={() => setActiveDay(null)} className="text-sl-gray-light hover:text-white touch-target">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-1.5 mb-4 overflow-x-auto">
              {DAY_TYPES.filter(dt => dt.id !== 'rest' && dt.id !== 'cardio').map(dt => (
                <button key={dt.id} onClick={() => handleAssignDayType(activeDay, dt.id)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-semibold transition bg-sl-gray/20 hover:bg-sl-gray/30 text-sl-gray-light border border-sl-gray/20 whitespace-nowrap touch-target">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={dt.icon} /></svg>
                  {dt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mb-4 border-b border-sl-purple/15 pb-2">
              {['templates', 'custom', 'musclegroups'].map(tab => (
                <button key={tab} onClick={() => { setModalTab(tab); setMgActiveGroup(null); setMgActiveSplit(null); setCustomExerciseName(''); setCustomExerciseSets(1); setEditingExerciseId(null); setEditExerciseName(''); }}
                  className={`text-xs font-semibold pb-2 border-b-2 transition -mb-[10px] capitalize ${modalTab === tab ? 'text-sl-purple-light border-sl-purple' : 'text-sl-gray-light border-transparent hover:text-white'}`}>
                  {tab === 'musclegroups' ? 'Groups' : tab}
                </button>
              ))}
            </div>

            {modalTab === 'templates' ? (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {workoutTemplates.length === 0 ? (
                  <p className="text-xs text-sl-gray-light/45 italic py-4 text-center">No saved templates yet.</p>
                ) : (
                  workoutTemplates.map(t => {
                    const exCount = t.exercises?.length || 0;
                    const totalSets = t.exercises?.reduce((acc, e) => acc + (e.sets || 3), 0) || 0;
                    return (
                      <button key={t.id} onClick={() => handleAssignTemplate(activeDay, t)}
                        className="w-full text-left p-3 rounded-xl border border-sl-purple/10 bg-sl-gray/10 hover:bg-sl-purple/5 hover:border-sl-purple/30 transition flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-sl-purple/30 text-sl-purple-light bg-sl-purple/10">{t.muscleGroup || 'Full Body'}</span>
                            <span className="text-xs font-semibold text-white truncate">{t.name}</span>
                          </div>
                          <p className="text-[10px] text-sl-gray-light/70 mt-0.5">{exCount} exs &middot; {totalSets} sets</p>
                        </div>
                        <span className="text-[10px] font-bold text-sl-purple-light shrink-0 ml-2">Assign</span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : modalTab === 'musclegroups' ? (
              <div className="space-y-4">
                {!mgActiveGroup && !mgActiveSplit ? (
                  <>
                    <div>
                      <p className="text-[10px] text-sl-purple/60 uppercase tracking-widest font-bold mb-2">By Muscle Group</p>
                      <div className="grid grid-cols-4 gap-2">
                        {MUSCLE_GROUP_CARDS.map(mg => (
                          <button key={mg.id} onClick={() => { setMgActiveGroup(mg.id); setMgSelectedExercises([]); }}
                            className={`p-3 rounded-xl border ${mg.color} ${mg.bg} hover:bg-sl-purple/10 hover:border-sl-purple/40 transition-all text-center`}>
                            <svg className={`w-5 h-5 mx-auto mb-1 ${mg.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={mg.icon} /></svg>
                            <span className={`text-[9px] font-bold ${mg.text}`}>{mg.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-sl-purple/60 uppercase tracking-widest font-bold mb-2">Popular Splits</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {POPULAR_SPLITS.map(split => (
                          <button key={split.id} onClick={() => handleAssignSplitWorkout(activeDay, split)}
                            className="p-2.5 rounded-xl border border-sl-purple/10 bg-sl-gray/10 hover:bg-sl-purple/5 hover:border-sl-purple/30 transition text-left">
                            <p className="text-[10px] font-semibold text-white truncate">{split.name}</p>
                            <p className="text-[8px] text-sl-gray-light/60 truncate">{split.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : mgActiveGroup ? (
                  <div>
                    <button onClick={() => { setMgActiveGroup(null); setMgSelectedExercises([]); }}
                      className="text-xs text-sl-purple-light hover:text-white transition mb-2 flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-white">{MUSCLE_GROUP_CARDS.find(c => c.id === mgActiveGroup)?.name || mgActiveGroup}</p>
                      <button onClick={() => handleSelectAllMg(mgActiveGroup)} className="text-[10px] text-sl-purple-light/60 hover:text-sl-purple-light transition">Select All</button>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto mb-3">
                      {mgFilteredExercises.map(ex => {
                        const isSelected = mgSelectedExercises.includes(ex.id);
                        return (
                          <button key={ex.id} onClick={() => handleToggleMgExercise(ex.id)}
                            className={`w-full text-left p-2 rounded-xl border transition flex items-center justify-between ${isSelected ? 'bg-sl-purple/15 border-sl-purple/40' : 'bg-sl-gray/10 border-sl-purple/10'}`}>
                            <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-sl-gray-light'}`}>{ex.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sl-purple-light shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => { const selected = mgSelectedExercises.length > 0 ? exercises.filter(ex => mgSelectedExercises.includes(ex.id)).map(ex => ({ exerciseId: ex.id, name: ex.name, sets: 3, reps: 10, weight: ex.trackingType === 'weight' ? 20 : 0, difficulty: ex.difficulty || 'Beginner', xpReward: ex.xpReward || 10, muscleGroup: ex.muscleGroup || mgActiveGroup })) : []; handleAssignMuscleGroupWorkout(activeDay, mgActiveGroup, selected); }}
                      className="w-full bg-sl-purple/20 hover:bg-sl-purple/30 text-sl-purple-light border border-sl-purple/30 px-4 py-2.5 rounded-xl text-sm font-semibold transition">
                      Assign
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-sl-purple/60 uppercase tracking-widest font-bold mb-2">Select Muscle Group</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MUSCLE_GROUPS.map(mg => (
                      <button key={mg.id} onClick={() => { setSelectedMuscleGroup(mg.id); setSelectedExercises([]); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition border ${selectedMuscleGroup === mg.id ? 'bg-sl-purple/20 border-sl-purple/50 text-sl-purple-light' : 'bg-sl-gray/20 border-sl-gray/20 text-sl-gray-light'}`}>
                        {mg.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMuscleGroup && (
                  <div>
                    <p className="text-[10px] text-sl-purple/60 uppercase tracking-widest font-bold mb-2">Choose Exercises</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {filteredExercises.map(ex => {
                        const isSelected = selectedExercises.some(e => e.exerciseId === ex.id);
                        return (
                          <button key={ex.id} onClick={() => isSelected ? handleRemoveExercise(ex.id) : handleAssignExercise(ex)}
                            className={`w-full text-left p-2 rounded-xl border transition flex items-center justify-between ${isSelected ? 'bg-sl-purple/15 border-sl-purple/40' : 'bg-sl-gray/10 border-sl-purple/10'}`}>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-medium text-white truncate block">{ex.name}</span>
                              <span className="text-[9px] text-sl-gray-light/60">{ex.equipment}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sl-purple-light shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedExercises.length > 0 && (
                  <div>
                    <p className="text-[10px] text-sl-purple/60 uppercase tracking-widest font-bold mb-2">Configure</p>
                    <input type="text" placeholder="Workout name" value={customWorkoutName} onChange={e => setCustomWorkoutName(e.target.value)} className="holo-input text-sm mb-3" />
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {selectedExercises.map(ex => (
                        <div key={ex.exerciseId} className="p-2 rounded-xl bg-sl-gray/10 border border-sl-purple/10">
                          <div className="flex items-center gap-1 mb-1.5">
                            {ex.exerciseId?.startsWith('custom-') && editingExerciseId === ex.exerciseId ? (
                              <input type="text" value={editExerciseName}
                                onChange={e => setEditExerciseName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                                onBlur={handleSaveEdit}
                                className="holo-input text-xs py-1 flex-1 min-w-0"
                                autoFocus />
                            ) : (
                              <span className="text-xs font-semibold text-white truncate flex-1">{ex.name}</span>
                            )}
                            <div className="flex gap-1 shrink-0">
                              {ex.exerciseId?.startsWith('custom-') && editingExerciseId === ex.exerciseId ? (
                                <button onClick={handleSaveEdit} className="text-emerald-400 text-[10px]">Save</button>
                              ) : ex.exerciseId?.startsWith('custom-') ? (
                                <button onClick={() => handleStartEdit(ex)} className="text-sl-purple-light text-[10px]">Edit</button>
                              ) : null}
                              <button onClick={() => handleRemoveExercise(ex.exerciseId)} className="text-red-400 text-[10px]">Remove</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            <div><label className="text-[8px] text-sl-gray-light block font-semibold">Sets</label>
                              <input type="number" min="1" max="10" value={ex.sets} onChange={e => {
                                const val = parseInt(e.target.value);
                                if (val < 0) return;
                                handleUpdateExercise(ex.exerciseId, 'sets', val > 10 ? 10 : (val || 1));
                              }} className="holo-input text-center text-xs py-1" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] text-sl-purple/60 uppercase tracking-widest font-bold mb-2">
                    Assign Custom Exercise {selectedExercises.length > 0 && <span className="text-sl-gray-light/50">({selectedExercises.length}/10)</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="Exercise name" value={customExerciseName}
                      onChange={e => setCustomExerciseName(e.target.value)}
                      className="holo-input text-sm flex-1" />
                    <div className="w-16 shrink-0">
                      <input type="number" min="1" max="10" value={customExerciseSets}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          if (val < 0) {
                            setSetsError("Sets can't be negative");
                            return;
                          }
                          setSetsError('');
                          setCustomExerciseSets(val > 10 ? 10 : (val || 1));
                        }}
                        className="holo-input text-center text-xs py-2" />
                      {setsError && <p className="text-red-400 text-[9px] mt-1 text-center">{setsError}</p>}
                    </div>
                    <button onClick={handleAssignCustomExercise}
                      disabled={!customExerciseName.trim() || selectedExercises.length >= 10}
                      className="bg-sl-purple/20 hover:bg-sl-purple/30 text-sl-purple-light border border-sl-purple/30 px-3 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50 shrink-0">
                      Assign
                    </button>
                  </div>
                  <p className="text-[8px] text-sl-gray-light/50 mt-1">Type any exercise name and set the number of sets</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setActiveDay(null)} className="bg-sl-gray/30 hover:bg-sl-gray/40 text-sl-gray-light px-4 py-2 rounded-xl text-sm font-semibold transition touch-target">Cancel</button>
              {modalTab === 'custom' && selectedExercises.length > 0 && (
                <button onClick={handleAssignCustomWorkout} className="bg-sl-purple/20 hover:bg-sl-purple/30 text-sl-purple-light border border-sl-purple/30 px-4 py-2 rounded-xl text-sm font-semibold transition touch-target">Assign</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
