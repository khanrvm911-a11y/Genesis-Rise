import { Capacitor } from '@capacitor/core';
import { Health } from '@capgo/capacitor-health';

const STORAGE_KEY = 'gr_hc_connected';

function isNative() {
  return Capacitor.isNativePlatform();
}

export function getGoogleFitStatus() {
  if (!isNative()) {
    return { connected: false, loading: false, error: 'Health Connect is only available on Android' };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return { connected: stored === 'true', loading: false, error: null };
}

export async function connectGoogleFit() {
  if (!isNative()) {
    throw new Error('Health Connect is only available on Android');
  }

  const available = await Health.isAvailable();
  if (!available.available) {
    await Health.openHealthConnectSettings();
    throw new Error('Health Connect is not installed. Please install it from the Play Store.');
  }

  const status = await Health.requestAuthorization({
    read: ['steps', 'distance', 'calories', 'exerciseTime'],
    write: [],
  });

  const hasSteps = status.readAuthorized.includes('steps');
  if (!hasSteps) {
    throw new Error('Health Connect permissions denied');
  }

  localStorage.setItem(STORAGE_KEY, 'true');
  return true;
}

export function disconnectGoogleFit() {
  localStorage.removeItem(STORAGE_KEY);
}

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return {
    startDate: start.toISOString(),
    endDate: now.toISOString(),
  };
}

export async function fetchGoogleFitSteps() {
  if (!isNative()) throw new Error('Health Connect is only available on Android');
  if (!getGoogleFitStatus().connected) throw new Error('Not connected');

  try {
    const { startDate, endDate } = getTodayRange();
    const result = await Health.queryAggregated({
      dataType: 'steps',
      startDate,
      endDate,
      bucket: 'day',
      aggregation: 'sum',
    });
    return result.samples.length > 0 ? result.samples[0].value : 0;
  } catch (err) {
    disconnectGoogleFit();
    throw err;
  }
}

export async function fetchHealthMetrics() {
  if (!isNative()) throw new Error('Health Connect is only available on Android');
  if (!getGoogleFitStatus().connected) throw new Error('Not connected');

  const { startDate, endDate } = getTodayRange();

  const [stepsRes, distanceRes, caloriesRes, exerciseRes] = await Promise.all([
    Health.queryAggregated({ dataType: 'steps', startDate, endDate, bucket: 'day', aggregation: 'sum' }),
    Health.queryAggregated({ dataType: 'distance', startDate, endDate, bucket: 'day', aggregation: 'sum' }),
    Health.queryAggregated({ dataType: 'calories', startDate, endDate, bucket: 'day', aggregation: 'sum' }),
    Health.queryAggregated({ dataType: 'exerciseTime', startDate, endDate, bucket: 'day', aggregation: 'sum' }),
  ]);

  return {
    steps: stepsRes.samples.length > 0 ? stepsRes.samples[0].value : 0,
    distance: distanceRes.samples.length > 0 ? distanceRes.samples[0].value : 0,
    calories: caloriesRes.samples.length > 0 ? caloriesRes.samples[0].value : 0,
    activeMinutes: exerciseRes.samples.length > 0 ? exerciseRes.samples[0].value : 0,
  };
}
