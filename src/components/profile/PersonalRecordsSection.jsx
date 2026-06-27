import { useMemo } from 'react';
import {
  Trophy, ArrowLeft, Clock, Zap, Calendar,
  Dumbbell, TrendingUp, Star, Award,
} from 'lucide-react';

export default function PersonalRecordsSection({ workoutHistory, personalRecords, stats, onBack }) {
  const records = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) return [];

    const result = [];

    let highestWeight = 0;
    let highestWeightName = '';
    let longestDuration = 0;
    let longestDurationName = '';
    let fastestDuration = Infinity;
    let fastestDurationName = '';
    let highestXp = 0;
    let highestXpName = '';

    (workoutHistory || []).forEach(w => {
      const dur = w.duration || 0;
      const xpGained = w.xpGained || 0;

      if (dur > longestDuration) {
        longestDuration = dur;
        longestDurationName = w.name || 'Workout';
      }
      if (dur > 0 && dur < fastestDuration) {
        fastestDuration = dur;
        fastestDurationName = w.name || 'Workout';
      }
      if (xpGained > highestXp) {
        highestXp = xpGained;
        highestXpName = w.name || 'Workout';
      }

      (w.exercises || []).forEach(ex => {
        (ex.sets || []).forEach(set => {
          const wt = parseFloat(set.weight) || 0;
          if (wt > highestWeight) {
            highestWeight = wt;
            highestWeightName = ex.exerciseData?.name || ex.name || ex.exerciseId || 'Exercise';
          }
        });
      });
    });

    result.push({ icon: Dumbbell, label: 'Highest Weight', value: `${highestWeight} kg`, detail: highestWeightName });
    result.push({ icon: Clock, label: 'Longest Workout', value: formatDuration(longestDuration), detail: longestDurationName });
    result.push({ icon: Zap, label: 'Fastest Workout', value: formatDuration(fastestDuration), detail: fastestDurationName });
    result.push({ icon: Trophy, label: 'Highest XP / Day', value: `+${highestXp} XP`, detail: highestXpName });

    const weekCounts = {};
    (workoutHistory || []).forEach(w => {
      const d = new Date(w.date || w.timestamp);
      const weekStart = getWeekStart(d);
      const key = weekStart.toISOString().split('T')[0];
      weekCounts[key] = (weekCounts[key] || 0) + 1;
    });
    const maxWeek = Object.entries(weekCounts).sort(([, a], [, b]) => b - a)[0];
    if (maxWeek) {
      result.push({ icon: Calendar, label: 'Most Workouts/Week', value: `${maxWeek[1]} workouts`, detail: `Week of ${formatDate(maxWeek[0])}` });
    }

    const sorted = [...(workoutHistory || [])].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    if (sorted.length > 0) {
      result.push({ icon: Star, label: 'Newest Record', value: sorted[0].name || 'Workout', detail: formatDate(sorted[0].date || sorted[0].timestamp) });
    }

    if (personalRecords) {
      const prEntries = Object.entries(personalRecords).filter(([, r]) => r?.best && Object.values(r.best).some(v => v > 0));
      const prCount = prEntries.length;
      if (prCount > 0) {
        result.push({ icon: Award, label: 'Personal Records', value: `${prCount} PRs`, detail: `${prCount} exercise${prCount !== 1 ? 's' : ''} with records` });
      }
    }

    return result;
  }, [workoutHistory, personalRecords]);

  if (!workoutHistory || workoutHistory.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Personal Records
          </h2>
          <button onClick={onBack} className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>
        <div className="rounded-xl p-6 border border-sl-purple/15 bg-sl-gray/20 text-center">
          <Trophy className="w-10 h-10 text-sl-purple-light/30 mx-auto mb-3" />
          <p className="text-sm text-white font-semibold">No Records Yet</p>
          <p className="text-xs text-sl-purple-light/60 mt-1">Complete your first workout to start tracking personal records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Personal Records
        </h2>
        <button onClick={onBack} className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {records.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div key={i} className="rounded-xl p-3 border border-sl-purple/15 bg-sl-gray/20">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-sl-gray-light">{rec.label}</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{rec.value}</p>
              <p className="text-[10px] text-sl-purple-light/60 mt-0.5 truncate">{rec.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(mins) {
  if (!mins || mins === Infinity) return '—';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
