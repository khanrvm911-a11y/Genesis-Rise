import { useState, useEffect } from 'react';
import { useLevel } from '../context/LevelContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SYSTEM_MissionS = [
  {
    id: 'sys_daily_Mission',
    name: 'Daily Mission: Preparations for Becoming Strong',
    description: 'The standard Mission assigned by the System. Failure to complete results in a Penalty Mission.',
    rank: 'Novice',
    exercises: [
      { name: 'Push-ups', sets: 10, reps: 10, type: 'reps' },
      { name: 'Sit-ups', sets: 10, reps: 10, type: 'reps' },
      { name: 'Squats', sets: 10, reps: 10, type: 'reps' },
      { name: 'Running', sets: 1, reps: 10, type: 'mins' }
    ],
    xpReward: 150
  },
  {
    id: 'sys_shadow_march',
    name: 'Shadow Army Marching',
    description: 'Train alongside your shadows to build extreme muscular endurance.',
    rank: 'Warrior',
    exercises: [
      { name: 'Pull-ups', sets: 5, reps: 10, type: 'reps' },
      { name: 'Push-ups', sets: 5, reps: 20, type: 'reps' },
      { name: 'Squats', sets: 5, reps: 30, type: 'reps' },
      { name: 'Cardio Run', sets: 1, reps: 20, type: 'mins' }
    ],
    xpReward: 350
  },
  {
    id: 'sys_monarch_trial',
    name: "Monarch's Strength Trial",
    description: 'A brutal regimen that pushes human limits. Only those who stand at the pinnacle can survive.',
    rank: 'Genesis',
    exercises: [
      { name: 'Weighted Pull-ups', sets: 5, reps: 12, type: 'reps' },
      { name: 'Decline Push-ups', sets: 8, reps: 25, type: 'reps' },
      { name: 'Pistol Squats', sets: 5, reps: 15, type: 'reps' },
      { name: 'Stair Climb / Sprint', sets: 1, reps: 40, type: 'mins' }
    ],
    xpReward: 800
  }
];

