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

  const muscleEmoji = {
    Chest: '💪', Back: '🔥', Shoulders: '⚡', Arms: '🤜',
    Legs: '🦵', Core: '🎯', Cardio: '🏃', 'Full Body': '💯'
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search exercises..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="holo-input"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div key={ex.id} className="sl-card hover:border-sl-red/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{ex.name}</h3>
                  <p className="text-sm text-sl-gray-light">{ex.equipment}</p>
                </div>
                <span className="text-xs bg-sl-purple/20 text-sl-purple-light px-2 py-1 rounded-full">
                  +{ex.xpReward} XP
                </span>
              </div>

              <div className="flex items-center space-x-1 text-yellow-400 text-sm mb-2">
                {difficultyStars(ex.difficulty)}
                <span className="text-sl-gray-light text-xs ml-2">{ex.difficulty}</span>
              </div>

              <div className="bg-sl-gray/20 rounded-lg p-3 mb-4">
                <p className="text-xs text-sl-gray-light uppercase tracking-wider mb-1">Last Performance</p>
                <p className="text-base font-semibold text-white">{lastText}</p>
              </div>

              <button
                onClick={() => onSelectExercise(ex)}
                className="w-full holo-button holo-button-primary text-center"
              >
                Start Exercise
              </button>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sl-gray-light">
          <p className="text-xl">No exercises found for "{search}"</p>
        </div>
      )}
    </div>
  );
}
