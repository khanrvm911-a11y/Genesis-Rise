import { useEffect, useState } from 'react';
import { Timer, Dumbbell, BarChart3, Flame, Zap, Hash, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import PersonalRecords from './PersonalRecords';

export default function WorkoutCompleteScreen({
  data,
  onNewWorkout,
  onViewAnalytics,
  onReturnToPlanner,
  level,
  xp,
  progress,
  title,
}) {
  const [show, setShow] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [showPRs, setShowPRs] = useState(false);

  useEffect(() => {
    setShow(true);
    setTimeout(() => setAnimateStats(true), 400);
    setTimeout(() => setShowPRs(true), 800);

    const duration = 3500;
    const end = Date.now() + duration;
    const colors = ['#8b5cf6', '#ef4444', '#c084fc', '#f87171', '#fbbf24'];

    (function frame() {
      if (Date.now() > end) return;
      const p = document.createElement('div');
      p.style.cssText = `
        position: fixed; width: ${4 + Math.random() * 4}px; height: ${4 + Math.random() * 4}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: -10px;
        pointer-events: none;
        z-index: 9999;
        animation: confetti-fall ${1.5 + Math.random() * 2}s linear forwards;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4000);
      requestAnimationFrame(frame);
    })();

    return () => {
      document.querySelectorAll('[style*="confetti-fall"]').forEach(p => p.remove());
    };
  }, []);

  const stats = [
    { label: 'Duration', value: `${data.duration} min`, icon: Timer, color: 'text-sl-purple-light' },
    { label: 'Exercises', value: `${data.exercisesCompleted}`, icon: Dumbbell, color: 'text-emerald-400' },
    { label: 'Volume', value: `${(data.totalVolume / 1000).toFixed(1)}k kg`, icon: BarChart3, color: 'text-blue-400' },
    { label: 'Calories', value: `${data.totalCalories}`, icon: Flame, color: 'text-sl-red-light' },
    { label: 'XP Earned', value: `+${data.xpGained}`, icon: Zap, color: 'text-yellow-400' },
    { label: 'Sets', value: `${data.totalSets}`, icon: Hash, color: 'text-sl-red-light' },
  ];

  return (
    <div className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="mobile-card text-center mb-4 border-sl-red/30 p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-sl-red/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400/20 to-sl-red/20 border border-yellow-400/30 flex items-center justify-center animate-scale-in">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-1 animate-slide-up">MISSION COMPLETE</h1>
          <p className="text-sm text-sl-gray-light mb-5">Outstanding performance!</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {stats.map((item, i) => {
              const Icon = item.icon;
              const delay = animateStats ? `${i * 80 + 300}ms` : '9999ms';
              return (
                <div key={item.label}
                  className="bg-sl-gray/15 rounded-xl p-2.5 transition-all duration-500"
                  style={{
                    opacity: animateStats ? 1 : 0,
                    transform: animateStats ? 'translateY(0)' : 'translateY(12px)',
                    transitionDelay: delay,
                  }}
                >
                  <Icon className={`w-4 h-4 mx-auto mb-0.5 ${item.color}`} />
                  <p className="text-[9px] text-sl-gray-light uppercase tracking-wider font-semibold truncate">{item.label}</p>
                  <p className="text-sm font-bold text-white">{item.value}</p>
                </div>
              );
            })}
          </div>

          {showPRs && data.newPRs && data.newPRs.length > 0 && (
            <div className="mb-2">
              {data.newPRs.map((pr, i) => (
                <div key={i}
                  className="animate-scale-in bg-gradient-to-r from-yellow-500/10 to-sl-red/10 border border-yellow-500/30 rounded-xl p-3 mb-2"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-[10px] uppercase tracking-widest text-yellow-400 font-bold">NEW PERSONAL RECORD</span>
                  </div>
                  <p className="text-sm font-bold text-white">{pr.exercise}</p>
                  <p className="text-sm text-yellow-300">
                    {pr.type === 'weight' ? `${pr.newValue}${pr.unit}` : ''}
                    {pr.type === 'reps' ? `${pr.newValue} reps` : ''}
                    {pr.type === 'volume' ? `${(pr.newValue / 1000).toFixed(1)}k kg volume` : ''}
                    <span className="text-yellow-400 ml-2 text-[10px] font-semibold">+{pr.type === 'reps' ? 30 : 50} XP</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mobile-card mb-4">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Level Progress
        </h2>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-sl-gray-light font-semibold">Level {level}</span>
          <span className="text-xs text-sl-purple-light font-semibold">{title}</span>
          <span className="text-xs text-sl-gray-light">{xp} XP</span>
        </div>
        <div className="w-full bg-sl-gray/40 rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red animate-xp-fill rounded-full relative"
               style={{ width: `${Math.min(100, progress * 100)}%` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-sl-gray-light">Next: {data.xpForNext} XP</span>
          <span className="text-[10px] text-sl-purple-light font-semibold">{Math.floor(progress * 100)}%</span>
        </div>
      </div>

      {data.calorieBreakdown && data.calorieBreakdown.length > 0 && (
        <div className="mobile-card mb-4">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-sl-red-light" />
            Calorie Burn
          </h2>
          <div className="space-y-1.5">
            {data.calorieBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-sl-gray/15 rounded-lg p-2.5">
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-sl-red-light font-bold text-sm">{item.calories} cal</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-t border-sl-purple/20 pt-2 mt-1.5">
              <span className="text-white font-bold text-sm">Total</span>
              <span className="text-sl-red-light font-bold text-base">{data.totalCalories} cal</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <button onClick={onReturnToPlanner} className="holo-button flex-1 text-center text-sm py-4">
            Planner
          </button>
          <button onClick={onNewWorkout} className="holo-button holo-button-primary flex-1 text-center text-sm py-4">
            New Workout
          </button>
          <button onClick={onViewAnalytics} className="holo-button flex-1 text-center text-sm py-4">
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
