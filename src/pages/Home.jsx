import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { useNotification } from '../context/NotificationContext';
import NotificationPanel from '../components/NotificationPanel';
import { useWorkout } from '../context/WorkoutContext';
import { TODAYS_WORKOUT_CHANGED } from '../utils/syncEvents';
import {
  Activity, Calendar, Sparkles, Heart, Dumbbell,
  ChevronRight, Target, Droplets, Moon, Flame,
  Clock, CheckCircle2, Play, BarChart3, Bell, Zap,
  Shield, Crown, Star
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const DAILY_GOALS_KEY = 'sl_daily_goals';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadDailyGoals = () => {
  try {
    const raw = localStorage.getItem(DAILY_GOALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* silent */
  }
  return { goals: { water: 3000, steps: 10000, sleep: 480, calories: 500 }, days: {} };
};

const loadFromStorage = (key) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

const Home = () => {
  const { user } = useAuth();
  const { workoutHistory } = useWorkout();
  const navigate = useNavigate();
  const { unreadCount } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    const handler = () => setSyncKey(k => k + 1);
    window.addEventListener(TODAYS_WORKOUT_CHANGED, handler);
    return () => window.removeEventListener(TODAYS_WORKOUT_CHANGED, handler);
  }, []);

  const dailyData = useMemo(() => loadDailyGoals(), []);
  const todaysWorkout = useMemo(() => loadFromStorage('gr_todays_workout'), [syncKey]);
  const completedDates = useMemo(() => {
    try {
      const c = JSON.parse(localStorage.getItem('gr_completed_workouts') || '[]');
      return Array.isArray(c) ? c : [];
    } catch {
      return [];
    }
  }, [syncKey]);
  const workouts = useMemo(() => {
    try {
      const w = JSON.parse(localStorage.getItem('sl_workout_history') || '[]');
      return Array.isArray(w) ? w : [];
    } catch {
      return [];
    }
  }, [syncKey]);

  const todayKey = getTodayKey();
  const goals = dailyData.goals;
  const todaySafe = useMemo(() => {
    const raw = dailyData.days[todayKey];
    if (raw) return raw;
    return { date: todayKey, water: { total: 0, entries: [] }, steps: { count: 0 }, sleep: { start: null, end: null, duration: 0 }, calories: { total: 0, fromSteps: 0 } };
  }, [dailyData, todayKey]);

  const todayCompleted = completedDates.includes(todayKey);
  const todayPlan = useMemo(() => {
    try {
      const schedule = JSON.parse(localStorage.getItem('gr_workout_schedule') || '{}');
      return schedule[todayKey] || null;
    } catch {
      return null;
    }
  }, [todayKey, syncKey]);
  const todayDayType = todayPlan && todayPlan.type !== 'workout' && !todayCompleted ? todayPlan.type : null;

  const todayCalories = useMemo(() => {
    const fromWorkouts = (workoutHistory || []).filter(w => {
      const d = new Date(w.timestamp || w.date);
      return d.toISOString().split('T')[0] === todayKey;
    }).reduce((s, w) => s + (w.totalCalories || 0), 0);
    const fromSteps = Math.round((todaySafe.steps?.count || 0) * 0.04);
    return fromWorkouts + fromSteps;
  }, [workoutHistory, todayKey, todaySafe.steps]);

  const overallProgress = useMemo(() => {
    let metrics = 0;
    let count = 0;
    if (todayCompleted) { metrics += 1; count++; }
    const waterRatio = Math.min((todaySafe.water?.total || 0) / Math.max(goals.water, 1), 1);
    metrics += waterRatio; count++;
    const stepsRatio = Math.min((todaySafe.steps?.count || 0) / Math.max(goals.steps, 1), 1);
    metrics += stepsRatio; count++;
    const sleepRatio = Math.min((todaySafe.sleep?.duration || 0) / Math.max(goals.sleep, 1), 1);
    metrics += sleepRatio; count++;
    const calRatio = Math.min(todayCalories / Math.max(goals.calories, 1), 1);
    metrics += calRatio; count++;
    return count > 0 ? metrics / count : 0;
  }, [todayCompleted, todaySafe, goals, todayCalories]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Athlete';
  const avatarLetter = (username || 'A')[0].toUpperCase();
  const { avatar: savedAvatar, avatarType: savedAvatarType } = useAvatar();
  const AVATAR_PRESETS = [
    { id: 'dumbbell', icon: Dumbbell, colors: 'from-sl-purple to-sl-red' },
    { id: 'activity', icon: Activity, colors: 'from-blue-500 to-cyan-400' },
    { id: 'heart', icon: Heart, colors: 'from-red-500 to-pink-400' },
    { id: 'flame', icon: Flame, colors: 'from-orange-500 to-red-400' },
    { id: 'zap', icon: Zap, colors: 'from-yellow-500 to-amber-400' },
    { id: 'shield', icon: Shield, colors: 'from-emerald-500 to-teal-400' },
    { id: 'crown', icon: Crown, colors: 'from-purple-500 to-pink-400' },
    { id: 'star', icon: Star, colors: 'from-amber-500 to-orange-400' },
  ];
  const avatarPreset = AVATAR_PRESETS.find(p => p.id === savedAvatar);
  const AvatarIcon = avatarPreset?.icon;

  const recentWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)).slice(0, 5);
  }, [workouts]);

  const weeklyData = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return labels.map((label, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayWorkouts = (workoutHistory || []).filter(w => {
        const d = new Date(w.timestamp || w.date);
        return d.toISOString().split('T')[0] === dateStr;
      });
      const totalCal = dayWorkouts.reduce((s, w) => s + (w.totalCalories || 0), 0);
      const totalDur = dayWorkouts.reduce((s, w) => s + (w.duration || 0), 0);
      return { label, date: dateStr, hasWorkout: dayWorkouts.length > 0, calories: totalCal, duration: totalDur, count: dayWorkouts.length };
    });
  }, [workoutHistory]);

  const weeklyStats = useMemo(() => {
    const totalWorkouts = weeklyData.reduce((s, d) => s + d.count, 0);
    const totalCalories = weeklyData.reduce((s, d) => s + d.calories, 0);
    const totalDuration = weeklyData.reduce((s, d) => s + d.duration, 0);
    return { totalWorkouts, totalCalories, totalDuration };
  }, [weeklyData]);

  const circleRadius = 54;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progressOffset = circleCircumference * (1 - Math.min(overallProgress, 1));
  const progressPercent = Math.round(overallProgress * 100);

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Genesis Rise Tracker - Level Up Your Fitness Journey</title>
          <meta name="description" content="Track workouts, earn XP, and reach your fitness goals with Genesis Rise — a premium AI-powered fitness platform with personalized coaching, training plans, and health tracking." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://yourdomain.com/" />
          <meta property="og:title" content="Genesis Rise - AI-Powered Fitness Platform" />
          <meta property="og:description" content="Track workouts, earn XP, and reach your fitness goals with Genesis Rise — a premium AI-powered fitness platform with personalized coaching, training plans, and health tracking." />
          <meta property="og:image" content="https://yourdomain.com/igris_shadow_face.png" />
          <meta property="og:image:alt" content="Genesis Rise Logo" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://yourdomain.com/" />
          <meta property="twitter:title" content="Genesis Rise - AI-Powered Fitness Platform" />
          <meta property="twitter:description" content="Track workouts, earn XP, and reach your fitness goals with Genesis Rise — a premium AI-powered fitness platform with personalized coaching, training plans, and health tracking." />
          <meta property="twitter:image" content="https://yourdomain.com/igris_shadow_face.png" />
        </Helmet>
        <div className="min-h-screen bg-sl-gradient">
          <div className="mobile-container py-8">
            <div className="text-center mb-10 pt-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 flex items-center justify-center bg-sl-purple/20 rounded-full border-2 border-sl-purple shadow-sl-glow-purple overflow-hidden">
                  <img src="/igris_shadow_face.png" alt="Genesis Rise" className="w-full h-full object-cover" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-wider uppercase gradient-text mb-3">
                Achieve Your Fitness Goals
              </h1>
              <p className="text-sl-gray-light text-base max-w-lg mx-auto">
                Track workouts, earn XP, and build consistent habits with personalized coaching, training plans, and health insights.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <Link to="/register" className="holo-button holo-button-primary px-8 py-3 text-center w-full sm:w-auto">
                  Start Your Journey
                </Link>
                <Link to="/login" className="holo-button px-8 py-3 text-center w-full sm:w-auto">
                  Sign In
                </Link>
              </div>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-center gradient-text mb-6">Features</h2>
              <div className="space-y-4">
                <div className="mobile-card flex items-start gap-4 p-5">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light mb-1">Workout Tracker</h3>
                    <p className="text-sm text-sl-gray-light">Log your daily workouts, track duration, calories, and earn XP based on intensity.</p>
                  </div>
                </div>
                <div className="mobile-card flex items-start gap-4 p-5">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light mb-1">Mission Planner</h3>
                    <p className="text-sm text-sl-gray-light">Schedule weekly training plans or create custom routines with personalized exercise sequences.</p>
                  </div>
                </div>
                <div className="mobile-card flex items-start gap-4 p-5">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light mb-1">Genesis Coach</h3>
                    <p className="text-sm text-sl-gray-light">Get AI-powered fitness and health advice from your personal AI fitness coach.</p>
                  </div>
                </div>
                <div className="mobile-card flex items-start gap-4 p-5">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light mb-1">Health Monitor</h3>
                    <p className="text-sm text-sl-gray-light">Track weight, height, age, and sleep to maintain your vessel in peak condition.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-center gradient-text mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="mobile-card p-5 text-center">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sl-purple-light font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-sl-purple-light mb-2">Log Your Training</h3>
                  <p className="text-sm text-sl-gray-light">Record each workout with duration and calories burned to earn XP.</p>
                </div>
                <div className="mobile-card p-5 text-center">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sl-purple-light font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-sl-purple-light mb-2">Complete Missions</h3>
                  <p className="text-sm text-sl-gray-light">Follow Daily Missions or custom plans to earn bonus XP and level up faster.</p>
                </div>
                <div className="mobile-card p-5 text-center">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sl-purple-light font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-sl-purple-light mb-2">Level Up</h3>
                  <p className="text-sm text-sl-gray-light">Watch your level increase as you accumulate XP, unlocking new titles and rewards.</p>
                </div>
              </div>
            </section>

            <div className="mobile-card p-6 text-center border-sl-purple/30 mb-8">
              <h2 className="text-xl font-bold text-sl-purple-light mb-3">Ready to begin your transformation?</h2>
              <p className="text-sm text-sl-gray-light mb-5">Create your profile and start earning XP today. No credit card required.</p>
              <Link to="/register" className="holo-button holo-button-primary w-full text-center">
                Start Your Transformation
              </Link>
            </div>

            <footer className="text-center text-sl-gray-light/50 text-xs pb-8">
              <p>&copy; 2026 Genesis Rise System. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-sl-gradient pb-20">
      <Helmet>
        <title>Genesis Rise | Dashboard</title>
      </Helmet>

      {/* ===== Section 1: Welcome Header ===== */}
      <div className="mobile-container pt-4 pb-2">
        <div className="flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg shadow-sl-purple/30 shrink-0 ${savedAvatarType === 'preset' && avatarPreset ? `bg-gradient-to-br ${avatarPreset.colors}` : 'bg-gradient-to-br from-sl-purple to-sl-red'}`}>
              {savedAvatarType === 'custom' && savedAvatar ? (
                <img src={savedAvatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : savedAvatarType === 'preset' && AvatarIcon ? (
                <AvatarIcon className="w-5 h-5 text-white" />
              ) : user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : avatarLetter}
            </div>
            <div>
              <p className="text-xs text-sl-gray-light font-semibold">{greeting}</p>
              <h1 className="text-lg font-bold text-white -mt-0.5">{username}</h1>
            </div>
          </div>
          <button onClick={() => setShowNotifications(true)} className="w-10 h-10 rounded-full bg-sl-purple/10 border border-sl-purple/20 flex items-center justify-center text-sl-purple-light hover:bg-sl-purple/20 hover:border-sl-purple/30 active:scale-95 transition-all relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-sl-red rounded-full border-2 border-[#090214] text-[9px] font-bold text-white leading-none px-1 animate-badge-pop">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ===== Section 2: Today's Progress Hero Card ===== */}
      <div className="mobile-container mt-4 animate-slide-up" style={{ animationDelay: '80ms' }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sl-purple/20 via-sl-purple/10 to-sl-gray/20 border border-sl-purple/20 p-5 shadow-lg shadow-sl-purple/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sl-purple/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sl-red/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="relative shrink-0">
              <svg width="120" height="120" viewBox="0 0 128 128" className="transform -rotate-90">
                <circle cx="64" cy="64" r={circleRadius} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="8" />
                <circle cx="64" cy="64" r={circleRadius} fill="none" stroke="url(#progressGradient)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circleCircumference} strokeDashoffset={progressOffset}
                  style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">{progressPercent}%</span>
                <span className="text-[9px] text-sl-gray-light font-semibold uppercase tracking-wider -mt-0.5">Complete</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-sl-purple-light" />
                Today's Progress
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-[11px] text-sl-gray-light font-medium">Water</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-[11px] text-sl-gray-light font-medium">Steps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span className="text-[11px] text-sl-gray-light font-medium">Sleep</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-[11px] text-sl-gray-light font-medium">Calories</span>
                </div>
              </div>
              {todayCompleted && (
                <div className="flex items-center gap-1.5 mt-3 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Workout completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Section 3: Daily Goals 2x2 ===== */}
      <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '160ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-sl-purple-light" />
            Daily Goals
          </h2>
          <Link to="/health" className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple flex items-center gap-0.5 transition">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Water */}
          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-bold text-white">Water</span>
              </div>
              <span className="text-[10px] text-sl-gray-light font-semibold">{Math.round(Math.min((todaySafe.water?.total || 0) / Math.max(goals.water, 1), 1) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-sl-gray/40 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min((todaySafe.water?.total || 0) / Math.max(goals.water, 1), 1) * 100}%` }} />
            </div>
            <p className="text-[9px] text-sl-purple-light/60 font-semibold">{(todaySafe.water?.total || 0).toLocaleString()} / {goals.water.toLocaleString()} ml</p>
          </div>

          {/* Steps */}
          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-bold text-white">Steps</span>
              </div>
              <span className="text-[10px] text-sl-gray-light font-semibold">{Math.round(Math.min((todaySafe.steps?.count || 0) / Math.max(goals.steps, 1), 1) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-sl-gray/40 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-500"
                style={{ width: `${Math.min((todaySafe.steps?.count || 0) / Math.max(goals.steps, 1), 1) * 100}%` }} />
            </div>
            <p className="text-[9px] text-sl-purple-light/60 font-semibold">{(todaySafe.steps?.count || 0).toLocaleString()} / {goals.steps.toLocaleString()}</p>
          </div>

          {/* Sleep */}
          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] font-bold text-white">Sleep</span>
              </div>
              <span className="text-[10px] text-sl-gray-light font-semibold">{Math.round(Math.min((todaySafe.sleep?.duration || 0) / Math.max(goals.sleep, 1), 1) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-sl-gray/40 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-500"
                style={{ width: `${Math.min((todaySafe.sleep?.duration || 0) / Math.max(goals.sleep, 1), 1) * 100}%` }} />
            </div>
            <p className="text-[9px] text-sl-purple-light/60 font-semibold">{Math.round((todaySafe.sleep?.duration || 0) / 60)}h {Math.round((todaySafe.sleep?.duration || 0) % 60)}m / {Math.round(goals.sleep / 60)}h</p>
          </div>

          {/* Calories */}
          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-bold text-white">Calories</span>
              </div>
              <span className="text-[10px] text-sl-gray-light font-semibold">{Math.round(Math.min(todayCalories / Math.max(goals.calories, 1), 1) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-sl-gray/40 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-400 transition-all duration-500"
                style={{ width: `${Math.min(todayCalories / Math.max(goals.calories, 1), 1) * 100}%` }} />
            </div>
            <p className="text-[9px] text-sl-purple-light/60 font-semibold">{todayCalories.toLocaleString()} / {goals.calories.toLocaleString()} cal</p>
          </div>
        </div>
      </div>

      {/* ===== Section 4: Continue Workout ===== */}
      <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '240ms' }}>
        {todayCompleted ? (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-400">Workout Complete</p>
              <p className="text-[10px] text-sl-gray-light">Great job today! Rest and recover.</p>
            </div>
          </div>
        ) : todayDayType ? (
          <div className="w-full rounded-xl border border-sl-purple/20 bg-sl-purple/5 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sl-purple/10 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-sl-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Rest Day</p>
              <p className="text-[10px] text-sl-gray-light">Rest and prepare for your next workout.</p>
            </div>
            <button onClick={() => navigate('/planner')} className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple transition shrink-0">
              Schedule
            </button>
          </div>
        ) : todaysWorkout ? (
          <button onClick={() => navigate('/tracker')}
            className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-sl-purple/20 to-sl-red/10 border border-sl-purple/20 p-4 text-left hover:border-sl-purple/40 hover:shadow-lg hover:shadow-sl-purple/10 transition cursor-pointer group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sl-purple/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sl-purple to-sl-red flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">Continue Workout</p>
                <h3 className="text-sm font-bold text-white truncate">{todaysWorkout.name || 'Today\'s Workout'}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-sl-gray-light font-medium">
                    {todaysWorkout.exercises?.length || 0} exercises
                  </span>
                  <span className="text-[10px] text-sl-gray-light font-medium">·</span>
                  <span className="text-[10px] text-sl-gray-light font-medium">
                    ~{todaysWorkout.exercises?.reduce((a, e) => a + ((e.sets || 3) * 5), 0) || 0} min
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-sl-purple-light group-hover:translate-x-0.5 transition" />
            </div>
          </button>
        ) : (
          <button onClick={() => navigate('/planner')}
            className="w-full rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-4 text-left hover:bg-sl-gray/30 hover:border-sl-purple/20 transition cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sl-purple/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Dumbbell className="w-5 h-5 text-sl-purple-light" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">No Active Workout</p>
                <h3 className="text-sm font-bold text-white">Open Planner</h3>
                <p className="text-[10px] text-sl-gray-light mt-0.5">Plan or start a new training session</p>
              </div>
              <ChevronRight className="w-5 h-5 text-sl-purple-light group-hover:translate-x-0.5 transition" />
            </div>
          </button>
        )}
      </div>

      {/* ===== Section 5: Weekly Activity ===== */}
      <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '320ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-sl-purple-light" />
            Weekly Activity
          </h2>
          <Link to="/analysis" className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple flex items-center gap-0.5 transition">
            Details <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-[10px] text-sl-gray-light font-semibold">
              <span>{weeklyStats.totalWorkouts} workouts</span>
              <span>·</span>
              <span>{Math.round(weeklyStats.totalDuration / 60)}h {weeklyStats.totalDuration % 60}m</span>
              <span>·</span>
              <span>{weeklyStats.totalCalories.toLocaleString()} cal</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-24">
            {weeklyData.map((day, i) => {
              const maxCal = Math.max(...weeklyData.map(d => d.calories), 1);
              const heightPct = day.calories > 0 ? Math.max((day.calories / maxCal) * 100, 8) : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="relative w-full flex justify-center group">
                    <div className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-sl-purple/40 to-sl-purple/70 transition-all duration-500 hover:from-sl-purple/60 hover:to-sl-purple cursor-pointer relative"
                      style={{ height: `${heightPct}%`, minHeight: day.hasWorkout ? '12px' : '4px' }}>
                      {day.calories > 0 && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-[8px] text-sl-gray-light font-semibold whitespace-nowrap bg-sl-gray/80 px-1.5 py-0.5 rounded">
                          {day.calories.toLocaleString()} cal
                        </div>
                      )}
                    </div>
                    {day.hasWorkout && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    )}
                  </div>
                  <span className={`text-[8px] font-semibold ${day.hasWorkout ? 'text-sl-purple-light' : 'text-sl-gray-light/40'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>



      {/* ===== Section 6: Recent Workouts ===== */}
      <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '480ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sl-purple-light" />
            Recent Workouts
          </h2>
          <Link to="/analysis" className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple flex items-center gap-0.5 transition">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="rounded-xl bg-sl-gray/15 border border-sl-purple/10 p-6 text-center">
            <Dumbbell className="w-8 h-8 text-sl-purple-light/20 mx-auto mb-2" />
            <p className="text-sm text-sl-gray-light">No workouts logged yet.</p>
            <button onClick={() => navigate('/planner')}
              className="mt-3 holo-button holo-button-primary text-xs px-5 py-2">
              Start Your First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((w, i) => {
              const ts = new Date(w.timestamp || w.date);
              const dateStr = ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={w.id || i} className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition cursor-pointer"
                  onClick={() => navigate('/analysis')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-sl-purple/15 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-4 h-4 text-sl-purple-light" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{w.name || 'Workout'}</h3>
                        <p className="text-[10px] text-sl-gray-light font-medium">{dateStr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] text-sl-gray-light font-semibold shrink-0 ml-2">
                      <span>{w.duration || 0}m</span>
                      <span className="text-orange-400/80">{(w.totalCalories || 0).toLocaleString()} cal</span>
                      {w.xpGained > 0 && (
                        <span className="text-yellow-400/80">+{w.xpGained} XP</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== Section 7: Quick Actions ===== */}
      <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '560ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-sl-purple-light" />
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <button onClick={() => navigate('/tracker')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3 hover:bg-sl-purple/15 hover:border-sl-purple/20 active:scale-95 transition cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-sl-purple/15 flex items-center justify-center">
              <Activity className="w-4 h-4 text-sl-purple-light" />
            </div>
            <span className="text-[9px] font-bold text-white">Tracker</span>
          </button>
          <button onClick={() => navigate('/planner')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3 hover:bg-sl-purple/15 hover:border-sl-purple/20 active:scale-95 transition cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-sl-purple/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-sl-purple-light" />
            </div>
            <span className="text-[9px] font-bold text-white">Planner</span>
          </button>
          <button onClick={() => navigate('/adviser')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3 hover:bg-sl-purple/15 hover:border-sl-purple/20 active:scale-95 transition cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-sl-purple/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sl-purple-light" />
            </div>
            <span className="text-[9px] font-bold text-white">Coach</span>
          </button>
          <button onClick={() => navigate('/health')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3 hover:bg-sl-purple/15 hover:border-sl-purple/20 active:scale-95 transition cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-sl-purple/15 flex items-center justify-center">
              <Heart className="w-4 h-4 text-sl-purple-light" />
            </div>
            <span className="text-[9px] font-bold text-white">Health</span>
          </button>
        </div>
      </div>

      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
};

export default Home;
