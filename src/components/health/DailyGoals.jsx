import { useState, useEffect, useRef, useCallback } from 'react';
import { Droplets, Activity, Moon, Flame, Target, Edit2, Plus, Play, Square, Check, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useNotification } from '../../context/NotificationContext';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'sl_daily_goals';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getTodayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const defaultGoals = { water: 3000, steps: 10000, sleep: 8, calories: 500 };

const defaultDay = () => ({
  date: getTodayKey(),
  water: { total: 0, entries: [] },
  steps: { count: 0 },
  sleep: { start: null, end: null, duration: 0 },
  calories: { total: 0, fromSteps: 0 },
});

const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { goals: { ...defaultGoals }, days: {} };
};

const saveAll = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const formatDuration = (hours) => {
  if (hours === Math.floor(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
};

const formatNumber = (n) => n.toLocaleString();

const DailyGoals = () => {
  const { user } = useAuth();
  const { workoutHistory } = useWorkout();
  const { addNotification } = useNotification();
  const goalNotifiedRef = useRef({ water: false, steps: false, sleep: false, calories: false });
  const allData = useRef(loadAll());

  const todayKey = getTodayKey();
  const storedToday = allData.current.days[todayKey];

  const [today, setToday] = useState(storedToday ? { ...storedToday } : defaultDay());
  const [goals, setGoals] = useState({ ...(allData.current.goals || defaultGoals) });
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalInput, setGoalInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [pedometerActive, setPedometerActive] = useState(false);
  const [sleepElapsed, setSleepElapsed] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');
  const [waterInput, setWaterInput] = useState('');

  const pedometerRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const pedometerStarted = useRef(false);

  const todaySafe = today || defaultDay();

  const persist = useCallback((newToday, newGoals) => {
    const d = allData.current;
    if (newToday) {
      d.days[newToday.date || todayKey] = newToday;
    }
    if (newGoals) {
      d.goals = newGoals;
    }
    saveAll(d);
  }, [todayKey]);

  useEffect(() => {
    const nowKey = getTodayKey();
    if (todaySafe.date !== nowKey) {
      const fresh = defaultDay();
      setToday(fresh);
      persist(fresh, null);
    }
  }, []);

  useEffect(() => {
    const checkDate = () => {
      const nowKey = getTodayKey();
      if (todaySafe.date !== nowKey) {
        const fresh = defaultDay();
        setToday(fresh);
        allData.current.days[nowKey] = fresh;
        saveAll(allData.current);
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkDate();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    const iv = setInterval(checkDate, 60000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(iv);
    };
  }, [todaySafe.date]);

  useEffect(() => {
    if (!user) return;
    const timeout = setTimeout(async () => {
      try {
        const data = allData.current.days[todayKey];
        if (data) {
          await supabase.from('daily_goals').upsert(
            { user_id: user.id, date: todayKey, data, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,date' }
          );
          setSyncStatus('synced');
        }
      } catch {
        setSyncStatus('offline');
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [user, todayKey]);

  useEffect(() => {
    const waterCompleted = todaySafe.water.total >= goals.water;
    const stepsCompleted = todaySafe.steps.count >= goals.steps;
    const sleepCompleted = todaySafe.sleep.duration >= goals.sleep;
    const todayWCal = (workoutHistory || []).filter(w => w.date === getTodayKey()).reduce((s, w) => s + (w.totalCalories || 0), 0);
    const calsFromSteps = Math.round(todaySafe.steps.count * 0.04);
    const calTotal = todayWCal + calsFromSteps;
    const caloriesCompleted = calTotal >= goals.calories;

    if (waterCompleted && !goalNotifiedRef.current.water) {
      goalNotifiedRef.current.water = true;
      addNotification('Water Goal Completed', `You reached your daily water goal of ${goals.water.toLocaleString()}ml!`, 'health', 'health', '/health');
    }
    if (stepsCompleted && !goalNotifiedRef.current.steps) {
      goalNotifiedRef.current.steps = true;
      addNotification('Steps Goal Completed', `You reached your daily step goal of ${goals.steps.toLocaleString()} steps!`, 'health', 'health', '/health');
    }
    if (sleepCompleted && !goalNotifiedRef.current.sleep) {
      goalNotifiedRef.current.sleep = true;
      addNotification('Sleep Goal Completed', `You reached your daily sleep goal of ${goals.sleep}h!`, 'health', 'health', '/health');
    }
    if (caloriesCompleted && !goalNotifiedRef.current.calories) {
      goalNotifiedRef.current.calories = true;
      addNotification('Calories Goal Completed', `You reached your daily calorie burn goal of ${goals.calories.toLocaleString()} cal!`, 'health', 'health', '/health');
    }
  }, [todaySafe, goals, workoutHistory, addNotification]);

  useEffect(() => {
    if (pedometerActive) {
      let lastMagnitude = null;
      let stepBuffer = 0;
      const threshold = 12;
      const handler = (e) => {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        if (lastMagnitude !== null) {
          const diff = Math.abs(mag - lastMagnitude);
          if (diff > threshold && mag > 9.5) {
            stepBuffer++;
          }
        }
        lastMagnitude = mag;
      };
      window.addEventListener('devicemotion', handler);
      const iv = setInterval(() => {
        if (stepBuffer > 0) {
          setToday(prev => {
            const next = { ...prev, steps: { count: prev.steps.count + stepBuffer } };
            allData.current.days[next.date || todayKey] = next;
            saveAll(allData.current);
            return next;
          });
          stepBuffer = 0;
        }
      }, 2000);
      pedometerRef.current = { handler, iv };
      return () => {
        window.removeEventListener('devicemotion', handler);
        clearInterval(iv);
        pedometerRef.current = null;
      };
    }
  }, [pedometerActive, todayKey]);

  useEffect(() => {
    if (todaySafe.sleep.start && !todaySafe.sleep.end) {
      const update = () => {
        const elapsed = (Date.now() - new Date(todaySafe.sleep.start).getTime()) / 3600000;
        setSleepElapsed(elapsed);
      };
      update();
      sleepTimerRef.current = setInterval(update, 1000);
      return () => clearInterval(sleepTimerRef.current);
    } else {
      setSleepElapsed(0);
    }
  }, [todaySafe.sleep.start, todaySafe.sleep.end]);

  const addWater = (amount) => {
    setToday(prev => {
      const next = {
        ...prev,
        water: {
          total: prev.water.total + amount,
          entries: [...prev.water.entries, { time: new Date().toLocaleTimeString(), amount }],
        },
      };
      persist(next, null);
      return next;
    });
  };

  const handleCustomWater = (e) => {
    e.preventDefault();
    const val = parseInt(waterInput);
    if (val > 0) {
      addWater(val);
      setWaterInput('');
    }
  };

  const updateSteps = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setToday(prev => {
        const next = { ...prev, steps: { count: val } };
        persist(next, null);
        return next;
      });
    }
  };

  const togglePedometer = async () => {
    if (pedometerActive) {
      setPedometerActive(false);
      if (pedometerRef.current) {
        window.removeEventListener('devicemotion', pedometerRef.current.handler);
        clearInterval(pedometerRef.current.iv);
        pedometerRef.current = null;
      }
      return;
    }
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        if (result !== 'granted') return;
      } catch {
        return;
      }
    }
    setPedometerActive(true);
  };

  const startSleep = () => {
    setToday(prev => {
      const next = { ...prev, sleep: { start: new Date().toISOString(), end: null, duration: 0 } };
      persist(next, null);
      return next;
    });
  };

  const stopSleep = () => {
    const end = new Date();
    const start = new Date(todaySafe.sleep.start);
    const durHours = (end.getTime() - start.getTime()) / 3600000;
    setToday(prev => {
      const next = {
        ...prev,
        sleep: { start: prev.sleep.start, end: end.toISOString(), duration: Math.round((prev.sleep.duration + durHours) * 10) / 10 },
      };
      persist(next, null);
      return next;
    });
  };

  const startEditGoal = (key) => {
    setEditingGoal(key);
    setGoalInput(goals[key].toString());
  };

  const saveGoal = () => {
    if (editingGoal) {
      const val = parseInt(goalInput);
      if (val > 0) {
        const newGoals = { ...goals, [editingGoal]: val };
        setGoals(newGoals);
        persist(null, newGoals);
      }
      setEditingGoal(null);
      setGoalInput('');
    }
  };

  const pastDays = Object.entries(allData.current.days || {})
    .filter(([k]) => k !== todayKey)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30);

  const goalKeys = [
    { key: 'water', label: 'Water', icon: Droplets, unit: 'ml' },
    { key: 'steps', label: 'Steps', icon: Activity, unit: 'steps' },
    { key: 'sleep', label: 'Sleep', icon: Moon, unit: 'h' },
    { key: 'calories', label: 'Calories', icon: Flame, unit: 'cal' },
  ];

  return (
    <div className="mobile-card mb-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-sl-purple-light flex items-center gap-2">
          <Target className="w-4 h-4" />
          Daily Goals
        </h2>
        <div className="flex items-center gap-2">
          {syncStatus === 'synced' && <span className="text-[9px] text-emerald-400 font-semibold">Synced</span>}
          {syncStatus === 'offline' && <span className="text-[9px] text-amber-400 font-semibold">Offline</span>}
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition">
            <Clock className="w-3 h-3" />
            {showHistory ? 'Hide' : 'History'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {goalKeys.map(({ key, label, icon: Icon, unit }) => {
          const goal = goals[key];
          let current = 0;
          let displayValue = '';
          let progress = 0;
          const todayWCal = key === 'calories' ? workoutHistory.filter(w => w.date === getTodayKey()).reduce((s, w) => s + (w.totalCalories || 0), 0) : 0;

          if (key === 'water') {
            current = todaySafe.water.total;
            displayValue = `${formatNumber(current)} / ${formatNumber(goal)} ml`;
            progress = Math.min(current / goal, 1);
          } else if (key === 'steps') {
            current = todaySafe.steps.count;
            displayValue = `${formatNumber(current)} / ${formatNumber(goal)}`;
            progress = Math.min(current / goal, 1);
          } else if (key === 'sleep') {
            current = todaySafe.sleep.duration + (todaySafe.sleep.start && !todaySafe.sleep.end ? Math.round(sleepElapsed * 10) / 10 : 0);
            displayValue = `${formatDuration(current)} / ${formatDuration(goal)}`;
            progress = Math.min(current / goal, 1);
          } else if (key === 'calories') {
            const fromSteps = Math.round(todaySafe.steps.count * 0.04);
            current = todayWCal + fromSteps;
            displayValue = `${formatNumber(current)} / ${formatNumber(goal)} cal`;
            progress = Math.min(current / goal, 1);
          }

          return (
            <div key={key} className="bg-sl-gray/20 rounded-xl p-3 border border-sl-purple/10">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-sl-purple-light" />
                  <span className="text-xs font-bold text-white">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {editingGoal === key ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={goalInput} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setGoalInput(v); }}
                        className="w-16 h-6 bg-sl-gray/40 border border-sl-purple/20 rounded-lg text-xs text-white text-center px-1 focus:outline-none focus:border-sl-purple/50 focus:bg-sl-gray/50 transition"
                        min="0" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveGoal(); if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                      <button onClick={saveGoal} className="text-emerald-400 hover:text-emerald-300"><Check className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => startEditGoal(key)} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-sl-purple-light/40 hover:text-sl-purple-light transition">
                      <Edit2 className="w-2.5 h-2.5" />
                      {formatNumber(goal)}{unit === 'ml' ? 'ml' : unit === 'cal' ? 'cal' : unit === 'h' ? 'h' : ''}
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full h-1.5 bg-sl-gray/40 rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(progress * 100, 100)}%`,
                    background: key === 'calories' ? 'linear-gradient(90deg, #f59e0b, #ef4444)' :
                                key === 'water' ? 'linear-gradient(90deg, #3b82f6, #06b6d4)' :
                                key === 'steps' ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' :
                                'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-sl-purple-light/60 font-semibold">{displayValue}</span>
                <div className="flex items-center gap-1.5">
                  {key === 'water' && (
                    <>
                      {[250, 500].map((amt) => (
                        <button key={amt} onClick={() => addWater(amt)}
                          className="text-[9px] font-bold bg-sl-purple/10 border border-sl-purple/20 px-1.5 py-0.5 rounded-md text-sl-purple-light hover:bg-sl-purple/20 transition">
                          +{amt}
                        </button>
                      ))}
                      <form onSubmit={handleCustomWater} className="flex items-center gap-1">
                        <input type="number" value={waterInput} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setWaterInput(v); }}
                          placeholder="ml" className="w-12 h-5 bg-sl-gray/40 border border-sl-purple/15 rounded text-[9px] text-white text-center px-0.5 focus:outline-none focus:border-sl-purple/50 focus:bg-sl-gray/50 transition" min="0" />
                        <button type="submit" className="text-emerald-400 hover:text-emerald-300"><Plus className="w-3 h-3" /></button>
                      </form>
                    </>
                  )}
                  {key === 'steps' && (
                    <>
                      <input type="number" value={todaySafe.steps.count} onChange={updateSteps}
                        className="w-16 h-5 bg-sl-gray/40 border border-sl-purple/15 rounded text-[9px] text-white text-center px-0.5 focus:outline-none focus:border-sl-purple/50 focus:bg-sl-gray/50 transition" min="0" />
                      <button onClick={togglePedometer}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition ${
                          pedometerActive
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : 'bg-sl-purple/10 border-sl-purple/20 text-sl-purple-light hover:bg-sl-purple/20'
                        }`}>
                        {pedometerActive ? 'ON' : 'Auto'}
                      </button>
                    </>
                  )}
                  {key === 'sleep' && (
                    !todaySafe.sleep.start || todaySafe.sleep.end ? (
                      <button onClick={startSleep}
                        className="flex items-center gap-1 text-[9px] font-bold bg-sl-purple/10 border border-sl-purple/20 px-1.5 py-0.5 rounded-md text-sl-purple-light hover:bg-sl-purple/20 transition">
                        <Play className="w-2.5 h-2.5" /> Start
                      </button>
                    ) : (
                      <button onClick={stopSleep}
                        className="flex items-center gap-1 text-[9px] font-bold bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded-md text-red-400 hover:bg-red-500/30 transition">
                        <Square className="w-2.5 h-2.5" /> Stop
                      </button>
                    )
                  )}
                  {key === 'calories' && (
                    <span className="text-[9px] text-sl-gray-light font-semibold">{todayWCal > 0 ? `${todayWCal} cal` : ''}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {todaySafe.sleep.start && !todaySafe.sleep.end && (
        <div className="mt-3 text-center animate-pulse">
          <span className="text-[10px] font-bold text-emerald-400">
            Sleep tracking active: {formatDuration(sleepElapsed)}
          </span>
        </div>
      )}

      {showHistory && (
        <div className="mt-4 pt-3 border-t border-sl-purple/15 animate-fade-slide">
          <h3 className="text-[11px] font-bold text-sl-purple-light/60 uppercase tracking-wider mb-2">Past Days</h3>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {pastDays.length === 0 && (
              <p className="text-center py-4 text-sl-purple-light/30 text-[10px]">No history yet.</p>
            )}
            {pastDays.map(([date, dayData]) => {
              const fromSteps = Math.round((dayData.steps?.count || 0) * 0.04);
              const calTotal = dayData.calories?.total || fromSteps;
              return (
                <div key={date} className="flex items-center justify-between p-2 bg-sl-gray/15 rounded-lg border border-sl-purple/10">
                  <span className="text-[10px] font-semibold text-white">{date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-blue-400">{dayData.water?.total || 0}ml</span>
                    <span className="text-[9px] text-purple-400">{(dayData.steps?.count || 0).toLocaleString()}</span>
                    <span className="text-[9px] text-indigo-400">{formatDuration(dayData.sleep?.duration || 0)}</span>
                    <span className="text-[9px] text-orange-400">{calTotal}cal</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyGoals;
