import { Capacitor, registerPlugin } from '@capacitor/core';

const STORAGE_KEY = 'gr_gfit_connected';

const GoogleFitPlugin = Capacitor.isNativePlatform()
  ? registerPlugin('GoogleFit', {
      android: {
        web: () => import('@capacitor/core').then(() => ({
          async requestPermissions() { throw new Error('native only'); },
          async getDailySteps() { throw new Error('native only'); },
        })),
      },
    })
  : null;

export function getGoogleFitStatus() {
  if (!Capacitor.isNativePlatform()) {
    return { connected: false, loading: false, error: 'Google Fit is only available on Android' };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return { connected: stored === 'true', loading: false, error: null };
}

export async function connectGoogleFit() {
  if (!GoogleFitPlugin) {
    throw new Error('Google Fit is only available on Android');
  }
  try {
    const result = await GoogleFitPlugin.requestPermissions();
    if (result?.granted) {
      localStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    throw new Error('Permission denied');
  } catch (err) {
    throw err;
  }
}

export function disconnectGoogleFit() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function fetchGoogleFitSteps() {
  if (!GoogleFitPlugin) {
    throw new Error('Google Fit is only available on Android');
  }
  if (!getGoogleFitStatus().connected) {
    throw new Error('Not connected');
  }
  try {
    const result = await GoogleFitPlugin.getDailySteps();
    return result?.steps ?? 0;
  } catch (err) {
    disconnectGoogleFit();
    throw err;
  }
}
