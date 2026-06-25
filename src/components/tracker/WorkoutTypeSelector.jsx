import { useLevel } from '../../context/LevelContext';
import { useWorkout } from '../../context/WorkoutContext';
import { usePowerLevel } from '../../context/PowerLevelContext';
import { getWorkoutStats } from '../../utils/workoutUtils';
import TodayMission from './TodayMission';
import { BarChart3, Dumbbell, Zap } from 'lucide-react';

export default function WorkoutTypeSelector({ onSelect, onViewAnalytics }) {
  const { level, xp, progress, title } = useLevel();
  const { powerLevel, weeklyChange } = usePowerLevel();
  const { workoutHistory, missionProgress } = useWorkout();

  const stats = getWorkoutStats(workoutHistory);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="mobile-card text-center p-3">
          <p className="text-[10px] uppercase tracking-widest text-sl-gray-light mb-0.5 font-semibold">Level</p>
          <p className="text-2xl font-bold text-sl-purple-light">{level}</p>
        </div>
        <div className="mobile-card text-center p-3">
          <p className="text-[10px] uppercase tracking-widest text-sl-gray-light mb-0.5 font-semibold">Title</p>
          <p className="text-sm font-bold text-white truncate">{title}</p>
        </div>
        <div className="mobile-card text-center p-3">
          <p className="text-[10px] uppercase tracking-widest text-sl-gray-light mb-0.5 font-semibold">XP</p>
          <p className="text-lg font-bold text-sl-purple-light">{xp.toLocaleString()}</p>
          <div className="w-full bg-sl-gray/40 rounded-full h-1 mt-1 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000" style={{ width: `${Math.min(100, progress * 100)}%` }}></div>
          </div>
        </div>
        <div className="mobile-card text-center p-3">
          <p className="text-[10px] uppercase tracking-widest text-sl-gray-light mb-0.5 font-semibold">Power</p>
          <p className="text-lg font-bold text-sl-red-light">{powerLevel}</p>
          <p className={`text-[10px] ${weeklyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {weeklyChange >= 0 ? '+' : ''}{weeklyChange}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <div className="bg-sl-gray/20 rounded-xl p-2 text-center">
          <p className="text-[9px] text-sl-gray-light font-semibold">Workouts</p>
          <p className="text-base font-bold text-white">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-2 text-center">
          <p className="text-[9px] text-sl-gray-light font-semibold">Volume</p>
          <p className="text-base font-bold text-white">{(stats.totalVolume / 1000).toFixed(1)}k</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-2 text-center">
          <p className="text-[9px] text-sl-gray-light font-semibold">Calories</p>
          <p className="text-base font-bold text-white">{stats.totalCalories.toLocaleString()}</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-2 text-center">
          <p className="text-[9px] text-sl-gray-light font-semibold">Streak</p>
          <p className="text-base font-bold text-white">{stats.currentStreak}d</p>
        </div>
        <div className="bg-sl-gray/20 rounded-xl p-2 text-center">
          <p className="text-[9px] text-sl-gray-light font-semibold">Time</p>
          <p className="text-base font-bold text-white">{Math.floor(stats.totalTime / 60)}h</p>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={() => onSelect('prebuilt')} className="mobile-card w-full text-left group hover:border-sl-purple/40 active:scale-[0.98] transition-all p-5 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-sl-purple/20 rounded-2xl flex items-center justify-center shrink-0">
              <Dumbbell className="w-7 h-7 text-sl-purple-light" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white mb-1">Prebuilt Workout</h2>
              <p className="text-sm text-sl-gray-light">Curated plans by muscle group</p>
            </div>
            <div className="holo-button holo-button-primary text-sm px-5 py-2 shrink-0">
              Select
            </div>
          </div>
        </button>

        <button onClick={() => onSelect('custom')} className="mobile-card w-full text-left group hover:border-sl-purple/40 active:scale-[0.98] transition-all p-5 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-sl-purple/20 rounded-2xl flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-sl-purple-light" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white mb-1">Custom Workout</h2>
              <p className="text-sm text-sl-gray-light">Build your own from scratch</p>
            </div>
            <div className="holo-button holo-button-primary text-sm px-5 py-2 shrink-0">
              Create
            </div>
          </div>
        </button>
      </div>

      <TodayMission missionProgress={missionProgress} />

      <button onClick={onViewAnalytics} className="holo-button w-full text-center py-3">
        <BarChart3 className="w-4 h-4 inline mr-2" />
        View Analytics Dashboard
      </button>
    </div>
  );
}
