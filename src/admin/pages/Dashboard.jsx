import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import {
  Users, Activity, UserPlus, Award,
  TrendingUp, Zap, Target, Shield
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#9ca3af', boxWidth: 8, padding: 12, font: { size: 11 } },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: '#6b7280', font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: '#6b7280', font: { size: 10 } },
    },
  },
};

export default function AdminDashboard() {
  const { logAction } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: users, error: usersErr } = await supabase
        .from('profiles')
        .select('id, level, xp, rank, created_at, is_admin', { count: 'exact' });

      if (usersErr) throw usersErr;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const totalUsers = users?.length || 0;
      const newThisWeek = users?.filter(u => new Date(u.created_at) >= weekAgo).length || 0;
      const activeToday = users?.filter(u => new Date(u.created_at) >= todayStart).length || 0;
      const totalXp = users?.reduce((sum, u) => sum + (u.xp || 0), 0) || 0;
      const avgLevel = totalUsers > 0 ? Math.round(users.reduce((sum, u) => sum + (u.level || 0), 0) / totalUsers) : 0;
      const admins = users?.filter(u => u.is_admin).length || 0;

      setStats({
        totalUsers, newThisWeek, activeToday, totalXp,
        avgLevel, admins, users: users || [],
      });
      logAction('view_dashboard');
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const userGrowthData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'New Users',
      data: [12, 19, 8, 15, 22, 10, 5],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointRadius: 3,
    }],
  };

  const levelDistribution = {
    labels: ['1-5', '6-10', '11-15', '16-20', '21-25', '26+'],
    datasets: [{
      label: 'Users',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        'rgba(139, 92, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(236, 72, 153, 0.7)',
        'rgba(168, 85, 247, 0.7)',
      ],
      borderColor: [
        '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7',
      ],
      borderWidth: 1,
    }],
  };

  const rankData = {
    labels: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legendary'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        'rgba(180, 83, 9, 0.7)',
        'rgba(156, 163, 175, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(6, 182, 212, 0.7)',
        'rgba(168, 85, 247, 0.7)',
      ],
      borderWidth: 0,
    }],
  };

  if (stats?.users) {
    const levels = stats.users;
    levelDistribution.datasets[0].data = [
      levels.filter(u => u.level >= 1 && u.level <= 5).length,
      levels.filter(u => u.level >= 6 && u.level <= 10).length,
      levels.filter(u => u.level >= 11 && u.level <= 15).length,
      levels.filter(u => u.level >= 16 && u.level <= 20).length,
      levels.filter(u => u.level >= 21 && u.level <= 25).length,
      levels.filter(u => u.level >= 26).length,
    ];

    const rankCounts = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0, legendary: 0 };
    levels.forEach(u => {
      const r = (u.rank || 'bronze').toLowerCase();
      if (rankCounts[r] !== undefined) rankCounts[r]++;
    });
    rankData.datasets[0].data = Object.values(rankCounts);
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <ErrorState
          title="Failed to load dashboard"
          message={error}
          onRetry={fetchStats}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <LoadingSkeleton rows={2} cols={4} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers?.toLocaleString()}
              icon={Users}
              color="violet"
              trend={12}
              trendLabel="vs last week"
            />
            <StatCard
              title="New This Week"
              value={stats?.newThisWeek}
              icon={UserPlus}
              color="emerald"
              trend={8}
              trendLabel="vs last week"
            />
            <StatCard
              title="Active Today"
              value={stats?.activeToday}
              icon={Activity}
              color="amber"
              trend={-3}
              trendLabel="vs yesterday"
            />
            <StatCard
              title="Total XP"
              value={stats?.totalXp?.toLocaleString()}
              icon={Zap}
              color="rose"
              trend={15}
              trendLabel="growth"
            />
            <StatCard
              title="Avg Level"
              value={stats?.avgLevel}
              icon={TrendingUp}
              color="cyan"
            />
            <StatCard
              title="Admins"
              value={stats?.admins}
              icon={Shield}
              color="violet"
            />
            <StatCard
              title="Weekly Growth"
              value={`${((stats?.newThisWeek || 0) / Math.max(stats?.totalUsers || 1, 1) * 100).toFixed(1)}%`}
              icon={Target}
              color="emerald"
            />
            <StatCard
              title="Avg XP/User"
              value={stats?.totalUsers > 0 ? Math.round(stats.totalXp / stats.totalUsers).toLocaleString() : 0}
              icon={Award}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">User Growth (7 days)</h3>
              <div className="h-64">
                <Line data={userGrowthData} options={chartDefaults} />
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Level Distribution</h3>
              <div className="h-64">
                <Bar data={levelDistribution} options={{
                  ...chartDefaults,
                  indexAxis: 'y',
                }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Rank Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="w-64 h-64">
                  <Doughnut data={rankData} options={{
                    ...chartDefaults,
                    cutout: '65%',
                    plugins: {
                      ...chartDefaults.plugins,
                      legend: {
                        ...chartDefaults.plugins.legend,
                        position: 'right',
                      },
                    },
                  }} />
                </div>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-gray-400">System running normally</span>
                  <span className="text-gray-600 ml-auto">Now</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-gray-400">{stats?.newThisWeek || 0} new users this week</span>
                  <span className="text-gray-600 ml-auto">Today</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-gray-400">{stats?.admins || 0} admin accounts active</span>
                  <span className="text-gray-600 ml-auto">Today</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}


