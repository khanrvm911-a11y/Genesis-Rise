import { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  ArrowLeft, Zap, Flame, Dumbbell, Clock, Trophy, Target, TrendingUp,
  Calendar, Activity, Weight, Sparkles, Medal, Gauge, Heart, Award,
} from 'lucide-react';
import { getWorkoutStats } from '../../utils/workoutUtils';
import MuscleRecovery from './MuscleRecovery';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

const MUSCLE_COLORS = ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];



function Skeleton({ className }) {
  return <div className={`bg-sl-gray/20 rounded-xl animate-pulse ${className || ''}`} />;
}

function EmptyState({ icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-sl-gray/20 flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold text-white mb-1">{title}</p>
      <p className="text-xs text-sl-gray-light max-w-[220px]">{message}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent, color }) {
  return (
    <div className="mobile-card p-3.5 group hover:bg-sl-gray/25 transition-colors cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold mb-0.5">{label}</p>
          <p className={`text-xl font-bold truncate ${color || 'text-white'}`}>{value}</p>
          {sub && <p className="text-[10px] text-sl-gray-light mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent || 'bg-sl-purple/15'}`}>
            <Icon className={`w-4 h-4 ${color || 'text-sl-purple-light'}`} />
          </div>
        )}
      </div>
    </div>
  );
}

const chartBase = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1035',
      titleColor: '#c084fc',
      bodyColor: '#fff',
      borderColor: 'rgba(139,92,246,0.3)',
      borderWidth: 1,
      padding: 10,
      boxPadding: 4,
    },
  },
  scales: {
    x: {
      ticks: { color: '#6b7280', font: { size: 10, family: 'Inter' }, maxTicksLimit: 10 },
      grid: { color: 'rgba(139,92,246,0.06)', display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#6b7280', font: { size: 9, family: 'Inter' } },
      grid: { color: 'rgba(139,92,246,0.08)' },
    },
  },
};

