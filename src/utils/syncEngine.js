import { supabase } from '../lib/supabase';

const SYNC_QUEUE_KEY = 'gr_sync_queue';
const SYNC_META_KEY = 'gr_sync_meta';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;

let processing = false;
let listeners = [];

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getQueue() {
  try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'); }
  catch { return []; }
}

function setQueue(queue) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

function getMeta() {
  try { return JSON.parse(localStorage.getItem(SYNC_META_KEY) || '{}'); }
  catch { return {}; }
}

function setMeta(meta) {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

function notify() {
  const state = getSyncState();
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.push(fn);
  fn(getSyncState());
  return () => { listeners = listeners.filter(f => f !== fn); };
}

export function getSyncState() {
  const queue = getQueue();
  const meta = getMeta();
  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    queueSize: queue.length,
    pendingCount: queue.filter(i => i.status === 'pending').length,
    syncingCount: queue.filter(i => i.status === 'syncing').length,
    failedCount: queue.filter(i => i.status === 'failed').length,
    lastSyncTime: meta.lastSyncTime || null,
    lastSyncResult: meta.lastSyncResult || null,
    isProcessing: processing,
  };
}

function getRetryDelay(retryCount) {
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
}

export function enqueue(type, action, payload, userId) {
  const item = {
    id: generateId(),
    type,
    action,
    payload,
    userId: userId || null,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    status: 'pending',
    lastError: null,
  };
  const queue = getQueue();
  queue.push(item);
  setQueue(queue);
  notify();
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    scheduleProcess();
  }
  return item.id;
}

export function enqueueMany(items) {
  const queue = getQueue();
  const enqueued = items.map(item => ({
    id: generateId(),
    ...item,
    timestamp: item.timestamp || new Date().toISOString(),
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    status: 'pending',
    lastError: null,
  }));
  queue.push(...enqueued);
  setQueue(queue);
  notify();
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    scheduleProcess();
  }
  return enqueued;
}

function scheduleProcess() {
  setTimeout(() => processQueue(), 100);
}

export async function processQueue() {
  if (processing) return;
  const queue = getQueue();
  const pending = queue.filter(i => i.status === 'pending' || i.status === 'failed');
  if (pending.length === 0) return;

  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  processing = true;
  notify();

  let synced = 0;
  let failed = 0;
  let errors = [];

  for (const item of pending) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) break;

    item.status = 'syncing';
    setQueue(queue);
    notify();

    try {
      await syncItem(item);
      item.status = 'completed';
      synced++;
    } catch (err) {
      item.retryCount++;
      if (item.retryCount >= item.maxRetries) {
        item.status = 'failed';
        item.lastError = err.message || 'Unknown error';
        errors.push({ id: item.id, error: item.lastError });
      } else {
        item.status = 'pending';
        item.lastError = err.message || 'Unknown error';
        failed++;
      }
    }
    setQueue(queue);
    notify();
  }

  const meta = getMeta();
  meta.lastSyncTime = new Date().toISOString();
  meta.lastSyncResult = { synced, failed, errors: errors.length > 0 ? errors : undefined };
  setMeta(meta);

  processing = false;
  notify();

  cleanCompleted();

  if (failed > 0) {
    const retryPending = getQueue().filter(i => i.status === 'pending');
    if (retryPending.length > 0 && typeof navigator !== 'undefined' && navigator.onLine) {
      const minDelay = Math.min(...retryPending.map(i => getRetryDelay(i.retryCount)));
      setTimeout(() => processQueue(), minDelay);
    }
  }

  return { synced, failed };
}

async function syncItem(item) {
  switch (item.type) {
    case 'workout_set':
      await syncWorkoutSet(item);
      break;
    case 'daily_goals':
      await syncDailyGoals(item);
      break;
    case 'water_intake':
      await syncWaterIntake(item);
      break;
    case 'weight_entry':
      await syncWeightEntry(item);
      break;
    case 'health_log':
      await syncHealthLog(item);
      break;
    case 'planner_change':
      await syncPlannerChange(item);
      break;
    case 'notification':
      await syncNotification(item);
      break;
    default:
      throw new Error(`Unknown sync type: ${item.type}`);
  }
}

async function syncWorkoutSet(item) {
  const { action, payload } = item;
  if (action === 'create') {
    const { data, error } = await supabase.from('workout_sets').insert({
      session_id: payload.sessionId,
      user_id: payload.userId,
      exercise_id: payload.exerciseId,
      exercise_name: payload.exerciseName,
      set_index: payload.setIndex,
      weight: payload.weight,
      reps: payload.reps,
      volume: (payload.weight || 0) * (payload.reps || 0),
      completed_at: payload.completedAt || new Date().toISOString(),
      client_id: payload.clientId || item.id,
    }).select('id');
    if (error) throw error;
  }
}

