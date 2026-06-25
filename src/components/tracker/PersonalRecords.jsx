export default function PersonalRecords({ prs, exerciseName }) {
  if (!prs || prs.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      {prs.map((pr, i) => (
        <div
          key={i}
          className="animate-scale-in bg-gradient-to-r from-yellow-500/10 to-sl-red/10 border border-yellow-500/30 rounded-xl p-4"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏆</span>
            <span className="text-xs uppercase tracking-widest text-yellow-400 font-bold">NEW PERSONAL RECORD</span>
          </div>
          <p className="text-xl font-bold text-white">{exerciseName}</p>
          <p className="text-lg text-yellow-300">
            {pr.type === 'weight' ? `${pr.newValue}${pr.unit} × ${pr.type === 'volume' ? '' : ''}` : ''}
            {pr.type === 'weight' ? `${pr.unit}` : ''}
            {pr.type === 'reps' ? `${pr.newValue} reps` : ''}
            {pr.type === 'volume' ? `${(pr.newValue / 1000).toFixed(1)}k kg volume` : ''}
          </p>
          {pr.oldValue > 0 && (
            <p className="text-sm text-sl-gray-light">
              Previous: {pr.type === 'weight' ? `${pr.oldValue}${pr.unit}` : ''}
              {pr.type === 'reps' ? `${pr.oldValue} reps` : ''}
              {pr.type === 'volume' ? `${(pr.oldValue / 1000).toFixed(1)}k kg` : ''}
            </p>
          )}
          <p className="text-xs text-yellow-400 mt-1">+50 XP Reward</p>
        </div>
      ))}
    </div>
  );
}
