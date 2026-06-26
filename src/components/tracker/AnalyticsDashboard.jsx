import { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getWorkoutStats, calculateRecoveryPercentage, calculateWeeklyCalories } from '../../utils/workoutUtils';
import MuscleRecovery from './MuscleRecovery';
import AIAnalysis from './AIAnalysis';
import { ArrowLeft } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#a78bfa', font: { size: 10, family: 'Inter' } } }
  },
  scales: {
    x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(139,92,246,0.1)' } },
    y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(139,92,246,0.1)' } }
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sl-purple-light hover:text-white text-sm touch-target">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {showPlaceholder ? (
        <div className="mobile-card text-center py-10">
          <p className="text-3xl mb-3">📊</p>
          <h3 className="text-lg font-bold text-white mb-1">No Workout Data Yet</h3>
          <p className="text-sm text-sl-gray-light">Complete your first workout to see analytics</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="mobile-card text-center p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Workouts</p>
              <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
            </div>
            <div className="mobile-card text-center p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Volume</p>
              <p className="text-2xl font-bold text-white">{(stats.totalVolume / 1000).toFixed(1)}k</p>
            </div>
            <div className="mobile-card text-center p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Calories</p>
              <p className="text-2xl font-bold text-sl-red-light">{stats.totalCalories.toLocaleString()}</p>
            </div>
            <div className="mobile-card text-center p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Time</p>
              <p className="text-2xl font-bold text-white">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="mobile-card p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Avg Duration</p>
              <p className="text-xl font-bold text-white">{stats.averageDuration} min</p>
            </div>
            <div className="mobile-card p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Streak</p>
              <p className="text-xl font-bold text-white">{stats.currentStreak} days</p>
            </div>
            <div className="mobile-card p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Best Streak</p>
              <p className="text-xl font-bold text-white">{stats.longestStreak} days</p>
            </div>
            <div className="mobile-card p-4">
              <p className="text-[10px] text-sl-gray-light uppercase tracking-wider font-semibold">Power Level</p>
              <p className="text-xl font-bold text-sl-red-light">{stats.powerLevel || 0}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="mobile-card">
              <h3 className="text-base font-bold text-white mb-3">Weekly Workouts</h3>
              <div className="h-40">
                <Bar data={{
                  labels: weeklyData.labels,
                  datasets: [{
                    label: 'Workouts',
                    data: weeklyData.data,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1,
                    borderRadius: 4,
                  }]
                }} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
              </div>
            </div>
            <div className="mobile-card">
              <h3 className="text-base font-bold text-white mb-3">Monthly Workouts</h3>
              <div className="h-40">
                <Bar data={{
                  labels: monthlyData.labels,
                  datasets: [{
                    label: 'Workouts',
                    data: monthlyData.data,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    borderWidth: 1,
                    borderRadius: 4,
                  }]
                }} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="mobile-card">
              <h3 className="text-base font-bold text-white mb-3">Muscle Distribution</h3>
              <div className="h-40">
                {muscleDistribution.labels.length > 0 ? (
                  <Doughnut data={{
                    labels: muscleDistribution.labels,
                    datasets: [{
                      data: muscleDistribution.data,
                      backgroundColor: ['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'],
                      borderColor: '#090214',
                      borderWidth: 2,
                    }]
                  }} options={{ responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { color: '#a78bfa', font: { size: 10, family: 'Inter' }, padding: 8 } } }
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sl-gray-light text-sm">No data</div>
                )}
              </div>
            </div>
            <div className="mobile-card">
              <h3 className="text-base font-bold text-white mb-3">Strength Progress</h3>
              <div className="h-40">
                <Line data={{
                  labels: strengthData[0]?.history.map(h => h.date) || [],
                  datasets: strengthData.filter(l => l.history.length > 0).map(lift => ({
                    label: lift.name,
                    data: lift.history.map(h => h.weight),
                    borderColor: lift.color,
                    backgroundColor: lift.color + '20',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2,
                  }))
                }} options={chartOptions} />
              </div>
              {strengthData.every(l => l.history.length === 0) && (
                <p className="text-center text-sl-gray-light mt-2 text-[10px]">Track Bench Press, Squat, Deadlift to see progress</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="mobile-card">
              <h3 className="text-base font-bold text-white mb-3">Calorie Analytics</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Today</p>
                  <p className="text-xl font-bold text-sl-red-light">{todayCalories}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Week</p>
                  <p className="text-xl font-bold text-sl-red-light">{weeklyCalories}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Month</p>
                  <p className="text-xl font-bold text-sl-red-light">{monthlyCalories}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Lifetime</p>
                  <p className="text-xl font-bold text-sl-red-light">{lifetimeCalories.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="mobile-card">
              <h3 className="text-base font-bold text-white mb-3">XP Analytics</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Today</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.todayXP}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Week</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.weekXP}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Month</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.monthXP}</p>
                </div>
                <div className="bg-sl-gray/20 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-sl-gray-light font-semibold">Lifetime</p>
                  <p className="text-xl font-bold text-sl-purple-light">{xpData.lifetimeXP}</p>
                </div>
              </div>
            </div>
          </div>

          <MuscleRecovery workoutHistory={workoutHistory} />
          <AIAnalysis workoutHistory={workoutHistory} personalRecords={personalRecords} stats={stats} userSettings={userSettings} />
        </>
      )}
    </div>
  );
}
