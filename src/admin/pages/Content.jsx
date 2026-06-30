import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorState from '../components/ErrorState';
import {
  FileText, Plus, Trash2, RefreshCw,
  Eye, Calendar, User
} from 'lucide-react';

export default function AdminContent() {
  const { logAction } = useAdminAuth();
  const [content, setContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'announcement', status: 'draft' });

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: goals, error: gErr } = await supabase
        .from('daily_goals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (gErr) throw gErr;

      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, username, email');

      if (pErr) throw pErr;

      setContent(goals || []);
      setUsers(profiles || []);
      logAction('view_content');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const getUsername = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.username || user?.email?.split('@')[0] || 'Unknown';
  };

  const columns = [
    {
      header: 'Content',
      accessor: 'title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <FileText size={16} className="text-violet-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{row.title || 'Untitled'}</p>
            <p className="text-xs text-gray-500 truncate max-w-xs">{row.description || row.type || ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => (
        <span className="text-xs text-gray-400 capitalize">{row.type || 'goal'}</span>
      ),
    },
    {
      header: 'User',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-gray-500" />
          <span className="text-xs text-gray-400">{getUsername(row.user_id)}</span>
        </div>
      ),
    },
    {
      header: 'Created',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-gray-500" />
          <span className="text-xs text-gray-500">
            {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
          </span>
        </div>
      ),
    },
    {
      header: '',
      cell: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setEditItem(row); }}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: insertErr } = await supabase
        .from('daily_goals')
        .insert({
          title: form.title,
          description: form.body,
          type: form.type,
          user_id: user.id,
        });

      if (insertErr) throw insertErr;

      await logAction('create_content', 'content', null, { title: form.title });
      setForm({ title: '', body: '', type: 'announcement', status: 'draft' });
      setShowCreate(false);
      fetchContent();
    } catch (err) {
      alert('Failed to create: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error: deleteErr } = await supabase
        .from('daily_goals')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;

      await logAction('delete_content', 'content', id);
      setContent(prev => prev.filter(c => c.id !== id));
      setEditItem(null);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <AdminLayout title="Content Management">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {content.length} content item{content.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContent}
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
            New Content
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState title="Failed to load content" message={error} onRetry={fetchContent} />
      ) : (
        <DataTable
          columns={columns}
          data={content}
          loading={loading}
          searchPlaceholder="Search content..."
          emptyMessage="No content created yet"
        />
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Content"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Content title"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Body</label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Content body..."
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            >
              <option value="announcement" className="bg-[#12122a]">Announcement</option>
              <option value="challenge" className="bg-[#12122a]">Challenge</option>
              <option value="tip" className="bg-[#12122a]">Tip</option>
              <option value="goal" className="bg-[#12122a]">Goal</option>
            </select>
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
              disabled={saving || !form.title.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
            >
              {saving ? 'Creating...' : 'Create Content'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!editItem}
        onClose={() => setEditItem(null)}
        title={editItem?.title || 'Content Details'}
        size="lg"
      >
        {editItem && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <p className="text-white text-sm">{editItem.title || 'Untitled'}</p>
            </div>
            {editItem.description && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{editItem.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <p className="text-sm text-white capitalize">{editItem.type || 'goal'}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Created By</label>
                <p className="text-sm text-white">{getUsername(editItem.user_id)}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Created</label>
                <p className="text-sm text-white">{new Date(editItem.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDelete(editItem.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
