const STORAGE_KEY = 'gr_app_settings';

export const DEFAULT_SETTINGS = {
  appearance: {
    theme: 'dark',
    fontSize: 'medium',
  },
  units: {
    weight: 'kg',
    height: 'cm',
    distance: 'km',
    water: 'ml',
  },
  notifications: {
    workoutReminders: true,
    dailyGoals: true,
    achievements: true,
    weeklyReports: false,
    aiCoachInsights: true,
    systemAnnouncements: true,
  },
  privacy: {
    dataSharing: false,
  },
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return deepMerge(DEFAULT_SETTINGS, parsed);
    }
  } catch {}
  return { ...DEFAULT_SETTINGS, notifications: { ...DEFAULT_SETTINGS.notifications }, units: { ...DEFAULT_SETTINGS.units }, appearance: { ...DEFAULT_SETTINGS.appearance }, privacy: { ...DEFAULT_SETTINGS.privacy } };
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

function deepMerge(defaults, overrides) {
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = { ...defaults[key], ...overrides[key] };
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

export function applyTheme(theme) {
  const html = document.documentElement;
  html.classList.remove('theme-dark', 'theme-light', 'theme-system');
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
  } else {
    html.classList.add(`theme-${theme}`);
  }
  localStorage.setItem('gr_theme', theme);
}

export function applyFontSize(size) {
  const html = document.documentElement;
  html.classList.remove('text-sm', 'text-base', 'text-lg');
  const map = { small: 'text-sm', medium: 'text-base', large: 'text-lg' };
  html.classList.add(map[size] || 'text-base');
  localStorage.setItem('gr_font_size', size);
}

// Unit conversion helpers
export function convertWeight(value, from, to) {
  if (!value || from === to) return value;
  if (from === 'kg' && to === 'lbs') return Math.round(value * 2.20462 * 10) / 10;
  if (from === 'lbs' && to === 'kg') return Math.round(value / 2.20462 * 10) / 10;
  return value;
}

export function convertHeight(value, from, to) {
  if (!value || from === to) return value;
  if (from === 'cm' && to === 'ft') {
    const totalInches = value / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  }
  if (from === 'ft' && to === 'cm') {
    return Math.round((value.feet * 30.48 + (value.inches || 0) * 2.54) * 10) / 10;
  }
  return value;
}

export function convertDistance(value, from, to) {
  if (!value || from === to) return value;
  if (from === 'km' && to === 'mi') return Math.round(value / 1.60934 * 10) / 10;
  if (from === 'mi' && to === 'km') return Math.round(value * 1.60934 * 10) / 10;
  return value;
}

export function convertWater(value, from, to) {
  if (!value || from === to) return value;
  if (from === 'ml' && to === 'l') return Math.round(value / 1000 * 10) / 10;
  if (from === 'l' && to === 'ml') return Math.round(value * 1000);
  return value;
}

export const SETTINGS_SEARCH_INDEX = [
  { keywords: ['account', 'name', 'username', 'email', 'password', 'profile', 'picture', 'avatar', 'google'], section: 'account', label: 'Account' },
  { keywords: ['appearance', 'theme', 'dark', 'light', 'system', 'font', 'size', 'text', 'accent', 'color'], section: 'appearance', label: 'Appearance' },
  { keywords: ['units', 'weight', 'height', 'distance', 'water', 'kg', 'lbs', 'cm', 'ft', 'km', 'mi', 'ml', 'liter', 'measurement'], section: 'units', label: 'Units & Preferences' },
  { keywords: ['notifications', 'reminder', 'alert', 'goal', 'achievement', 'report', 'coach', 'insights', 'announcement'], section: 'notifications', label: 'Notifications' },
  { keywords: ['privacy', 'security', 'session', 'sign out', 'data', 'download', 'delete', 'account', 'sharing'], section: 'privacy', label: 'Privacy & Security' },
  { keywords: ['data', 'export', 'backup', 'restore', 'history', 'workout', 'progress', 'health', 'analytics'], section: 'data', label: 'Data Management' },
  { keywords: ['about', 'version', 'build', 'release', 'license', 'support', 'contact', 'bug', 'feature', 'terms', 'privacy', 'policy'], section: 'about', label: 'About' },
];

export function searchSettings(query) {
  if (!query?.trim()) return SETTINGS_SEARCH_INDEX.map(s => s.section);
  const q = query.toLowerCase();
  return SETTINGS_SEARCH_INDEX
    .filter(entry => entry.keywords.some(k => k.includes(q)) || entry.label.toLowerCase().includes(q))
    .map(entry => entry.section);
}