const Planner = () => {
  const { addXP } = useLevel();

  // Load schedule and custom plans
  const [customPlans] = useState(() => {
    const savedCustom = localStorage.getItem('sl_custom_plans');
    return savedCustom ? JSON.parse(savedCustom) : [];
  });
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('sl_workout_schedule');
    return saved ? JSON.parse(saved) : {};
  });

  // Active day selection for modal assignment
  const [activeDay, setActiveDay] = useState(null);
  // Track checklist progress for today's active Mission
  const [todayProgress, setTodayProgress] = useState({});
  const [MissionCompleted, setMissionCompleted] = useState(false);

  // Save schedule when it changes
  useEffect(() => {
    localStorage.setItem('sl_workout_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Determine current day of the week
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Get active plan for a specific day
  const getPlanForDay = (day) => {
    const planId = schedule[day];
    if (!planId) return null;

    // Check system Missions first
    const sysMission = SYSTEM_MissionS.find(q => q.id === planId);
    if (sysMission) return sysMission;

    // Check custom plans
    const customPlan = customPlans.find(p => p.id === planId);
    if (customPlan) return customPlan;

    return null;
  };

  const todayPlan = getPlanForDay(todayName);
  const todayPlanId = todayPlan ? todayPlan.id : null;

  // Adjust progress and completion state when the active plan changes
  useEffect(() => {
    const initialProgress = {};
    if (todayPlan) {
      todayPlan.exercises.forEach((ex, idx) => {
        initialProgress[idx] = false;
      });
    }
    const timer = setTimeout(() => {
      setTodayProgress(initialProgress);
      setMissionCompleted(false);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayPlanId]);

  const handleAssignPlan = (day, planId) => {
    setSchedule(prev => ({
      ...prev,
      [day]: planId
    }));
    setActiveDay(null);
  };

  const handleRemovePlan = (day) => {
    setSchedule(prev => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });
  };

  const toggleExerciseCheck = (idx) => {
    setTodayProgress(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleCompleteMission = () => {
    if (!todayPlan) return;

    // Verify everything is checked off
    const allChecked = Object.values(todayProgress).every(val => val === true);
    if (!allChecked) {
      alert('You must complete all tasks assigned in the active Daily Mission!');
      return;
    }

    // Determine XP reward
    const xpReward = todayPlan.xpReward
      ? todayPlan.xpReward
      : Math.floor((todayPlan.exercises.length * 20) * ({ Novice: 1.0, Rookie: 1.2, Warrior: 1.5, Champion: 2.0, Master: 3.0, Grandmaster: 5.0, Legend: 8.0, Genesis: 10.0 }[todayPlan.rank] || 1.0));

    // Award XP
    addXP(xpReward);

    // Save workout to log list
    const loggedWorkout = {
      id: Date.now(),
      name: todayPlan.name,
      duration: todayPlan.exercises.reduce((acc, ex) => acc + (ex.type === 'mins' ? ex.reps : 5), 15), // estimate duration
      calories: todayPlan.exercises.length * 50, // estimate calories
      date: new Date().toISOString().split('T')[0]
    };

    const storedWorkouts = localStorage.getItem('workouts');
    const workoutsList = storedWorkouts ? JSON.parse(storedWorkouts) : [];
    workoutsList.push(loggedWorkout);
    localStorage.setItem('workouts', JSON.stringify(workoutsList));

    setMissionCompleted(true);
    alert(`Mission Completed! Gained ${xpReward} XP. Check your level status!`);
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 'Genesis': return { border: 'border-red-600', text: 'text-red-500', bg: 'bg-red-950/20' };
      case 'Legend': return { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-950/20' };
      case 'Grandmaster': return { border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-950/20' };
      case 'Master': return { border: 'border-blue-500', text: 'text-blue-400', bg: 'bg-blue-950/20' };
      case 'Champion': return { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/20' };
      default: return { border: 'border-gray-500', text: 'text-gray-400', bg: 'bg-gray-950/10' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center gradient-text animate-pulse-red mb-2">
          Daily Mission Planner
        </h1>
        <p className="text-center text-sl-gray-light max-w-2xl mx-auto">
          Establish your weekly training trials. The System rewards those who show absolute devotion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Weekly Schedule Grid */}
        <div className="lg:col-span-2 bg-sl-gray/20 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-red/20 shadow-sl-glow">
          <h2 className="text-2xl font-bold text-sl-red-light mb-6 border-b border-sl-red/15 pb-2">
            Weekly Trial Board
          </h2>

          <div className="space-y-4">
            {DAYS.map(day => {
              const plan = getPlanForDay(day);
              const isToday = day === todayName;
              return (
                <div
                  key={day}
                  className={`p-4 rounded-sl-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${
                    isToday
                      ? 'border-sl-red/50 bg-sl-red/5 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                      : 'border-sl-red/10 bg-sl-gray/10 hover:bg-sl-gray/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-28">
                      <span className={`font-bold text-lg ${isToday ? 'text-sl-red-light' : 'text-white'}`}>
                        {day}
                      </span>
                      {isToday && (
                        <span className="block text-[10px] text-sl-red-light font-bold uppercase tracking-wider">
                          [Today's Target]
                        </span>
                      )}
                    </div>

                    {plan ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getRankStyle(plan.rank).border} ${getRankStyle(plan.rank).text} ${getRankStyle(plan.rank).bg}`}>
                          {plan.rank}
                        </span>
                        <span className="text-sm font-semibold text-sl-gray-light/95">{plan.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-sl-gray-light/45 italic">No Mission assigned</span>
                    )}
                  </div>

                  <div className="flex gap-2 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => setActiveDay(day)}
                      className="bg-sl-red/10 hover:bg-sl-red/25 text-sl-red-light border border-sl-red/20 px-3 py-1.5 rounded-sl-lg text-xs font-semibold transition"
                    >
                      {plan ? 'Reassign' : 'Assign Mission'}
                    </button>
                    {plan && (
                      <button
                        onClick={() => handleRemovePlan(day)}
                        className="text-red-500 hover:text-red-400 p-1.5 rounded-lg border border-transparent hover:border-red-500/10 transition"
                        title="Remove Mission"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Active Trial Dashboard */}
        <div className="bg-sl-gray/20 backdrop-blur-sm p-6 rounded-sl-xl border border-sl-red/20 shadow-sl-glow flex flex-col">
          <h2 className="text-2xl font-bold text-sl-red-light mb-6 border-b border-sl-red/15 pb-2">
            Active System Trial
          </h2>

          {!todayPlan ? (
            <div className="flex flex-col items-center justify-center flex-grow text-center py-12">
              <div className="w-16 h-16 bg-sl-red/5 rounded-full flex items-center justify-center border border-sl-red/20 animate-pulse mb-4">
                <svg className="w-8 h-8 text-sl-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sl-gray-light font-medium">No Mission Scheduled for Today!</p>
              <p className="text-xs text-sl-gray-light/50 mt-1 max-w-xs">
                To trigger the level progression system, assign a Daily Mission to {todayName} in the Trial Board.
              </p>
            </div>
          ) : MissionCompleted ? (
            <div className="flex flex-col items-center justify-center flex-grow text-center py-12">
              <div className="w-16 h-16 bg-emerald-950/20 rounded-full flex items-center justify-center border border-emerald-500/30 mb-4 animate-bounce">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-emerald-400 font-bold text-lg">Daily Mission CLEARED!</p>
              <p className="text-xs text-sl-gray-light/60 mt-1">
                You have finished today's training session. Relax and recover for tomorrow's Mission.
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getRankStyle(todayPlan.rank).border} ${getRankStyle(todayPlan.rank).text} ${getRankStyle(todayPlan.rank).bg}`}>
                    {todayPlan.rank}-Rank
                  </span>
                  <h3 className="font-semibold text-white text-lg">{todayPlan.name}</h3>
                </div>
                <p className="text-xs text-sl-gray-light/75 mb-6 italic">{todayPlan.description}</p>

                <div className="space-y-3">
                  {todayPlan.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleExerciseCheck(idx)}
                      className={`p-3 rounded-sl-lg border cursor-pointer flex items-center justify-between transition ${
                        todayProgress[idx]
                          ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-sl-gray/10 border-sl-red/10 hover:bg-sl-gray/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          todayProgress[idx] ? 'border-emerald-400 bg-emerald-500/10' : 'border-sl-red/30'
                        }`}>
                          {todayProgress[idx] && (
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${todayProgress[idx] ? 'line-through opacity-60' : 'text-white'}`}>
                          {ex.name}
                        </span>
                      </div>
                      <span className="text-xs text-sl-gray-light/80 font-bold bg-sl-gray/20 px-2 py-0.5 rounded border border-sl-red/5">
                        {ex.sets}x{ex.reps} {ex.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleCompleteMission}
                  className="holo-button w-full py-3 text-center"
                >
                  Verify Mission Completion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mission Selection Modal */}
      {activeDay && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-sl-dark border border-sl-red/30 p-6 rounded-sl-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-sl-glow-red">
            <h3 className="text-2xl font-bold text-sl-red-light mb-4 border-b border-sl-red/25 pb-2">
              Select Mission for {activeDay}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-sl-red/60 uppercase tracking-widest font-bold mb-2">System Missions</p>
                <div className="space-y-2">
                  {SYSTEM_MissionS.map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleAssignPlan(activeDay, q.id)}
                      className="w-full text-left p-3 rounded-sl-lg border border-sl-red/10 bg-sl-gray/10 hover:bg-sl-red/5 hover:border-sl-red/30 transition flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded border border-sl-red/20 text-sl-red-light bg-sl-red/10">
                            {q.rank}-Rank
                          </span>
                          <span className="text-sm font-semibold text-white">{q.name}</span>
                        </div>
                        <p className="text-xs text-sl-gray-light/70 mt-1 max-w-sm line-clamp-1">{q.description}</p>
                      </div>
                      <span className="text-xs font-bold text-sl-red-light">{q.xpReward} XP</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-sl-red/60 uppercase tracking-widest font-bold mb-2">Custom Regimens</p>
                {customPlans.length === 0 ? (
                  <p className="text-xs text-sl-gray-light/45 italic py-2">No custom plans created. Visit Plan Designer to build some.</p>
                ) : (
                  <div className="space-y-2">
                    {customPlans.map(q => (
                      <button
                        key={q.id}
                        onClick={() => handleAssignPlan(activeDay, q.id)}
                        className="w-full text-left p-3 rounded-sl-lg border border-sl-red/10 bg-sl-gray/10 hover:bg-sl-red/5 hover:border-sl-red/30 transition flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded border border-sl-gray-light/20 text-sl-gray-light bg-sl-gray/20">
                              {q.rank}-Rank
                            </span>
                            <span className="text-sm font-semibold text-white">{q.name}</span>
                          </div>
                          <p className="text-xs text-sl-gray-light/70 mt-1 max-w-sm line-clamp-1">{q.description}</p>
                        </div>
                        <span className="text-xs font-bold text-sl-gray-light/60">Custom XP</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveDay(null)}
                className="bg-sl-gray/30 hover:bg-sl-gray/40 text-sl-gray-light px-4 py-2 rounded-sl-lg text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;