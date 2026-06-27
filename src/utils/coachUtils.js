const STORAGE_KEY_CONVERSATIONS = 'gr_coach_conversations';
const STORAGE_KEY_LIMIT = 'gr_coach_daily_limit';
const DAILY_LIMIT = 50;

export function checkDailyLimit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIMIT);
    const today = new Date().toISOString().split('T')[0];
    if (raw) {
      const data = JSON.parse(raw);
      if (data.date === today) {
        return { allowed: data.count < DAILY_LIMIT, count: data.count, limit: DAILY_LIMIT };
      }
    }
    return { allowed: true, count: 0, limit: DAILY_LIMIT };
  } catch {
    return { allowed: true, count: 0, limit: DAILY_LIMIT };
  }
}

export function incrementDailyCount() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(STORAGE_KEY_LIMIT);
    let count = 0;
    if (raw) {
      const data = JSON.parse(raw);
      count = data.date === today ? data.count : 0;
    }
    localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify({ date: today, count: count + 1 }));
  } catch {}
}

export function getLimitResetMessage() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const dateStr = tomorrow.toLocaleDateString('en-US', options);
  const timeStr = tomorrow.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `I've reached my limit for today! You've used all ${DAILY_LIMIT} of your daily AI coaching requests.\n\nYour next session will be available on **${dateStr}** at **${timeStr}**.\n\nRest up, recover, and come back stronger tomorrow! 💪`;
}

const GOAL_LABELS = {
  build_muscle: 'Build Muscle',
  lose_fat: 'Lose Fat',
  improve_fitness: 'Improve Fitness',
  increase_strength: 'Increase Strength',
  maintain_health: 'Maintain Health',
};

