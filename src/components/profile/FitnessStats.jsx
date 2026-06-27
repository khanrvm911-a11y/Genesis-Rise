import { useMemo } from 'react';
import {
  Dumbbell, Clock, Flame, Trophy, Award, Zap,
  TrendingUp, Target, Calendar, Star,
} from 'lucide-react';

export default function FitnessStats({
  stats, level, xp, title, currentStreak, longestStreak, activePlan,
}) {
  const cards = useMemo(() => [
    {
      icon: Dumbbell, label: 'Total Workouts', value: stats.totalWorkouts || 0,
      color: 'text-sl-purple-light', bg: 'bg-sl-purple/10', border: 'border-sl-purple/20',
    },
    {
      icon: Clock, label: 'Total Hours', value: formatHours(stats.totalTime || 0),
      color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    },
    {
      icon: Flame, label: 'Calories Burned', value: (stats.totalCalories || 0).toLocaleString(),
      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20',
    },
    {
      icon: Trophy, label: 'Total XP', value: xp.toLocaleString(),
      color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20',
    },
    {
      icon: Zap, label: 'Current Streak', value: `${currentStreak} days`,
      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    },
    {
      icon: Star, label: 'Longest Streak', value: `${longestStreak} days`,
      color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    },
  ], [stats, xp, currentStreak, longestStreak]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sl-purple-light" />
          Fitness Statistics
        </h2>
        {activePlan && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sl-purple/10 border border-sl-purple/20">
            <Target className="w-3 h-3 text-sl-purple-light" />
            <span className="text-[9px] font-semibold text-sl-purple-light truncate max-w-[80px]">{activePlan.name}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`rounded-xl p-3 border ${card.border} ${card.bg}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                <span className="text-[9px] font-bold uppercase tracking-wider text-sl-gray-light">{card.label}</span>
              </div>
              <p className="text-lg font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {(stats.totalWorkouts || 0) > 0 && (
        <div className="rounded-xl p-3 border border-sl-purple/15 bg-gradient-to-r from-sl-purple/10 to-transparent">
          <p className="text-xs text-white leading-relaxed">
            You've completed <strong className="text-sl-purple-light">{stats.totalWorkouts}</strong> workout{stats.totalWorkouts !== 1 ? 's' : ''},
            maintained a <strong className="text-emerald-400">{currentStreak}-day</strong> streak,
            earned <strong className="text-yellow-400">{xp.toLocaleString()} XP</strong>,
            and reached <strong className="text-sl-purple-light">{title}</strong> (Level {level}).
          </p>
        </div>
      )}
    </div>
  );
}

function formatHours(mins) {
  if (!mins) return '0h';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
