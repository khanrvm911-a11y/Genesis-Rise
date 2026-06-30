import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import ErrorState from '../components/ErrorState';
import {
  Flag, CheckCircle, Clock,
  AlertTriangle, RefreshCw, MessageSquare
} from 'lucide-react';

export default function AdminReports() {
  const { logAction } = useAdminAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchErr) throw fetchErr;
      setReports(data || []);
      logAction('view_reports');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const columns = [
    {
      header: 'Report',
      accessor: 'title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            row.type === 'alert' ? 'bg-red-500/20' :
            row.type === 'warning' ? 'bg-amber-500/20' : 'bg-violet-500/20'
          }`}>
            {row.type === 'alert' ? <AlertTriangle size={16} className="text-red-400" /> :
             row.type === 'warning' ? <Flag size={16} className="text-amber-400" /> :
             <MessageSquare size={16} className="text-violet-400" />}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{row.title || 'Untitled'}</p>
            <p className="text-xs text-gray-500 truncate max-w-xs">{row.description || ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => (
        <span className="text-xs text-gray-400 capitalize">{row.type || 'info'}</span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        const read = row.is_read;
        return (
          <span className={`flex items-center gap-1 text-xs ${
            read ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {read ? <CheckCircle size={12} /> : <Clock size={12} />}
            {read ? 'Resolved' : 'Pending'}
          </span>
        );
      },
    },
    {
      header: 'Date',
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  const pendingCount = reports.filter(r => !r.is_read).length;
  const resolvedCount = reports.filter(r => r.is_read).length;

  return (
    <AdminLayout title="Reports">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-rose-600/20 to-rose-600/5 border border-rose-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-rose-300/70 mb-1">Total Reports</p>
              <p className="text-2xl font-bold text-white">{reports.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-600/20 flex items-center justify-center">
              <Flag size={20} className="text-rose-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-amber-300/70 mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Clock size={20} className="text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-300/70 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-white">{resolvedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {pendingCount > 0 ? `${pendingCount} pending report${pendingCount !== 1 ? 's' : ''} to review` : 'All reports resolved'}
        </p>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState title="Failed to load reports" message={error} onRetry={fetchReports} />
      ) : (
        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          searchPlaceholder="Search reports..."
          emptyMessage="No reports found"
        />
      )}
    </AdminLayout>
  );
}
