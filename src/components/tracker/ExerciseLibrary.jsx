import { useState, useMemo } from 'react';

const difficultyStars = (diff) => {
  const map = { Beginner: 1, Intermediate: 3, Advanced: 5 };
  const count = map[diff] || 1;
  return '★'.repeat(count) + '☆'.repeat(5 - count);
};

export default function ExerciseLibrary({ muscleGroup, onSelectExercise, onBack, exercises, getLastPerformance }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(ex => ex.name.toLowerCase().includes(q) || ex.equipment?.toLowerCase().includes(q));
  }, [exercises, search]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="holo-input"
      />

      <div className="space-y-3">
        {filtered.map(ex => {
          const lastPerf = getLastPerformance ? getLastPerformance(ex.id) : null;
          let lastText = 'No data';
          if (lastPerf) {
            if (ex.trackingType === 'weight') lastText = `${lastPerf.weight || 0}kg × ${lastPerf.reps || 0}`;
            else if (ex.trackingType === 'reps') lastText = `${lastPerf.reps || 0} reps`;
            else if (ex.trackingType === 'time') lastText = `${lastPerf.duration || 0}s`;
            else if (ex.trackingType === 'distance') lastText = `${lastPerf.distance || 0}km`;
          }

          return (
            <div key={ex.id} className="mobile-card hover:border-sl-red/30 transition-all p-4 animate-slide-up">
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-white truncate">{ex.name}</h3>
                  <p className="text-xs text-sl-gray-light">{ex.equipment}</p>
                </div>
                <span className="text-[10px] bg-sl-purple/20 text-sl-purple-light px-2 py-1 rounded-full font-semibold shrink-0 ml-2">
                  +{ex.xpReward} XP
                </span>
              </div>

              <div className="flex items-center gap-1 text-yellow-400 text-xs mb-3">
                {difficultyStars(ex.difficulty)}
                <span className="text-sl-gray-light text-[10px] ml-1">{ex.difficulty}</span>
              </div>

              <div className="bg-sl-gray/20 rounded-lg p-3 mb-3">
                <p className="text-[10px] text-sl-gray-light uppercase tracking-wider mb-0.5 font-semibold">Last Performance</p>
                <p className="text-sm font-semibold text-white">{lastText}</p>
              </div>

              <button
                onClick={() => onSelectExercise(ex)}
                className="w-full holo-button holo-button-primary text-center py-3"
              >
                Start Exercise
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sl-gray-light">
          <p className="text-base">No exercises found for "{search}"</p>
        </div>
      )}
    </div>
  );
}
