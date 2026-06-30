import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import {
  Bell, Send, Plus, Trash2, RefreshCw,
  Globe
} from 'lucide-react';

const CATEGORIES = [
  { value: 'system', label: 'System', color: 'text-violet-400 bg-violet-500/10' },
  { value: 'update', label: 'Update', color: 'text-blue-400 bg-blue-500/10' },
  { value: 'promo', label: 'Promotion', color: 'text-amber-400 bg-amber-500/10' },
  { value: 'achievement', label: 'Achievement', color: 'text-emerald-400 bg-emerald-500/10' },
  { value: 'reminder', label: 'Reminder', color: 'text-rose-400 bg-rose-500/10' },
];

export default function AdminNotifications() {
  const { logAction } = useAdminAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'system',
    priority: 'normal',
    target_audience: 'all',
  });

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSending(true);
    try {
      const { error: insertErr } = await supabase
        .from('admin_notifications')
        .insert({
          title: form.title,
          description: form.description,
          category: form.category,
          priority: form.priority,
          target_audience: form.target_audience,
          sent_at: new Date().toISOString(),
        });

      if (insertErr) throw insertErr;

      await logAction('create_notification', 'notification', null, { title: form.title });

      setForm({ title: '', description: '', category: 'system', priority: 'normal', target_audience: 'all' });
      setShowCreate(false);
      fetchNotifications();
    } catch (err) {
      alert('Failed to create notification: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error: deleteErr } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;

      await logAction('delete_notification', 'notification', id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const getCategoryStyle = (cat) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.color : 'text-gray-400 bg-gray-500/10';
  };

  return (
    <AdminLayout title="Push Notifications">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''} sent
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            New Notification
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState title="Failed to load notifications" message={error} onRetry={fetchNotifications} />
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-white/10 rounded" />
                  <div className="h-3 w-96 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications sent"
          description="Create your first push notification to engage with users."
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
              Create Notification
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:bg-white/[0.05] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
                  <Bell size={20} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryStyle(n.category)}`}>
                      {n.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      n.priority === 'high' ? 'text-red-400 bg-red-500/10' :
                      n.priority === 'urgent' ? 'text-rose-400 bg-rose-500/10' :
                      'text-gray-400 bg-gray-500/10'
                    }`}>
                      {n.priority}
                    </span>
                  </div>
                  {n.description && (
                    <p className="text-sm text-gray-400 mb-2">{n.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Globe size={12} />
                      {n.target_audience}
                    </span>
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                    {n.sent_at && <span>Sent: {new Date(n.sent_at).toLocaleString()}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Notification"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Notification title"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Notification description (optional)"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} className="bg-[#12122a]">{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="low" className="bg-[#12122a]">Low</option>
                <option value="normal" className="bg-[#12122a]">Normal</option>
                <option value="high" className="bg-[#12122a]">High</option>
                <option value="urgent" className="bg-[#12122a]">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Audience</label>
              <select
                value={form.target_audience}
                onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="all" className="bg-[#12122a]">All Users</option>
                <option value="premium" className="bg-[#12122a]">Premium</option>
                <option value="active" className="bg-[#12122a]">Active</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={sending || !form.title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
            >
              <Send size={14} />
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
