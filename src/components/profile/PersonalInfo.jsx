import { useState } from 'react';
import {
  User, ArrowLeft, Save, X, Check,
  Ruler, Weight, Calendar, Target, Dumbbell,
} from 'lucide-react';

const GOALS = [
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'lose_fat', label: 'Lose Fat' },
  { value: 'improve_fitness', label: 'Improve Fitness' },
  { value: 'increase_strength', label: 'Increase Strength' },
  { value: 'maintain_health', label: 'Maintain Health' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function PersonalInfo({
  user, profile, userSettings,
  onUpdateAvatar, onUpdateProfile, onUpdateUsername, onBack,
}) {
  const [username, setUsername] = useState(profile?.username || '');
  const [age, setAge] = useState(String(profile?.age || userSettings?.age || ''));
  const [height, setHeight] = useState(String(profile?.height_cm || userSettings?.height || ''));
  const [weight, setWeight] = useState(String(profile?.weight_kg || userSettings?.weight || ''));
  const [goal, setGoal] = useState(profile?.goal || '');
  const [experience, setExperience] = useState(profile?.experience || '');
  const [workoutDays, setWorkoutDays] = useState(String(profile?.workout_days || ''));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    const usernameChanged = username !== (profile?.username || '');
    if (usernameChanged) {
      if (!/^[a-zA-Z0-9 ]+$/.test(username)) {
        setError('Letters, numbers, and spaces only');
        setSaving(false);
        return;
      }
      if (username.length < 2 || username.length > 30) {
        setError('Username must be 2-30 characters');
        setSaving(false);
        return;
      }
      const ok = await onUpdateUsername(username);
      if (!ok) {
        setError('Failed to update username');
        setSaving(false);
        return;
      }
    }

    const updates = [];
    const ageNum = parseInt(age);
    if (ageNum && ageNum !== (profile?.age || userSettings?.age)) {
      const ok = await onUpdateProfile('age', ageNum);
      if (!ok) updates.push('age');
    }

    const heightNum = parseFloat(height);
    if (heightNum && heightNum !== (profile?.height_cm || userSettings?.height)) {
      const ok = await onUpdateProfile('height_cm', heightNum);
      if (!ok) updates.push('height_cm');
    }

    const weightNum = parseFloat(weight);
    if (weightNum && weightNum !== (profile?.weight_kg || userSettings?.weight)) {
      const ok = await onUpdateProfile('weight_kg', weightNum);
      if (!ok) updates.push('weight_kg');
    }

    if (goal && goal !== profile?.goal) {
      const ok = await onUpdateProfile('goal', goal);
      if (!ok) updates.push('goal');
    }

    if (experience && experience !== profile?.experience) {
      const ok = await onUpdateProfile('experience', experience);
      if (!ok) updates.push('experience');
    }

    const wdNum = parseInt(workoutDays);
    if (wdNum && wdNum !== profile?.workout_days) {
      const ok = await onUpdateProfile('workout_days', wdNum);
      if (!ok) updates.push('workout_days');
    }

    setSaving(false);
    if (updates.length === 0) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError(`Failed to save: ${updates.join(', ')}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-sl-purple-light" />
          Personal Information
        </h2>
        <button onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-wider text-sl-purple-light/60 hover:text-sl-purple-light transition flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
      </div>

      <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 p-4 space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 block">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ''))}
            className="w-full h-10 rounded-xl bg-sl-gray/40 border border-sl-purple/15 text-sm text-white px-3 focus:outline-none focus:border-sl-purple/40 transition" />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 block">Email</label>
          <input type="email" value={user?.email || ''} disabled
            className="w-full h-10 rounded-xl bg-sl-gray/30 border border-sl-purple/10 text-sm text-sl-gray-light/60 px-3 cursor-not-allowed" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Age
            </label>
            <input type="number" value={age} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setAge(v); }}
              min="13" max="120"
              className="w-full h-10 rounded-xl bg-sl-gray/40 border border-sl-purple/15 text-sm text-white px-3 focus:outline-none focus:border-sl-purple/40 transition" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              Height (cm)
            </label>
            <input type="number" value={height} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setHeight(v); }}
              min="100" max="250" step="0.1"
              className="w-full h-10 rounded-xl bg-sl-gray/40 border border-sl-purple/15 text-sm text-white px-3 focus:outline-none focus:border-sl-purple/40 transition" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 flex items-center gap-1">
              <Weight className="w-3 h-3" />
              Weight (kg)
            </label>
            <input type="number" value={weight} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setWeight(v); }}
              min="20" max="500" step="0.1"
              className="w-full h-10 rounded-xl bg-sl-gray/40 border border-sl-purple/15 text-sm text-white px-3 focus:outline-none focus:border-sl-purple/40 transition" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              Workout Days
            </label>
            <input type="number" value={workoutDays} onChange={(e) => { const v = e.target.value; if (v === '' || /^\d*\.?\d*$/.test(v)) setWorkoutDays(v); }}
              min="1" max="7"
              className="w-full h-10 rounded-xl bg-sl-gray/40 border border-sl-purple/15 text-sm text-white px-3 focus:outline-none focus:border-sl-purple/40 transition" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Fitness Goal
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(g => (
              <button key={g.value} onClick={() => setGoal(g.value === goal ? '' : g.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold border transition ${
                  goal === g.value
                    ? 'bg-sl-purple/20 border-sl-purple/40 text-sl-purple-light'
                    : 'bg-sl-gray/30 border-sl-purple/10 text-sl-gray-light hover:bg-sl-gray/40'
                }`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-sl-gray-light mb-1.5 block">Experience Level</label>
          <div className="grid grid-cols-3 gap-2">
            {EXPERIENCE_LEVELS.map(e => (
              <button key={e.value} onClick={() => setExperience(e.value === experience ? '' : e.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold border transition ${
                  experience === e.value
                    ? 'bg-sl-purple/20 border-sl-purple/40 text-sl-purple-light'
                    : 'bg-sl-gray/30 border-sl-purple/10 text-sl-gray-light hover:bg-sl-gray/40'
                }`}>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-xl bg-sl-purple/20 border border-sl-purple/30 text-xs font-bold text-sl-purple-light hover:bg-sl-purple/30 transition flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? (
              <span className="w-4 h-4 border-2 border-sl-purple/30 border-t-sl-purple rounded-full animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
          <button onClick={onBack}
            className="h-10 px-4 rounded-xl bg-sl-gray/20 border border-sl-purple/15 text-xs font-bold text-sl-gray-light hover:bg-sl-gray/30 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
