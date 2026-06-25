import { useState, useMemo, useRef, useEffect } from 'react';

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body'];

const MUSCLE_GROUP_DISPLAY = {
  'All': { emoji: '📋', display: 'All Groups' },
  'Chest': { emoji: '💪', display: 'Chest Arsenal' },
  'Back': { emoji: '🔥', display: 'Back Arsenal' },
  'Shoulders': { emoji: '⚡', display: 'Shoulders' },
  'Arms': { emoji: '💥', display: 'Arms' },
  'Legs': { emoji: '🦵', display: 'Legion Training' },
  'Core': { emoji: '🎯', display: 'Core' },
  'Cardio': { emoji: '🏃', display: 'Cardio' },
  'Full Body': { emoji: '🏋', display: 'Full Body' },
};

export default function CustomWorkoutBuilder({ onComplete, onBack, onReset, exercises, templates, addWorkoutTemplate, removeWorkoutTemplate }) {
  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('All');
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredExercises = useMemo(() => {
    let result = exercises;
    if (filterMuscle !== 'All') result = result.filter(ex => ex.muscleGroup === filterMuscle);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(ex => ex.name.toLowerCase().includes(q));
    }
    return result;
  }, [exercises, filterMuscle, search]);

  const addExercise = (ex) => {
    if (selectedExercises.some(e => e.exerciseId === ex.id)) return;
    setSelectedExercises(prev => [...prev, {
      exerciseId: ex.id,
      exerciseData: ex,
      name: ex.name,
      sets: 3,
      reps: 10,
      weight: ex.trackingType === 'weight' ? 20 : 0
    }]);
  };

  const removeExercise = (id) => {
    setSelectedExercises(prev => prev.filter(e => e.exerciseId !== id));
  };

  const updateExercise = (id, field, value) => {
    setSelectedExercises(prev => prev.map(e =>
      e.exerciseId === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSave = () => {
    if (!name.trim() || selectedExercises.length === 0) return;
    const template = {
      name: name.trim(),
      exercises: selectedExercises.map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps,
        weight: e.weight
      }))
    };
    addWorkoutTemplate(template);
    setSaving(true);
    setTimeout(() => {
      onComplete(template);
    }, 800);
  };

  const startWorkout = () => {
    if (selectedExercises.length === 0) return;
    const workout = {
      name: name.trim() || 'Custom Workout',
      exercises: selectedExercises
    };
    onComplete(workout);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowResetConfirm(true)} className="text-red-400 hover:text-red-300 text-sm">
          Reset Workout
        </button>
      </div>

      <div className="sl-card">
        <label className="block text-sm text-sl-gray-light mb-2">Workout Name</label>
        <input
          type="text"
          placeholder="e.g. Push Day, Chest Blast, Leg Destroyer"
          value={name}
          onChange={e => setName(e.target.value)}
          className="holo-input text-lg font-semibold"
        />
      </div>

      {selectedExercises.length > 0 && (
        <div className="sl-card">
          <h3 className="text-xl font-bold text-white mb-4">
            Selected Exercises ({selectedExercises.length})
          </h3>
          <div className="space-y-3">
            {selectedExercises.map(ex => (
              <div key={ex.exerciseId} className="bg-sl-gray/20 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-white">{ex.name}</h4>
                  <button onClick={() => removeExercise(ex.exerciseId)} className="text-red-400 hover:text-red-300 text-sm">
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-sl-gray-light block mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={ex.sets}
                      onChange={e => updateExercise(ex.exerciseId, 'sets', parseInt(e.target.value) || 1)}
                      className="holo-input text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-sl-gray-light block mb-1">Reps</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={ex.reps}
                      onChange={e => updateExercise(ex.exerciseId, 'reps', parseInt(e.target.value) || 1)}
                      className="holo-input text-center"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-sl-gray-light block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={ex.weight}
                      onChange={e => updateExercise(ex.exerciseId, 'weight', parseFloat(e.target.value) || 0)}
                      className="holo-input text-center"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={!name.trim()} className="holo-button flex-1 text-center">
              {saving ? 'Saving...' : 'Save Template'}
            </button>
            <button onClick={startWorkout} disabled={selectedExercises.length === 0} className="holo-button holo-button-primary flex-1 text-center">
              Start Workout
            </button>
          </div>
        </div>
      )}

      {templates && templates.length > 0 && (
        <div className="sl-card">
          <h3 className="text-xl font-bold text-white mb-4">Saved Templates ({templates.length})</h3>
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center justify-between bg-sl-gray/20 rounded-xl p-3">
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-sl-gray-light">{t.exercises?.length || 0} exercises</p>
                </div>
                <button onClick={() => setDeleteConfirmId(t.id)} className="text-red-400 hover:text-red-300 text-sm px-2 py-1">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sl-card">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="holo-input flex-1"
          />
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown(prev => !prev)}
              className="flex items-center gap-2 px-4 py-3 rounded-sl-xl border text-sm font-semibold transition-all whitespace-nowrap min-w-[160px]"
              style={{
                backgroundColor: '#120A1F',
                borderColor: '#B56CFF',
                color: '#D9C2FF',
              }}
            >
              <span>{MUSCLE_GROUP_DISPLAY[filterMuscle]?.emoji || '📋'}</span>
              <span className="flex-1 text-left">{MUSCLE_GROUP_DISPLAY[filterMuscle]?.display || filterMuscle}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 mt-2 z-50 rounded-xl border overflow-hidden min-w-[200px] animate-fade-slide"
                style={{
                  backgroundColor: '#1A1028',
                  borderColor: '#7A3EFF',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setFilterMuscle('All'); setShowDropdown(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition flex items-center gap-3 ${
                    filterMuscle === 'All' ? 'text-white' : 'text-[#D9C2FF]'
                  }`}
                  style={filterMuscle === 'All' ? { backgroundColor: '#2A1744' } : {}}
                  onMouseEnter={e => e.target.style.backgroundColor = '#2A1744'}
                  onMouseLeave={e => { if (filterMuscle !== 'All') e.target.style.backgroundColor = 'transparent'; }}
                >
                  <span>📋</span>
                  <span>All Groups</span>
                </button>
                <div style={{ height: '1px', backgroundColor: 'rgba(122,62,255,0.3)' }} />
                {MUSCLE_GROUPS.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setFilterMuscle(g); setShowDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition flex items-center gap-3 ${
                      filterMuscle === g ? 'text-white' : 'text-[#D9C2FF]'
                    }`}
                    style={filterMuscle === g ? { backgroundColor: '#2A1744' } : {}}
                    onMouseEnter={e => e.target.style.backgroundColor = '#2A1744'}
                    onMouseLeave={e => { if (filterMuscle !== g) e.target.style.backgroundColor = 'transparent'; }}
                  >
                    <span>{MUSCLE_GROUP_DISPLAY[g]?.emoji || ''}</span>
                    <span>{MUSCLE_GROUP_DISPLAY[g]?.display || g}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
          {filteredExercises.filter(ex => !selectedExercises.some(s => s.exerciseId === ex.id)).map(ex => (
            <button
              key={ex.id}
              onClick={() => addExercise(ex)}
              className="bg-sl-gray/20 hover:bg-sl-purple/20 rounded-xl p-4 text-left transition-all border border-transparent hover:border-sl-purple/30"
            >
              <p className="font-semibold text-white text-base">{ex.name}</p>
              <p className="text-xs text-sl-gray-light">{ex.muscleGroup} · {ex.equipment}</p>
              <p className="text-xs text-sl-purple-light mt-1">+{ex.xpReward} XP</p>
            </button>
          ))}
        </div>

        {filteredExercises.filter(ex => !selectedExercises.some(s => s.exerciseId === ex.id)).length === 0 && (
          <p className="text-center text-sl-gray-light py-4">No exercises found</p>
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-sl-dark border border-sl-red/30 rounded-xl p-6 max-w-sm w-full mx-4 shadow-sl-glow" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2">Reset Workout?</h3>
            <p className="text-sl-gray-light text-sm mb-6">This will clear the current workout.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 holo-button text-center">Cancel</button>
              <button onClick={() => { setShowResetConfirm(false); onReset && onReset(); }} className="flex-1 holo-button holo-button-danger text-center">Reset</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-sl-dark border border-sl-red/30 rounded-xl p-6 max-w-sm w-full mx-4 shadow-sl-glow" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-2">Delete Workout?</h3>
            <p className="text-sl-gray-light text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 holo-button text-center">Cancel</button>
              <button onClick={() => { removeWorkoutTemplate(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 holo-button holo-button-danger text-center">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
