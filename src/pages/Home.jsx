import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useAvatar } from '../context/AvatarContext';
import { AVATAR_PRESETS } from '../utils/avatarPresets';
import { useNotification } from '../context/NotificationContext';
import { useLevel } from '../context/LevelContext';
import { getWorkoutStats } from '../utils/workoutUtils';
import NotificationPanel from '../components/NotificationPanel';
import Onboarding from '../components/Onboarding';
import { useWorkout } from '../context/WorkoutContext';
import { TODAYS_WORKOUT_CHANGED } from '../utils/syncEvents';
import {
  Activity, Calendar, Sparkles, Heart, Dumbbell,
  ChevronRight, Target, Droplets, Moon, Flame,
  Clock, CheckCircle2, Play, BarChart3, Bell, Zap,
  Check, Shield, Crown, Star, Trophy, Users, Lock, Smartphone, X,
  TrendingUp, Gift, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const ONBOARDING_RECOMMENDATIONS_KEY = 'sl_onboarding_recommendations';

const DAILY_GOALS_KEY = 'sl_daily_goals';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const loadDailyGoals = () => {
  try {
    const raw = localStorage.getItem(DAILY_GOALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* silent */
  }
  return { goals: { water: 3000, steps: 10000, sleep: 8, calories: 500 }, days: {} };
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
  const { xp, level, progress, xpForNext, title } = useLevel();
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncKey, setSyncKey] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        .then(({ data, error }) => {
          if (error || !data || !data.onboarding_completed) {
            setShowOnboarding(true);
            setProfile(null);
          } else {
            setShowOnboarding(false);
            setProfile(data);
          }
        })
        .catch(() => setShowOnboarding(false));
    } else {
      setShowOnboarding(null);
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    const handler = () => setSyncKey(k => k + 1);
    const onFocus = () => setSyncKey(k => k + 1);
    window.addEventListener(TODAYS_WORKOUT_CHANGED, handler);
    window.addEventListener('XP_CHANGED', handler);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener(TODAYS_WORKOUT_CHANGED, handler);
      window.removeEventListener('XP_CHANGED', handler);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  useEffect(() => {
    if (showOnboarding === false && !localStorage.getItem('gr_notification_asked')) {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 800);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding]);

  const dailyData = useMemo(() => loadDailyGoals(), [syncKey]);
  const todaysWorkout = useMemo(() => loadFromStorage('gr_todays_workout'), [syncKey]);
  const completedDates = useMemo(() => {
    try {
      const c = JSON.parse(localStorage.getItem('gr_completed_workouts') || '[]');
      return Array.isArray(c) ? c : [];
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

  const onboardingRecs = useMemo(() => {
    if (!profile || !profile.onboarding_completed) return null;
    const weight = profile.weight_kg || 70;
    const goal = profile.goal || '';
    const exp = profile.experience || 'Beginner';
    const days = profile.workout_days || 4;

    const waterMl = Math.round(weight * 35);
    const steps = exp === 'Beginner' ? 8000 : exp === 'Intermediate' ? 10000 : 12000;
    let calGoal;
    if (goal === 'Lose Fat') calGoal = Math.round(weight * 28);
    else if (goal === 'Build Muscle') calGoal = Math.round(weight * 38);
    else calGoal = Math.round(weight * 33);
    const sleepH = goal === 'Build Muscle' ? 8.5 : 8;

    const dailyXpTarget = goal === 'Lose Fat' ? 150 : goal === 'Build Muscle' ? 200 : 120;
    const weeklyProgressGoal = days;

    return {
      water: waterMl, steps, calories: calGoal, sleep: sleepH,
      dailyXpTarget, weeklyProgressGoal, workoutDays: days,
      goal, experience: exp,
    };
  }, [profile]);

  useEffect(() => {
    if (!onboardingRecs) return;
    const existing = localStorage.getItem(DAILY_GOALS_KEY);
    if (existing) return;
    const goals = {
      water: onboardingRecs.water,
      steps: onboardingRecs.steps,
      sleep: onboardingRecs.sleep,
      calories: onboardingRecs.calories,
    };
    localStorage.setItem(DAILY_GOALS_KEY, JSON.stringify({
      goals,
      days: {},
    }));
    localStorage.setItem(ONBOARDING_RECOMMENDATIONS_KEY, JSON.stringify(onboardingRecs));
  }, [onboardingRecs]);

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

  const handleAllowNotifications = async () => {
    localStorage.setItem('gr_notification_asked', 'true');
    setShowNotificationPrompt(false);
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleDismissNotifications = () => {
    localStorage.setItem('gr_notification_asked', 'true');
    setShowNotificationPrompt(false);
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Athlete';
  const avatarLetter = (username || 'A')[0].toUpperCase();
  const { avatar: savedAvatar, avatarType: savedAvatarType } = useAvatar();
  const avatarPreset = AVATAR_PRESETS.find(p => p.id === savedAvatar);
  const AvatarIcon = avatarPreset?.icon;

  const recentWorkouts = useMemo(() => {
    return [...(workoutHistory || [])].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)).slice(0, 5);
  }, [workoutHistory]);

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

  const streakStats = useMemo(() => getWorkoutStats(workoutHistory || []), [workoutHistory]);

  const circleRadius = 54;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const progressOffset = circleCircumference * (1 - Math.min(overallProgress, 1));
  const progressPercent = Math.round(overallProgress * 100);

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Genesis Rise — Transform Your Fitness Journey</title>
          <meta name="description" content="Track workouts, monitor health, and level up your fitness with Genesis Rise — a premium platform that turns exercise into a rewarding journey of consistent growth." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://yourdomain.com/" />
          <meta property="og:title" content="Genesis Rise — Transform Your Fitness Journey" />
          <meta property="og:description" content="Track workouts, monitor health, and level up your fitness with Genesis Rise — a premium platform that turns exercise into a rewarding journey of consistent growth." />
          <meta property="og:image" content="https://yourdomain.com/igris_shadow_face.png" />
          <meta property="og:image:alt" content="Genesis Rise Logo" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://yourdomain.com/" />
          <meta property="twitter:title" content="Genesis Rise - Premium Fitness Platform" />
          <meta property="twitter:description" content="Track workouts, earn XP, and reach your fitness goals with Genesis Rise — a premium fitness platform with training plans, health tracking, and nutrition tools." />
          <meta property="twitter:image" content="https://yourdomain.com/igris_shadow_face.png" />
        </Helmet>
        <div className="bg-sl-gradient">
          {/* ===== Cinematic Hero Section ===== */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sl-purple/8 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-1/4 right-1/5 w-[420px] h-[420px] bg-sl-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
              <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] bg-amber-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
              <div className="absolute bottom-1/3 left-1/5 w-[350px] h-[350px] bg-sl-purple/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4.5s' }} />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-sl-pattern opacity-20 pointer-events-none" />

            {/* Vignette Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-sl-darker/30 via-transparent to-sl-dark/60 pointer-events-none" />



            {/* Main Hero Content */}
            <div className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex justify-center mb-10"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center bg-sl-purple/10 rounded-full border-2 border-sl-purple/30 shadow-sl-glow-purple overflow-hidden">
                  <img src="/igris_shadow_face.png" alt="Genesis Rise" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-white">Rise Beyond Limits.</span>
                <br />
                <span className="gradient-text">Transform Every Day.</span>
              </motion.h1>

              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span
                  className="text-xl md:text-2xl text-white font-medium tracking-[0.15em]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  GENESIS RISE
                </span>
              </motion.div>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-sl-gray-light/70 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Track every rep, get adaptive guidance, and watch your progress unfold through levels and milestones. Genesis Rise turns fitness into a journey of consistent growth.
              </motion.p>

              <motion.div
                className="flex flex-col items-center gap-4 w-full sm:w-auto mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <a
                  href={import.meta.env.VITE_APK_DOWNLOAD_URL || '#'}
                  download
                  className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-sl-purple-light/70 hover:text-white rounded-full border border-sl-purple/20 hover:border-sl-purple/50 bg-sl-purple/5 hover:bg-sl-purple/15 transition-all duration-300 mb-1"
                >
                  <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
                  Download Android APK
                  <span className="absolute -inset-0.5 bg-gradient-to-r from-sl-purple/0 via-sl-purple/20 to-amber-500/0 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 rounded-full" />
                </a>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-5 w-full">
                <button
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-4 flex-1 sm:flex-none min-w-[200px] bg-gradient-to-r from-sl-purple to-amber-500 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-sl-purple/25 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark min-h-[56px]"
                >
                  <span className="relative z-10">Begin Your Journey</span>
                  <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-sl-purple via-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                </button>

                <button
                  onClick={() => setShowVideo(true)}
                  className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-4 flex-1 sm:flex-none min-w-[200px] bg-transparent text-sl-purple-light font-semibold text-lg rounded-xl border border-sl-purple/30 overflow-hidden transition-all duration-300 hover:border-sl-purple/60 hover:bg-sl-purple/5 hover:shadow-lg hover:shadow-sl-purple/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark min-h-[56px]"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Watch Experience</span>
                </button>
                </div>
              </motion.div>

              <p className="text-center text-xs text-sl-gray-light/50 mt-5 leading-relaxed">
                Free to get started&ensp;·&ensp;No credit card required&ensp;·&ensp;Secure authentication
              </p>
            </div>

            {/* Bottom Fade Transition */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-sl-dark to-transparent pointer-events-none" />
          </section>

          {/* ===== Rest of Landing Page ===== */}
          <div className="mobile-container py-8">

            {/* ===== Social Proof & Trust Section ===== */}
            <section className="mb-16">
              {/* Section Header */}
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold gradient-text mb-3">
                  Trusted by the Genesis Community
                </h2>
                <p className="text-base text-sl-gray-light max-w-2xl mx-auto leading-relaxed">
                  Build consistent habits with detailed progress tracking, health monitoring, and a progression system that keeps you motivated every day.
                </p>
              </div>

              {/* Community Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-6 md:p-7 text-center hover:bg-sl-gray/30 transition group">
                  <div className="w-12 h-12 rounded-full bg-sl-purple/15 flex items-center justify-center mx-auto mb-6 group-hover:bg-sl-purple/25 transition">
                    <Users className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-3">Active Members</h3>
                  <p className="text-lg lg:text-xl font-extrabold gradient-text leading-tight mb-0">Growing Daily</p>
                  <p className="text-sm text-sl-gray-light/60">Community Progress</p>
                </div>
                <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-6 md:p-7 text-center hover:bg-sl-gray/30 transition group">
                  <div className="w-12 h-12 rounded-full bg-sl-purple/15 flex items-center justify-center mx-auto mb-6 group-hover:bg-sl-purple/25 transition">
                    <Activity className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-3">Workouts Completed</h3>
                  <p className="text-lg lg:text-xl font-extrabold gradient-text leading-tight mb-0">Live Statistics</p>
                  <p className="text-sm text-sl-gray-light/60">Updated in Real Time</p>
                </div>
                <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-6 md:p-7 text-center hover:bg-sl-gray/30 transition group">
                  <div className="w-12 h-12 rounded-full bg-sl-purple/15 flex items-center justify-center mx-auto mb-6 group-hover:bg-sl-purple/25 transition">
                    <Zap className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-3">XP Earned</h3>
                  <p className="text-lg lg:text-xl font-extrabold gradient-text leading-tight mb-0">Collective Achievement</p>
                  <p className="text-sm text-sl-gray-light/60 -ml-0.5">Community Progress</p>
                </div>
                <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-6 md:p-7 text-center hover:bg-sl-gray/30 transition group">
                  <div className="w-12 h-12 rounded-full bg-sl-purple/15 flex items-center justify-center mx-auto mb-6 group-hover:bg-sl-purple/25 transition">
                    <CheckCircle2 className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-3">Daily Goals Completed</h3>
                  <p className="text-lg lg:text-xl font-extrabold gradient-text leading-tight mb-0">Consistency in Action</p>
                  <p className="text-sm text-sl-gray-light/60 -ml-0.5">Updated in Real Time</p>
                </div>
              </div>
              
              {/* Trust Features */}
              <h3 className="text-xl font-bold text-center gradient-text mb-6">Why Genesis Rise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">Secure Authentication</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Protected using Supabase Authentication.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">Diet & Nutrition</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Track your calories and macros with a personalised diet planner.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">Privacy First</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Your personal fitness data remains secure and private.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">Cross Platform</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Available on desktop, tablet, and mobile.</p>
                  </div>
                </div>
              </div>

              {/* Community Reviews */}
              <h3 className="text-xl font-bold text-center gradient-text mb-6">What Members Say</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="mobile-card p-5 h-full relative">
                  <span className="absolute top-3 right-3 text-[9px] font-semibold text-sl-gray-light/30 uppercase tracking-wider bg-sl-gray/20 px-2 py-0.5 rounded">Sample</span>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sl-purple to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Alex Chen</p>
                      <p className="text-[10px] text-amber-400/80 font-semibold">Genesis Level 14</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-sl-gray-light leading-relaxed">
                    &ldquo;Genesis Rise made it easier to stay consistent because every workout feels like meaningful progress.&rdquo;
                  </p>
                </div>
                <div className="mobile-card p-5 h-full relative">
                  <span className="absolute top-3 right-3 text-[9px] font-semibold text-sl-gray-light/30 uppercase tracking-wider bg-sl-gray/20 px-2 py-0.5 rounded">Sample</span>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-sl-purple flex items-center justify-center text-white font-bold text-sm shrink-0">
                      J
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Jordan Wells</p>
                      <p className="text-[10px] text-amber-400/80 font-semibold">Genesis Level 9</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-sl-gray-light leading-relaxed">
                    &ldquo;The progress tracking keeps me consistent. Seeing my levels and streaks grow is genuinely motivating.&rdquo;
                  </p>
                </div>
                <div className="mobile-card p-5 h-full relative">
                  <span className="absolute top-3 right-3 text-[9px] font-semibold text-sl-gray-light/30 uppercase tracking-wider bg-sl-gray/20 px-2 py-0.5 rounded">Sample</span>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sl-purple to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      T
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Taylor Reed</p>
                      <p className="text-[10px] text-amber-400/80 font-semibold">Genesis Level 11</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-sl-gray-light leading-relaxed">
                    &ldquo;Tracking progress with XP and levels turned my daily workouts into something I actually look forward to.&rdquo;
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-center gradient-text mb-2">Features</h2>
              <p className="text-base text-sl-gray-light max-w-2xl mx-auto leading-relaxed text-center mb-6">Build consistency, track every milestone, and stay motivated — from workout tracking to health monitoring.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-5 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-1.5">Health Dashboard</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Monitor vitals, daily goals, BPM zones, and nutrition all in one place.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-5 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-1.5">Workout Tracker</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Log workouts, sets, reps, weights, and automatically track your progression.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-5 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-1.5">Training Planner</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Build custom workout plans with daily missions that keep you on track.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-5 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-1.5">Health Monitor</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Monitor health metrics, recovery, BMI, calories, and overall wellness.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-5 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <BarChart3 className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-1.5">Performance Analytics</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Visualize your journey with detailed charts, milestone tracking, and trends that show how far you&rsquo;ve come.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-5 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-1.5">Levels &amp; Achievements</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Unlock levels, earn XP through every workout, and collect achievements that celebrate your milestones.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== Why People Lose Consistency ===== */}
            <section className="mb-16">
              {/* Section Header */}
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold gradient-text mb-3">
                  Why Staying Consistent Is So Difficult
                </h2>
                <p className="text-base text-sl-gray-light max-w-2xl mx-auto leading-relaxed">
                  Most fitness journeys don&rsquo;t fail because of lack of effort&mdash;they fail because people lose motivation, direction, and consistency.
                  Genesis Rise is designed to solve those challenges.
                </p>
              </div>

              {/* Pain Point Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center shrink-0">
                    <Flame className="w-6 h-6 text-amber-400/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2">Losing Motivation</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Many people begin with excitement but gradually lose motivation after a few weeks.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6 text-amber-400/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2">No Clear Progress</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Without visible progress, it becomes difficult to stay committed and celebrate improvement.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-amber-400/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2">Lack of Structure</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Random workouts and inconsistent planning often lead to frustration instead of results.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6 text-amber-400/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-2">No Accountability</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Without reminders, goals, or guidance, it&rsquo;s easy to skip workouts and lose momentum.</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-sl-purple/10"></div>
                <span className="text-xs text-sl-gray-light/40 font-medium tracking-wider uppercase">From Struggle to Growth</span>
                <div className="flex-1 h-px bg-sl-purple/10"></div>
              </div>

              {/* Solution Cards Heading */}
              <h3 className="text-xl font-bold text-center gradient-text mb-6">How Genesis Rise Changes the Journey</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">BPM Calculator</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Calculate your heart rate zones and optimise your training intensity.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <BarChart3 className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">Smart Progress Tracking</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Every workout contributes to meaningful progress you can clearly see.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">Personalized Planning</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Follow structured workout plans tailored to your goals.</p>
                  </div>
                </div>
                <div className="mobile-card flex flex-col items-center text-center gap-4 p-6 md:p-7 h-full">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-sl-purple-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-sl-purple-light leading-tight mb-2">Daily Goals &amp; Achievements</h3>
                    <p className="text-sm text-sl-gray-light leading-relaxed">Build consistency through milestones, achievements, and daily objectives.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="how-it-works" className="mb-12">
              <h2 className="text-2xl font-bold text-center gradient-text mb-6">How It Works</h2>
              <div className="space-y-4">
                <div className="mobile-card p-5 text-center">
                  <div className="w-12 h-12 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sl-purple-light font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-sl-purple-light mb-2">Log Your Training</h3>
                  <p className="text-sm text-sl-gray-light">Record every workout, track your performance, and earn XP with each session.</p>
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
                  <p className="text-sm text-sl-gray-light">Watch your level rise as you accumulate XP, unlocking new titles and reaching new milestones.</p>
                </div>
              </div>
            </section>

            {/* ===== Pricing Section ===== */}
            <section id="pricing" className="mb-16">
              <div className="text-center max-w-xl mx-auto mb-8 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-4 leading-tight">
                  Choose the Plan That Fits Your Journey
                </h2>
                <p className="text-base text-sl-gray-light leading-relaxed">
                  Start with everything you need to build lasting fitness habits. Upgrade in the future only if you want even more advanced features.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Genesis Free - Recommended */}
                <div className="relative mobile-card p-6 md:p-8 flex flex-col border border-sl-purple/40 shadow-sl-glow-purple hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-amber-500 to-amber-400 text-black text-xs font-bold rounded-full shadow-lg shadow-amber-500/30 z-10 whitespace-nowrap">
                    <Crown className="w-3.5 h-3.5" />
                    Recommended
                  </div>

                  <div className="text-center mb-6 pt-3">
                    <h3 className="text-xl font-bold text-white mb-2">Genesis Free</h3>
                    <div className="text-4xl font-bold text-sl-purple-light mb-1">Free</div>
                    <p className="text-xs text-sl-gray-light">No credit card required</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      'Workout Tracker',
                      'Smart Planner',
                      'Health Monitor',
                      'Progress Analytics',
                      'Diet Planner',
                      'Achievement System',
                      'Daily Goals',
                      'Google Sign-In',
                      'Cross-Device Access',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-sl-gray-light">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 w-full bg-gradient-to-r from-sl-purple to-amber-500 text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-sl-purple/25 hover:scale-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sl-purple focus-visible:ring-offset-2 focus-visible:ring-offset-sl-dark min-h-[56px]"
                  >
                    <span className="relative z-10">Start Free</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-sl-purple via-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  </Link>

                  <p className="text-xs text-sl-gray-light/50 text-center mt-3">
                    No credit card required.
                  </p>
                </div>

                {/* Genesis Pro - Coming Soon */}
                <div className="relative mobile-card p-6 md:p-8 flex flex-col border border-sl-purple/10 opacity-90 hover:opacity-100 hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-sl-purple to-sl-purple-light text-white text-xs font-bold rounded-full shadow-lg shadow-sl-purple/30 z-10 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5" />
                    Coming Soon
                  </div>

                  <div className="text-center mb-6 pt-3">
                    <h3 className="text-xl font-bold text-white mb-2">Genesis Pro</h3>
                    <div className="text-lg font-semibold text-sl-purple-light mb-1">Future Premium Features</div>
                    <p className="text-xs text-sl-gray-light">Elevate your fitness journey</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {[
                      'Personalized Performance Reports',
                      'Advanced Analytics',
                      'Exclusive Challenges',
                      'Priority New Features',
                      'Premium Themes',
                      'Cloud Backup Enhancements',
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-sl-gray-light">
                        <Sparkles className="w-4 h-4 text-sl-purple-light mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled
                    aria-disabled="true"
                    className="relative inline-flex items-center justify-center gap-2.5 px-8 py-4 w-full bg-sl-gray/50 text-sl-gray-light/40 font-bold text-lg rounded-xl border border-sl-purple/10 cursor-not-allowed min-h-[56px] focus-visible:outline-none"
                  >
                    <Lock className="w-5 h-5" />
                    Coming Soon
                  </button>
                </div>
              </div>
            </section>

            <footer className="text-center text-sl-gray-light/50 text-xs pb-8">
              <p>&copy; 2026 Genesis Rise System. All rights reserved.</p>
            </footer>
          </div>
        </div>

        {/* Video Showcase Modal */}
        <AnimatePresence>
          {showVideo && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-sl-darker/90 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowVideo(false)}
            >
              <motion.div
                className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-sl-purple/20 shadow-2xl shadow-sl-purple/20 bg-sl-dark"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-sl-dark via-sl-purple/5 to-sl-darker p-10 md:p-14">
                  <motion.div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-sl-purple to-amber-400 flex items-center justify-center mb-8 shadow-2xl shadow-sl-purple/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Play className="w-9 h-9 md:w-10 md:h-10 text-white ml-1" />
                  </motion.div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 text-center">
                    Genesis Rise Showcase
                  </h3>

                  <p className="text-base md:text-lg text-sl-purple-light font-semibold mb-4 text-center">
                    The official cinematic experience is coming soon.
                  </p>

                  <p className="text-sm text-sl-gray-light/60 text-center max-w-md leading-relaxed">
                    A premium gameplay and fitness showcase will be available in a future update.
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-[11px] text-sl-gray-light/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                    <span>Stay tuned</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-sl-purple/60" />
                  </div>
                </div>

                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-sl-dark/80 border border-sl-purple/20 flex items-center justify-center text-sl-gray-light hover:text-white hover:border-sl-purple/40 transition-all z-10"
                  aria-label="Close video"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (showOnboarding === null) {
    return null;
  }

  if (showOnboarding) {
    return <Onboarding user={user} onComplete={() => setShowOnboarding(false)} />;
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
            <p className="text-[9px] text-sl-purple-light/60 font-semibold">{Math.round((todaySafe.sleep?.duration || 0) * 10) / 10}h / {goals.sleep}h</p>
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

      {/* ===== Section 4: Today's Mission (first-time users) ===== */}
      {(!workoutHistory || workoutHistory.length === 0) && onboardingRecs && (
        <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '240ms' }}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-sl-purple/10 to-sl-gray/20 border border-amber-500/20 p-5 shadow-lg shadow-amber-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-sl-purple/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Today's Mission</h2>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10">
                  <div className="w-8 h-8 rounded-lg bg-sl-purple/15 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-sl-purple-light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Complete your first workout</p>
                    <p className="text-[10px] text-sl-gray-light">Start with a {onboardingRecs.experience === 'Beginner' ? 'light' : onboardingRecs.experience === 'Intermediate' ? 'moderate' : 'challenging'} session</p>
                  </div>
                  <div className="text-[10px] font-bold text-amber-400/80 whitespace-nowrap">+50 XP</div>
                </div>

                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                    <Droplets className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Drink your water goal</p>
                    <p className="text-[10px] text-sl-gray-light">{onboardingRecs.water.toLocaleString()} ml daily target</p>
                  </div>
                  <div className="text-[10px] font-bold text-amber-400/80 whitespace-nowrap">+30 XP</div>
                </div>

                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">Log today's weight</p>
                    <p className="text-[10px] text-sl-gray-light">Track your daily progress</p>
                  </div>
                  <div className="text-[10px] font-bold text-amber-400/80 whitespace-nowrap">+20 XP</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/10">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Mission Reward</span>
                </div>
                <span className="text-xs font-bold text-amber-400">+100 XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Section 5: Stats Widgets Row ===== */}
      <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '280ms' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-sl-gray-light font-semibold">Current Level</span>
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-lg font-extrabold text-white">{level}</p>
            <p className="text-[9px] text-sl-gray-light mt-0.5">{title || 'Initiate'}</p>
            <div className="w-full h-1 bg-sl-gray/40 rounded-full overflow-hidden mt-2">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
            </div>
          </div>

          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-sl-gray-light font-semibold">Total XP</span>
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <p className="text-lg font-extrabold text-white">{xp.toLocaleString()}</p>
            <p className="text-[9px] text-sl-gray-light mt-0.5">{xpForNext > 0 ? `${xpForNext - (xp % xpForNext)} to next level` : 'Max level'}</p>
          </div>

          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-sl-gray-light font-semibold">Workout Streak</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <p className="text-lg font-extrabold text-white">{streakStats.currentStreak > 0 ? `${streakStats.currentStreak}d` : '—'}</p>
            <p className="text-[9px] text-sl-gray-light mt-0.5">{streakStats.currentStreak > 0 ? `${streakStats.currentStreak} day${streakStats.currentStreak > 1 ? 's' : ''} in a row` : 'No active streak'}</p>
          </div>

          <div className="rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3.5 hover:bg-sl-gray/30 transition">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-sl-gray-light font-semibold">Weekly Workouts</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg font-extrabold text-white">{weeklyStats.totalWorkouts}x</p>
            <p className="text-[9px] text-sl-gray-light mt-0.5">{weeklyStats.totalWorkouts} workout{weeklyStats.totalWorkouts !== 1 ? 's' : ''} this week</p>
          </div>
        </div>
      </div>

      {/* ===== Section 6: Continue Workout ===== */}
      <div className="mobile-container mt-5 animate-slide-up" style={{ animationDelay: '320ms' }}>
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
                <p className="text-[10px] text-sl-gray-light font-semibold uppercase tracking-wider">Ready to Begin?</p>
                <h3 className="text-sm font-bold text-white">Plan Your First Workout</h3>
                <p className="text-[10px] text-sl-gray-light mt-0.5">Your analytics will appear here after your first session</p>
              </div>
              <ChevronRight className="w-5 h-5 text-sl-purple-light group-hover:translate-x-0.5 transition" />
            </div>
          </button>
        )}
      </div>


      {/* ===== Section 8: Recent Workouts ===== */}
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
            <p className="text-sm text-white font-semibold mb-1">No workouts logged yet</p>
            <p className="text-xs text-sl-gray-light mb-4">Complete your first workout to begin tracking your progress.</p>
            <button onClick={() => navigate('/planner')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-sl-purple to-amber-500 text-white font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-sl-purple/20 transition-all">
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

      {/* ===== Section 9: Quick Actions ===== */}
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
          <button onClick={() => navigate('/health')}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-sl-gray/20 border border-sl-purple/10 p-3 hover:bg-sl-purple/15 hover:border-sl-purple/20 active:scale-95 transition cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-sl-purple/15 flex items-center justify-center">
              <Heart className="w-4 h-4 text-sl-purple-light" />
            </div>
            <span className="text-[9px] font-bold text-white">Health</span>
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

      {showNotificationPrompt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-sl-dark border border-sl-purple/30 p-5 rounded-2xl max-w-sm w-full animate-scale-in shadow-sl-glow-purple">
            <div className="w-12 h-12 rounded-2xl bg-sl-purple/15 border border-sl-purple/25 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-sl-purple-light" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Stay Updated</h3>
            <p className="text-sm text-sl-gray-light text-center leading-relaxed mb-5">
              Allow push notifications to get workout reminders, progress updates, and goal completion alerts.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={handleAllowNotifications}
                className="w-full py-2.5 rounded-xl bg-sl-purple/20 border border-sl-purple/30 text-sm font-bold text-sl-purple-light hover:bg-sl-purple/30 transition">
                Allow Notifications
              </button>
              <button onClick={handleDismissNotifications}
                className="w-full py-2 rounded-xl text-xs font-semibold text-sl-gray-light hover:text-white transition">
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
