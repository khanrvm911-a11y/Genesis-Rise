import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import { useLevel } from '../context/LevelContext';
import { useWorkout } from '../context/WorkoutContext';
import { usePowerLevel } from '../context/PowerLevelContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, ChevronRight, Shield, Award, Dumbbell, Trophy, Flame, Star, Zap, ArrowUp, ArrowDown, Minus, Camera, X, Activity, Heart } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { level, xp, progress, xpForNext, title } = useLevel();
  const { workoutHistory, personalRecords } = useWorkout();
  const { powerLevel, weeklyChange } = usePowerLevel();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { avatar, avatarType, updateAvatar } = useAvatar();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const MAX_AVATAR_SIZE = 10 * 1024 * 1024; // 10 MB

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

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, level, xp, rank, created_at')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setError('Failed to load profile');
          setLoading(false);
          return;
        }

        if (data) setProfile(data);
        else setError('Profile not found');
      } finally { setLoading(false); }
    };

    fetchProfile();
  }, [user]);

  const handleAvatarSelect = (presetId) => {
    updateAvatar(presetId, 'preset');
    setShowAvatarPicker(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > MAX_AVATAR_SIZE) {
      setUploadError('Image must be under 10 MB');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        updateAvatar(dataUrl, 'custom');
        setShowAvatarPicker(false);
        setUploadError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const getTitleFromLevel = (level) => {
    const titles = ['Novice', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Elite', 'Legend'];
    const index = Math.min(Math.floor((level - 1) / 10), titles.length - 1);
    return titles[index];
  };

  const TIERS = [
    { min: 1, max: 10, title: 'Initiate' },
    { min: 11, max: 20, title: 'Bronze' },
    { min: 21, max: 30, title: 'Elite' },
    { min: 31, max: 40, title: 'Diamond' },
    { min: 41, max: 50, title: 'Ascendant' },
    { min: 51, max: 70, title: 'Genesis' },
    { min: 71, max: 90, title: 'Mythic' },
    { min: 91, max: 100, title: 'Legend' },
  ];
  const currentTier = TIERS.find(t => level >= t.min && level <= t.max) || TIERS[TIERS.length - 1];
  const currentIdx = TIERS.indexOf(currentTier);
  const nextTier = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
  const tierProgress = (level - currentTier.min) / (currentTier.max - currentTier.min);

  const weeklyWorkouts = (workoutHistory || []).filter(w => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const t = new Date(w.timestamp || w.date).getTime();
    return t >= weekAgo.getTime() && t <= now.getTime();
  });

  const currentStreak = (() => {
    if (!workoutHistory || workoutHistory.length === 0) return 0;
    const sorted = [...workoutHistory].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < sorted.length; i++) {
      const wDate = new Date(sorted[i].timestamp || sorted[i].date);
      wDate.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(expected.getDate() - streak);
      expected.setHours(0, 0, 0, 0);
      if (wDate.getTime() === expected.getTime()) {
        streak++;
      } else if (i === 0 && wDate.getTime() === new Date(today.getTime() - 86400000).setHours(0, 0, 0, 0)) {
        streak = 1;
      } else {
        break;
      }
    }
    return streak;
  })();

  const prCount = !personalRecords ? 0 : Object.values(personalRecords).filter(r => r?.best && Object.values(r.best).some(v => v > 0)).length;

  const weeklyStats = (() => {
    const total = weeklyWorkouts.length;
    const totCal = weeklyWorkouts.reduce((s, w) => s + (w.totalCalories || 0), 0);
    const totDur = weeklyWorkouts.reduce((s, w) => s + (w.duration || 0), 0);
    return { totalWorkouts: total, totalCalories: totCal, totalDuration: totDur };
  })();

  const achievements = (() => {
    const list = [];
    const total = (workoutHistory || []).length;
    if (total >= 1) list.push({ icon: Dumbbell, label: 'First Workout', desc: 'Complete your first session', earned: true });
    if (total >= 5) list.push({ icon: Dumbbell, label: 'Getting Started', desc: '5 workouts completed', earned: true });
    if (total >= 10) list.push({ icon: Trophy, label: 'Dedicated', desc: '10 workouts completed', earned: true });
    if (total >= 25) list.push({ icon: Trophy, label: 'Committed', desc: '25 workouts completed', earned: true });
    if (total >= 50) list.push({ icon: Award, label: 'Warrior', desc: '50 workouts completed', earned: true });
    if (total >= 100) list.push({ icon: Award, label: 'Legendary', desc: '100 workouts completed', earned: true });
    if (currentStreak >= 3) list.push({ icon: Flame, label: 'On Fire', desc: '3-day streak', earned: true });
    if (currentStreak >= 7) list.push({ icon: Flame, label: 'Week Warrior', desc: '7-day streak', earned: true });
    if (currentStreak >= 14) list.push({ icon: Star, label: 'Unstoppable', desc: '14-day streak', earned: true });
    if (prCount >= 1) list.push({ icon: Zap, label: 'Record Breaker', desc: 'Set first PR', earned: true });
    if (prCount >= 5) list.push({ icon: Zap, label: 'Power Surge', desc: '5 personal records', earned: true });
    if (weeklyWorkouts.length >= 7) list.push({ icon: Star, label: 'Daily Grind', desc: '7 workouts this week', earned: true });
    const unearned = [
      { icon: Dumbbell, label: 'First Workout', desc: 'Complete your first session', earned: false },
      { icon: Flame, label: 'On Fire', desc: '3-day streak', earned: false },
      { icon: Zap, label: 'Record Breaker', desc: 'Set first PR', earned: false },
    ];
    if (list.length >= 8) return list;
    const earnedKeys = new Set(list.map(a => a.label));
    const suggestions = unearned.filter(a => !earnedKeys.has(a.label));
    return [...list, ...suggestions].slice(0, 10);
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-sl-gradient flex items-center justify-center">
        <div className="text-sl-gray-light">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sl-gradient flex flex-col items-center justify-center px-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/" className="holo-button">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <Link to="/" className="flex items-center gap-1 text-sl-gray-light hover:text-white text-sm mb-4 touch-target w-fit">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="mobile-card p-6 text-center mb-4">
          <div className="relative w-16 h-16 mx-auto mb-3">
            {avatarType === 'custom' && avatar ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-sl-purple/30 shadow-sl-glow">
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : avatarType === 'preset' && avatar ? (
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${AVATAR_PRESETS.find(p => p.id === avatar)?.colors || 'from-sl-purple to-sl-red'} flex items-center justify-center mx-auto border-2 border-sl-purple/30 shadow-sl-glow`}>
                {(() => {
                  const preset = AVATAR_PRESETS.find(p => p.id === avatar);
                  const Icon = preset?.icon || Dumbbell;
                  return <Icon className="w-7 h-7 text-white" />;
                })()}
              </div>
            ) : (
              <div className="w-16 h-16 bg-sl-purple/20 rounded-full flex items-center justify-center mx-auto border-2 border-sl-purple/30 shadow-sl-glow">
                <span className="text-sl-purple-light font-bold text-2xl">
                  {(profile?.username || user?.email || 'C').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-sl-purple rounded-full flex items-center justify-center border-2 border-sl-bg hover:bg-sl-purple-light transition-colors"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <h2 className="text-xl font-bold gradient-text mb-1">Genesis Rise</h2>
          {profile?.username && (
            <p className="text-sl-purple-light font-semibold">{profile.username}</p>
          )}
          {user?.email && <p className="text-xs text-sl-gray-light/50 mt-0.5">{user.email}</p>}
        </div>

        <div className="mobile-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-sl-purple-light font-semibold">Level</span>
            <span className="text-lg font-bold text-white">{level}</span>
          </div>
          <div className="w-full bg-sl-gray/40 rounded-full h-2.5 overflow-hidden mb-2">
            <div className={`h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000`} style={{ width: `${progress * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-sl-gray-light/70">
            <span>{xp} XP</span>
            <span>{Math.floor(progress * 100)}%</span>
          </div>
        </div>

        <div className="mobile-card p-5 mb-4">
          <h3 className="text-sm text-sl-purple-light font-semibold mb-4 text-center">Title Progression</h3>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="text-center">
              <p className="text-base font-bold text-sl-purple-light">{currentTier.title}</p>
              <p className="text-[9px] text-sl-gray-light/50 font-semibold">Lv {currentTier.min}-{currentTier.max}</p>
            </div>
            {nextTier && (
              <>
                <ChevronRight className="w-5 h-5 text-sl-gray-light/40 shrink-0" />
                <div className="text-center">
                  <p className="text-base font-bold text-sl-gray-light/50">{nextTier.title}</p>
                  <p className="text-[9px] text-sl-gray-light/30 font-semibold">Lv {nextTier.min}-{nextTier.max}</p>
                </div>
              </>
            )}
          </div>
          <div className="w-full bg-sl-gray/40 rounded-full h-2 overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red rounded-full transition-all duration-1000"
              style={{ width: `${tierProgress * 100}%` }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-sl-gray-light/50">
            <span>{level} / {nextTier ? nextTier.min - 1 : currentTier.max}</span>
            <span>{nextTier ? `${nextTier.min - level} level${nextTier.min - level !== 1 ? 's' : ''} to ${nextTier.title}` : 'Maximum Rank'}</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sl-purple/15 via-sl-purple/5 to-transparent border border-sl-purple/15 p-4 mb-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sl-purple/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sl-purple to-sl-red flex items-center justify-center shadow-lg shadow-sl-purple/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[9px] text-sl-gray-light font-bold uppercase tracking-wider">Player Rank</p>
                <h3 className="text-base font-extrabold text-white -mt-0.5">
                  {title} <span className="text-sl-purple-light">Lv.{level}</span>
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-right">
                <p className="text-lg font-extrabold text-white leading-none">{powerLevel}</p>
                <div className="flex items-center gap-0.5">
                  {weeklyChange > 0 ? <ArrowUp className="w-2.5 h-2.5 text-emerald-400" /> : weeklyChange < 0 ? <ArrowDown className="w-2.5 h-2.5 text-red-400" /> : <Minus className="w-2.5 h-2.5 text-sl-gray-light" />}
                  <span className={`text-[9px] font-bold ${weeklyChange > 0 ? 'text-emerald-400' : weeklyChange < 0 ? 'text-red-400' : 'text-sl-gray-light'}`}>
                    {weeklyChange > 0 ? '+' : ''}{weeklyChange}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-sl-gray-light font-semibold">XP Progress</span>
              <span className="text-[10px] text-sl-purple-light font-bold">{xp.toLocaleString()} / {(xp + Math.round((1 - progress) * xpForNext)).toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000 animate-xp-fill"
                style={{ width: `${Math.min(progress * 100, 100)}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-10">
            <div className="bg-sl-gray/20 rounded-lg p-2.5 text-center">
              <p className="text-sm font-bold text-white">{currentStreak}</p>
              <p className="text-[8px] text-sl-gray-light font-semibold uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="bg-sl-gray/20 rounded-lg p-2.5 text-center">
              <p className="text-sm font-bold text-white">{weeklyStats.totalWorkouts}</p>
              <p className="text-[8px] text-sl-gray-light font-semibold uppercase tracking-wider">This Week</p>
            </div>
            <div className="bg-sl-gray/20 rounded-lg p-2.5 text-center">
              <p className="text-sm font-bold text-white">{prCount}</p>
              <p className="text-[8px] text-sl-gray-light font-semibold uppercase tracking-wider">PRs</p>
            </div>
          </div>
        </div>

        <div className="mobile-card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-sl-purple-light flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Achievements
            </h3>
            <span className="text-[10px] text-sl-gray-light font-semibold">{achievements.filter(a => a.earned).length} earned</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {achievements.length === 0 ? (
              <div className="rounded-xl bg-sl-gray/15 border border-sl-purple/10 p-4 text-center w-full">
                <p className="text-xs text-sl-gray-light">Complete workouts to earn achievements.</p>
              </div>
            ) : (
              achievements.map((ach, i) => (
                <div key={i} className={`shrink-0 w-28 rounded-xl p-3 border transition hover:scale-105 ${
                  ach.earned
                    ? 'bg-sl-purple/10 border-sl-purple/20'
                    : 'bg-sl-gray/10 border-sl-gray/20 opacity-50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    ach.earned ? 'bg-gradient-to-br from-sl-purple to-sl-red' : 'bg-sl-gray/30'
                  }`}>
                    <ach.icon className={`w-4 h-4 ${ach.earned ? 'text-white' : 'text-sl-gray-light/50'}`} />
                  </div>
                  <p className={`text-[11px] font-bold truncate ${ach.earned ? 'text-white' : 'text-sl-gray-light/50'}`}>{ach.label}</p>
                  <p className="text-[8px] text-sl-gray-light/60 mt-0.5 truncate">{ach.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mobile-card p-5 mb-4">
          <div className="flex items-center justify-between border-b border-sl-purple/10 pb-3 mb-3">
            <span className="text-sm text-sl-gray-light/70">Title</span>
            <span className="text-sl-purple-light font-bold flex items-center gap-1">
              <Crown className="w-4 h-4" />
              {profile?.title || getTitleFromLevel(level)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-sl-gray-light/70">Member Since</span>
            <span className="text-sm text-sl-gray-light">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>

        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-sm bg-sl-bg border border-sl-purple/20 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Edit Avatar</h3>
                <button onClick={() => setShowAvatarPicker(false)} className="text-sl-gray-light hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {AVATAR_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleAvatarSelect(preset.id)}
                      className={`w-full aspect-square rounded-full bg-gradient-to-br ${preset.colors} flex items-center justify-center border-2 transition hover:scale-110 ${avatarType === 'preset' && avatar === preset.id ? 'border-white shadow-sl-glow' : 'border-transparent'}`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </button>
                  );
                })}
              </div>
              <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sl-purple/20 border border-sl-purple/30 text-sl-purple-light text-sm font-semibold cursor-pointer hover:bg-sl-purple/30 transition-colors">
                <Camera className="w-4 h-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
              {uploadError && (
                <p className="text-red-400 text-xs text-center mt-2">{uploadError}</p>
              )}
            </div>
          </div>
        )}

        <Link to="/" className="holo-button w-full text-center py-3 text-sm">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Profile;
