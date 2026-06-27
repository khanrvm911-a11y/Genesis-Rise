import { Dumbbell, Activity, Heart, Flame, Zap, Shield, Crown, Star } from 'lucide-react';

export const AVATAR_PRESETS = [
  { id: 'dumbbell', icon: Dumbbell, colors: 'from-sl-purple to-sl-red', emoji: '\u{1F3CB}\uFE0F' },
  { id: 'activity', icon: Activity, colors: 'from-blue-500 to-cyan-400', emoji: '\u{1F4CA}' },
  { id: 'heart', icon: Heart, colors: 'from-red-500 to-pink-400', emoji: '\u2764\uFE0F' },
  { id: 'flame', icon: Flame, colors: 'from-orange-500 to-red-400', emoji: '\u{1F525}' },
  { id: 'zap', icon: Zap, colors: 'from-yellow-500 to-amber-400', emoji: '\u26A1' },
  { id: 'shield', icon: Shield, colors: 'from-emerald-500 to-teal-400', emoji: '\u{1F6E1}\uFE0F' },
  { id: 'crown', icon: Crown, colors: 'from-purple-500 to-pink-400', emoji: '\u{1F451}' },
  { id: 'star', icon: Star, colors: 'from-amber-500 to-orange-400', emoji: '\u2B50' },
];

export function getAvatarPreset(id) {
  return AVATAR_PRESETS.find(p => p.id === id);
}

export function getAvatarIcon(id) {
  return getAvatarPreset(id)?.icon;
}

export function getAvatarColors(id) {
  return getAvatarPreset(id)?.colors || 'from-sl-purple to-sl-red';
}

export function getAvatarEmoji(id) {
  return getAvatarPreset(id)?.emoji || '\u{1F464}';
}
