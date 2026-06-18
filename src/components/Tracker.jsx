import { useState, useEffect } from 'react';
import { useLevel } from '../context/LevelContext';
import { calculateWorkoutXP } from '../utils/workoutUtils';

const SYSTEM_QUESTS = [
  { id: 'sys_daily_quest', name: 'Daily Quest: Preparations for Becoming Strong', duration: 45, calories: 350 },
  { id: 'sys_shadow_march', name: 'Shadow Army Marching', duration: 35, calories: 250 },
  { id: 'sys_monarch_trial', name: "Monarch's Strength Trial", duration: 60, calories: 500 }
];

const Tracker = () => {
  const { addXP } = useLevel();
  const [workouts, setWorkouts] = useState(() => {
    const stored = localStorage.getItem('workouts');
    return stored ? JSON.parse(stored) : [];
  });

  const [customPlans] = useState(() => {
    const savedCustom = localStorage.getItem('sl_custom_plans');
    return savedCustom ? JSON.parse(savedCustom) : [];
  });
  const [selectedPreset, setSelectedPreset] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    duration: '',
    calories: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [lastXPGained, setLastXPGained] = useState(0); // XP gained from last submitted workout

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handlePresetSelect = (e) => {
    const val = e.target.value;
    setSelectedPreset(val);
    if (!val) return;

    // Check system quests
    const sys = SYSTEM_QUESTS.find(q => q.id === val);
    if (sys) {
      setFormState(prev => ({
        ...prev,
        name: sys.name,
        duration: sys.duration.toString(),
        calories: sys.calories.toString()
      }));
      return;
    }

    // Check custom plans
    const custom = customPlans.find(q => q.id === val);
    if (custom) {
      const estimatedDuration = custom.exercises.reduce((acc, ex) => acc + (ex.type === 'mins' ? ex.reps : 5), 15);
      const estimatedCalories = custom.exercises.length * 50;
      setFormState(prev => ({
        ...prev,
        name: custom.name,
        duration: estimatedDuration.toString(),
        calories: estimatedCalories.toString()
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newWorkout = {
      id: Date.now(),
      name: formState.name,
      duration: parseInt(formState.duration, 10),
      calories: parseInt(formState.calories, 10),
      date: formState.date,
    };
    setWorkouts(prev => [...prev, newWorkout]);
    // Calculate and add XP
    const xpGained = calculateWorkoutXP(newWorkout);
    addXP(xpGained);
    setLastXPGained(xpGained);
    // Reset form
    setFormState({
      name: '',
      duration: '',
      calories: '',
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedPreset('');
  };

  const handleDelete = (id) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center gradient-text animate-pulse-red mb-2">
          Workout Tracker
        </h1>
        <p className="text-center text-sl-gray-light max-w-2xl mx-auto">
          Log your training activities, record calories burned, and track your daily level-up progress.
        </p>
        {lastXPGained > 0 && (
          <div className="text-center text-emerald-400 mt-4 font-bold animate-bounce">
            + {lastXPGained} XP gained! level progress updated.
          </div>
        )}
      </div>

      {/* Preset Plan Select & Workout Form */}
      <div className="bg-sl-gray/20 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-red/20 shadow-sl-glow mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Load Preset Regimen</label>
          <select
            value={selectedPreset}
            onChange={handlePresetSelect}
            className="holo-input bg-sl-gray/30 text-white select-dark cursor-pointer"
          >
            <option value="" className="bg-sl-gray text-white">-- Select custom plan or predefined quest --</option>
            <optgroup label="System Quests" className="bg-sl-gray text-sl-red-light font-bold">
              {SYSTEM_QUESTS.map(q => (
                <option key={q.id} value={q.id} className="bg-sl-gray text-white">{q.name}</option>
              ))}
            </optgroup>
            {customPlans.length > 0 && (
              <optgroup label="Custom Designed Plans" className="bg-sl-gray text-purple-400 font-bold">
                {customPlans.map(q => (
                  <option key={q.id} value={q.id} className="bg-sl-gray text-white">{q.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Workout Name</label>
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                className="holo-input text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                placeholder="e.g. Bench Press"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formState.duration}
                onChange={handleChange}
                className="holo-input text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                placeholder="e.g. 45"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Calories Burned</label>
              <input
                type="number"
                name="calories"
                value={formState.calories}
                onChange={handleChange}
                className="holo-input text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                placeholder="e.g. 300"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-sl-red-light/85 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formState.date}
                onChange={handleChange}
                className="holo-input text-white bg-sl-gray/30 placeholder:text-gray-600 focus:text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="holo-button w-full py-3 text-center"
          >
            Log Activity & Extract XP
          </button>
        </form>
      </div>

      {/* Workouts List */}
      <div className="bg-sl-gray/20 backdrop-blur-sm rounded-sl-xl border border-sl-red/20 shadow-sl-glow p-6">
        <h2 className="text-2xl font-bold text-sl-red-light mb-6 border-b border-sl-red/15 pb-2">
          Workout History Log
        </h2>

        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-16 h-16 text-sl-gray-light/35 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sl-gray-light/60">No workouts logged yet. Build your history to level up.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {workouts.slice().reverse().map(workout => (
              <div key={workout.id} className="p-4 bg-sl-gray/10 rounded-sl-lg border border-sl-red/10 flex justify-between items-center hover:bg-sl-gray/15 transition duration-300">
                <div>
                  <h3 className="font-semibold text-white text-lg">{workout.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-sl-gray-light/75 mt-1.5">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-sl-red-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {workout.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-sl-red-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {workout.calories} kcal
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-sl-red-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(workout.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition"
                  title="Delete Log"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracker;