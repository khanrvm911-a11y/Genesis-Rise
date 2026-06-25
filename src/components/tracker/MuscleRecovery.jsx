import { useMemo } from 'react';
import { calculateRecoveryPercentage } from '../../utils/workoutUtils';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Core', 'Arms'];

export default function MuscleRecovery({ workoutHistory }) {
  const recovery = useMemo(() => {
    const result = {};
    MUSCLE_GROUPS.forEach(g => { result[g] = calculateRecoveryPercentage(workoutHistory, g); });
    return result;
  }, [workoutHistory]);

  const getColor = (pct) => {
    if (pct >= 80) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatus = (pct) => {
    if (pct >= 80) return 'Ready';
    if (pct >= 50) return 'Moderate';
    return 'Fatigued';
  };

  return (
    <div className="mobile-card">
      <h3 className="text-base font-bold text-white mb-3">Recovery</h3>
      <div className="grid grid-cols-2 gap-2">
        {MUSCLE_GROUPS.map(group => (
          <div key={group} className="bg-sl-gray/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white text-xs">{group}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                recovery[group] >= 80 ? 'text-green-400 bg-green-500/10' :
                recovery[group] >= 50 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'
              }`}>
                {getStatus(recovery[group])}
              </span>
            </div>
            <div className="w-full bg-sl-gray/40 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${getColor(recovery[group])}`}
                   style={{ width: `${recovery[group]}%` }}></div>
            </div>
            <p className="text-right text-[10px] text-sl-gray-light mt-0.5">{Math.round(recovery[group])}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
