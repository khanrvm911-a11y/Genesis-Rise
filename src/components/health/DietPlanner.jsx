import { useState, useEffect, useCallback } from 'react';
import { Utensils, Plus, Trash2, Target, Flame, Dumbbell, Droplets, Apple } from 'lucide-react';

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 1.375, label: 'Light', desc: '1–3 days/week' },
  { value: 1.55, label: 'Moderate', desc: '3–5 days/week' },
  { value: 1.725, label: 'Active', desc: '6–7 days/week' },
  { value: 1.9, label: 'Extreme', desc: 'Twice daily / physical job' },
];

const GOALS = [
  { value: -500, label: 'Cut', icon: Flame, desc: 'Fat loss' },
  { value: 0, label: 'Maintain', icon: Target, desc: 'Stay same' },
  { value: 300, label: 'Bulk', icon: Dumbbell, desc: 'Muscle gain' },
];

const FOOD_PRESETS = [
  { name: 'Oatmeal', cals: 150, protein: 5, fat: 3, carbs: 27 },
  { name: 'Chicken Breast', cals: 165, protein: 31, fat: 3.6, carbs: 0 },
  { name: 'Rice (cooked)', cals: 130, protein: 2.7, fat: 0.3, carbs: 28 },
  { name: 'Eggs (2)', cals: 140, protein: 12, fat: 10, carbs: 1 },
  { name: 'Whey Shake', cals: 120, protein: 24, fat: 1, carbs: 3 },
  { name: 'Banana', cals: 105, protein: 1.3, fat: 0.4, carbs: 27 },
  { name: 'Salmon', cals: 208, protein: 22, fat: 13, carbs: 0 },
  { name: 'Sweet Potato', cals: 103, protein: 2.3, fat: 0.2, carbs: 24 },
  { name: 'Greek Yogurt', cals: 100, protein: 17, fat: 0.7, carbs: 6 },
  { name: 'Avocado', cals: 160, protein: 2, fat: 15, carbs: 9 },
];

const STORAGE_KEY = 'gr_diet_log';

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveLog(log) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); } catch {}
}

