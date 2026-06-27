import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';
import { useLevel } from '../../context/LevelContext';
import { useWorkout } from '../../context/WorkoutContext';
import { usePowerLevel } from '../../context/PowerLevelContext';
import { getWorkoutStats } from '../../utils/workoutUtils';
import { loadPlans, loadSchedule, getActivePlan } from '../../utils/planUtils';
import ProfileHero from './ProfileHero';
import PersonalInfo from './PersonalInfo';
import FitnessStats from './FitnessStats';
import AchievementsGallery from './AchievementsGallery';
import PersonalRecordsSection from './PersonalRecordsSection';
import ActivityTimeline from './ActivityTimeline';
import AccountSection from './AccountSection';

const VIEWS = {
  PROFILE: 'profile',
  INFO: 'info',
  ACHIEVEMENTS: 'achievements',
  RECORDS: 'records',
  TIMELINE: 'timeline',
  ACCOUNT: 'account',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { level, xp, progress, xpForNext, title } = useLevel();
  const { workoutHistory, personalRecords, userSettings, missionProgress, updateUserSettings } = useWorkout();
  const { powerLevel, weeklyChange } = usePowerLevel();
  const { avatar, avatarType, updateAvatar } = useAvatar();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [view, setView] = useState(VIEWS.PROFILE);

  const hasWorkouts = (workoutHistory?.length || 0) > 0;

  useEffect(() => {
    if (!user) { setProfileLoading(false); return; }
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, level, xp, rank, created_at, goal, experience, height_cm, weight_kg, age, workout_days, onboarding_completed')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      } finally { setProfileLoading(false); }
    })();
  }, [user]);

  const stats = useMemo(() => getWorkoutStats(workoutHistory || []), [workoutHistory]);

  const activePlan = useMemo(() => {
    try {
      const plans = loadPlans();
      const schedule = loadSchedule();
      return getActivePlan(plans);
    } catch { return null; }
  }, []);

  const longestStreak = stats.longestStreak || 0;
  const currentStreak = missionProgress?.streak || 0;

  const handleUpdateProfile = useCallback(async (field, value) => {
    if (!user) return;
    const updates = { [field]: value };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) setProfile(prev => ({ ...prev, ...updates }));
    if (field === 'weight' || field === 'height' || field === 'age') {
      const settingsField = field === 'height_cm' ? 'height' : field === 'weight_kg' ? 'weight' : field;
      updateUserSettings({ [settingsField]: value });
    }
    return !error;
  }, [user, updateUserSettings]);

  const handleUpdateUsername = useCallback(async (username) => {
    if (!user) return false;
    try {
      const { error: authError } = await supabase.auth.updateUser({ data: { username } });
      if (authError) return false;
      const { error: profileError } = await supabase.from('profiles').update({ username }).eq('id', user.id);
      if (profileError) return false;
      setProfile(prev => ({ ...prev, username }));
      return true;
    } catch { return false; }
  }, [user]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-sl-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sl-purple/30 border-t-sl-purple rounded-full animate-spin" />
          <span className="text-xs text-sl-gray-light font-semibold">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="space-y-4">
          {view === VIEWS.PROFILE && (
            <>
              <ProfileHero
                user={user}
                profile={profile}
                level={level}
                xp={xp}
                progress={progress}
                xpForNext={xpForNext}
                title={title}
                powerLevel={powerLevel}
                weeklyChange={weeklyChange}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                avatar={avatar}
                avatarType={avatarType}
                hasWorkouts={hasWorkouts}
                onEditProfile={() => setView(VIEWS.INFO)}
                onUpdateAvatar={updateAvatar}
              />

              <FitnessStats
                stats={stats}
                level={level}
                xp={xp}
                title={title}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                activePlan={activePlan}
              />

              <div className="grid grid-cols-3 gap-2">
                <NavButton label="Achievements" count={stats.totalWorkouts > 0 ? Math.min(6, 6) : 0} onClick={() => setView(VIEWS.ACHIEVEMENTS)} />
                <NavButton label="Records" count={Object.keys(personalRecords || {}).length} onClick={() => setView(VIEWS.RECORDS)} />
                <NavButton label="Activity" onClick={() => setView(VIEWS.TIMELINE)} />
              </div>

              <AccountSection
                user={user}
                onViewChange={setView}
              />
            </>
          )}

          {view === VIEWS.INFO && (
            <PersonalInfo
              user={user}
              profile={profile}
              userSettings={userSettings}
              avatar={avatar}
              avatarType={avatarType}
              onUpdateAvatar={updateAvatar}
              onUpdateProfile={handleUpdateProfile}
              onUpdateUsername={handleUpdateUsername}
              onBack={() => setView(VIEWS.PROFILE)}
            />
          )}

          {view === VIEWS.ACHIEVEMENTS && (
            <AchievementsGallery
              workoutHistory={workoutHistory}
              currentStreak={currentStreak}
              personalRecords={personalRecords}
              level={level}
              onBack={() => setView(VIEWS.PROFILE)}
            />
          )}

          {view === VIEWS.RECORDS && (
            <PersonalRecordsSection
              workoutHistory={workoutHistory}
              personalRecords={personalRecords}
              stats={stats}
              onBack={() => setView(VIEWS.PROFILE)}
            />
          )}

          {view === VIEWS.TIMELINE && (
            <ActivityTimeline
              workoutHistory={workoutHistory}
              personalRecords={personalRecords}
              level={level}
              onBack={() => setView(VIEWS.PROFILE)}
            />
          )}

          {view === VIEWS.ACCOUNT && (
            <AccountSection
              user={user}
              onBack={() => setView(VIEWS.PROFILE)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ label, count, onClick }) {
  return (
    <button onClick={onClick}
      className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20 hover:bg-sl-gray/30 hover:border-sl-purple/25 transition text-center">
      <p className="text-[11px] font-bold text-white">{label}</p>
      {count !== undefined && (
        <p className="text-[9px] text-sl-purple-light/60 mt-0.5">{count}</p>
      )}
    </button>
  );
}
