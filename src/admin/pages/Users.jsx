import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorState from '../components/ErrorState';
import {
  Shield, ShieldOff, Crown, Trash2, Edit3, RefreshCw,
  Award, MoreHorizontal
} from 'lucide-react';

const RANKS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary'];

export default function AdminUsers() {
  const { logAction } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', level: 1, xp: 0, rank: 'bronze' });
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const menuRef = useRef();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setUsers(data || []);
      logAction('view_users');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ username: user.username || '', level: user.level || 1, xp: user.xp || 0, rank: user.rank || 'bronze' });
    setModalMode('edit');
    setMenuOpen(null);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setModalMode('delete');
    setMenuOpen(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          level: Math.max(1, parseInt(editForm.level) || 1),
          xp: Math.max(0, parseInt(editForm.xp) || 0),
          rank: editForm.rank,
        })
        .eq('id', selectedUser.id);

      if (updateErr) throw updateErr;

      await logAction('update_user', 'user', selectedUser.id, {
        changes: editForm,
      });

      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...editForm, level: Math.max(1, parseInt(editForm.level) || 1), xp: Math.max(0, parseInt(editForm.xp) || 0) }
          : u
      ));
      setModalMode(null);
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      const newAdminStatus = !user.is_admin;
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_admin: newAdminStatus })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      await logAction(newAdminStatus ? 'grant_admin' : 'revoke_admin', 'user', user.id);

      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, is_admin: newAdminStatus } : u
      ));
    } catch (err) {
      alert('Failed to toggle admin: ' + err.message);
    }
    setMenuOpen(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error: deleteErr } = await supabase.rpc('admin_delete_user', {
        p_user_id: selectedUser.id,
      });

      if (deleteErr) throw deleteErr;

      await logAction('delete_user', 'user', selectedUser.id);

      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setModalMode(null);
      setSelectedUser(null);
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetPremium = async (user) => {
    try {
      const newPremium = !user.is_premium;
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ is_premium: newPremium })
        .eq('id', user.id);

      if (updateErr) throw updateErr;

      await logAction(newPremium ? 'grant_premium' : 'revoke_premium', 'user', user.id);

      setUsers(prev => prev.map(u =>
        u.id === user.id ? { ...u, is_premium: newPremium } : u
      ));
    } catch (err) {
      alert('Failed to update premium: ' + err.message);
    }
    setMenuOpen(null);
  };

  const columns = [
    {
      header: 'User',
      accessor: 'username',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white">
            {(row.username || row.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium text-sm flex items-center gap-1.5">
              {row.username || 'Unnamed'}
              {row.is_admin && <Shield size={12} className="text-violet-400" />}
              {row.is_premium && <Crown size={12} className="text-amber-400" />}
            </p>
            <p className="text-xs text-gray-500">{row.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Level',
      accessor: 'level',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Award size={14} className="text-amber-400" />
          <span className="text-white font-medium">{row.level || 1}</span>
        </div>
      ),
    },
    {
      header: 'XP',
      accessor: 'xp',
      cell: (row) => <span className="text-gray-400">{(row.xp || 0).toLocaleString()}</span>,
    },
    {
      header: 'Rank',
      accessor: 'rank',
      cell: (row) => {
        const rankColors = {
          bronze: 'text-amber-700 bg-amber-500/10',
          silver: 'text-gray-300 bg-gray-500/10',
          gold: 'text-yellow-400 bg-yellow-500/10',
          platinum: 'text-cyan-300 bg-cyan-500/10',
          diamond: 'text-blue-300 bg-blue-500/10',
          legendary: 'text-violet-300 bg-violet-500/10',
        };
        const rank = (row.rank || 'bronze').toLowerCase();
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${rankColors[rank] || rankColors.bronze}`}>
            {rank}
          </span>
        );
      },
    },
    {
      header: 'Joined',
      accessor: 'created_at',
      cell: (row) => (
        <span className="text-gray-500 text-xs">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: '',
      accessor: 'actions',
      cell: (row) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === row.id ? null : row.id); }}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="User Management">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {users.length} user{users.length !== 1 ? 's' : ''} registered
        </p>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState title="Failed to load users" message={error} onRetry={fetchUsers} />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          searchPlaceholder="Search by username or email..."
          emptyMessage="No users found"
        />
      )}

      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 w-48 bg-[#12122a] border border-white/10 rounded-xl shadow-2xl py-1"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <button
            onClick={() => {
              const user = users.find(u => u.id === menuOpen);
              if (user) openEdit(user);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            <Edit3 size={14} /> Edit User
          </button>
          <button
            onClick={() => {
              const user = users.find(u => u.id === menuOpen);
              if (user) handleSetPremium(user);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            <Crown size={14} /> Toggle Premium
          </button>
          <button
            onClick={() => {
              const user = users.find(u => u.id === menuOpen);
              if (user) handleToggleAdmin(user);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            {users.find(u => u.id === menuOpen)?.is_admin
              ? <><ShieldOff size={14} /> Revoke Admin</>
              : <><Shield size={14} /> Grant Admin</>
            }
          </button>
          <div className="border-t border-white/5 my-1" />
          <button
            onClick={() => {
              const user = users.find(u => u.id === menuOpen);
              if (user) openDelete(user);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} /> Delete User
          </button>
        </div>
      )}

      <Modal
        open={modalMode === 'edit'}
        onClose={() => { setModalMode(null); setSelectedUser(null); }}
        title="Edit User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text"
              value={editForm.username}
              onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Level</label>
              <input
                type="number"
                min="1"
                value={editForm.level}
                onChange={e => setEditForm(f => ({ ...f, level: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">XP</label>
              <input
                type="number"
                min="0"
                value={editForm.xp}
                onChange={e => setEditForm(f => ({ ...f, xp: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rank</label>
            <select
              value={editForm.rank}
              onChange={e => setEditForm(f => ({ ...f, rank: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
            >
              {RANKS.map(r => (
                <option key={r} value={r} className="bg-[#12122a]">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setModalMode(null); setSelectedUser(null); }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalMode === 'delete'}
        onClose={() => { setModalMode(null); setSelectedUser(null); }}
        title="Delete User"
        size="sm"
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Trash2 size={24} className="text-red-400" />
          </div>
          <p className="text-white text-sm mb-2">
            Are you sure you want to delete <strong>{selectedUser?.username || 'this user'}</strong>?
          </p>
          <p className="text-gray-500 text-xs mb-6">This will remove all user data including goals and progress.</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => { setModalMode(null); setSelectedUser(null); }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={saving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
            >
              {saving ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
