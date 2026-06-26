import { useWorkout } from '../context/WorkoutContext';
import { useLevel } from '../context/LevelContext';
import { Dumbbell, Clock, Zap, Flame, BarChart3, TrendingUp, Calendar } from 'lucide-react';

const Analysis = () => {
  const { workoutHistory } = useWorkout();
  const { xp } = useLevel();

  const totalWorkouts = workoutHistory.length;
  const totalDuration = workoutHistory.reduce((s, w) => s + (w.duration || 0), 0);
  const totalCalories = workoutHistory.reduce((s, w) => s + (w.totalCalories || 0), 0);
  const totalVolume = workoutHistory.reduce((s, w) => s + (w.totalVolume || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  const recentWorkouts = workoutHistory.slice(0, 50);

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold gradient-text">Performance Analysis</h1>
          <p className="text-xs text-sl-gray-light mt-0.5">Review your training history and progress</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="mobile-card p-3 text-center">
            <BarChart3 className="w-5 h-5 text-sl-purple-light mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalWorkouts}</p>
            <p className="text-[9px] text-sl-gray-light font-semibold uppercase tracking-wider">Total Workouts</p>
          </div>
          <div className="mobile-card p-3 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{avgDuration}m</p>
            <p className="text-[9px] text-sl-gray-light font-semibold uppercase tracking-wider">Avg Duration</p>
          </div>
          <div className="mobile-card p-3 text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{totalCalories.toLocaleString()}</p>
            <p className="text-[9px] text-sl-gray-light font-semibold uppercase tracking-wider">Total Calories</p>
          </div>
          <div className="mobile-card p-3 text-center">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{xp.toLocaleString()} XP</p>
            <p className="text-[9px] text-sl-gray-light font-semibold uppercase tracking-wider">Total XP</p>
          </div>
        </div>

        <div className="mobile-card p-4">
          <h2 className="text-base font-bold text-sl-purple-light mb-3 flex items-center gap-2 border-b border-sl-purple/15 pb-2">
            <Calendar className="w-4 h-4" />
            Workout History
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {recentWorkouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Dumbbell className="w-10 h-10 text-sl-purple-light/20 mb-3" />
                <p className="text-sm text-sl-gray-light/50">No workouts logged yet.</p>
                <p className="text-[10px] text-sl-gray-light/30 mt-1">Complete a workout to see your data here.</p>
              </div>
            ) : (
              recentWorkouts.map((w, i) => {
                const ts = new Date(w.timestamp || w.date);
                const dateStr = ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={w.id || i} className="p-3 bg-sl-gray/20 rounded-xl border border-sl-purple/10 hover:bg-sl-gray/30 transition">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-sm font-bold text-white truncate mr-2">{w.name || 'Workout'}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">+{w.xpGained || 0} XP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-sl-gray-light font-semibold mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeStr}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-sl-purple/10 border border-sl-purple/20 px-2 py-0.5 rounded-full text-[9px] text-sl-purple-light font-semibold">
                        {w.duration || 0}m
                      </span>
                      <span className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full text-[9px] text-orange-400 font-semibold">
                        {(w.totalCalories || 0).toLocaleString()} cal
                      </span>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] text-emerald-400 font-semibold">
                        {(w.exercisesCount || w.exercises?.length || 0)} exercises
                      </span>
                      {w.totalVolume > 0 && (
                        <span className="bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full text-[9px] text-blue-400 font-semibold">
                          {(w.totalVolume / 1000).toFixed(1)}k vol
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
