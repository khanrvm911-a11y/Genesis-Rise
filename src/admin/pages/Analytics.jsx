import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import ErrorState from '../components/ErrorState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Users, Activity, TrendingUp,
  Award, Zap
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';

export default function AdminAnalytics() {
  const { logAction } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*');

      if (pErr) throw pErr;

      const { data: goals, error: gErr } = await supabase
        .from('daily_goals')
        .select('*');

      if (gErr) throw gErr;

      setData({ profiles: profiles || [], goals: goals || [] });
      logAction('view_analytics');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const levelData = {
    labels: ['1-5', '6-10', '11-15', '16-20', '21-25', '26+'],
    datasets: [{
      label: 'Users',
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(139, 92, 246, 0.7)',
      borderColor: '#8b5cf6',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const rankDist = {
    labels: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legendary'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        'rgba(180, 83, 9, 0.7)', 'rgba(156, 163, 175, 0.7)',
        'rgba(245, 158, 11, 0.7)', 'rgba(59, 130, 246, 0.7)',
        'rgba(6, 182, 212, 0.7)', 'rgba(168, 85, 247, 0.7)',
      ],
      borderWidth: 0,
    }],
  };

  const weeklyActivity = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Active Users',
      data: [0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(16, 185, 129, 0.7)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const rankCounts = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0, legendary: 0 };

  if (data) {
    const profiles = data.profiles;
    levelData.datasets[0].data = [
      profiles.filter(u => u.level >= 1 && u.level <= 5).length,
      profiles.filter(u => u.level >= 6 && u.level <= 10).length,
      profiles.filter(u => u.level >= 11 && u.level <= 15).length,
      profiles.filter(u => u.level >= 16 && u.level <= 20).length,
      profiles.filter(u => u.level >= 21 && u.level <= 25).length,
      profiles.filter(u => u.level >= 26).length,
    ];

    profiles.forEach(u => {
      const r = (u.rank || 'bronze').toLowerCase();
      if (rankCounts[r] !== undefined) rankCounts[r]++;
    });
    rankDist.datasets[0].data = Object.values(rankCounts);
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', boxWidth: 8, padding: 12, font: { size: 11 } },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
    },
  };

  const totalUsers = data?.profiles?.length || 0;
  const avgLevel = totalUsers > 0
    ? (data.profiles.reduce((s, u) => s + (u.level || 0), 0) / totalUsers).toFixed(1)
    : '0';
  const totalXp = data?.profiles?.reduce((s, u) => s + (u.xp || 0), 0) || 0;
  const totalGoals = data?.goals?.length || 0;

  return (
    <AdminLayout title="Analytics">
      {error ? (
        <ErrorState title="Failed to load analytics" message={error} onRetry={fetchAnalytics} />
      ) : loading ? (
        <LoadingSkeleton rows={2} cols={4} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-violet-300/70 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white">{totalUsers}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
                  <Users size={20} className="text-violet-400" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-300/70 mb-1">Avg Level</p>
                  <p className="text-2xl font-bold text-white">{avgLevel}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-400" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-300/70 mb-1">Total XP</p>
                  <p className="text-2xl font-bold text-white">{totalXp.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                  <Zap size={20} className="text-amber-400" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-300/70 mb-1">Total Goals</p>
                  <p className="text-2xl font-bold text-white">{totalGoals}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Activity size={20} className="text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Level Distribution</h3>
              <div className="h-72">
                <Bar data={levelData} options={{ ...chartOptions, indexAxis: 'y' }} />
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Rank Distribution</h3>
              <div className="h-72 flex items-center justify-center">
                <div className="w-72 h-72">
                  <Doughnut data={rankDist} options={{
                    ...chartOptions, cutout: '65%',
                    plugins: { ...chartOptions.plugins, legend: { ...chartOptions.plugins.legend, position: 'right' } },
                  }} />
                </div>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Weekly Activity</h3>
              <div className="h-72">
                <Bar data={weeklyActivity} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Award size={18} className="text-violet-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">User Engagement</p>
                    <p className="text-xs text-gray-500">
                      {totalUsers > 0 ? `${(totalGoals / totalUsers).toFixed(1)} goals per user on average` : 'No data yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Zap size={18} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">XP Distribution</p>
                    <p className="text-xs text-gray-500">
                      {totalUsers > 0 ? `${(totalXp / totalUsers).toFixed(0)} XP per user on average` : 'No data yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Users size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">Demographics</p>
                    <p className="text-xs text-gray-500">
                      {totalUsers} registered users across {Object.values(rankCounts || {}).filter(v => v > 0).length || 0} rank tiers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
