import { useMemo } from 'react';
import {
  Dumbbell, Trophy, Award, Flame, Star, Zap,
  Shield, Crown, Target, Activity, ArrowLeft,
  Lock, Check,
} from 'lucide-react';
import { getWorkoutStats } from '../../utils/workoutUtils';

const ACHIEVEMENT_DEFS = [
  { id: 'first_workout', icon: Dumbbell, label: 'First Workout', desc: 'Complete your first workout', check: (w, s, pr) => w >= 1 },
  { id: 'getting_started', icon: Dumbbell, label: 'Getting Started', desc: 'Complete 5 workouts', check: (w, s, pr) => w >= 5 },
  { id: 'dedicated', icon: Trophy, label: 'Dedicated', desc: 'Complete 10 workouts', check: (w, s, pr) => w >= 10 },
  { id: 'committed', icon: Trophy, label: 'Committed', desc: 'Complete 25 workouts', check: (w, s, pr) => w >= 25 },
  { id: 'warrior', icon: Award, label: 'Warrior', desc: 'Complete 50 workouts', check: (w, s, pr) => w >= 50 },
  { id: 'legendary', icon: Award, label: 'Legendary', desc: 'Complete 100 workouts', check: (w, s, pr) => w >= 100 },
  { id: 'on_fire', icon: Flame, label: 'On Fire', desc: 'Reach a 3-day streak', check: (w, s, pr) => s >= 3 },
  { id: 'week_warrior', icon: Flame, label: 'Week Warrior', desc: 'Reach a 7-day streak', check: (w, s, pr) => s >= 7 },
  { id: 'unstoppable', icon: Star, label: 'Unstoppable', desc: 'Reach a 14-day streak', check: (w, s, pr) => s >= 14 },
  { id: 'record_breaker', icon: Zap, label: 'Record Breaker', desc: 'Set your first PR', check: (w, s, pr) => pr >= 1 },
  { id: 'power_surge', icon: Zap, label: 'Power Surge', desc: 'Set 5 personal records', check: (w, s, pr) => pr >= 5 },
  { id: 'daily_grind', icon: Activity, label: 'Daily Grind', desc: 'Complete 7 workouts in a week', check: (w, s, pr) => false },
  { id: 'half_century', icon: Shield, label: 'Half Century', desc: 'Reach Level 50', check: (w, s, pr, lvl) => lvl >= 50 },
  { id: 'ascendant', icon: Crown, label: 'Ascendant', desc: 'Reach Level 41+', check: (w, s, pr, lvl) => lvl >= 41 },
  { id: 'genesis_tier', icon: Star, label: 'Genesis Tier', desc: 'Reach Level 51+', check: (w, s, pr, lvl) => lvl >= 51 },
];

export default function AchievementsGallery({ workoutHistory, currentStreak, personalRecords, level, onBack }) {
  const totalWorkouts = workoutHistory?.length || 0;
  const prCount = personalRecords
    ? Object.values(personalRecords).filter(r => r?.best && Object.values(r.best).some(v => v > 0)).length
    : 0;

  const achievements = useMemo(() => {
    return ACHIEVEMENT_DEFS.map(def => {
      const earned = def.check(totalWorkouts, currentStreak, prCount, level);
      return { ...def, earned };
    });
  }, [totalWorkouts, currentStreak, prCount, level]);

  const earned = achievements.filter(a => a.earned).length;
  const total = achievements.length;
  const progress = total > 0 ? earned / total : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Achievements
        </h2>
        <button onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      </div>

      <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-sl-gray-light">Progress</span>
          <span className="text-[10px] font-bold text-sl-purple-light">{earned} / {total}</span>
        </div>
        <div className="w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-sl-purple to-yellow-400 transition-all duration-1000"
            style={{ width: `${Math.min(progress * 100, 100)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {achievements.map(ach => {
          const Icon = ach.icon;
          return (
            <div key={ach.id}
              className={`rounded-xl p-3 border transition ${
                ach.earned
                  ? 'bg-sl-purple/10 border-sl-purple/20'
                  : 'bg-sl-gray/15 border-sl-purple/10 opacity-60'
              }`}>
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  ach.earned
                    ? 'bg-gradient-to-br from-sl-purple to-sl-red'
                    : 'bg-sl-gray/30'
                }`}>
                  <Icon className={`w-4 h-4 ${ach.earned ? 'text-white' : 'text-sl-gray-light/50'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-[11px] font-bold truncate ${ach.earned ? 'text-white' : 'text-sl-gray-light/60'}`}>
                      {ach.label}
                    </p>
                    {ach.earned ? (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-sl-gray-light/30 shrink-0" />
                    )}
                  </div>
                  <p className={`text-[9px] mt-0.5 ${ach.earned ? 'text-sl-purple-light/70' : 'text-sl-gray-light/40'}`}>
                    {ach.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
