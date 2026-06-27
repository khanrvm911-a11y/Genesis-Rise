import { useMemo } from 'react';
import {
  Target, Flame, TrendingUp, Zap, Dumbbell,
  Calendar, Award, ChevronRight, Sparkles,
  BrainCircuit,
} from 'lucide-react';
import { generateDailyCoaching, generateRecommendations, getWeekRange } from '../../utils/coachUtils';

const GOAL_THEMES = {
  build_muscle: { label: 'Build Muscle', gradient: 'from-red-500/20 to-orange-500/10', accent: 'text-red-400' },
  lose_fat: { label: 'Lose Fat', gradient: 'from-green-500/20 to-emerald-500/10', accent: 'text-green-400' },
  improve_fitness: { label: 'Improve Fitness', gradient: 'from-blue-500/20 to-cyan-500/10', accent: 'text-blue-400' },
  increase_strength: { label: 'Increase Strength', gradient: 'from-purple-500/20 to-pink-500/10', accent: 'text-purple-400' },
  maintain_health: { label: 'Maintain Health', gradient: 'from-yellow-500/20 to-amber-500/10', accent: 'text-yellow-400' },
};

export default function CoachDashboard({
  ctx, onStartChat, onViewWeeklyReview, onViewRecommendations,
}) {
  const coaching = useMemo(() => generateDailyCoaching(ctx), [ctx]);
  const recommendations = useMemo(() => generateRecommendations(ctx), [ctx]);

  if (!ctx.hasData) return null;

  const goalTheme = GOAL_THEMES[ctx.goal] || GOAL_THEMES.build_muscle;
  const { start, end } = getWeekRange();
  const weekLabel = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const topRec = recommendations[0] || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-sl-purple-light" />
          AI Coach
        </h2>
        <span className="text-[10px] font-semibold text-sl-purple-light/50 uppercase tracking-wider">
          {weekLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3 border border-sl-purple/15 bg-gradient-to-br ${goalTheme.gradient}`}>
          <div className="flex items-center gap-1.5 mb-2">
            <Target className={`w-3.5 h-3.5 ${goalTheme.accent}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light">
              Today's Focus
            </span>
          </div>
          <p className="text-sm font-bold text-white leading-tight">
            {ctx.todayWorkout
              ? ctx.todayWorkout.name || 'Completed Workout'
              : ctx.goalLabel
              ? `${ctx.goalLabel} - ${todayName}`
              : 'Ready to Train'}
          </p>
          {!ctx.todayWorkout && (
            <p className="text-[10px] text-sl-purple-light/60 mt-1">
              {ctx.lastWorkout ? 'Next session waiting' : 'Start your journey'}
            </p>
          )}
        </div>

        <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-3.5 h-3.5 text-sl-purple-light" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light">
              Current Goal
            </span>
          </div>
          <p className="text-sm font-bold text-white">{ctx.goalLabel || 'Not Set'}</p>
          <p className="text-[10px] text-sl-purple-light/60 mt-1 capitalize">
            {ctx.experienceLabel || 'Beginner'} &middot; Level {ctx.level}
          </p>
        </div>

        <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light">
              Workout Progress
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{ctx.totalWorkouts}</span>
            <span className="text-[10px] text-sl-gray-light">total workouts</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3 text-sl-purple-light/60" />
            <span className="text-[10px] text-sl-purple-light/60">
              {ctx.thisWeekCount} this week
            </span>
          </div>
        </div>

        <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light">
              Weekly Consistency
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{ctx.streak}</span>
            <span className="text-[10px] text-sl-gray-light">day streak</span>
          </div>
          {ctx.streak >= 3 && (
            <div className="flex items-center gap-1 mt-1">
              <Award className="w-3 h-3 text-yellow-400" />
              <span className="text-[10px] text-yellow-400 font-semibold">On Fire!</span>
            </div>
          )}
        </div>
      </div>

      {coaching && (
        <div className="rounded-xl p-4 border border-sl-purple/15 bg-gradient-to-r from-sl-purple/10 to-transparent">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sl-purple/20 border border-sl-purple/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-sl-purple-light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sl-purple-light mb-1">Daily Coaching</p>
              <p className="text-sm text-white leading-relaxed">{coaching}</p>
            </div>
          </div>
        </div>
      )}

      {topRec && (
        <button onClick={onViewRecommendations}
          className="w-full rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20 flex items-center justify-between hover:bg-sl-gray/30 transition text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{topRec.title}</p>
              <p className="text-[10px] text-sl-purple-light/60 mt-0.5 line-clamp-1">{topRec.description}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-sl-purple-light/40" />
        </button>
      )}

      <div className="flex gap-2">
        <button onClick={onStartChat}
          className="flex-1 h-10 rounded-xl bg-sl-purple/20 border border-sl-purple/30 text-xs font-bold text-sl-purple-light hover:bg-sl-purple/30 transition flex items-center justify-center gap-2">
          <BrainCircuit className="w-4 h-4" />
          Chat with Coach
        </button>
        <button onClick={onViewWeeklyReview}
          className="flex-1 h-10 rounded-xl bg-sl-gray/20 border border-sl-purple/15 text-xs font-bold text-white hover:bg-sl-gray/30 transition flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          Weekly Review
        </button>
      </div>
    </div>
  );
}
