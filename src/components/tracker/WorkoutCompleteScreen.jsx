import { Timer, Dumbbell, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function WorkoutCompleteScreen({
  data,
  onNewWorkout,
  onViewAnalytics,
  onReturnToPlanner,
}) {
  const completedAt = data.completedAt
    ? new Date(data.completedAt).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
    : new Date().toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      });

  return (
    <div>
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <h1 className="text-lg font-bold text-white">Today's Workout is Completed</h1>
        <p className="text-xs text-sl-gray-light mt-0.5">{completedAt}</p>
      </div>

      <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 p-4 mb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">{data.workoutName}</h2>
          <div className="flex items-center gap-1.5 text-sl-purple-light">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{data.duration} min</span>
          </div>
        </div>

        <div className="space-y-2">
          {data.exercises.map((ex, i) => (
            <div key={i} className="rounded-lg bg-sl-gray/25 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">{ex.name}</span>
                {ex.muscleGroup && (
                  <span className="text-[9px] text-sl-purple-light/60 uppercase tracking-wider font-semibold">{ex.muscleGroup}</span>
                )}
              </div>
              {ex.sets.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center text-[9px] text-sl-gray-light uppercase tracking-wider font-semibold pb-1 border-b border-sl-purple/10">
                    <span className="w-16">Set</span>
                    <span className="w-20 text-right">Weight</span>
                    <span className="w-20 text-right">Reps</span>
                    <span className="w-20 text-right">Volume</span>
                  </div>
                  {ex.sets.map((set, j) => (
                    <div key={j} className="flex items-center text-xs text-white">
                      <span className="w-16 text-sl-gray-light">{j + 1}</span>
                      <span className="w-20 text-right font-medium">{set.weight} kg</span>
                      <span className="w-20 text-right font-medium">&times; {set.reps}</span>
                      <span className="w-20 text-right font-semibold text-sl-purple-light">{(set.weight * set.reps / 1000).toFixed(2)}k</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-sl-gray-light/60 italic">No sets recorded</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-sl-purple/10">
          <div className="flex items-center gap-1.5 text-sl-gray-light">
            <Dumbbell className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{data.exercisesCompleted} exercises</span>
          </div>
          <div className="flex items-center gap-1.5 text-sl-gray-light">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{data.totalSets} sets</span>
          </div>
          <div className="text-xs font-semibold text-sl-purple-light">{(data.totalVolume / 1000).toFixed(1)}k kg</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onReturnToPlanner} className="holo-button flex-1 text-center text-xs py-3">
          Planner
        </button>
        <button onClick={onNewWorkout} className="holo-button holo-button-primary flex-1 text-center text-xs py-3">
          New Workout
        </button>
        <button onClick={onViewAnalytics} className="holo-button flex-1 text-center text-xs py-3">
          Analytics
        </button>
      </div>
    </div>
  );
}
