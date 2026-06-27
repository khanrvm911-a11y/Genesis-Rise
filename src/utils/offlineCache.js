const CACHE_PREFIX = 'gr_cache_';
const CACHE_INDEX_KEY = 'gr_cache_index';
const DEFAULT_TTL = 5 * 60 * 1000;

function getIndex() {
  try { return JSON.parse(localStorage.getItem(CACHE_INDEX_KEY) || '{}'); }
  catch { return {}; }
}

function setIndex(index) {
  localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(index));
}

export function cacheData(key, data, ttl = DEFAULT_TTL) {
  const cacheKey = CACHE_PREFIX + key;
  const entry = {
    data,
    cachedAt: Date.now(),
    ttl,
  };
  try {
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    const index = getIndex();
    index[key] = { cachedAt: Date.now(), ttl };
    setIndex(index);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      pruneCache();
      try { localStorage.setItem(cacheKey, JSON.stringify(entry)); }
      catch {}
    }
  }
}

export function getCachedData(key) {
  const cacheKey = CACHE_PREFIX + key;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function getCachedDataWithAge(key) {
  const cacheKey = CACHE_PREFIX + key;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return { data: null, age: null, isStale: true };
    const entry = JSON.parse(raw);
    const age = Date.now() - entry.cachedAt;
    const isStale = age > entry.ttl;
    return { data: entry.data, age, isStale, cachedAt: entry.cachedAt };
  } catch {
    return { data: null, age: null, isStale: true };
  }
}

export function isCached(key) {
  return getCachedData(key) !== null;
}

export function invalidateCache(key) {
  const cacheKey = CACHE_PREFIX + key;
  localStorage.removeItem(cacheKey);
  const index = getIndex();
  delete index[key];
  setIndex(index);
}

export function clearAllCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(k => {
    if (k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
  });
  localStorage.removeItem(CACHE_INDEX_KEY);
}

export function getCacheAge(key) {
  const index = getIndex();
  const entry = index[key];
  if (!entry) return null;
  return Date.now() - entry.cachedAt;
}

export function getAllCacheKeys() {
  return Object.keys(getIndex());
}

export function getCacheStats() {
  const index = getIndex();
  const keys = Object.keys(index);
  let totalSize = 0;
  let expiredCount = 0;
  const now = Date.now();
  keys.forEach(key => {
    const entry = index[key];
    if (now - entry.cachedAt > entry.ttl) expiredCount++;
    const cacheKey = CACHE_PREFIX + key;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) totalSize += raw.length;
    } catch {}
  });
  return { totalEntries: keys.length, expiredEntries: expiredCount, totalSizeBytes: totalSize };
}

function pruneCache() {
  const index = getIndex();
  const entries = Object.entries(index)
    .map(([key, meta]) => ({ key, age: Date.now() - meta.cachedAt, ttl: meta.ttl }))
    .sort((a, b) => b.age - a.age);
  const toRemove = entries.slice(Math.floor(entries.length * 0.3));
  toRemove.forEach(({ key }) => {
    localStorage.removeItem(CACHE_PREFIX + key);
    delete index[key];
  });
  setIndex(index);
}

export function refreshCache(key, fetchFn, ttl = DEFAULT_TTL) {
  return fetchFn().then(data => {
    cacheData(key, data, ttl);
    return data;
  }).catch(() => {
    return getCachedData(key);
  });
}

export const CACHE_KEYS = {
  EXERCISES: 'exercises',
  WORKOUT_HISTORY: 'workout_history',
  PLANS: 'plans',
  USER_SETTINGS: 'user_settings',
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  DAILY_GOALS: 'daily_goals',
  HEALTH_METRICS: 'health_metrics',
  ANALYTICS: 'analytics',
  ACHIEVEMENTS: 'achievements',
};
