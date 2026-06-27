import { Trophy, ArrowUp } from 'lucide-react';

const PR_XP = { weight: 50, reps: 30, volume: 40 };

export default function PersonalRecords({ prs, exerciseName, compact = false }) {
  if (!prs || prs.length === 0) return null;

  const badges = compact
    ? 'bg-gradient-to-r from-yellow-500/10 to-sl-red/10 border border-yellow-500/30 rounded-xl p-3'
    : 'animate-scale-in bg-gradient-to-r from-yellow-500/10 to-sl-red/10 border border-yellow-500/30 rounded-xl p-4';

  return (
    <div className="space-y-2">
      {prs.map((pr, i) => (
        <div key={i} className={badges} style={!compact ? { animationDelay: `${i * 200}ms` } : undefined}>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs uppercase tracking-widest text-yellow-400 font-bold">NEW PERSONAL RECORD</span>
          </div>
          <p className={`font-bold text-white ${compact ? 'text-sm' : 'text-xl'}`}>{exerciseName}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className={`font-bold text-yellow-300 ${compact ? 'text-base' : 'text-lg'}`}>
              {pr.type === 'weight' ? `${pr.newValue}${pr.unit}` : ''}
              {pr.type === 'reps' ? `${pr.newValue} reps` : ''}
              {pr.type === 'volume' ? `${(pr.newValue / 1000).toFixed(1)}k kg volume` : ''}
            </p>
            {pr.oldValue > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-emerald-400">
                <ArrowUp className="w-3 h-3" />
                {pr.type === 'weight' ? `+${((pr.newValue - pr.oldValue) / pr.oldValue * 100).toFixed(0)}%` : ''}
                {pr.type === 'reps' ? `+${pr.newValue - pr.oldValue}` : ''}
                {pr.type === 'volume' ? `+${(((pr.newValue - pr.oldValue) / pr.oldValue) * 100).toFixed(0)}%` : ''}
              </span>
            )}
          </div>
          {!compact && pr.oldValue > 0 && (
            <p className="text-sm text-sl-gray-light">
              Previous: {pr.type === 'weight' ? `${pr.oldValue}${pr.unit}` : ''}
              {pr.type === 'reps' ? `${pr.oldValue} reps` : ''}
              {pr.type === 'volume' ? `${(pr.oldValue / 1000).toFixed(1)}k kg` : ''}
            </p>
          )}
          <p className="text-xs text-yellow-400 mt-1 font-semibold">+{PR_XP[pr.type] || 25} XP Reward</p>
        </div>
      ))}
    </div>
  );
}
