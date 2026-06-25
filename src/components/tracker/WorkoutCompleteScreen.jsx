import { useEffect, useState, useRef } from 'react';
import { getLevelTitle } from '../../utils/workoutUtils';

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
  const [animCount, setAnimCount] = useState(0);

  useEffect(() => {
    setShow(true);
    const interval = setInterval(() => {
      setAnimCount(prev => Math.min(prev + 1, 8));
    }, 200);
    setTimeout(() => clearInterval(interval), 2000);

    try {
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#8b5cf6', '#ef4444', '#c084fc', '#f87171'];

      (function frame() {
        if (Date.now() > end) return;
        const particlen = document.createElement('div');
        particlen.style.cssText = `
          position: fixed; width: 8px; height: 8px;
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
    } catch (e) {}

    return () => {
      const particles = document.querySelectorAll('[style*="confetti-fall"]');
      particles.forEach(p => p.remove());
    };
  }, []);

  const items = [
    { label: 'Duration', value: `${data.duration} min`, icon: '⏱️' },
    { label: 'Exercises', value: `${data.exercisesCompleted}`, icon: '🏋️' },
    { label: 'Volume', value: `${(data.totalVolume / 1000).toFixed(1)}k kg`, icon: '📊' },
    { label: 'Calories', value: `${data.totalCalories}`, icon: '🔥' },
    { label: 'XP Earned', value: `+${data.xpGained}`, icon: '⚡' },
    { label: 'Sets Completed', value: `${data.totalSets}`, icon: '🔢' },
  ];

  return (
    <div className={`transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="sl-card text-center mb-6 border-sl-red/30">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold gradient-text mb-2 animate-slide-up">MISSION COMPLETE</h1>
        <p className="text-sl-gray-light text-lg mb-6">Outstanding performance, Champion</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {items.map((item, i) => (
            <div
              key={item.label}
              className="bg-sl-gray/20 rounded-xl p-4 animate-slide-up"
              style={{ animationDelay: `${i * 100 + 300}ms` }}
            >
              <span className="text-2xl block mb-1">{item.icon}</span>
              <p className="text-xs text-sl-gray-light uppercase tracking-wider">{item.label}</p>
              <p className="text-xl font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {data.newPRs && data.newPRs.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2">New Personal Records</p>
            {data.newPRs.map((pr, i) => (
              <p key={i} className="text-white">
                🏆 {pr.exercise}: {pr.newValue}{pr.unit} (previous: {pr.oldValue}{pr.unit})
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="sl-card mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Level Progress</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-sl-gray-light">Level {level}</span>
          <span className="text-sm text-sl-purple-light">{title}</span>
          <span className="text-sm text-sl-gray-light">{xp} XP</span>
        </div>
        <div className="w-full bg-sl-gray/40 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sl-purple to-sl-red animate-xp-fill rounded-full"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-sl-gray-light">XP to next level: {data.xpForNext}</span>
          <span className="text-xs text-sl-purple-light">{Math.floor(progress * 100)}%</span>
        </div>
      </div>

      <div className="sl-card mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Calorie Burn Detail</h2>
        {data.calorieBreakdown && data.calorieBreakdown.length > 0 ? (
          <div className="space-y-2">
            {data.calorieBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-sl-gray/20 rounded-lg p-3">
                <span className="text-white">{item.name}</span>
                <span className="text-sl-red-light font-bold">{item.calories} cal</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-t border-sl-purple/20 pt-2 mt-2">
              <span className="text-white font-bold">Total</span>
              <span className="text-sl-red-light font-bold text-lg">{data.totalCalories} cal</span>
            </div>
          </div>
        ) : (
          <p className="text-sl-gray-light text-base">Total calories burned: {data.totalCalories} cal</p>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={onNewWorkout} className="holo-button holo-button-primary flex-1 text-center text-lg py-4">
          New Workout
        </button>
        <button onClick={onViewAnalytics} className="holo-button flex-1 text-center text-lg py-4">
          View Analytics
        </button>
      </div>
    </div>
  );
}
