import { useEffect, useState } from 'react';

export default function WorkoutCompleteScreen({
  data,
  onNewWorkout,
  onViewAnalytics,
  level,
  xp,
  progress,
  title,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#8b5cf6', '#ef4444', '#c084fc', '#f87171'];

    (function frame() {
      if (Date.now() > end) return;
      const particlen = document.createElement('div');
      particlen.style.cssText = `
        position: fixed; width: 6px; height: 6px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}vw;
        top: -10px;
        pointer-events: none;
        z-index: 9999;
        animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
      `;
      document.body.appendChild(particlen);
      setTimeout(() => particlen.remove(), 4000);
      requestAnimationFrame(frame);
    })();

    return () => {
      const particles = document.querySelectorAll('[style*="confetti-fall"]');
      particles.forEach(p => p.remove());
    };
  }, []);

  const items = [
    { label: 'Duration', value: `${data.duration} min`, icon: '⏱️' },
    { label: 'Exercises', value: `${data.exercisesCompleted}`, icon: '🏋️' },
    { label: 'Volume', value: `${(data.totalVolume / 1000).toFixed(1)}k`, icon: '📊' },
    { label: 'Calories', value: `${data.totalCalories}`, icon: '🔥' },
    { label: 'XP Earned', value: `+${data.xpGained}`, icon: '⚡' },
    { label: 'Sets', value: `${data.totalSets}`, icon: '🔢' },
  ];

  return (
    <div className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="mobile-card text-center mb-4 border-sl-red/30 p-6">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-2xl font-bold gradient-text mb-1 animate-slide-up">MISSION COMPLETE</h1>
        <p className="text-sm text-sl-gray-light mb-4">Outstanding performance!</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {items.map((item, i) => (
            <div key={item.label} className="bg-sl-gray/20 rounded-xl p-3 animate-slide-up" style={{ animationDelay: `${i * 80 + 300}ms` }}>
              <span className="text-xl block mb-0.5">{item.icon}</span>
              <p className="text-[9px] text-sl-gray-light uppercase tracking-wider font-semibold">{item.label}</p>
              <p className="text-base font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {data.newPRs && data.newPRs.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">New Personal Records</p>
            {data.newPRs.map((pr, i) => (
              <p key={i} className="text-white text-xs">
                🏆 {pr.exercise}: {pr.newValue}{pr.unit} (prev: {pr.oldValue}{pr.unit})
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="mobile-card mb-4">
        <h2 className="text-lg font-bold text-white mb-3">Level Progress</h2>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-sl-gray-light font-semibold">Level {level}</span>
          <span className="text-xs text-sl-purple-light font-semibold">{title}</span>
          <span className="text-xs text-sl-gray-light">{xp} XP</span>
        </div>
        <div className="w-full bg-sl-gray/40 rounded-full h-2.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red animate-xp-fill rounded-full"
               style={{ width: `${Math.min(100, progress * 100)}%` }}></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-sl-gray-light">Next: {data.xpForNext} XP</span>
          <span className="text-[10px] text-sl-purple-light font-semibold">{Math.floor(progress * 100)}%</span>
        </div>
      </div>

      <div className="mobile-card mb-4">
        <h2 className="text-lg font-bold text-white mb-3">Calorie Burn</h2>
        {data.calorieBreakdown && data.calorieBreakdown.length > 0 ? (
          <div className="space-y-1.5">
            {data.calorieBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-sl-gray/20 rounded-lg p-2.5">
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-sl-red-light font-bold text-sm">{item.calories} cal</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-t border-sl-purple/20 pt-2 mt-1.5">
              <span className="text-white font-bold text-sm">Total</span>
              <span className="text-sl-red-light font-bold text-base">{data.totalCalories} cal</span>
            </div>
          </div>
        ) : (
          <p className="text-sl-gray-light text-sm">Total calories burned: {data.totalCalories} cal</p>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onNewWorkout} className="holo-button holo-button-primary flex-1 text-center text-sm py-4">
          New Workout
        </button>
        <button onClick={onViewAnalytics} className="holo-button flex-1 text-center text-sm py-4">
          Analytics
        </button>
      </div>
    </div>
  );
}
