import { supabase } from '../lib/supabase';
import { enqueueWorkoutSet, getSyncState, processQueue, subscribe } from './syncEngine';

const OFFLINE_QUEUE_KEY = 'gr_offline_sets_queue';
const ACTIVE_SESSION_KEY = 'gr_active_workout_session';

export function generateClientId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setOfflineQueue(queue) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function getOfflineQueueSize() {
  const state = getSyncState();
  const legacyQueue = getOfflineQueue().filter(i => !i.synced).length;
  return state.pendingCount + legacyQueue;
}

export function getActiveSessionId() {
  try {
    const session = JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY) || '{}');
    return session.sessionId || null;
  } catch {
    return null;
  }
}

export function setActiveSessionId(sessionId) {
  try {
    const session = JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY) || '{}');
    session.sessionId = sessionId;
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch {}
}

async function saveSetToSupabase(setData) {
  const { data, error } = await supabase.from('workout_sets').insert({
    session_id: setData.sessionId,
    user_id: setData.userId,
    exercise_id: setData.exerciseId,
    exercise_name: setData.exerciseName,
    set_index: setData.setIndex,
    weight: setData.weight,
    reps: setData.reps,
    volume: setData.weight * setData.reps,
    completed_at: setData.completedAt || new Date().toISOString(),
  }).select('id');

  if (error) throw error;
  return data?.[0]?.id;
}

export async function saveCompletedSet(setData) {
  const navigatorOnline = typeof navigator !== 'undefined' && navigator.onLine;

  if (navigatorOnline && setData.sessionId && setData.userId) {
    try {
      const serverId = await saveSetToSupabase(setData);
      return { saved: true, synced: true, clientId: setData.clientId || generateClientId(), serverId };
    } catch {}
  }

  const clientId = setData.clientId || generateClientId();
  enqueueWorkoutSet({ ...setData, clientId });

  const queue = getOfflineQueue();
  queue.push({
    clientId,
    sessionId: setData.sessionId,
    userId: setData.userId,
    exerciseId: setData.exerciseId,
    exerciseName: setData.exerciseName,
    setIndex: setData.setIndex,
    weight: setData.weight,
    reps: setData.reps,
    completedAt: setData.completedAt || new Date().toISOString(),
    synced: false,
  });
  setOfflineQueue(queue);

  return { saved: true, synced: false, clientId };
}

export async function syncOfflineQueue() {
  const result = await processQueue();
  if (!result) return { synced: 0, failed: 0 };

  const queue = getOfflineQueue();
  const unsynced = queue.filter(item => !item.synced);

  let legacySynced = 0;
  let legacyFailed = 0;

  for (const item of unsynced) {
    try {
      const serverId = await saveSetToSupabase(item);
      item.synced = true;
      item.serverId = serverId;
      legacySynced++;
    } catch {
      legacyFailed++;
    }
  }

  setOfflineQueue(queue);

  return { synced: result.synced + legacySynced, failed: result.failed + legacyFailed };
}

export async function createWorkoutSession(userId, workoutName) {
  try {
    const { data, error } = await supabase.from('workout_sessions').insert({
      user_id: userId,
      workout_name: workoutName || 'Workout',
      status: 'active',
    }).select('id').single();

    if (error) throw error;
    if (data?.id) {
      setActiveSessionId(data.id);
      return data.id;
    }
  } catch {}
  return null;
}

export async function completeWorkoutSession(sessionId, stats) {
  if (!sessionId) return;
  try {
    await supabase.from('workout_sessions').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_duration_seconds: stats.durationSeconds || 0,
      total_volume: stats.totalVolume || 0,
      total_calories: stats.totalCalories || 0,
      total_xp: stats.totalXP || 0,
      total_sets: stats.totalSets || 0,
      exercises_count: stats.exercisesCount || 0,
    }).eq('id', sessionId);
  } catch {}
}

export async function abandonWorkoutSession(sessionId) {
  if (!sessionId) return;
  try {
    await supabase.from('workout_sessions').update({ status: 'abandoned' }).eq('id', sessionId);
  } catch {}
}

export function setupAutoSync(onSyncComplete) {
  const unsub = subscribe((state) => {
    if (state.lastSyncResult && onSyncComplete) {
      onSyncComplete(state.lastSyncResult);
    }
  });

  const handler = async () => {
    if (navigator.onLine) {
      const result = await syncOfflineQueue();
      if (result.synced > 0 && onSyncComplete) {
        onSyncComplete(result);
      }
    }
  };

  window.addEventListener('online', handler);

  processQueue();

  return () => {
    unsub();
    window.removeEventListener('online', handler);
  };
}

export async function getWorkoutSessionHistory(userId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}
