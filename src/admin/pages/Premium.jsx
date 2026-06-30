import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import { Crown, RefreshCw, Award, Zap } from 'lucide-react';

export default function AdminPremium() {
  const { logAction } = useAdminAuth();
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setAllUsers(data || []);
      setPremiumUsers((data || []).filter(u => u.is_premium));
      logAction('view_premium');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = {
    total: allUsers.length,
    premium: premiumUsers.length,
    rate: allUsers.length > 0 ? ((premiumUsers.length / allUsers.length) * 100).toFixed(1) : '0.0',
  };

  const columns = [
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
            {(row.username || row.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium text-sm flex items-center gap-1.5">
              {row.username || 'Unnamed'}
              <Crown size={12} className="text-amber-400" />
            </p>
            <p className="text-xs text-gray-500">{row.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Level',
      cell: (row) => <span className="text-white font-medium">{row.level || 1}</span>,
    },
    {
      header: 'XP',
      cell: (row) => <span className="text-gray-400">{(row.xp || 0).toLocaleString()}</span>,
    },
    {
      header: 'Rank',
      cell: (row) => {
        const rank = (row.rank || 'bronze').toLowerCase();
        return <span className="text-gray-400 capitalize">{rank}</span>;
      },
    },
    {
      header: 'Joined',
      cell: (row) => (
        <span className="text-gray-500 text-xs">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Premium Management">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-amber-300/70 mb-1">Premium Users</p>
              <p className="text-2xl font-bold text-white">{stats.premium}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Crown size={20} className="text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-violet-300/70 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
              <Award size={20} className="text-violet-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-300/70 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{stats.rate}%</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <Zap size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {stats.premium} premium subscriber{stats.premium !== 1 ? 's' : ''}
        </p>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState title="Failed to load data" message={error} onRetry={fetchData} />
      ) : (
        <DataTable
          columns={columns}
          data={premiumUsers}
          loading={loading}
          searchPlaceholder="Search premium users..."
          emptyMessage="No premium users yet"
        />
      )}
    </AdminLayout>
  );
}
