import { useState } from 'react';
import { User, KeyRound, Mail, Camera, Shield, Check, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';
import { supabase } from '../../lib/supabase';
import { AVATAR_PRESETS, getAvatarEmoji } from '../../utils/avatarPresets';
import { validateAvatarFile } from '../../utils/avatarUtils';

export default function AccountSettings({ settings, onUpdate, showToast }) {
  const { user, updateUser } = useAuth();
  const { avatar, avatarType, updateAvatar } = useAvatar();

  const [editing, setEditing] = useState(null);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const provider = user?.app_metadata?.provider || 'email';

  const handleSaveUsername = async () => {
    const trimmed = username.trim();
    if (!/^[a-zA-Z0-9 ]+$/.test(trimmed)) { setError('Letters, numbers, and spaces only'); return; }
    if (trimmed.length < 2 || trimmed.length > 30) { setError('Username must be 2-30 characters'); return; }
    setSaving(true); setError('');
    try {
      await updateUser({ data: { username: trimmed } });
      await supabase.from('profiles').update({ username: trimmed }).eq('id', user.id);
      setEditing(null);
      showToast('Username updated');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleSaveEmail = async () => {
    if (!email.includes('@')) { setError('Invalid email'); return; }
    setSaving(true); setError('');
    try {
      await updateUser({ email });
      setEditing(null);
      showToast('Verification email sent to new address');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleSavePassword = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== passwordConfirm) { setError('Passwords do not match'); return; }
    setSaving(true); setError('');
    try {
      await updateUser({ password });
      setShowPassword(false);
      setPassword('');
      setPasswordConfirm('');
      showToast('Password updated');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleSaveDisplayName = async () => {
    const trimmed = displayName.trim();
    if (trimmed.length < 1) { setError('Display name is required'); return; }
    setSaving(true); setError('');
    try {
      await updateUser({ data: { full_name: trimmed } });
      setEditing(null);
      showToast('Display name updated');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleAvatarSelect = (presetId) => {
    updateAvatar(presetId, 'preset');
    setShowAvatarPicker(false);
    showToast('Avatar updated');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateAvatarFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        updateAvatar(ev.target.result, 'custom');
        setShowAvatarPicker(false);
        showToast('Avatar updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const SettingRow = ({ label, value, onEdit, children }) => (
    <div className="px-4 py-3.5 border-b border-sl-purple/10 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">{label}</p>
          {children || <p className="text-[11px] text-sl-purple-light/60 truncate mt-0.5">{value}</p>}
        </div>
        {onEdit && (
          <button onClick={onEdit}
            className="shrink-0 text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80 transition">
            Edit
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-sl-purple/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-sl-purple-light" />
          Account
        </h3>
      </div>

      <SettingRow label="Profile Picture" value={avatarType === 'custom' ? 'Custom photo' : avatarType === 'preset' ? 'Preset icon' : 'Initial'}>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-sl-purple/20 border border-sl-purple/30 flex items-center justify-center overflow-hidden">
            {avatarType === 'custom' && avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : avatarType === 'preset' && avatar ? (
              <span className="text-sm">{getAvatarEmoji(avatar)}</span>
            ) : (
              <span className="text-sm text-sl-purple-light font-bold">
                {(user?.email || 'C').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button onClick={() => setShowAvatarPicker(true)}
            className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80 flex items-center gap-1">
            <Camera className="w-3 h-3" /> Change
          </button>
        </div>
      </SettingRow>

      <SettingRow label="Display Name" value={user?.user_metadata?.full_name || 'Not set'}>
        {editing === 'displayName' ? (
          <div className="flex items-center gap-2 mt-1.5">
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="flex-1 h-8 rounded-lg bg-sl-gray/40 border border-sl-purple/15 text-xs text-white px-2.5 focus:outline-none focus:border-sl-purple/40 transition" />
            <button onClick={handleSaveDisplayName} disabled={saving}
              className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditing(null)}
              className="w-7 h-7 rounded-lg bg-sl-gray/30 border border-sl-purple/15 flex items-center justify-center text-sl-purple-light/60 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={() => { setEditing('displayName'); setDisplayName(user?.user_metadata?.full_name || ''); setError(''); }}
            className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80 mt-1">Edit</button>
        )}
      </SettingRow>

      <SettingRow label="Username" value={`@${user?.user_metadata?.username || 'not set'}`}>
        {editing === 'username' ? (
          <div className="flex items-center gap-2 mt-1.5">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ''))}
              className="flex-1 h-8 rounded-lg bg-sl-gray/40 border border-sl-purple/15 text-xs text-white px-2.5 focus:outline-none focus:border-sl-purple/40 transition" />
            <button onClick={handleSaveUsername} disabled={saving}
              className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditing(null)}
              className="w-7 h-7 rounded-lg bg-sl-gray/30 border border-sl-purple/15 flex items-center justify-center text-sl-purple-light/60 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={() => { setEditing('username'); setUsername(user?.user_metadata?.username || ''); setError(''); }}
            className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80 mt-1">Edit</button>
        )}
      </SettingRow>

      {provider === 'email' && (
        <>
          <SettingRow label="Email" value={user?.email || 'Not set'}>
            {editing === 'email' ? (
              <div className="flex items-center gap-2 mt-1.5">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-8 rounded-lg bg-sl-gray/40 border border-sl-purple/15 text-xs text-white px-2.5 focus:outline-none focus:border-sl-purple/40 transition" />
                <button onClick={handleSaveEmail} disabled={saving}
                  className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditing(null)}
                  className="w-7 h-7 rounded-lg bg-sl-gray/30 border border-sl-purple/15 flex items-center justify-center text-sl-purple-light/60 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => { setEditing('email'); setEmail(user?.email || ''); setError(''); }}
                className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80 mt-1">Change</button>
            )}
          </SettingRow>

          <div className="px-4 py-3.5 border-b border-sl-purple/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Password</p>
                <p className="text-[11px] text-sl-purple-light/60 mt-0.5">Change your password</p>
              </div>
              <button onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80">
                {showPassword ? 'Cancel' : 'Change'}
              </button>
            </div>
            {showPassword && (
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full h-9 rounded-lg bg-sl-gray/40 border border-sl-purple/15 text-xs text-white px-2.5 pr-8 focus:outline-none focus:border-sl-purple/40 transition" />
                </div>
                <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full h-9 rounded-lg bg-sl-gray/40 border border-sl-purple/15 text-xs text-white px-2.5 focus:outline-none focus:border-sl-purple/40 transition" />
                <div className="flex gap-2">
                  <button onClick={handleSavePassword} disabled={saving}
                    className="flex-1 h-8 rounded-lg bg-sl-purple/20 border border-sl-purple/30 text-[10px] font-bold text-sl-purple-light hover:bg-sl-purple/30 transition">
                    {saving ? 'Saving...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {provider === 'google' && (
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-white">Google Account</p>
              <p className="text-[11px] text-sl-purple-light/60">Signed in with Google. Manage via Google Account settings.</p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="px-4 py-2 text-xs text-red-400">{error}</p>}

      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm bg-sl-dark border border-sl-purple/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Edit Avatar</h3>
              <button onClick={() => setShowAvatarPicker(false)} className="text-sl-gray-light hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {AVATAR_PRESETS.map(p => (
                <button key={p.id} onClick={() => handleAvatarSelect(p.id)}
                  className={`aspect-square rounded-full bg-gradient-to-br ${p.colors} flex items-center justify-center border-2 transition hover:scale-110 ${avatarType === 'preset' && avatar === p.id ? 'border-white shadow-sl-glow' : 'border-transparent'}`}>
                  <span className="text-lg">{getAvatarEmoji(p.id)}</span>
                </button>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sl-purple/20 border border-sl-purple/30 text-sl-purple-light text-sm font-semibold cursor-pointer hover:bg-sl-purple/30 transition">
              <Camera className="w-4 h-4" />
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
