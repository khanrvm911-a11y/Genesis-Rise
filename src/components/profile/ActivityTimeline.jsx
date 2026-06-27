import { useMemo } from 'react';
import {
  Clock, ArrowLeft, Dumbbell, Zap, Star,
  Trophy, Activity,
} from 'lucide-react';

export default function ActivityTimeline({ workoutHistory, personalRecords, level, onBack }) {
  const events = useMemo(() => {
    const items = [];

    (workoutHistory || []).forEach(w => {
      const date = w.date || w.timestamp?.split('T')[0] || '';
      items.push({
        date,
        timestamp: new Date(w.timestamp || w.date).getTime(),
        type: 'workout',
        icon: Dumbbell,
        title: w.name || 'Workout Completed',
        detail: `${w.duration || 0} min · ${w.totalCalories || 0} cal · ${w.xpGained || 0} XP`,
      });
    });

    if (personalRecords) {
      Object.entries(personalRecords).forEach(([id, rec]) => {
        if (rec?.history) {
          rec.history.slice(-3).forEach(h => {
            if (h.date) {
              items.push({
                date: h.date,
                timestamp: new Date(h.date).getTime(),
                type: 'pr',
                icon: Zap,
                title: 'Personal Record',
                detail: `${h.weight ? h.weight + 'kg ' : ''}${h.volume ? h.volume + ' vol' : ''}`,
              });
            }
          });
        }
      });
    }

    items.sort((a, b) => b.timestamp - a.timestamp);

    return items.slice(0, 50);
  }, [workoutHistory, personalRecords]);

  const grouped = useMemo(() => {
    const groups = {};
    events.forEach(ev => {
      if (!groups[ev.date]) groups[ev.date] = [];
      groups[ev.date].push(ev);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [events]);

  if (!workoutHistory || workoutHistory.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-sl-purple-light" />
            Activity Timeline
          </h2>
          <button onClick={onBack} className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>
        <div className="rounded-xl p-6 border border-sl-purple/15 bg-sl-gray/20 text-center">
          <Activity className="w-10 h-10 text-sl-purple-light/30 mx-auto mb-3" />
          <p className="text-sm text-white font-semibold">No Activity Yet</p>
          <p className="text-xs text-sl-purple-light/60 mt-1">Complete your first workout to start building your timeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-sl-purple-light" />
          Activity Timeline
        </h2>
        <button onClick={onBack} className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
      </div>

      <div className="relative pl-5 space-y-0">
        <div className="absolute left-2 top-1 bottom-1 w-px bg-sl-purple/15" />

        {grouped.map(([date, dayEvents]) => (
          <div key={date} className="relative pb-4">
            <div className="absolute -left-[13px] top-0.5 w-2.5 h-2.5 rounded-full bg-sl-purple/30 border-2 border-sl-purple/15" />
            <p className="text-[10px] font-bold text-sl-purple-light/60 uppercase tracking-wider mb-2 ml-1">
              {formatDateLabel(date)}
            </p>
            <div className="space-y-1.5 ml-1">
              {dayEvents.map((ev, i) => {
                const Icon = ev.icon;
                return (
                  <div key={i} className="rounded-lg p-2.5 border border-sl-purple/10 bg-sl-gray/15 flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      ev.type === 'pr' ? 'bg-yellow-500/15 border border-yellow-500/20' : 'bg-sl-purple/15 border border-sl-purple/20'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${ev.type === 'pr' ? 'text-yellow-400' : 'text-sl-purple-light'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{ev.title}</p>
                      <p className="text-[10px] text-sl-purple-light/60 truncate">{ev.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDateLabel(iso) {
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().split('T')[0];

  if (iso === today) return 'Today';
  if (iso === yKey) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}
