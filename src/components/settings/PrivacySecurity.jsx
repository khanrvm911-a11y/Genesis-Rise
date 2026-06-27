import { useState } from 'react';
import { Shield, Download, Trash2, LogOut, Share2, Fingerprint, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function PrivacySecurity({ settings, onUpdate, showToast }) {
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const handleExportData = () => {
    const keys = [
      'sl_exercises', 'sl_workout_history', 'sl_personal_records', 'sl_workout_templates',
      'sl_user_settings', 'sl_mission_progress', 'sl_user_xp', 'sl_user_level',
      'sl_power_level', 'sl_weekly_change', 'gr_avatar', 'gr_avatar_type',
      'gr_workout_plans', 'gr_weekly_schedule', 'gr_active_plan_id', 'gr_todays_workout',
      'sl_daily_goals', 'gr_coach_conversations', 'gr_app_settings',
    ];
    const data = {};
    keys.forEach(k => {
      try { const val = localStorage.getItem(k); if (val) data[k] = JSON.parse(val); }
      catch { try { const val = localStorage.getItem(k); if (val) data[k] = val; } catch {} }
    });
    data._exportedAt = new Date().toISOString();
    data._userId = user?.id;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-rise-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      await logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete account');
    }
  };

  const dataSharing = settings.privacy?.dataSharing || false;

  return (
    <>
      <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-sl-purple/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-sl-purple-light" />
            Privacy & Security
          </h3>
        </div>

        <div className="px-4 py-3.5 border-b border-sl-purple/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-4 h-4 text-sl-purple-light" />
            <div>
              <p className="text-xs font-semibold text-white">Data Sharing</p>
              <p className="text-[10px] text-sl-purple-light/60 mt-0.5">Help improve Genesis Rise with usage data</p>
            </div>
          </div>
          <button onClick={() => { onUpdate('privacy.dataSharing', !dataSharing); showToast(dataSharing ? 'Data sharing disabled' : 'Data sharing enabled'); }}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${dataSharing ? 'bg-sl-purple' : 'bg-sl-gray/40'}`}
            role="switch" aria-checked={dataSharing} aria-label="Data sharing">
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${dataSharing ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="px-4 py-3.5 border-b border-sl-purple/10">
          <button onClick={handleExportData} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-sl-purple-light" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Download Personal Data</p>
                <p className="text-[10px] text-sl-purple-light/60 mt-0.5">Export all your data as JSON</p>
              </div>
            </div>
            <span className="text-xs text-sl-purple-light/60">JSON</span>
          </button>
        </div>

        <div className="px-4 py-3.5 border-b border-sl-purple/10">
          <button onClick={() => showToast('Signing out from other devices...')}
            className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-sl-purple-light" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Sign Out From Other Devices</p>
                <p className="text-[10px] text-sl-purple-light/60 mt-0.5">End sessions on other devices</p>
              </div>
            </div>
          </button>
        </div>

        <div className="px-4 py-3.5">
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-400" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Delete Account</p>
                <p className="text-[10px] text-sl-purple-light/60 mt-0.5">Permanently delete your account and data</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm bg-sl-dark border border-red-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Account</h3>
                <p className="text-[10px] text-sl-gray-light">This cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-sl-gray-light mb-4 leading-relaxed">
              All your data will be permanently deleted. Type <strong className="text-red-400">delete</strong> to confirm.
            </p>
            <input type="text" value={deleteText} onChange={(e) => setDeleteText(e.target.value)}
              placeholder='Type "delete" to confirm'
              className="w-full h-10 rounded-xl bg-sl-gray/40 border border-red-500/20 text-sm text-white px-3 mb-3 focus:outline-none focus:border-red-500/40 transition" />
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                className="flex-1 h-10 rounded-xl bg-sl-gray/20 border border-sl-purple/15 text-xs font-bold text-sl-gray-light hover:bg-sl-gray/30 transition">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteText !== 'delete'}
                className="flex-1 h-10 rounded-xl bg-red-600 border border-red-500/30 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-40">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