export default function AnalyticsDashboard({
  workoutHistory, personalRecords, userSettings,
  missionProgress,
  level, xp, title, progress, powerLevel,
  onBack,
}) {
  const [chartTab, setChartTab] = useState('workouts');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 200); return () => clearTimeout(t); }, []);

  const stats = useMemo(() => getWorkoutStats(workoutHistory), [workoutHistory]);
  const filteredWorkouts = workoutHistory;

  const hasData = workoutHistory.length > 0;
  const hasFilteredData = filteredWorkouts.length > 0;

  const weeklyGoal = missionProgress?.weekly || {};
  const goalWorkouts = missionProgress?.goalWorkouts || 5;
  const goalXP = missionProgress?.goalXP || 1000;
  const goalCalories = missionProgress?.goalCalories || 2000;
  const goalDuration = missionProgress?.goalDuration || 300;

  const weeklyWorkoutPct = Math.min(1, (weeklyGoal.workoutsCompleted || 0) / goalWorkouts);
  const monthlyXP = filteredWorkouts.reduce((s, w) => s + (w.xpGained || 0), 0);
  const monthlyXPPct = Math.min(1, monthlyXP / goalXP);
  const filteredCalories = filteredWorkouts.reduce((s, w) => s + (w.totalCalories || w.calories || 0), 0);
  const caloriePct = Math.min(1, filteredCalories / goalCalories);
  const filteredDuration = filteredWorkouts.reduce((s, w) => s + (w.duration || 0), 0);
  const durationPct = Math.min(1, filteredDuration / goalDuration);

  const totalWorkoutDays = useMemo(() => {
    const days = new Set();
    workoutHistory.forEach(w => days.add(w.date || w.timestamp?.slice(0, 10)));
    return days.size;
  }, [workoutHistory]);

  const missedDays = useMemo(() => {
    if (workoutHistory.length === 0) return 0;
    const dates = [...new Set(workoutHistory.map(w => w.date || w.timestamp?.slice(0, 10)))].sort();
    if (dates.length < 2) return 0;
    let missed = 0;
    for (let i = 0; i < dates.length - 1; i++) {
      const d1 = new Date(dates[i]);
      const d2 = new Date(dates[i + 1]);
      const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
      if (diff > 1 && diff < 14) missed += diff - 1;
    }
    return missed;
  }, [workoutHistory]);

  const avgWeeklySessions = useMemo(() => {
    if (workoutHistory.length === 0) return 0;
    const first = new Date(workoutHistory[workoutHistory.length - 1]?.timestamp || Date.now());
    const weeks = Math.max(1, (Date.now() - first.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return (totalWorkoutDays / weeks).toFixed(1);
  }, [workoutHistory, totalWorkoutDays]);

  const completionRate = useMemo(() => {
    if (workoutHistory.length === 0) return 0;
    const { currentStreak, longestStreak } = stats;
    return Math.min(100, Math.round((currentStreak / Math.max(longestStreak, 1)) * 100));
  }, [workoutHistory, stats]);

  const weeklyChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    filteredWorkouts.forEach(w => {
      const d = new Date(w.timestamp || w.date);
      if (d >= weekStart) counts[d.getDay()]++;
    });
    return { labels: days, data: counts };
  }, [filteredWorkouts]);

  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const counts = Array(12).fill(0);
    filteredWorkouts.forEach(w => {
      const d = new Date(w.timestamp || w.date);
      if (d >= yearStart) counts[d.getMonth()]++;
    });
    return { labels: months, data: counts };
  }, [filteredWorkouts]);

  const yearlyChartData = useMemo(() => {
    const now = new Date();
    const fiveYearsAgo = new Date(now.getFullYear() - 5, 0, 1);
    const years = {};
    for (let y = fiveYearsAgo.getFullYear(); y <= now.getFullYear(); y++) years[y] = 0;
    filteredWorkouts.forEach(w => {
      const y = new Date(w.timestamp || w.date).getFullYear();
      if (years[y] !== undefined) years[y]++;
    });
    return { labels: Object.keys(years), data: Object.values(years) };
  }, [filteredWorkouts]);

  const xpChartData = useMemo(() => {
    const byDate = {};
    filteredWorkouts.forEach(w => {
      const key = (w.date || w.timestamp?.slice(0, 10));
      if (key) byDate[key] = (byDate[key] || 0) + (w.xpGained || 0);
    });
    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
    return { labels: sorted.map(([d]) => d.slice(5)), data: sorted.map(([, v]) => v) };
  }, [filteredWorkouts]);

  const caloriesChartData = useMemo(() => {
    const byDate = {};
    filteredWorkouts.forEach(w => {
      const key = (w.date || w.timestamp?.slice(0, 10));
      if (key) byDate[key] = (byDate[key] || 0) + (w.totalCalories || w.calories || 0);
    });
    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
    const avg = sorted.length > 0 ? sorted.reduce((s, [, v]) => s + v, 0) / sorted.length : 0;
    return { labels: sorted.map(([d]) => d.slice(5)), data: sorted.map(([, v]) => v), avg: Math.round(avg) };
  }, [filteredWorkouts]);

  const durationChartData = useMemo(() => {
    const byDate = {};
    filteredWorkouts.forEach(w => {
      const key = (w.date || w.timestamp?.slice(0, 10));
      if (key) byDate[key] = Math.max(byDate[key] || 0, w.duration || 0);
    });
    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
    return { labels: sorted.map(([d]) => d.slice(5)), data: sorted.map(([, v]) => v) };
  }, [filteredWorkouts]);

  const weightChartData = useMemo(() => {
    if (!workoutHistory || workoutHistory.length === 0) return null;
    const entries = [];
    workoutHistory.forEach(w => {
      if (w.bodyWeight && w.bodyWeight > 0) {
        entries.push({ date: w.date || w.timestamp?.slice(0, 10), weight: w.bodyWeight });
      }
    });
    const byDate = {};
    entries.forEach(e => { byDate[e.date] = e.weight; });
    const sorted = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
    if (sorted.length === 0) return null;
    return { labels: sorted.map(([d]) => d.slice(5)), data: sorted.map(([, v]) => v) };
  }, [workoutHistory]);

  const muscleDistribution = useMemo(() => {
    const dist = {};
    MUSCLE_GROUPS.forEach(g => dist[g] = 0);
    let total = 0;
    filteredWorkouts.forEach(w => {
      if (w.exercises) {
        w.exercises.forEach(ex => {
          const group = ex.exerciseData?.muscleGroup || 'Other';
          dist[group] = (dist[group] || 0) + 1;
          total++;
        });
      }
    });
    const labels = Object.entries(dist).filter(([, v]) => v > 0).map(([k]) => k);
    const data = Object.entries(dist).filter(([, v]) => v > 0).map(([, v]) => v);
    return { labels, data, total };
  }, [filteredWorkouts]);

  const bestExercises = useMemo(() => {
    const vols = {};
    workoutHistory.forEach(w => {
      if (w.exercises) {
        w.exercises.forEach(ex => {
          const name = ex.exerciseData?.name || ex.exerciseId || 'Unknown';
          const vol = (ex.sets || []).reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0);
          vols[name] = (vols[name] || 0) + vol;
        });
      }
    });
    return Object.entries(vols).sort(([, a], [, b]) => b - a).slice(0, 5);
  }, [workoutHistory]);

  const newestPR = useMemo(() => {
    let newest = null;
    let newestDate = '';
    if (personalRecords) {
      Object.entries(personalRecords).forEach(([id, rec]) => {
        if (rec.best?.weight && rec.best?.weightDate) {
          if (!newest || rec.best.weightDate > newestDate) {
            newestDate = rec.best.weightDate;
            newest = { id, name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: rec.best.weight, unit: 'kg' };
          }
        }
        if (rec.best?.reps && rec.best?.repsDate) {
          if (!newest || rec.best.repsDate > newestDate) {
            newestDate = rec.best.repsDate;
            newest = { id, name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: rec.best.reps, unit: 'reps' };
          }
        }
      });
    }
    return newest;
  }, [personalRecords]);

  const highestWeight = useMemo(() => {
    let highest = null;
    if (personalRecords) {
      Object.entries(personalRecords).forEach(([id, rec]) => {
        if (rec.best?.weight && (!highest || rec.best.weight > highest.value)) {
          highest = { id, name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), value: rec.best.weight, unit: 'kg' };
        }
      });
    }
    return highest;
  }, [personalRecords]);

  const longestWorkout = useMemo(() => {
    let max = 0;
    workoutHistory.forEach(w => { if ((w.duration || 0) > max) max = w.duration; });
    return max;
  }, [workoutHistory]);

  const mostExercises = useMemo(() => {
    let max = 0;
    workoutHistory.forEach(w => { if ((w.exercises?.length || 0) > max) max = w.exercises.length; });
    return max;
  }, [workoutHistory]);

  const fastestWorkout = useMemo(() => {
    let min = Infinity;
    workoutHistory.forEach(w => { if ((w.duration || 0) > 0 && w.duration < min) min = w.duration; });
    return min === Infinity ? 0 : min;
  }, [workoutHistory]);

  const weeklySummary = useMemo(() => {
    if (filteredWorkouts.length === 0) return null;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekWorkouts = filteredWorkouts.filter(w => new Date(w.timestamp || w.date) >= weekStart);
    if (weekWorkouts.length === 0) return null;

    const count = weekWorkouts.length;
    const weekXP = weekWorkouts.reduce((s, w) => s + (w.xpGained || 0), 0);
    const muscleSet = new Set();
    weekWorkouts.forEach(w => {
      if (w.exercises) w.exercises.forEach(ex => {
        const g = ex.exerciseData?.muscleGroup;
        if (g) muscleSet.add(g);
      });
    });

    const priorWeek = new Date(weekStart);
    priorWeek.setDate(priorWeek.getDate() - 7);
    const priorCount = filteredWorkouts.filter(w => {
      const d = new Date(w.timestamp || w.date);
      return d >= priorWeek && d < weekStart;
    }).length;

    let changeStr = '';
    if (priorCount > 0) {
      const diff = Math.round(((count - priorCount) / priorCount) * 100);
      changeStr = diff >= 0 ? `+${diff}%` : `${diff}%`;
    }

    let summary = '';
    if (count === 1) {
      summary = `This week you completed ${count} workout, earned ${weekXP} XP, and trained ${muscleSet.size} muscle group${muscleSet.size > 1 ? 's' : ''}.`;
    } else {
      summary = `This week you completed ${count} workouts, earned ${weekXP} XP, and trained ${muscleSet.size} muscle groups.`;
    }
    if (changeStr) {
      summary += ` Your consistency ${changeStr.startsWith('+') ? 'improved' : 'changed'} by ${changeStr} vs last week.`;
    }

    return summary;
  }, [filteredWorkouts]);

  const prCount = useMemo(() => {
    if (!personalRecords) return 0;
    return Object.values(personalRecords).filter(r => r?.best && Object.values(r.best).some(v => v > 0)).length;
  }, [personalRecords]);

  if (!loaded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-16 h-6" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sl-purple-light hover:text-white text-sm touch-target">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="mobile-card text-center py-12">
          <div className="w-16 h-16 rounded-full bg-sl-purple/10 flex items-center justify-center mx-auto mb-4 border border-sl-purple/30">
            <Activity className="w-8 h-8 text-sl-purple-light" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Your Analytics Hub</h3>
          <p className="text-sm text-sl-gray-light mb-6 max-w-xs mx-auto leading-relaxed">
            Complete your first workout to unlock detailed analytics, progress charts, and personalized insights.
          </p>
          <button onClick={onBack} className="holo-button holo-button-primary px-6 py-3 text-sm">
            Start Your Journey
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['Track Progress', 'View Stats', 'Set Goals', 'Earn Badges'].map((tip, i) => (
            <div key={i} className="mobile-card text-center p-4 opacity-50">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">{tip}</p>
              <p className="text-xs text-sl-gray-light mt-1">Unlock with first workout</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between sticky top-0 bg-sl-gradient z-10 py-2 -mx-4 px-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sl-purple-light hover:text-white text-sm touch-target transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Award} label="Level" value={`${level} ${title}`} sub={`${Math.round(progress * 100)}% to next`} color="gradient-text" accent="bg-yellow-500/15" />
        <StatCard icon={Zap} label="Total XP" value={xp.toLocaleString()} sub={`${workoutHistory.reduce((s,w) => s+(w.xpGained||0), 0).toLocaleString()} earned`} color="text-yellow-400" accent="bg-yellow-500/15" />
        <StatCard icon={Heart} label="Streak" value={`${stats.currentStreak} days`} sub={`Best: ${stats.longestStreak} days`} color="text-sl-red-light" accent="bg-sl-red/15" />
        <StatCard icon={Dumbbell} label="Workouts" value={stats.totalWorkouts} sub={`All time`} color="text-emerald-400" accent="bg-emerald-500/15" />
        <StatCard icon={Clock} label="Total Time" value={`${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m`} sub={`Avg ${stats.averageDuration} min`} color="text-blue-400" accent="bg-blue-500/15" />
        <StatCard icon={Flame} label="Calories" value={stats.totalCalories.toLocaleString()} sub={`All time`} color="text-sl-red-light" accent="bg-sl-red/15" />
        {userSettings?.weight > 0 && (
          <StatCard icon={Weight} label="Weight" value={`${userSettings.weight} kg`} sub="Current" color="text-sl-purple-light" accent="bg-sl-purple/15" />
        )}
        <StatCard icon={Gauge} label="Power Level" value={powerLevel || 0} sub={`${prCount} PRs set`} color="text-sl-red-light" accent="bg-sl-red/15" />
      </div>

      {hasFilteredData && (
        <div className="mobile-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white">Workout Activity</h3>
            <div className="flex gap-1">
              {['workouts', 'xp', 'calories', 'duration'].map(tab => (
                <button key={tab} onClick={() => setChartTab(tab)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    chartTab === tab ? 'bg-sl-purple/30 text-sl-purple-light' : 'text-sl-gray-light hover:text-white'
                  }`}
                >
                  {tab === 'workouts' ? 'Workouts' : tab === 'xp' ? 'XP' : tab === 'calories' ? 'Calories' : 'Duration'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-44">
            {chartTab === 'workouts' && (
              <Bar data={{
                labels: monthlyChartData.labels,
                datasets: [{
                  label: 'Workouts',
                  data: monthlyChartData.data,
                  backgroundColor: 'rgba(139, 92, 246, 0.5)',
                  borderColor: '#8b5cf6',
                  borderWidth: 1,
                  borderRadius: 4,
                }]
              }} options={{ ...chartBase, plugins: { ...chartBase.plugins, legend: { display: false } } }} />
            )}
            {chartTab === 'xp' && xpChartData.labels.length > 0 && (
              <Line data={{
                labels: xpChartData.labels,
                datasets: [{
                  label: 'XP',
                  data: xpChartData.data,
                  borderColor: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 5,
                }]
              }} options={chartBase} />
            )}
            {chartTab === 'calories' && caloriesChartData.labels.length > 0 && (
              <>
                <Bar data={{
                  labels: caloriesChartData.labels,
                  datasets: [{
                    label: 'Calories',
                    data: caloriesChartData.data,
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 3,
                  }, {
                    label: 'Avg',
                    data: Array(caloriesChartData.labels.length).fill(caloriesChartData.avg),
                    type: 'line',
                    borderColor: '#fbbf24',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    pointRadius: 0,
                    fill: false,
                  }]
                }} options={{ ...chartBase, plugins: { ...chartBase.plugins, legend: { display: false } } }} />
                <p className="text-[10px] text-sl-gray-light text-center mt-1">Avg {caloriesChartData.avg} cal per session</p>
              </>
            )}
            {chartTab === 'duration' && durationChartData.labels.length > 0 && (
              <Line data={{
                labels: durationChartData.labels,
                datasets: [{
                  label: 'Duration (min)',
                  data: durationChartData.data,
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 5,
                }]
              }} options={chartBase} />
            )}
            {(chartTab === 'xp' && xpChartData.labels.length === 0) ||
             (chartTab === 'calories' && caloriesChartData.labels.length === 0) ||
             (chartTab === 'duration' && durationChartData.labels.length === 0) ? (
              <EmptyState icon={<Activity className="w-5 h-5 text-sl-gray-light" />}
                title="No data in this period" message="Complete more workouts to see charts populate." />
            ) : null}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mobile-card">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-sl-purple-light" /> Muscle Distribution
          </h3>
          <div className="h-44">
            {muscleDistribution.total > 0 ? (
              <Doughnut data={{
                labels: muscleDistribution.labels,
                datasets: [{
                  data: muscleDistribution.data,
                  backgroundColor: MUSCLE_COLORS,
                  borderColor: '#090214',
                  borderWidth: 2,
                }]
              }} options={{
                responsive: true, maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#a78bfa', font: { size: 9, family: 'Inter' }, padding: 6, boxWidth: 10 },
                  },
                  tooltip: chartBase.plugins.tooltip,
                },
              }} />
            ) : (
              <EmptyState icon={<Target className="w-5 h-5 text-sl-gray-light" />}
                title="No muscle data yet" message="Complete workouts with exercises to see your distribution." />
            )}
          </div>
        </div>

        <div className="mobile-card">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Top Exercises by Volume
          </h3>
          {bestExercises.length > 0 ? (
            <div className="space-y-2">
              {bestExercises.map(([name, vol], i) => {
                const maxVol = bestExercises[0][1];
                const pct = maxVol > 0 ? (vol / maxVol) * 100 : 0;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-white font-medium truncate mr-2">{name}</span>
                      <span className="text-[10px] text-sl-gray-light shrink-0">{(vol / 1000).toFixed(1)}k kg</span>
                    </div>
                    <div className="w-full bg-sl-gray/30 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: MUSCLE_COLORS[i % MUSCLE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={<TrendingUp className="w-5 h-5 text-sl-gray-light" />}
              title="No exercise data" message="Your top lifts will appear here as you train." />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Medal} label="Current Streak" value={`${stats.currentStreak} days`} color="text-emerald-400" accent="bg-emerald-500/15" />
        <StatCard icon={Trophy} label="Best Streak" value={`${stats.longestStreak} days`} color="text-yellow-400" accent="bg-yellow-500/15" />
        <StatCard icon={Activity} label="Rate" value={`${completionRate}%`} sub="Completion" color="text-sl-purple-light" accent="bg-sl-purple/15" />
        <StatCard icon={Calendar} label="Missed" value={`${missedDays} day${missedDays !== 1 ? 's' : ''}`} color={missedDays > 10 ? 'text-sl-red-light' : 'text-sl-gray-light'} accent={missedDays > 10 ? 'bg-sl-red/15' : 'bg-sl-gray/20'} />
        <StatCard icon={Sparkles} label="Avg/Week" value={`${avgWeeklySessions}`} sub="sessions" color="text-blue-400" accent="bg-blue-500/15" />
      </div>

      {hasFilteredData && (
        <div className="mobile-card">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> Personal Records
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="bg-gradient-to-br from-yellow-500/10 to-sl-red/10 border border-yellow-500/20 rounded-xl p-3">
              <p className="text-[9px] text-yellow-400 uppercase tracking-wider font-semibold mb-1">PRs Set</p>
              <p className="text-lg font-bold text-white">{prCount}</p>
            </div>
            <div className={`bg-sl-gray/15 rounded-xl p-3 ${!newestPR ? 'opacity-50' : ''}`}>
              <p className="text-[9px] text-sl-gray-light uppercase tracking-wider font-semibold mb-1">Newest PR</p>
              {newestPR ? (
                <>
                  <p className="text-sm font-bold text-white truncate">{newestPR.name}</p>
                  <p className="text-xs text-yellow-300">{newestPR.value}{newestPR.unit}</p>
                </>
              ) : (
                <p className="text-xs text-sl-gray-light">No PRs yet</p>
              )}
            </div>
            <div className={`bg-sl-gray/15 rounded-xl p-3 ${!highestWeight ? 'opacity-50' : ''}`}>
              <p className="text-[9px] text-sl-gray-light uppercase tracking-wider font-semibold mb-1">Highest Weight</p>
              {highestWeight ? (
                <>
                  <p className="text-sm font-bold text-white truncate">{highestWeight.name}</p>
                  <p className="text-xs text-emerald-400">{highestWeight.value}{highestWeight.unit}</p>
                </>
              ) : (
                <p className="text-xs text-sl-gray-light">No data</p>
              )}
            </div>
            <div className="bg-sl-gray/15 rounded-xl p-3">
              <p className="text-[9px] text-sl-gray-light uppercase tracking-wider font-semibold mb-1">Longest</p>
              <p className="text-lg font-bold text-white">{longestWorkout > 0 ? `${longestWorkout} min` : '—'}</p>
              <p className="text-[9px] text-sl-gray-light">workout</p>
            </div>
            <div className="bg-sl-gray/15 rounded-xl p-3">
              <p className="text-[9px] text-sl-gray-light uppercase tracking-wider font-semibold mb-1">Most Exercises</p>
              <p className="text-lg font-bold text-white">{mostExercises > 0 ? mostExercises : '—'}</p>
              <p className="text-[9px] text-sl-gray-light">in a session</p>
            </div>
          </div>
        </div>
      )}

      {hasFilteredData && (
        <div className="mobile-card">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-sl-purple-light" /> Goal Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-sl-gray-light">Weekly Workouts</span>
                <span className="text-white font-semibold">{weeklyGoal.workoutsCompleted || 0}/{goalWorkouts}</span>
              </div>
              <div className="w-full bg-sl-gray/30 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sl-purple to-sl-red rounded-full transition-all duration-700"
                     style={{ width: `${Math.min(100, weeklyWorkoutPct * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-sl-gray-light">Monthly XP</span>
                <span className="text-white font-semibold">{monthlyXP.toLocaleString()}/{goalXP.toLocaleString()}</span>
              </div>
              <div className="w-full bg-sl-gray/30 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-700"
                     style={{ width: `${Math.min(100, monthlyXPPct * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-sl-gray-light">Calories Burned</span>
                <span className="text-white font-semibold">{filteredCalories.toLocaleString()}/{goalCalories.toLocaleString()}</span>
              </div>
              <div className="w-full bg-sl-gray/30 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sl-red to-orange-400 rounded-full transition-all duration-700"
                     style={{ width: `${Math.min(100, caloriePct * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-sl-gray-light">Workout Duration</span>
                <span className="text-white font-semibold">{filteredDuration} min / {goalDuration} min</span>
              </div>
              <div className="w-full bg-sl-gray/30 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-700"
                     style={{ width: `${Math.min(100, durationPct * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {weightChartData && (
        <div className="mobile-card">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Weight className="w-4 h-4 text-sl-purple-light" /> Weight Progress
          </h3>
          <div className="h-44">
            <Line data={{
              labels: weightChartData.labels,
              datasets: [{
                label: 'Weight (kg)',
                data: weightChartData.data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#8b5cf6',
              }]
            }} options={{
              ...chartBase,
              scales: {
                ...chartBase.scales,
                y: { ...chartBase.scales.y, beginAtZero: false },
              },
            }} />
          </div>
        </div>
      )}

      <MuscleRecovery workoutHistory={workoutHistory} />

      {weeklySummary && (
        <div className="mobile-card bg-gradient-to-br from-sl-purple/10 to-transparent border border-sl-purple/20">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Weekly Summary
          </h3>
          <p className="text-sm text-sl-gray-light leading-relaxed">{weeklySummary}</p>
        </div>
      )}
    </div>
  );
}