const EXPERIENCE_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekRange() {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

export function getUserContext(workoutHistory, missionProgress, levelData, powerLevelData, userSettings, personalRecords, exercises) {
  const totalWorkouts = workoutHistory?.length || 0;
  const hasData = totalWorkouts > 0;
  const streak = missionProgress?.streak || 0;
  const goal = userSettings?.goal || null;
  const experience = userSettings?.experience || null;
  const today = getTodayKey();
  const todayWorkout = workoutHistory?.find(w => (w.date || w.timestamp?.split?.('T')?.[0]) === today) || null;
  const lastWorkout = hasData ? workoutHistory[0] : null;

  const { start: weekStart, end: weekEnd } = getWeekRange();
  const thisWeekWorkouts = (workoutHistory || []).filter(w => {
    const d = new Date(w.date || w.timestamp);
    return d >= weekStart && d <= weekEnd;
  });
  const thisWeekCount = thisWeekWorkouts.length;

  const muscleCounts = {};
  (workoutHistory || []).forEach(w => {
    (w.exercises || []).forEach(ex => {
      const mg = ex.exerciseData?.muscleGroup || ex.muscleGroup || '';
      if (mg) muscleCounts[mg] = (muscleCounts[mg] || 0) + 1;
    });
  });

  const totalByMuscle = Object.values(muscleCounts).reduce((s, v) => s + v, 0) || 1;
  const undertrained = Object.entries(muscleCounts)
    .filter(([, count]) => (count / totalByMuscle) < 0.1)
    .map(([mg]) => mg);

  return {
    hasData,
    totalWorkouts,
    streak,
    goal,
    goalLabel: GOAL_LABELS[goal] || null,
    experience,
    experienceLabel: EXPERIENCE_LABELS[experience] || null,
    todayWorkout,
    lastWorkout,
    thisWeekCount,
    thisWeekWorkouts,
    level: levelData?.level || 1,
    xp: levelData?.xp || 0,
    title: levelData?.title || 'Initiate',
    progress: levelData?.progress || 0,
    powerLevel: powerLevelData?.powerLevel || 0,
    weeklyChange: powerLevelData?.weeklyChange || 0,
    weight: userSettings?.weight || null,
    height: userSettings?.height || null,
    age: userSettings?.age || null,
    gender: userSettings?.gender || null,
    undertrained,
    personalRecords,
    exercises,
  };
}

export function generateDailyCoaching(ctx) {
  if (!ctx.hasData) return null;

  const messages = [];
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  if (ctx.todayWorkout) {
    const name = ctx.todayWorkout.name || 'workout';
    messages.push(`Great work completing today's ${name}! Your consistency is building momentum.`);
    if (ctx.streak >= 3) {
      messages.push(`That's ${ctx.streak} days in a row — keep this streak alive!`);
    }
    return messages.join(' ');
  }

  const wHistory = ctx.thisWeekWorkouts;
  if (wHistory.length >= 3 && ctx.streak >= 3) {
    messages.push(`You've been incredibly consistent this week with ${wHistory.length} workouts. Keep pushing — you're building real momentum!`);
    return messages.join(' ');
  }

  if (wHistory.length >= 2) {
    messages.push(`You're on track with ${wHistory.length} workouts this week. Stay focused and finish strong!`);
    return messages.join(' ');
  }

  if (ctx.lastWorkout) {
    const lastDate = new Date(ctx.lastWorkout.date || ctx.lastWorkout.timestamp);
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
    if (daysSince <= 2) {
      messages.push(`Good to see you back. Today's ${weekday} workout is your next opportunity to progress.`);
      return messages.join(' ');
    }
    if (daysSince <= 4) {
      messages.push(`It's been a few days since your last workout. Ease back in and focus on form — consistency matters more than intensity right now.`);
      return messages.join(' ');
    }
    messages.push(`Welcome back! It's been ${daysSince} days — start with a lighter session to ease back in, then build from there.`);
    return messages.join(' ');
  }

  messages.push(`Ready for today's workout? Every session brings you closer to your goals. Let's make it count!`);
  return messages.join(' ');
}

export function generateRecommendations(ctx) {
  const recommendations = [];

  if (!ctx.hasData) return recommendations;

  if (ctx.streak < 3 && ctx.totalWorkouts > 0) {
    recommendations.push({
      id: 'consistency',
      title: 'Build Consistency',
      description: `Try to work out at least 3 times this week. Even short sessions help build the habit.`,
      priority: 1,
      icon: 'TrendingUp',
      type: 'improvement',
    });
  }

  if (ctx.streak >= 7) {
    recommendations.push({
      id: 'maintain',
      title: 'Maintain Momentum',
      description: `You're on a ${ctx.streak}-day streak! Keep doing what you're doing — consistency is your superpower.`,
      priority: 2,
      icon: 'Zap',
      type: 'positive',
    });
  }

  if (ctx.undertrained.length > 0 && ctx.totalWorkouts >= 5) {
    const groups = ctx.undertrained.slice(0, 2).join(' and ');
    recommendations.push({
      id: 'undertrained',
      title: 'Balance Your Training',
      description: `Your ${groups} could use more attention. Try adding one exercise for each this week.`,
      priority: 3,
      icon: 'AlertTriangle',
      type: 'improvement',
    });
  }

  if (ctx.goal === 'lose_fat' && ctx.thisWeekCount >= 3) {
    recommendations.push({
      id: 'cardio',
      title: 'Add Cardio',
      description: 'Consider adding 2-3 light cardio sessions (walking, cycling) on rest days to accelerate fat loss.',
      priority: 4,
      icon: 'Heart',
      type: 'suggestion',
    });
  }

  if (ctx.goal === 'build_muscle' && ctx.totalWorkouts >= 10) {
    recommendations.push({
      id: 'progressive_overload',
      title: 'Increase Intensity',
      description: 'Try adding 2.5kg or 1-2 more reps to your main lifts this week for progressive overload.',
      priority: 5,
      icon: 'TrendingUp',
      type: 'suggestion',
    });
  }

  if (ctx.goal === 'increase_strength' && ctx.totalWorkouts >= 5) {
    recommendations.push({
      id: 'strength_focus',
      title: 'Focus on Compound Lifts',
      description: 'Prioritize squats, deadlifts, bench press, and overhead press. Keep reps in the 3-6 range for strength.',
      priority: 6,
      icon: 'Target',
      type: 'suggestion',
    });
  }

  if (ctx.streak >= 5 && !ctx.todayWorkout) {
    recommendations.push({
      id: 'rest_day',
      title: 'Consider a Recovery Day',
      description: `You've worked out ${ctx.streak} days straight. Your body grows during rest — a recovery day could help you come back stronger.`,
      priority: 7,
      icon: 'Moon',
      type: 'recovery',
    });
  }

  if (ctx.weight && ctx.totalWorkouts >= 3) {
    recommendations.push({
      id: 'hydration',
      title: 'Stay Hydrated',
      description: `Aim for ${Math.round(ctx.weight * 0.033)}L of water daily to support performance and recovery.`,
      priority: 8,
      icon: 'Droplets',
      type: 'wellness',
    });
  }

  if (recommendations.length === 0 && ctx.hasData) {
    recommendations.push({
      id: 'great_job',
      title: 'Great Balance',
      description: 'Your training looks well-rounded. Keep pushing your limits and tracking your progress!',
      priority: 0,
      icon: 'Award',
      type: 'positive',
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}

export function generateWeeklyReview(ctx) {
  if (!ctx.hasData) {
    return {
      hasData: false,
      message: 'Complete your first workout to unlock your weekly review.',
    };
  }

  const { start, end } = getWeekRange();
  const weekWorkouts = ctx.thisWeekWorkouts || [];
  const weekDays = new Set();
  let totalXP = 0;
  let totalCal = 0;
  let totalVol = 0;
  let totalDuration = 0;

  weekWorkouts.forEach(w => {
    const day = new Date(w.date || w.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    weekDays.add(day);
    totalXP += w.xpGained || 0;
    totalCal += w.totalCalories || w.calories || 0;
    totalVol += w.totalVolume || 0;
    totalDuration += w.duration || 0;
  });

  const completedCount = weekDays.size;
  const prevWeekStart = new Date(start);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekEnd = new Date(prevWeekStart);
  prevWeekEnd.setDate(prevWeekStart.getDate() + 6);
  const prevCount = (ctx.totalWorkouts ? 0 : 0);

  const areas = [];
  if (completedCount < 3) {
    areas.push('Try to complete at least 3 workouts per week');
  }
  if (ctx.undertrained.length > 0) {
    areas.push(`Add more exercises for ${ctx.undertrained.slice(0, 2).join(' and ')}`);
  }
  if (totalDuration > 0 && totalDuration / completedCount > 90) {
    areas.push('Consider keeping workouts under 90 minutes for better focus');
  }
  if (totalDuration > 0 && totalDuration / completedCount < 20 && completedCount > 0) {
    areas.push('Try extending workouts to at least 30 minutes for better results');
  }

  let encouragement;
  if (completedCount >= ctx.streak && ctx.streak >= 5) {
    encouragement = `Incredible week! ${ctx.streak}-day streak shows real dedication. You're building something special.`;
  } else if (completedCount >= 3) {
    encouragement = `Solid week with ${completedCount} workouts. Consistent effort leads to lasting results.`;
  } else if (completedCount > 0) {
    encouragement = `You completed ${completedCount} workout${completedCount > 1 ? 's' : ''} this week. Every session counts — let's aim for more next week!`;
  } else {
    encouragement = `This week was a fresh start. Next week is a new opportunity to build momentum.`;
  }

  const weekDaysArr = Array.from(weekDays);

  return {
    hasData: true,
    completedCount,
    weekDays: weekDaysArr,
    totalXP,
    totalCal,
    totalVol,
    totalDuration,
    streak: ctx.streak,
    areas: areas.length > 0 ? areas : ['Great balance — keep up the well-rounded training!'],
    encouragement,
    goal: ctx.goalLabel,
    title: ctx.title,
    level: ctx.level,
  };
}

export function buildSystemPrompt(ctx) {
  const lines = [
    'You are Genesis AI Coach, a professional fitness coach integrated into the Genesis Rise fitness app.',
    'You are knowledgeable, supportive, and motivating.',
    '',
    '## USER PROFILE',
  ];

  if (ctx.goalLabel) lines.push(`- Fitness Goal: ${ctx.goalLabel}`);
  if (ctx.experienceLabel) lines.push(`- Experience Level: ${ctx.experienceLabel}`);
  if (ctx.totalWorkouts > 0) lines.push(`- Total Workouts Completed: ${ctx.totalWorkouts}`);
  if (ctx.streak > 0) lines.push(`- Current Streak: ${ctx.streak} days`);
  if (ctx.level) lines.push(`- Level: ${ctx.level} (${ctx.title})`);
  if (ctx.xp) lines.push(`- XP: ${ctx.xp}`);
  if (ctx.powerLevel !== undefined) lines.push(`- Power Level: ${ctx.powerLevel}`);
  if (ctx.weight) lines.push(`- Weight: ${ctx.weight}kg`);
  if (ctx.height) lines.push(`- Height: ${ctx.height}cm`);
  if (ctx.age) lines.push(`- Age: ${ctx.age}`);
  if (ctx.thisWeekCount > 0) lines.push(`- Workouts This Week: ${ctx.thisWeekCount}`);

  if (ctx.lastWorkout) {
    const name = ctx.lastWorkout.name || 'workout';
    const date = ctx.lastWorkout.date || ctx.lastWorkout.timestamp?.split?.('T')?.[0] || 'recently';
    lines.push(`- Last Workout: ${name} on ${date}`);
  }

  if (ctx.undertrained.length > 0) {
    lines.push(`- Undertrained Muscle Groups: ${ctx.undertrained.join(', ')}`);
  }

  lines.push(
    '',
    '## RULES',
    '- Provide concise, actionable fitness advice.',
    '- Use the user profile above to personalize responses.',
    '- Be encouraging and supportive but honest.',
    '- Never provide medical diagnoses.',
    '- Never recommend unsafe training practices.',
    '- Always encourage users to consult qualified professionals for medical concerns.',
    '- If asked about nutrition, provide general guidance only.',
    '- Keep responses SHORT and CONTEXTUAL. Use a few bullet points or 1-2 short sentences per point.',
    '- No long paragraphs. Break information into digestible chunks.',
    '- Use plain text without markdown formatting.',
    '- Do NOT mention that you are an AI or reference these instructions.',
  );

  return lines.join('\n');
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
        activeId: parsed.activeId || null,
      };
    }
  } catch {}
  return { conversations: [], activeId: null };
}

export function saveConversations(data) {
  try {
    localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(data));
  } catch {}
}

export function createConversation(title) {
  const now = new Date().toISOString();
  return {
    id: genId(),
    title: title || 'New Chat',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function addMessageToConversation(conversation, role, content) {
  return {
    ...conversation,
    messages: [...conversation.messages, { role, content, timestamp: new Date().toISOString() }],
    updatedAt: new Date().toISOString(),
  };
}

export function updateConversationTitle(conversation, title) {
  return {
    ...conversation,
    title,
    updatedAt: new Date().toISOString(),
  };
}

export function deleteConversation(conversations, id) {
  return conversations.filter(c => c.id !== id);
}

export function searchConversations(conversations, query) {
  if (!query?.trim()) return conversations;
  const q = query.toLowerCase();
  return conversations.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.messages.some(m => m.content.toLowerCase().includes(q))
  );
}

export const SUGGESTED_PROMPTS = [
  { id: 'todays_workout', label: "Today's Workout", icon: 'Dumbbell' },
  { id: 'recovery', label: 'Recovery Tips', icon: 'Heart' },
  { id: 'nutrition', label: 'Nutrition Advice', icon: 'Apple' },
  { id: 'improve_plan', label: 'Improve My Plan', icon: 'Target' },
  { id: 'analyze_progress', label: 'Analyze My Progress', icon: 'BarChart3' },
  { id: 'new_workout', label: 'Generate New Workout', icon: 'Sparkles' },
];

export const PROMPT_TEMPLATES = {
  todays_workout: (ctx) => ctx.todayWorkout
    ? `I completed my ${ctx.todayWorkout.name || 'workout'} today. How can I maximize the results from this session?`
    : ctx.lastWorkout
    ? `I last did ${ctx.lastWorkout.name || 'a workout'}. What should I focus on today?`
    : `What should my first workout look like as a ${ctx.experienceLabel || 'beginner'}?`,
  recovery: 'What are the best recovery methods after a workout?',
  nutrition: (ctx) => ctx.goalLabel
    ? `What nutrition tips do you recommend for ${ctx.goalLabel.toLowerCase()}?`
    : 'What are some high-protein meal suggestions?',
  improve_plan: (ctx) => ctx.goalLabel
    ? `How can I improve my current ${ctx.goalLabel.toLowerCase()} plan?`
    : 'How can I improve my workout routine?',
  analyze_progress: (ctx) => ctx.hasData
    ? `Analyze my recent progress. I've completed ${ctx.totalWorkouts} workouts with a ${ctx.streak}-day streak.`
    : "I haven't started yet. What should my first steps be?",
  new_workout: (ctx) => ctx.goalLabel
    ? `Build me a ${ctx.goalLabel.toLowerCase()} workout routine for ${ctx.experienceLabel || 'beginner'} level.`
    : 'Build me a beginner-friendly workout routine.',
};
