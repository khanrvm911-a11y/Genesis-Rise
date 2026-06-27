import { useState } from 'react';
import {
  Settings, KeyRound, Mail, Trash2, Download,
  Shield, ChevronRight, ArrowLeft, X, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AccountSection({ user, onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const provider = user?.app_metadata?.provider || 'email';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPasswordDone(true);
      setPassword('');
      setPasswordConfirm('');
      setTimeout(() => {
        setPasswordDone(false);
        setShowPassword(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExportData = () => {
    const keys = [
      'sl_exercises', 'sl_workout_history', 'sl_personal_records', 'sl_workout_templates',
      'sl_user_settings', 'sl_mission_progress', 'sl_user_xp', 'sl_user_level',
      'sl_power_level', 'sl_weekly_change', 'gr_avatar', 'gr_avatar_type',
      'gr_workout_plans', 'gr_weekly_schedule', 'gr_active_plan_id', 'gr_todays_workout',
      'sl_daily_goals', 'gr_coach_conversations',
    ];
    const data = {};
    keys.forEach(k => {
      try {
        const val = localStorage.getItem(k);
        if (val) data[k] = JSON.parse(val);
      } catch {
        try { data[k] = localStorage.getItem(k); } catch {}
      }
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-sl-purple-light" />
          Account
        </h2>
        {onBack && (
          <button onClick={onBack}
            className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
        )}
      </div>

      <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-sl-purple/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-sl-purple-light" />
            <div>
              <p className="text-xs font-semibold text-white">Email</p>
              <p className="text-[11px] text-sl-gray-light">{user?.email || 'Not set'}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-sl-purple/10 text-sl-purple-light border border-sl-purple/20">
            {provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'Email'}
          </span>
        </div>

        {provider === 'email' && (
          <div className="px-4 py-3 border-b border-sl-purple/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-sl-purple-light" />
              <div>
                <p className="text-xs font-semibold text-white">Password</p>
                <p className="text-[11px] text-sl-gray-light">Change your password</p>
              </div>
            </div>
            <button onClick={() => setShowPassword(!showPassword)}
              className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80 transition">
              {showPassword ? 'Cancel' : 'Change'}
            </button>
          </div>
        )}

        {provider === 'google' && (
          <div className="px-4 py-3 border-b border-sl-purple/10">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-semibold text-white">Google Account</p>
                <p className="text-[11px] text-sl-gray-light">Signed in with Google. Manage via Google Account settings.</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 py-3 border-b border-sl-purple/10">
          <button onClick={handleExportData}
            className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-sl-purple-light" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Export Data</p>
                <p className="text-[11px] text-sl-gray-light">Download your personal data</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sl-purple-light/30" />
          </button>
        </div>

        <div className="px-4 py-3">
          <button onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4 text-red-400" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Delete Account</p>
                <p className="text-[11px] text-sl-gray-light">Permanently delete your account</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sl-purple-light/30" />
          </button>
        </div>
      </div>

      {showPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm bg-sl-dark border border-sl-purple/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sl-purple-light" />
                Change Password
              </h3>
              <button onClick={() => { setShowPassword(false); setPasswordError(''); }}
                className="text-sl-gray-light hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {passwordDone ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                  <KeyRound className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white">Password Updated</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 block">New Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 rounded-xl bg-sl-gray/40 border border-sl-purple/15 text-sm text-white px-3 focus:outline-none focus:border-sl-purple/40 transition"
                    placeholder="Min 6 characters" minLength={6} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 block">Confirm Password</label>
                  <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full h-10 rounded-xl bg-sl-gray/40 border border-sl-purple/15 text-sm text-white px-3 focus:outline-none focus:border-sl-purple/40 transition"
                    placeholder="Repeat password" />
                </div>
                {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
                <button type="submit" disabled={passwordSaving}
                  className="w-full h-10 rounded-xl bg-sl-purple/20 border border-sl-purple/30 text-xs font-bold text-sl-purple-light hover:bg-sl-purple/30 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {passwordSaving ? (
                    <span className="w-4 h-4 border-2 border-sl-purple/30 border-t-sl-purple rounded-full animate-spin" />
                  ) : null}
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm bg-sl-dark border border-red-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Account</h3>
                <p className="text-[10px] text-sl-gray-light">This action cannot be undone</p>
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
              <button onClick={async () => {
                if (deleteText !== 'delete') return;
                try {
                  const { error } = await supabase.rpc('delete_user_account');
                  if (error) throw error;
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                } catch (err) {
                  console.error('Delete account error:', err);
                }
              }}
                disabled={deleteText !== 'delete'}
                className="flex-1 h-10 rounded-xl bg-red-600 border border-red-500/30 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-40">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
