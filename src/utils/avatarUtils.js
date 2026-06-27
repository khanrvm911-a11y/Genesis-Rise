import { AVATAR_PRESETS } from './avatarPresets';

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const SAFE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const SAFE_DATA_URL_PATTERN = /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i;

export function validateAvatarFile(file) {
  if (!file) return 'Choose an image file';
  if (!SAFE_IMAGE_TYPES.has(file.type)) return 'Use a PNG, JPG, WebP, or GIF image';
  if (file.size > MAX_AVATAR_SIZE) return 'Image must be under 2 MB';
  return '';
}

export function isSafeAvatarValue(avatar, avatarType) {
  if (!avatarType || avatarType === 'initial') return true;
  if (avatarType === 'preset') return AVATAR_PRESETS.some(preset => preset.id === avatar);
  if (avatarType === 'custom') {
    return typeof avatar === 'string'
      && avatar.length <= 3000000
      && SAFE_DATA_URL_PATTERN.test(avatar);
  }
  return false;
}
