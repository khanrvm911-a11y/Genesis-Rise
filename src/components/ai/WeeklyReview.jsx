import { useMemo } from 'react';
import {
  Calendar, Trophy, Flame, Timer, Zap, Award,
  TrendingUp, Activity, Sparkles, ChevronRight,
  Dumbbell, Heart,
} from 'lucide-react';
import { generateWeeklyReview } from '../../utils/coachUtils';

export default function WeeklyReview({ ctx, onBack }) {
  const review = useMemo(() => generateWeeklyReview(ctx), [ctx]);

  if (!ctx.hasData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sl-purple-light" />
            Weekly Review
          </h2>
          <button onClick={onBack}
            className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition">
            Back
          </button>
        </div>
        <div className="rounded-xl p-6 border border-sl-purple/15 bg-sl-gray/20 text-center">
          <Activity className="w-10 h-10 text-sl-purple-light/30 mx-auto mb-3" />
          <p className="text-sm text-white font-semibold">No Data Yet</p>
          <p className="text-xs text-sl-purple-light/60 mt-1">Complete your first workout to unlock your weekly review.</p>
        </div>
      </div>
    );
  }

  const formatTime = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sl-purple-light" />
          Weekly Review
        </h2>
        <button onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition">
          Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-sl-purple-light" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-sl-gray-light">Workouts</span>
          </div>
          <span className="text-xl font-bold text-white">{review.completedCount}</span>
        </div>

        <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-sl-gray-light">XP Earned</span>
          </div>
          <span className="text-xl font-bold text-white">+{review.totalXP}</span>
        </div>

        <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-sl-gray-light">Calories</span>
          </div>
          <span className="text-xl font-bold text-white">{review.totalCal}</span>
        </div>

        <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-sl-gray-light">Duration</span>
          </div>
          <span className="text-xl font-bold text-white">{formatTime(review.totalDuration)}</span>
        </div>
      </div>

      <div className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-sl-gray-light">Streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white">{review.streak} days</span>
          <span className="text-[10px] text-sl-purple-light/60">current streak</span>
        </div>
        {review.weekDays.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
              <span key={d}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  review.weekDays.includes(d)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-sl-gray/30 text-sl-purple-light/30 border border-sl-purple/10'
                }`}>
                {d.slice(0, 3)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl p-4 border border-sl-purple/15 bg-gradient-to-br from-sl-purple/10 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-sl-purple-light" />
          <span className="text-xs font-bold text-sl-purple-light">Areas to Improve</span>
        </div>
        <ul className="space-y-1.5">
          {review.areas.map((area, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-white">
              <ChevronRight className="w-3 h-3 text-sl-purple-light/60 mt-0.5 shrink-0" />
              {area}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl p-4 border border-sl-purple/15 bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white leading-relaxed">{review.encouragement}</p>
        </div>
      </div>
    </div>
  );
}