function calculateBMR(weight, height, age, gender) {
  if (!weight || !height || !age) return 0;
  if (gender === 'female') return 10 * weight + 6.25 * height - 5 * age - 161;
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

function calculateBF(weight, neck, waist, hip, gender) {
  if (!weight || !neck || !waist) return null;
  if (gender === 'female' && !hip) return null;

  const logVal = Math.log10(waist + (gender === 'female' ? hip - neck : neck));
  if (gender === 'female') {
    return 163.205 * logVal - 97.684 * Math.log10(heightCM || 160) - 78.387;
  }
  return 495 / (1.0324 - 0.19077 * logVal + 0.15456 * Math.log10(heightCM || 175)) - 450;
}

export default function DietPlanner() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState(0);
  const [showCalc, setShowCalc] = useState(false);
  const [foodLog, setFoodLog] = useState(() => loadLog());
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [bodyFat, setBodyFat] = useState(null);
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');

  const todayKey = getTodayKey();
  const todayMeals = foodLog[todayKey] || [];

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = bmr * activity;
  const targetCals = Math.round(tdee + goal);
  const proteinG = weight ? Math.round(weight * (goal < 0 ? 2.2 : 1.8)) : 0;
  const proteinCals = proteinG * 4;
  const fatCals = Math.round(targetCals * 0.25);
  const fatG = Math.round(fatCals / 9);
  const carbCals = targetCals - proteinCals - fatCals;
  const carbG = Math.round(carbCals / 4);

  useEffect(() => { saveLog(foodLog); }, [foodLog]);

  const addFood = useCallback((food) => {
    setFoodLog(prev => {
      const today = { ...(prev[todayKey] || []) };
      const id = Date.now();
      today[id] = { ...food, id, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      return { ...prev, [todayKey]: today };
    });
  }, [todayKey]);

  const removeFood = useCallback((id) => {
    setFoodLog(prev => {
      const today = { ...(prev[todayKey] || {}) };
      delete today[id];
      return { ...prev, [todayKey]: today };
    });
  }, [todayKey]);

  const addCustom = (e) => {
    e.preventDefault();
    if (!customName || !customCals) return;
    addFood({ name: customName, cals: parseInt(customCals) || 0, protein: parseInt(customProtein) || 0, fat: parseInt(customFat) || 0, carbs: parseInt(customCarbs) || 0 });
    setCustomName(''); setCustomCals(''); setCustomProtein(''); setCustomFat(''); setCustomCarbs('');
  };

  const totalCals = Object.values(todayMeals).reduce((s, m) => s + (m.cals || 0), 0);
  const totalProtein = Object.values(todayMeals).reduce((s, m) => s + (m.protein || 0), 0);
  const totalFat = Object.values(todayMeals).reduce((s, m) => s + (m.fat || 0), 0);
  const totalCarbs = Object.values(todayMeals).reduce((s, m) => s + (m.carbs || 0), 0);

  const GoalIcon = GOALS.find(g => g.value === goal)?.icon || Target;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-sl-purple/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-sl-purple-light" />
              <h3 className="text-sm font-bold text-white">Diet Planner</h3>
            </div>
            <button onClick={() => setShowCalc(!showCalc)} className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80">
              {showCalc ? 'Hide' : 'Calculate TDEE'}
            </button>
          </div>
        </div>

        {showCalc && (
          <div className="p-4 space-y-3 border-b border-sl-purple/10">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 bg-sl-gray/40 border border-sl-purple/20 rounded-lg text-xs text-white text-center px-2 focus:outline-none focus:border-sl-purple/50" min="20" max="300" step="0.1" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 bg-sl-gray/40 border border-sl-purple/20 rounded-lg text-xs text-white text-center px-2 focus:outline-none focus:border-sl-purple/50" min="100" max="250" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1">Age</label>
                <input type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 0)}
                  className="w-full h-9 bg-sl-gray/40 border border-sl-purple/20 rounded-lg text-xs text-white text-center px-2 focus:outline-none focus:border-sl-purple/50" min="10" max="120" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1">Gender</label>
                <div className="flex gap-2">
                  {['male', 'female'].map(g => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`flex-1 h-9 rounded-lg text-xs font-bold border transition ${
                        gender === g ? 'bg-sl-purple/20 border-sl-purple/40 text-sl-purple-light' : 'bg-sl-gray/40 border-sl-purple/15 text-sl-gray-light hover:bg-sl-gray/30'
                      }`}>{g === 'male' ? 'M' : 'F'}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1.5">Activity Level</label>
              <div className="grid grid-cols-1 gap-1.5">
                {ACTIVITY_LEVELS.map(a => (
                  <button key={a.value} onClick={() => setActivity(a.value)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition ${
                      activity === a.value ? 'bg-sl-purple/20 border-sl-purple/40 text-sl-purple-light' : 'bg-sl-gray/40 border-sl-purple/15 text-sl-gray-light hover:bg-sl-gray/30'
                    }`}>
                    <span className="font-semibold">{a.label}</span>
                    <span className="text-sl-purple-light/60">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 mb-1.5">Goal</label>
              <div className="flex gap-2">
                {GOALS.map(g => {
                  const Icon = g.icon;
                  return (
                    <button key={g.value} onClick={() => setGoal(g.value)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-bold border transition ${
                        goal === g.value ? 'bg-sl-purple/20 border-sl-purple/40 text-sl-purple-light' : 'bg-sl-gray/40 border-sl-purple/15 text-sl-gray-light hover:bg-sl-gray/30'
                      }`}>
                      <Icon className="w-4 h-4" />
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {(bmr > 0) && (
              <div className="bg-sl-gray/30 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[10px] text-sl-purple-light/60 font-semibold">BMR</span>
                  <span className="text-xs font-bold text-white">{Math.round(bmr)} cal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-sl-purple-light/60 font-semibold">TDEE</span>
                  <span className="text-xs font-bold text-white">{Math.round(tdee)} cal</span>
                </div>
                <div className="border-t border-sl-purple/10 my-1.5" />
                <div className="flex justify-between">
                  <span className="text-[11px] text-sl-purple-light font-bold flex items-center gap-1">
                    <GoalIcon className="w-3.5 h-3.5" />
                    Target
                  </span>
                  <span className="text-sm font-bold text-white">{targetCals} cal/day</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60">Daily Macros</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Protein', value: proteinG, unit: 'g', target: proteinG, current: totalProtein, color: 'text-blue-400', icon: Dumbbell },
              { label: 'Fat', value: fatG, unit: 'g', target: fatG, current: totalFat, color: 'text-amber-400', icon: Flame },
              { label: 'Carbs', value: carbG, unit: 'g', target: carbG, current: totalCarbs, color: 'text-emerald-400', icon: Droplets },
            ].map(m => {
              const pct = m.target > 0 ? Math.min(m.current / m.target, 1) : 0;
              return (
                <div key={m.label} className="bg-sl-gray/30 rounded-lg p-3 text-center">
                  <p className={`text-[9px] font-bold ${m.color} mb-1`}>{m.label}</p>
                  <p className="text-lg font-bold text-white">{m.value}{m.unit}</p>
                  <p className="text-[9px] text-sl-purple-light/60">{m.label === 'Protein' ? '1.8–2.2g/kg' : m.label === 'Fat' ? '~25% of cals' : 'Remaining cals'}</p>
                  <div className="w-full h-1 bg-sl-gray/40 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${m.color.replace('text-', 'from-').replace('-400', '-400').replace('-400', '-400')} to-${m.color.replace('text-', '')}/50`}
                      style={{ width: `${pct * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-sl-purple/10">
          <div className="flex items-center gap-2">
            <Apple className="w-4 h-4 text-sl-purple-light" />
            <h3 className="text-sm font-bold text-white">Food Log</h3>
          </div>
        </div>

        <div className="p-4 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {FOOD_PRESETS.map(food => (
              <button key={food.name} onClick={() => addFood(food)}
                className="bg-sl-gray/30 hover:bg-sl-gray/40 border border-sl-purple/10 rounded-lg px-2 py-1.5 text-center transition">
                <p className="text-[10px] font-bold text-white truncate">{food.name}</p>
                <p className="text-[8px] text-sl-gray-light/60">{food.cals} cal</p>
              </button>
            ))}
          </div>

          <form onSubmit={addCustom} className="flex flex-wrap gap-1.5">
            <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Food name"
              className="flex-1 min-w-[80px] h-8 bg-sl-gray/40 border border-sl-purple/15 rounded-lg text-[10px] text-white px-2 focus:outline-none focus:border-sl-purple/50" />
            <input type="number" value={customCals} onChange={e => setCustomCals(e.target.value)} placeholder="Cal"
              className="w-14 h-8 bg-sl-gray/40 border border-sl-purple/15 rounded-lg text-[10px] text-white text-center px-1 focus:outline-none focus:border-sl-purple/50" />
            <button type="submit" className="h-8 px-2.5 bg-sl-purple/20 border border-sl-purple/30 rounded-lg text-[10px] font-bold text-sl-purple-light hover:bg-sl-purple/30 transition flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>

          <div className="bg-sl-gray/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex gap-4 text-[10px]">
              <span className="text-white font-bold">{totalCals} / {targetCals} <span className="text-sl-purple-light/60">cal</span></span>
              <span className="text-blue-400 font-semibold">{totalProtein}g</span>
              <span className="text-amber-400 font-semibold">{totalFat}g</span>
              <span className="text-emerald-400 font-semibold">{totalCarbs}g</span>
            </div>
            <div className="w-16 h-1.5 bg-sl-gray/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-sl-purple transition-all" style={{ width: `${Math.min(targetCals > 0 ? totalCals / targetCals * 100 : 0, 100)}%` }} />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {Object.values(todayMeals).length === 0 && (
              <p className="text-center text-[10px] text-sl-gray-light/40 py-4">No meals logged today</p>
            )}
            {Object.values(todayMeals).reverse().map(meal => (
              <div key={meal.id} className="flex items-center justify-between bg-sl-gray/25 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-sl-gray-light/40 shrink-0">{meal.time}</span>
                  <span className="text-[11px] font-semibold text-white truncate">{meal.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-white font-bold">{meal.cals}cal</span>
                  <button onClick={() => removeFood(meal.id)} className="text-red-400/50 hover:text-red-400 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
