import { useState } from 'react';

const PLAN_RANKS = ['Novice', 'Rookie', 'Warrior', 'Champion', 'Master', 'Grandmaster', 'Legend', 'Genesis'];

const PlanDesigner = () => {
  const [plans, setPlans] = useState(() => {
    const saved = localStorage.getItem('sl_custom_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rank, setRank] = useState('Novice');
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Push-ups', sets: 3, reps: 10, type: 'reps' }
  ]);

  const addExerciseField = () => {
    setExercises(prev => [
      ...prev,
      { id: Date.now() + Math.random(), name: '', sets: 3, reps: 10, type: 'reps' }
    ]);
  };

  const removeExerciseField = (id) => {
    if (exercises.length === 1) return;
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const handleExerciseChange = (id, field, value) => {
    setExercises(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a plan name.');
      return;
    }

    const hasEmptyExercises = exercises.some(ex => !ex.name.trim());
    if (hasEmptyExercises) {
      alert('Please fill out all exercise names.');
      return;
    }

    const newPlan = {
      id: Date.now().toString(),
      name,
      description,
      rank,
      exercises: exercises.map(({ name, sets, reps, type }) => ({
        name,
        sets: parseInt(sets, 10) || 1,
        reps: parseInt(reps, 10) || 1,
        type
      }))
    };

    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);
    localStorage.setItem('sl_custom_plans', JSON.stringify(updatedPlans));

    // Reset Form
    setName('');
    setDescription('');
    setRank('Novice');
    setExercises([{ id: 1, name: 'Push-ups', sets: 3, reps: 10, type: 'reps' }]);
  };

  const handleDeletePlan = (id) => {
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    localStorage.setItem('sl_custom_plans', JSON.stringify(updated));
  };

  // Helper to get rank-specific styling
  const getRankStyle = (rank) => {
    switch (rank) {
      case 'Genesis': return { border: 'border-red-500', text: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]', bg: 'bg-red-950/35' };
      case 'Legend': return { border: 'border-amber-500', text: 'text-amber-400', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]', bg: 'bg-amber-950/30' };
      case 'Grandmaster': return { border: 'border-fuchsia-500', text: 'text-fuchsia-400', glow: 'shadow-[0_0_12px_rgba(217,70,239,0.3)]', bg: 'bg-fuchsia-950/30' };
      case 'Master': return { border: 'border-violet-500', text: 'text-violet-400', glow: 'shadow-[0_0_12px_rgba(139,92,246,0.3)]', bg: 'bg-violet-950/30' };
      case 'Champion': return { border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.25)]', bg: 'bg-blue-950/30' };
      default: return { border: 'border-slate-500', text: 'text-slate-400', glow: '', bg: 'bg-slate-900/20' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-wide uppercase gradient-text mb-2 animate-pulse-slow">
          Monarch's Regimen Blueprint Creator
        </h1>
        <p className="text-sl-gray-light max-w-2xl mx-auto text-sm md:text-base">
          Draft custom training trials. Configure target exercises, sets, reps, and ranks to unlock maximum XP scaling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
        {/* Creator Form */}
        <div className="lg:col-span-7 bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow">
          <h2 className="text-xl font-bold text-sl-purple-light mb-6 flex items-center justify-between border-b border-sl-purple/15 pb-3">
            <span className="tracking-wider uppercase">Blueprint Parameters</span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getRankStyle(rank).border} ${getRankStyle(rank).text} ${getRankStyle(rank).bg} ${getRankStyle(rank).glow}`}>
              Rank: {rank}
            </span>
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-sl-purple-light/85 mb-2">Plan Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Shadow Soldier Endurance"
                  className="holo-input text-white bg-sl-gray/40 placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-sl-purple-light/85 mb-2">Plan Rank</label>
                <select
                  value={rank}
                  onChange={e => setRank(e.target.value)}
                  className="holo-input bg-sl-dark text-sl-purple-light select-dark cursor-pointer font-bold border-sl-purple/30"
                >
                  {PLAN_RANKS.map(r => (
                    <option key={r} value={r} className="bg-sl-dark text-white font-bold">{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-sl-purple-light/85 mb-2">Description / Objective</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g., A high-intensity regimen focusing on raw power and muscular endurance."
                className="holo-input h-20 text-white bg-sl-gray/40 placeholder:text-gray-500 resize-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-sl-purple-light/85">Exercises Sequence</label>
                <button
                  type="button"
                  onClick={addExerciseField}
                  className="text-xs font-bold bg-sl-purple/20 hover:bg-sl-purple/35 text-sl-purple-light px-3.5 py-2 rounded-sl-lg border border-sl-purple/40 shadow-sl-glow transition duration-300"
                >
                  + Add Trial Element
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {exercises.map((ex, idx) => (
                  <div key={ex.id} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-sl-gray/30 p-3.5 rounded-sl-lg border border-sl-purple/10 hover:border-sl-purple/20 transition duration-300">
                    <span className="text-xs text-sl-purple-light/50 font-bold bg-sl-purple/10 w-6 h-6 flex items-center justify-center rounded-full border border-sl-purple/25">{idx + 1}</span>
                    <input
                      type="text"
                      value={ex.name}
                      onChange={e => handleExerciseChange(ex.id, 'name', e.target.value)}
                      placeholder="Exercise name"
                      className="holo-input py-1.5 text-sm bg-transparent flex-1 text-white border-sl-purple/20 focus:border-sl-purple/50"
                      required
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="1"
                        value={ex.sets}
                        onChange={e => handleExerciseChange(ex.id, 'sets', e.target.value)}
                        placeholder="Sets"
                        className="holo-input py-1.5 w-16 text-center bg-transparent text-white border-sl-purple/20"
                      />
                      <span className="text-xs text-sl-purple-light/60">x</span>
                      <input
                        type="number"
                        min="1"
                        value={ex.reps}
                        onChange={e => handleExerciseChange(ex.id, 'reps', e.target.value)}
                        placeholder="Reps"
                        className="holo-input py-1.5 w-18 text-center bg-transparent text-white border-sl-purple/20"
                      />
                      <select
                        value={ex.type}
                        onChange={e => handleExerciseChange(ex.id, 'type', e.target.value)}
                        className="holo-input py-1.5 px-2 bg-sl-dark text-white border-sl-purple/20 text-xs w-24 cursor-pointer"
                      >
                        <option value="reps" className="bg-sl-dark text-white">Reps</option>
                        <option value="secs" className="bg-sl-dark text-white">Secs</option>
                        <option value="mins" className="bg-sl-dark text-white">Mins</option>
                      </select>
                    </div>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExerciseField(ex.id)}
                        className="text-red-400 hover:text-red-300 p-2 transition ml-auto md:ml-0 hover:bg-red-500/10 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="holo-button w-full py-3.5 mt-4 text-center font-bold tracking-widest uppercase hover:bg-sl-purple/30 border-sl-purple/40 shadow-sl-glow-purple transition duration-300"
            >
              Construct Regimen Blueprint
            </button>
          </form>
        </div>

        {/* Right side: Live Preview & Saved blueprints */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <div className={`p-5 rounded-sl-xl border ${getRankStyle(rank).border} ${getRankStyle(rank).glow} bg-sl-dark/60 backdrop-blur-sm`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xxs uppercase tracking-widest text-sl-purple-light/50 font-bold">Blueprint Draft Preview</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getRankStyle(rank).border} ${getRankStyle(rank).text} ${getRankStyle(rank).bg}`}>
                {rank}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-xl uppercase tracking-wide truncate">{name || 'Unnamed Regimen'}</h3>
            <p className="text-xs text-sl-purple-light/70 italic mt-1 line-clamp-2 h-8">{description || 'No description provided yet.'}</p>
            
            <div className="border-t border-sl-purple/10 mt-4 pt-3 space-y-2">
              <span className="text-xxs uppercase tracking-wider text-sl-purple-light/40 font-bold block mb-1">Trial Items ({exercises.length})</span>
              {exercises.map((ex, idx) => (
                <div key={idx} className="text-xs text-sl-purple-light flex justify-between bg-sl-purple/5 px-2.5 py-1.5 rounded border border-sl-purple/5">
                  <span className="font-medium text-white truncate max-w-[150px]">• {ex.name || `Exercise ${idx + 1}`}</span>
                  <span className="text-sl-purple-light/80 font-semibold">{ex.sets} sets x {ex.reps} {ex.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active blueprints list */}
          <div className="bg-sl-dark/40 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-purple/20 shadow-sl-glow flex flex-col">
            <h2 className="text-lg font-bold text-sl-purple-light mb-4 border-b border-sl-purple/15 pb-2 uppercase tracking-wider">
              Active Custom Blueprint Deck
            </h2>

            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
              {plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <svg className="w-12 h-12 text-sl-purple-light/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xs text-sl-purple-light/60">No custom regimens constructed yet.</p>
                </div>
              ) : (
                plans.map(p => {
                  const styles = getRankStyle(p.rank);
                  return (
                    <div key={p.id} className={`p-4 rounded-sl-lg border ${styles.border} ${styles.glow} bg-sl-gray/20 flex justify-between gap-4 transition-all duration-300 hover:bg-sl-gray/30`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xxs font-bold px-1.5 py-0.5 rounded border ${styles.border} ${styles.text} ${styles.bg}`}>
                            {p.rank}
                          </span>
                          <h3 className="font-bold text-white text-base truncate max-w-[150px]">{p.name}</h3>
                        </div>
                        {p.description && <p className="text-xs text-sl-purple-light/75 mb-2 line-clamp-1 italic">{p.description}</p>}
                        <div className="space-y-1">
                          {p.exercises.map((ex, idx) => (
                            <div key={idx} className="text-xxs text-sl-purple-light/65 flex justify-between max-w-[200px]">
                              <span>• {ex.name}</span>
                              <span>{ex.sets}s x {ex.reps} {ex.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start justify-end">
                        <button
                          onClick={() => handleDeletePlan(p.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
                          title="Delete Plan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDesigner;