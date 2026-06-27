import { dispatchTodaysWorkoutChanged } from './syncEvents';

const STORAGE_KEY_PLANS = 'gr_workout_plans';
const STORAGE_KEY_SCHEDULE = 'gr_weekly_schedule';
const STORAGE_KEY_ACTIVE = 'gr_active_plan_id';
const STORAGE_KEY_TODAYS_WORKOUT = 'gr_todays_workout';

let uidCounter = Date.now();
export function genId() {
  return `${++uidCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

export function loadPlans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function savePlans(plans) {
  localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
}

export function loadSchedule() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULE);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveSchedule(sched) {
  localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(sched));
}

export function getActivePlanId() {
  return localStorage.getItem(STORAGE_KEY_ACTIVE);
}

export function setActivePlanId(id) {
  if (id) localStorage.setItem(STORAGE_KEY_ACTIVE, id);
  else localStorage.removeItem(STORAGE_KEY_ACTIVE);
}

export function getActivePlan(plans) {
  const id = getActivePlanId();
  return plans.find(p => p.id === id && !p.archived) || plans.find(p => !p.archived) || null;
}

export function createPlan(name, goal = 'build_muscle') {
  return {
    id: genId(),
    name,
    goal,
    active: false,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    days: [],
  };
}

export function createDay(name, muscleGroups = []) {
  return {
    id: genId(),
    name,
    targetMuscleGroups: muscleGroups,
    estimatedDuration: 0,
    exercises: [],
  };
}

export function createExercise(exerciseId, name, opts = {}) {
  return {
    id: genId(),
    exerciseId,
    name,
    sets: opts.sets ?? 3,
    reps: opts.reps ?? 10,
    weight: opts.weight ?? 0,
    restTime: opts.restTime ?? 60,
    notes: opts.notes ?? '',
    order: opts.order ?? 0,
    muscleGroup: opts.muscleGroup ?? 'Other',
    trackingType: opts.trackingType ?? 'weight',
    equipment: opts.equipment ?? '',
    difficulty: opts.difficulty ?? 'Beginner',
    xpReward: opts.xpReward ?? 10,
  };
}

export function duplicatePlan(plan) {
  const copy = JSON.parse(JSON.stringify(plan));
  copy.id = genId();
  copy.name = `${plan.name} (Copy)`;
  copy.active = false;
  copy.archived = false;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  copy.days = plan.days.map(d => ({
    ...d,
    id: genId(),
    exercises: d.exercises.map(ex => ({ ...ex, id: genId() })),
  }));
  return copy;
}

export function calcEstimatedDuration(exercises) {
  if (!exercises || exercises.length === 0) return 0;
  return exercises.reduce((acc, ex) => acc + (ex.sets || 3) * 4 + (ex.restTime || 60) / 60 * (ex.sets || 3), 0);
}

export function calcXP(exercises) {
  if (!exercises || exercises.length === 0) return 0;
  return exercises.reduce((acc, ex) => acc + (ex.xpReward || 10) * (ex.sets || 3), 0);
}

export function calcCalories(exercises) {
  if (!exercises || exercises.length === 0) return 0;
  return exercises.reduce((acc, ex) => acc + (ex.sets || 3) * (ex.reps || 10) * 0.5, 0);
}

export function calcDifficulty(exercises) {
  if (!exercises || exercises.length === 0) return 'Beginner';
  const map = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  const avg = exercises.reduce((s, ex) => s + (map[ex.difficulty] || 1), 0) / exercises.length;
  if (avg >= 2.5) return 'Advanced';
  if (avg >= 1.5) return 'Intermediate';
  return 'Beginner';
}

export function getDifficultyColor(diff) {
  switch (diff) {
    case 'Beginner': return { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/20' };
    case 'Intermediate': return { border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-950/20' };
    case 'Advanced': return { border: 'border-red-500', text: 'text-red-400', bg: 'bg-red-950/20' };
    default: return { border: 'border-gray-500', text: 'text-gray-400', bg: 'bg-gray-950/10' };
  }
}

export function syncToTodaysWorkout(plan, schedule, dayName) {
  const entry = schedule[dayName?.toLowerCase()];
  const todayStr = new Date().toISOString().split('T')[0];
  if (entry && entry.type === 'workout' && plan) {
    const day = plan.days.find(d => d.id === entry.dayId);
    if (day) {
      const payload = {
        date: todayStr,
        name: day.name,
        planName: plan.name,
        exercises: day.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          difficulty: ex.difficulty,
          xpReward: ex.xpReward,
          muscleGroup: ex.muscleGroup,
          trackingType: ex.trackingType,
          equipment: ex.equipment,
        })),
      };
      localStorage.setItem(STORAGE_KEY_TODAYS_WORKOUT, JSON.stringify(payload));
      dispatchTodaysWorkoutChanged();
      return true;
    }
  }
  localStorage.removeItem(STORAGE_KEY_TODAYS_WORKOUT);
  dispatchTodaysWorkoutChanged();
  return false;
}

export function computeWeeklyStats(plans, schedule, workoutHistory) {
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const activePlan = getActivePlan(plans);
  const plannedWorkouts = DAYS.filter(d => schedule[d]?.type === 'workout').length;

  const thisWeekWorkouts = workoutHistory.filter(w => {
    const d = new Date(w.date || w.timestamp);
    return d >= monday && d <= sunday;
  });
  const completedDays = [...new Set(thisWeekWorkouts.map(w => {
    const d = new Date(w.date || w.timestamp);
    return d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }))];
  const completedCount = completedDays.length;
  const rate = plannedWorkouts > 0 ? Math.round((completedCount / plannedWorkouts) * 100) : 0;
  const totalXP = thisWeekWorkouts.reduce((s, w) => s + (w.xpGained || 0), 0);
  const totalCal = thisWeekWorkouts.reduce((s, w) => s + (w.totalCalories || w.calories || 0), 0);
  const totalVol = thisWeekWorkouts.reduce((s, w) => s + (w.totalVolume || 0), 0);

  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayEntry = schedule[todayName];
  let nextWorkout = null;
  if (activePlan) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const entry = schedule[dayName];
      if (entry?.type === 'workout') {
        const day = activePlan.days.find(dd => dd.id === entry.dayId);
        if (day) {
          const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
          nextWorkout = { dayName: d.toLocaleDateString('en-US', { weekday: 'long' }), date: dateStr, day };
          break;
        }
      }
    }
  }

  return { plannedWorkouts, completedCount, rate, totalXP, totalCal, totalVol, activePlan, nextWorkout, todayEntry, todayName };
}

const SPLIT_TEMPLATES = {
  build_muscle: {
    type: 'Push / Pull / Legs',
    days: [
      { name: 'Push Day', groups: ['Chest', 'Shoulders', 'Arms'] },
      { name: 'Pull Day', groups: ['Back', 'Arms'] },
      { name: 'Leg Day', groups: ['Legs', 'Core'] },
    ],
    sets: 4, reps: 10,
  },
  lose_fat: {
    type: 'Full Body',
    days: [
      { name: 'Full Body A', groups: ['Chest', 'Back', 'Legs', 'Core'] },
      { name: 'Full Body B', groups: ['Shoulders', 'Arms', 'Legs', 'Core'] },
      { name: 'Full Body C', groups: ['Chest', 'Back', 'Legs', 'Shoulders'] },
      { name: 'Cardio & Core', groups: ['Cardio', 'Core'] },
    ],
    sets: 3, reps: 12,
  },
  improve_fitness: {
    type: 'Upper / Lower',
    days: [
      { name: 'Upper Body', groups: ['Chest', 'Back', 'Shoulders', 'Arms'] },
      { name: 'Lower Body', groups: ['Legs', 'Core'] },
      { name: 'Full Body', groups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'] },
    ],
    sets: 3, reps: 12,
  },
  increase_strength: {
    type: 'Strength',
    days: [
      { name: 'Strength A', groups: ['Chest', 'Shoulders', 'Arms'] },
      { name: 'Strength B', groups: ['Back', 'Legs'] },
      { name: 'Strength C', groups: ['Chest', 'Back', 'Legs'] },
    ],
    sets: 5, reps: 5,
  },
  maintain_health: {
    type: 'Full Body',
    days: [
      { name: 'Full Body', groups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'] },
      { name: 'Cardio', groups: ['Cardio'] },
      { name: 'Full Body Light', groups: ['Chest', 'Back', 'Legs', 'Core'] },
    ],
    sets: 3, reps: 10,
  },
};

const DIFFICULTY_MAP = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const EQUIPMENT_BY_EXPERIENCE = {
  beginner: ['Bodyweight', 'Dumbbells'],
  intermediate: ['Bodyweight', 'Dumbbells', 'Barbell', 'Machine', 'Cable'],
  advanced: ['Bodyweight', 'Dumbbells', 'Barbell', 'Machine', 'Cable', 'Kettlebell', 'Medicine Ball'],
};

function pickExercisesForGroup(muscleGroup, exercises, difficulty, count, sets, reps, usedIds) {
  const diff = DIFFICULTY_MAP[difficulty?.toLowerCase()] || 'Beginner';
  const allowedEquip = EQUIPMENT_BY_EXPERIENCE[difficulty?.toLowerCase()] || EQUIPMENT_BY_EXPERIENCE.beginner;
  const pool = exercises.filter(ex =>
    ex.muscleGroup === muscleGroup &&
    allowedEquip.includes(ex.equipment) &&
    !usedIds.has(ex.id)
  );
  const sorted = pool.sort((a, b) => {
    const order = { Beginner: 0, Intermediate: 1, Advanced: 2 };
    const aDiff = order[a.difficulty] || 0;
    const bDiff = order[b.difficulty] || 0;
    const aMatch = a.difficulty === diff ? 1 : 0;
    const bMatch = b.difficulty === diff ? 1 : 0;
    return bMatch - aMatch || aDiff - bDiff;
  });
  const selected = sorted.slice(0, count);
  selected.forEach(ex => usedIds.add(ex.id));
  return selected.map(ex => createExercise(ex.id, ex.name, {
    sets, reps,
    weight: ex.trackingType === 'weight' ? (difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 20 : 30) : 0,
    muscleGroup: ex.muscleGroup,
    trackingType: ex.trackingType,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    xpReward: ex.xpReward,
    restTime: sets >= 5 ? 90 : 60,
  }));
}

export function generatePlan(onboarding, exercises, nameOverride) {
  const goal = onboarding?.goal || 'build_muscle';
  const experience = onboarding?.experience || 'beginner';
  const workoutDays = Math.min(Math.max(onboarding?.workout_days || 3, 1), 7);
  const template = SPLIT_TEMPLATES[goal] || SPLIT_TEMPLATES.build_muscle;
  const planDays = template.days.slice(0, Math.min(workoutDays, template.days.length));
  const planName = nameOverride || `${template.type} Plan`;
  const plan = createPlan(planName, goal);
  const usedIds = new Set();

  planDays.forEach(td => {
    const exCount = td.groups.length <= 2 ? 4 : 3;
    const day = createDay(td.name, td.groups);
    const allExercises = [];
    td.groups.forEach(group => {
      const perGroup = Math.max(1, Math.floor(exCount / td.groups.length));
      const picked = pickExercisesForGroup(group, exercises, experience, perGroup, template.sets, template.reps, usedIds);
      allExercises.push(...picked);
    });
    day.exercises = allExercises.map((ex, i) => ({ ...ex, order: i }));
    day.estimatedDuration = calcEstimatedDuration(day.exercises);
    plan.days.push(day);
  });

  if (plan.days.length === 0) {
    const fallback = createDay('Full Body', ['Chest', 'Back', 'Legs', 'Core']);
    const picked = pickExercisesForGroup('Chest', exercises, experience, 2, 3, 10, usedIds);
    picked.push(...pickExercisesForGroup('Back', exercises, experience, 2, 3, 10, usedIds));
    picked.push(...pickExercisesForGroup('Legs', exercises, experience, 2, 3, 10, usedIds));
    fallback.exercises = picked.map((ex, i) => ({ ...ex, order: i }));
    fallback.estimatedDuration = calcEstimatedDuration(fallback.exercises);
    plan.days.push(fallback);
  }

  plan.updatedAt = new Date().toISOString();
  return plan;
}