async function syncDailyGoals(item) {
  const { action, payload } = item;
  if (action === 'upsert') {
    const { error } = await supabase.from('daily_goals').upsert({
      user_id: payload.userId,
      date: payload.date,
      data: payload.data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, date' });
    if (error) throw error;
  }
}

async function syncWaterIntake(item) {
  const { payload } = item;
  const { error } = await supabase.from('daily_goals').upsert({
    user_id: payload.userId,
    date: payload.date,
    data: payload.data,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id, date' });
  if (error) throw error;
}

async function syncWeightEntry(item) {
  const { payload } = item;
  const { error } = await supabase.from('weight_entries').insert({
    user_id: payload.userId,
    weight: payload.weight,
    date: payload.date || new Date().toISOString().split('T')[0],
    notes: payload.notes || null,
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

async function syncHealthLog(item) {
  const { payload } = item;
  const { error } = await supabase.from('health_logs').upsert({
    user_id: payload.userId,
    date: payload.date,
    data: payload.data,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id, date' });
  if (error) throw error;
}

async function syncPlannerChange(item) {
  const { action, payload } = item;
  if (action === 'update_schedule') {
    const { error } = await supabase.from('weekly_schedule').upsert({
      user_id: payload.userId,
      day_of_week: payload.dayOfWeek,
      plan_id: payload.planId,
      is_rest_day: payload.isRestDay || false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, day_of_week' });
    if (error) throw error;
  }
}

async function syncNotification(item) {
  const { action, payload } = item;
  if (action === 'create') {
    const { data, error } = await supabase.from('notifications').insert({
      user_id: payload.userId,
      title: payload.title,
      message: payload.message || '',
      category: payload.category || 'system',
      icon: payload.icon || 'Bell',
      read: false,
      action_link: payload.actionLink || null,
      created_at: payload.createdAt || new Date().toISOString(),
    }).select('id');
    if (error) throw error;
  }
}

function cleanCompleted() {
  const queue = getQueue();
  const completed = queue.filter(i => i.status === 'completed');
  if (completed.length > 50) {
    const keep = queue.filter(i => i.status !== 'completed');
    const recentCompleted = completed.slice(-50);
    setQueue([...keep, ...recentCompleted]);
  }
}

export function removeCompleted() {
  const queue = getQueue();
  const pending = queue.filter(i => i.status !== 'completed');
  setQueue(pending);
  notify();
}

export function clearFailed() {
  const queue = getQueue();
  const filtered = queue.filter(i => i.status !== 'failed');
  setQueue(filtered);
  notify();
}

export function retryFailed() {
  const queue = getQueue();
  let changed = false;
  queue.forEach(i => {
    if (i.status === 'failed') {
      i.status = 'pending';
      i.retryCount = 0;
      changed = true;
    }
  });
  if (changed) {
    setQueue(queue);
    notify();
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      scheduleProcess();
    }
  }
}

export function forceSyncAll() {
  const queue = getQueue();
  let changed = false;
  queue.forEach(i => {
    if (i.status === 'pending' || i.status === 'failed') {
      i.status = 'pending';
      i.retryCount = 0;
      changed = true;
    }
  });
  if (changed) {
    setQueue(queue);
    notify();
    scheduleProcess();
  }
}

export function setupAutoSync() {
  const handleOnline = () => {
    notify();
    scheduleProcess();
  };
  const handleOffline = () => {
    notify();
  };
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function getQueueByType(type) {
  return getQueue().filter(i => i.type === type);
}

export function getQueueStats() {
  const queue = getQueue();
  const stats = {};
  queue.forEach(i => {
    if (!stats[i.type]) stats[i.type] = { total: 0, pending: 0, syncing: 0, completed: 0, failed: 0 };
    stats[i.type].total++;
    stats[i.type][i.status]++;
  });
  return stats;
}

export function enqueueNotification(title, message, userId, category, icon, actionLink) {
  return enqueue('notification', 'create', {
    title,
    message,
    userId,
    category: category || 'system',
    icon: icon || 'Bell',
    actionLink: actionLink || null,
    createdAt: new Date().toISOString(),
  }, userId);
}

export function enqueueDailyGoals(userId, date, data) {
  return enqueue('daily_goals', 'upsert', { userId, date, data }, userId);
}

export function enqueueWorkoutSet(setData) {
  return enqueue('workout_set', 'create', {
    sessionId: setData.sessionId,
    userId: setData.userId,
    exerciseId: setData.exerciseId,
    exerciseName: setData.exerciseName,
    setIndex: setData.setIndex,
    weight: setData.weight,
    reps: setData.reps,
    completedAt: setData.completedAt || new Date().toISOString(),
    clientId: setData.clientId || generateId(),
  }, setData.userId);
}

export function enqueueWeightEntry(userId, weight, date, notes) {
  return enqueue('weight_entry', 'create', { userId, weight, date: date || new Date().toISOString().split('T')[0], notes: notes || null }, userId);
}

export function enqueueHealthLog(userId, date, data) {
  return enqueue('health_log', 'upsert', { userId, date, data }, userId);
}

export function enqueuePlannerChange(userId, dayOfWeek, planId, isRestDay) {
  return enqueue('planner_change', 'update_schedule', { userId, dayOfWeek, planId, isRestDay }, userId);
}
