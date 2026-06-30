import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import {
  Shield, RefreshCw, Clock,
  User, Activity, AlertTriangle
} from 'lucide-react';

export default function AdminSecurity() {
  const { logAction } = useAdminAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([]);

  const fetchSecurity = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: auditLogs, error: lErr } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (lErr) throw lErr;

      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*');

      if (pErr) throw pErr;

      setLogs(auditLogs || []);
      setAdmins((profiles || []).filter(p => p.is_admin));
      logAction('view_security');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSecurity(); }, []);

  const getActionColor = (action) => {
    if (action.includes('delete')) return 'text-red-400 bg-red-500/10';
    if (action.includes('grant') || action.includes('create')) return 'text-emerald-400 bg-emerald-500/10';
    if (action.includes('revoke') || action.includes('ban')) return 'text-rose-400 bg-rose-500/10';
    if (action.includes('update') || action.includes('edit')) return 'text-amber-400 bg-amber-500/10';
    return 'text-violet-400 bg-violet-500/10';
  };

  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(row.action)}`}>
          {row.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Target',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.target_type && <span className="text-xs text-gray-500">{row.target_type}</span>}
          {row.target_id && (
            <span className="text-xs text-gray-600 font-mono truncate max-w-[100px]">
              {row.target_id.substring(0, 8)}...
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Admin',
      cell: (row) => {
        const admin = admins.find(a => a.id === row.admin_id);
        return (
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-gray-500" />
            <span className="text-xs text-gray-400">{admin?.username || admin?.email?.split('@')[0] || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      header: 'Time',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-gray-500" />
          <span className="text-xs text-gray-500">
            {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
          </span>
        </div>
      ),
    },
  ];

  const recentLogs = logs.slice(0, 10);

  return (
    <AdminLayout title="Security & Audit">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-violet-300/70 mb-1">Admin Accounts</p>
              <p className="text-2xl font-bold text-white">{admins.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
              <Shield size={20} className="text-violet-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-amber-300/70 mb-1">Audit Logs</p>
              <p className="text-2xl font-bold text-white">{logs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Activity size={20} className="text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-300/70 mb-1">Recent Actions</p>
              <p className="text-2xl font-bold text-white">{recentLogs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3">Admin Accounts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {admins.length === 0 ? (
            <p className="text-sm text-gray-500 col-span-full">No admin accounts</p>
          ) : (
            admins.map(admin => (
              <div key={admin.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{admin.username || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{admin.email || ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Audit Log</h3>
        <button
          onClick={fetchSecurity}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState title="Failed to load security data" message={error} onRetry={fetchSecurity} />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          searchable={true}
          searchPlaceholder="Search audit logs..."
          emptyMessage="No audit logs recorded yet"
        />
      )}
    </AdminLayout>
  );
}
