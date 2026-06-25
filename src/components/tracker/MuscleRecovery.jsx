import { useMemo } from 'react';
import { calculateRecoveryPercentage } from '../../utils/workoutUtils';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Core', 'Arms'];

export default function MuscleRecovery({ workoutHistory }) {
  const recovery = useMemo(() => {
    const result = {};
    MUSCLE_GROUPS.forEach(g => {
      result[g] = calculateRecoveryPercentage(workoutHistory, g);
    });
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
    <div className="sl-card">
      <h3 className="text-xl font-bold text-white mb-4">Recovery Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MUSCLE_GROUPS.map(group => (
          <div key={group} className="bg-sl-gray/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{group}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                recovery[group] >= 80 ? 'text-green-400 bg-green-500/10' :
                recovery[group] >= 50 ? 'text-yellow-400 bg-yellow-500/10' :
                'text-red-400 bg-red-500/10'
              }`}>
                {getStatus(recovery[group])}
              </span>
            </div>
            <div className="w-full bg-sl-gray/40 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getColor(recovery[group])}`}
                style={{ width: `${recovery[group]}%` }}
              ></div>
            </div>
            <p className="text-right text-xs text-sl-gray-light mt-1">{Math.round(recovery[group])}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
