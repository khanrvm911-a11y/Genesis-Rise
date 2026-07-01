import { useState, useRef } from 'react';
import {
  Crown, Calendar, Target, Flame, Zap, Shield,
  ChevronRight, Camera, X, Dumbbell, Activity, Heart, Star,
  ArrowUp, ArrowDown, Minus, User,
} from 'lucide-react';
import { AVATAR_PRESETS } from '../../utils/avatarPresets';
import { validateAvatarFile } from '../../utils/avatarUtils';
import { requestStoragePermission } from '../../lib/permissions';

export default function ProfileHero({
  user, profile, level, xp, progress, xpForNext, title,
  powerLevel, weeklyChange, currentStreak, longestStreak,
  avatar, avatarType, hasWorkouts, onEditProfile, onUpdateAvatar,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleUploadClick = async () => {
    const granted = await requestStoragePermission();
    if (granted) fileInputRef.current?.click();
  };

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const goal = profile?.goal || null;
  const goalLabel = goal ? goal.charAt(0).toUpperCase() + goal.slice(1).replace(/_/g, ' ') : null;

  const username = profile?.username || '';
  const displayName = username;
  const email = user?.email || '';

  const handleAvatarSelect = (presetId) => {
    onUpdateAvatar(presetId, 'preset');
    setShowPicker(false);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    const validationError = validateAvatarFile(file);
    if (validationError) {
      setUploadError(validationError);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        onUpdateAvatar(ev.target.result, 'custom');
        setShowPicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-sl-purple/15 bg-gradient-to-br from-sl-purple/15 via-sl-purple/5 to-transparent p-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-sl-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-sl-purple/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-sl-purple/30 shadow-sl-glow">
              {avatarType === 'custom' && avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : avatarType === 'preset' && avatar ? (
                <div className={`w-full h-full bg-gradient-to-br ${AVATAR_PRESETS.find(p => p.id === avatar)?.colors || 'from-sl-purple to-sl-red'} flex items-center justify-center`}>
                  {(() => {
                    const Icon = AVATAR_PRESETS.find(p => p.id === avatar)?.icon || Dumbbell;
                    return <Icon className="w-7 h-7 text-white" />;
                  })()}
                </div>
              ) : user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-sl-purple/20 flex items-center justify-center">
                  <span className="text-sl-purple-light font-bold text-2xl">
                    {(username || email || 'C').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => setShowPicker(true)}
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-sl-purple border-2 border-sl-dark flex items-center justify-center hover:bg-sl-purple-light transition">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{displayName}</h1>
                {username && username !== displayName && (
                  <p className="text-[11px] text-sl-purple-light/60 truncate">@{username}</p>
                )}
                {email && !username && (
                  <p className="text-[11px] text-sl-purple-light/60 truncate">{email}</p>
                )}
              </div>
              <button onClick={onEditProfile}
                className="shrink-0 h-7 px-2.5 rounded-lg bg-sl-purple/20 border border-sl-purple/30 text-[10px] font-bold text-sl-purple-light hover:bg-sl-purple/30 transition flex items-center gap-1">
                <User className="w-3 h-3" />
                Edit
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sl-purple/15 border border-sl-purple/20">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] font-bold text-white">{title}</span>
                <span className="text-[10px] font-bold text-sl-purple-light">Lv.{level}</span>
              </div>
              {goalLabel && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-300">{goalLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-sl-gray-light">XP Progress</span>
            <span className="text-[10px] font-bold text-sl-purple-light">{xp.toLocaleString()} / {(xp + Math.round((1 - progress) * xpForNext)).toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-sl-gray/40 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sl-purple to-sl-red transition-all duration-1000"
              style={{ width: `${Math.min(progress * 100, 100)}%` }} />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-lg bg-sl-gray/20 p-2.5 text-center">
            <p className="text-sm font-bold text-white">{currentStreak}</p>
            <p className="text-[8px] font-semibold uppercase tracking-wider text-sl-gray-light">Day Streak</p>
          </div>
          <div className="rounded-lg bg-sl-gray/20 p-2.5 text-center">
            <p className="text-sm font-bold text-white">{longestStreak}</p>
            <p className="text-[8px] font-semibold uppercase tracking-wider text-sl-gray-light">Best Streak</p>
          </div>
          <div className="rounded-lg bg-sl-gray/20 p-2.5 text-center">
            <div className="flex items-center justify-center gap-0.5">
              <span className="text-sm font-bold text-white">{powerLevel}</span>
              {weeklyChange !== 0 && (
                weeklyChange > 0
                  ? <ArrowUp className="w-3 h-3 text-emerald-400" />
                  : <ArrowDown className="w-3 h-3 text-red-400" />
              )}
            </div>
            <p className="text-[8px] font-semibold uppercase tracking-wider text-sl-gray-light">Power</p>
          </div>
        </div>

        {joinDate && (
          <div className="relative z-10 flex items-center justify-between mt-3 pt-3 border-t border-sl-purple/10">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-sl-purple-light/50" />
              <span className="text-[10px] text-sl-purple-light/50">Joined {joinDate}</span>
            </div>
            {hasWorkouts && (
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[10px] font-semibold text-orange-300">Active</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm bg-sl-dark border border-sl-purple/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Edit Avatar</h3>
              <button onClick={() => setShowPicker(false)} className="text-sl-gray-light hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {AVATAR_PRESETS.map(preset => {
                const Icon = preset.icon;
                return (
                  <button key={preset.id} onClick={() => handleAvatarSelect(preset.id)}
                    className={`aspect-square rounded-full bg-gradient-to-br ${preset.colors} flex items-center justify-center border-2 transition hover:scale-110 ${avatarType === 'preset' && avatar === preset.id ? 'border-white shadow-sl-glow' : 'border-transparent'}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </button>
                );
              })}
            </div>
            <button onClick={handleUploadClick} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-sl-purple/20 border border-sl-purple/30 text-sl-purple-light text-sm font-semibold cursor-pointer hover:bg-sl-purple/30 transition">
              <Camera className="w-4 h-4" />
              Upload Photo
            </button>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} ref={fileInputRef} />
            {uploadError && <p className="text-red-400 text-xs text-center mt-2">{uploadError}</p>}
          </div>
        </div>
      )}
    </>
  );
}
