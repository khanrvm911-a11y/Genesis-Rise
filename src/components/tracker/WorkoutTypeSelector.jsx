import { useLevel } from '../../context/LevelContext';
import { useWorkout } from '../../context/WorkoutContext';
import { usePowerLevel } from '../../context/PowerLevelContext';
import { getWorkoutStats } from '../../utils/workoutUtils';
import TodayMission from './TodayMission';

export default function WorkoutTypeSelector({ onSelect, onViewAnalytics }) {
  const { level, xp, progress, title } = useLevel();
  const { powerLevel, weeklyChange } = usePowerLevel();
  const { workoutHistory, missionProgress } = useWorkout();

  const stats = getWorkoutStats(workoutHistory);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="sl-card text-center">
          <p className="text-xs uppercase tracking-widest text-sl-gray-light mb-1">Level</p>
          <p className="text-4xl font-bold text-sl-purple-light">{level}</p>
        </div>
        <div className="sl-card text-center">
          <p className="text-xs uppercase tracking-widest text-sl-gray-light mb-1">Title</p>
          <p className="text-lg font-bold text-white">{title}</p>
        </div>
        <div className="sl-card text-center">
          <p className="text-xs uppercase tracking-widest text-sl-gray-light mb-1">XP</p>
          <p className="text-xl font-bold text-sl-purple-light">{xp.toLocaleString()}</p>
          <div className="w-full bg-sl-gray/40 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000" style={{ width: `${Math.min(100, progress * 100)}%` }}></div>
          </div>
        </div>
        <div className="sl-card text-center">
          <p className="text-xs uppercase tracking-widest text-sl-gray-light mb-1">Power Level</p>
          <p className="text-2xl font-bold text-sl-red-light">{powerLevel}</p>
          <p className={`text-xs ${weeklyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {weeklyChange >= 0 ? '+' : ''}{weeklyChange} this week
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
          <p className="text-xs text-sl-gray-light">Workouts</p>
          <p className="text-xl font-bold text-white">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
          <p className="text-xs text-sl-gray-light">Volume</p>
          <p className="text-xl font-bold text-white">{(stats.totalVolume / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
          <p className="text-xs text-sl-gray-light">Calories</p>
          <p className="text-xl font-bold text-white">{stats.totalCalories.toLocaleString()}</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
          <p className="text-xs text-sl-gray-light">Streak</p>
          <p className="text-xl font-bold text-white">{stats.currentStreak} days</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
          <p className="text-xs text-sl-gray-light">Training</p>
          <p className="text-xl font-bold text-white">{Math.floor(stats.totalTime / 60)}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => onSelect('prebuilt')} className="sl-card text-center group hover:border-sl-purple/40 transition-all p-8">
          <div className="text-5xl mb-4">🏋️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Prebuilt Workout</h2>
          <p className="text-sl-gray-light text-base">Choose from curated workout plans organized by muscle group. Select your target area and start training.</p>
          <div className="mt-4 holo-button holo-button-primary inline-block">
            Select
          </div>
        </button>

        <button onClick={() => onSelect('custom')} className="sl-card text-center group hover:border-sl-purple/40 transition-all p-8">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-white mb-2">Custom Workout</h2>
          <p className="text-sl-gray-light text-base">Build your own workout from scratch. Name it, pick exercises, set targets, and save as a template.</p>
          <div className="mt-4 holo-button holo-button-primary inline-block">
            Create
          </div>
        </button>
      </div>

      <TodayMission missionProgress={missionProgress} />

      <div className="text-center">
        <button onClick={onViewAnalytics} className="holo-button">
          View Analytics Dashboard
        </button>
      </div>
    </div>
  );
}
