import { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getWorkoutStats, calculateRecoveryPercentage, calculateWeeklyCalories } from '../../utils/workoutUtils';
import MuscleRecovery from './MuscleRecovery';
import AIAnalysis from './AIAnalysis';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#a78bfa', font: { size: 12, family: 'Inter' } } }
  },
  scales: {
    x: { ticks: { color: '#6b7280', font: { size: 11 } }, grid: { color: 'rgba(139,92,246,0.1)' } },
    y: { ticks: { color: '#6b7280', font: { size: 11 } }, grid: { color: 'rgba(139,92,246,0.1)' } }
  }
};

export default function AnalyticsDashboard({ workoutHistory, personalRecords, userSettings, onBack }) {
  const stats = useMemo(() => getWorkoutStats(workoutHistory), [workoutHistory]);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    workoutHistory.forEach(w => {
      const d = new Date(w.timestamp || w.date);
      if (d >= weekStart) {
        counts[d.getDay()]++;
      }
    });

    return { labels: days, data: counts };
  }, [workoutHistory]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    workoutHistory.forEach(w => {
      const d = new Date(w.timestamp || w.date);
      if (d >= yearStart) {
        counts[d.getMonth()]++;
      }
    });

    return { labels: months, data: counts };
  }, [workoutHistory]);

  const muscleDistribution = useMemo(() => {
    const dist = {};
    MUSCLE_GROUPS.forEach(g => dist[g] = 0);
    let total = 0;

    workoutHistory.forEach(w => {
      if (w.exercises) {
        w.exercises.forEach(ex => {
          const group = ex.exerciseData?.muscleGroup || 'Other';
          dist[group] = (dist[group] || 0) + 1;
          total++;
        });
      }
    });

    const labels = Object.entries(dist).filter(([_, v]) => v > 0).map(([k]) => k);
    const data = Object.entries(dist).filter(([_, v]) => v > 0).map(([_, v]) => Math.round((v / total) * 100));

    return { labels, data };
  }, [workoutHistory]);

  const strengthData = useMemo(() => {
    const keyLifts = [
      { id: 'chest_bench_press', name: 'Bench Press', color: '#8b5cf6' },
      { id: 'legs_barbell_squat', name: 'Squat', color: '#ef4444' },
      { id: 'back_deadlift', name: 'Deadlift', color: '#10b981' },
      { id: 'back_pullups', name: 'Pull-ups', color: '#f59e0b' },
    ];

    return keyLifts.map(lift => {
      const record = personalRecords?.[lift.id];
      const history = record?.history || [];
      return {
        ...lift,
        history: history.slice(-20).map(h => ({
          date: h.date ? h.date.slice(5) : '',
          weight: h.weight || 0
        }))
      };
    });
  }, [personalRecords]);

  const todayCalories = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return workoutHistory
      .filter(w => w.date === today || (w.timestamp && w.timestamp.startsWith(today)))
      .reduce((sum, w) => sum + (w.totalCalories || w.calories || 0), 0);
  }, [workoutHistory]);

  const weeklyCalories = useMemo(() => calculateWeeklyCalories(workoutHistory), [workoutHistory]);

  const monthlyCalories = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return workoutHistory
      .filter(w => new Date(w.timestamp || w.date) >= monthStart)
      .reduce((sum, w) => sum + (w.totalCalories || w.calories || 0), 0);
  }, [workoutHistory]);

  const lifetimeCalories = useMemo(() => {
    return workoutHistory.reduce((sum, w) => sum + (w.totalCalories || w.calories || 0), 0);
  }, [workoutHistory]);

  const xpData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayXP = workoutHistory
      .filter(w => w.date === today || (w.timestamp && w.timestamp.startsWith(today)))
      .reduce((sum, w) => sum + (w.xpGained || 0), 0);

    const weekXP = workoutHistory
      .filter(w => new Date(w.timestamp || w.date) >= weekStart)
      .reduce((sum, w) => sum + (w.xpGained || 0), 0);

    const monthXP = workoutHistory
      .filter(w => new Date(w.timestamp || w.date) >= monthStart)
      .reduce((sum, w) => sum + (w.xpGained || 0), 0);

    const lifetimeXP = workoutHistory.reduce((sum, w) => sum + (w.xpGained || 0), 0);

    return { todayXP, weekXP, monthXP, lifetimeXP };
  }, [workoutHistory]);

  const showPlaceholder = workoutHistory.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sl-purple-light hover:text-white text-base inline-flex items-center">
          <span className="mr-2">←</span> Back
        </button>
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <div className="w-16"></div>
      </div>

      {showPlaceholder ? (
        <div className="sl-card text-center py-12">
          <p className="text-4xl mb-4">📊</p>
          <h3 className="text-xl font-bold text-white mb-2">No Workout Data Yet</h3>
          <p className="text-sl-gray-light text-base">Complete your first workout to see analytics</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sl-card text-center">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider">Total Workouts</p>
              <p className="text-3xl font-bold text-white">{stats.totalWorkouts}</p>
            </div>
            <div className="sl-card text-center">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider">Total Volume</p>
              <p className="text-3xl font-bold text-white">{(stats.totalVolume / 1000).toFixed(1)}k</p>
            </div>
            <div className="sl-card text-center">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider">Total Calories</p>
              <p className="text-3xl font-bold text-sl-red-light">{stats.totalCalories.toLocaleString()}</p>
            </div>
            <div className="sl-card text-center">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider">Total Time</p>
              <p className="text-3xl font-bold text-white">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="sl-card">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-white">{stats.averageDuration} min</p>
            </div>
            <div className="sl-card">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider mb-1">Current Streak</p>
              <p className="text-2xl font-bold text-white">{stats.currentStreak} days</p>
            </div>
            <div className="sl-card">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider mb-1">Longest Streak</p>
              <p className="text-2xl font-bold text-white">{stats.longestStreak} days</p>
            </div>
            <div className="sl-card">
              <p className="text-xs text-sl-gray-light uppercase tracking-wider mb-1">Power Level</p>
              <p className="text-2xl font-bold text-sl-red-light">{stats.powerLevel || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="sl-card">
              <h3 className="text-xl font-bold text-white mb-4">Weekly Workouts</h3>
              <div className="h-48">
                <Bar
                  data={{
                    labels: weeklyData.labels,
                    datasets: [{
                      label: 'Workouts',
                      data: weeklyData.data,
                      backgroundColor: 'rgba(139, 92, 246, 0.6)',
                      borderColor: '#8b5cf6',
                      borderWidth: 1,
                      borderRadius: 4,
                    }]
                  }}
                  options={{ ...chartOptions, plugins: { legend: { display: false } } }}
                />
              </div>
            </div>
            <div className="sl-card">
              <h3 className="text-xl font-bold text-white mb-4">Monthly Workouts</h3>
              <div className="h-48">
                <Bar
                  data={{
                    labels: monthlyData.labels,
                    datasets: [{
                      label: 'Workouts',
                      data: monthlyData.data,
                      backgroundColor: 'rgba(239, 68, 68, 0.6)',
                      borderColor: '#ef4444',
                      borderWidth: 1,
                      borderRadius: 4,
                    }]
                  }}
                  options={{ ...chartOptions, plugins: { legend: { display: false } } }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="sl-card">
              <h3 className="text-xl font-bold text-white mb-4">Workout Distribution</h3>
              <div className="h-48">
                {muscleDistribution.labels.length > 0 ? (
                  <Doughnut
                    data={{
                      labels: muscleDistribution.labels,
                      datasets: [{
                        data: muscleDistribution.data,
                        backgroundColor: ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'],
                        borderColor: '#090214',
                        borderWidth: 2,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: { color: '#a78bfa', font: { size: 12, family: 'Inter' }, padding: 12 }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sl-gray-light">No data</div>
                )}
              </div>
            </div>
            <div className="sl-card">
              <h3 className="text-xl font-bold text-white mb-4">Strength Progress</h3>
              <div className="h-48">
                <Line
                  data={{
                    labels: strengthData[0]?.history.map(h => h.date) || [],
                    datasets: strengthData.filter(l => l.history.length > 0).map(lift => ({
                      label: lift.name,
                      data: lift.history.map(h => h.weight),
                      borderColor: lift.color,
                      backgroundColor: lift.color + '20',
                      tension: 0.3,
                      fill: true,
                      pointRadius: 3,
                    }))
                  }}
                  options={chartOptions}
                />
              </div>
              {strengthData.every(l => l.history.length === 0) && (
                <p className="text-center text-sl-gray-light mt-2 text-sm">Track Bench Press, Squat, Deadlift to see progress</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="sl-card">
              <h3 className="text-xl font-bold text-white mb-4">Calorie Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">Today</p>
                  <p className="text-xl font-bold text-sl-red-light">{todayCalories}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">This Week</p>
                  <p className="text-xl font-bold text-sl-red-light">{weeklyCalories}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">This Month</p>
                  <p className="text-xl font-bold text-sl-red-light">{monthlyCalories}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">Lifetime</p>
                  <p className="text-xl font-bold text-sl-red-light">{lifetimeCalories.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="sl-card">
              <h3 className="text-xl font-bold text-white mb-4">XP Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">Today</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.todayXP}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">This Week</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.weekXP}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">This Month</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.monthXP}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-sl-gray-light">Lifetime</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.lifetimeXP}</p>
                </div>
              </div>
            </div>
          </div>

          <MuscleRecovery workoutHistory={workoutHistory} />

          <AIAnalysis
            workoutHistory={workoutHistory}
            personalRecords={personalRecords}
            stats={stats}
            userSettings={userSettings}
          />
        </>
      )}
    </div>
  );
}
