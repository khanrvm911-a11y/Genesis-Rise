export default function TodayMission({ missionProgress }) {
  if (!missionProgress) return null;

  const { daily, streak } = missionProgress;

  const missions = [
    { key: 'workoutCompleted', label: 'Complete Workout', icon: '💪', target: 1, current: daily?.workoutCompleted ? 1 : 0 },
    { key: 'waterIntake', label: 'Drink 3L Water', icon: '💧', target: 3, current: daily?.waterIntake || 0 },
    { key: 'steps', label: 'Walk 8000 Steps', icon: '🚶', target: 8000, current: daily?.steps || 0 },
    { key: 'proteinGoalMet', label: 'Hit Protein Goal', icon: '🥩', target: 1, current: daily?.proteinGoalMet ? 1 : 0 },
  ];

  return (
    <div className="sl-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Daily Missions</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-sl-gray-light">Streak</span>
          <span className="text-lg font-bold text-yellow-400">🔥 {streak || 0}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {missions.map(mission => {
          const completed = mission.current >= mission.target;
          const pct = Math.min(100, (mission.current / mission.target) * 100);
          return (
            <div
              key={mission.key}
              className={`rounded-xl p-3 transition-all ${
                completed
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-sl-gray/20 border border-sl-gray/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{mission.icon}</span>
                <span className={`text-xs font-semibold ${completed ? 'text-green-400' : 'text-sl-gray-light'}`}>
                  {completed ? 'DONE' : `${mission.current}/${mission.target}`}
                </span>
              </div>
              <p className="text-sm text-white">{mission.label}</p>
              <div className="w-full bg-sl-gray/40 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completed ? 'bg-green-500' : 'bg-sl-purple'
                  }`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
