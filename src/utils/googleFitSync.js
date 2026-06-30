import { Capacitor } from '@capacitor/core';

const STORAGE_KEY = 'gr_gfit_connected';
const TOKEN_KEY = 'gr_gfit_token';
const EXPIRY_KEY = 'gr_gfit_token_expiry';
const SCOPE = 'https://www.googleapis.com/auth/fitness.activity.read';

function getClientId() {
  return import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID || '';
}

function isWeb() {
  return !Capacitor.isNativePlatform();
}

function loadGisLibrary() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!token || !expiry) return null;
  if (Date.now() > parseInt(expiry)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return null;
  }
  return token;
}

function storeToken(token, expiresIn) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000));
  localStorage.setItem(STORAGE_KEY, 'true');
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

export function getGoogleFitStatus() {
  if (isWeb()) {
    const token = getStoredToken();
    return { connected: !!token, loading: false, error: null };
  }
  if (!Capacitor.isNativePlatform()) {
    return { connected: false, loading: false, error: 'Google Fit is only available on Android' };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return { connected: stored === 'true', loading: false, error: null };
}

export async function connectGoogleFit() {
  if (isWeb()) {
    const clientId = getClientId();
    if (!clientId || clientId === 'your_google_client_id_here') {
      throw new Error('Google Fit Client ID not configured. Set VITE_GOOGLE_FIT_CLIENT_ID in .env');
    }
    await loadGisLibrary();
    return new Promise((resolve, reject) => {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPE,
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error_description || 'Google Fit authorization failed'));
              return;
            }
            storeToken(response.access_token, response.expires_in);
            resolve(true);
          },
        });
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(new Error('Failed to initialize Google OAuth: ' + err.message));
      }
    });
  }
  const GoogleFitPlugin = Capacitor.isNativePlatform()
    ? (await import('@capacitor/core')).registerPlugin('GoogleFit')
    : null;
  if (!GoogleFitPlugin) throw new Error('Google Fit is only available on Android');
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
  clearToken();
  const token = getStoredToken();
  if (token && window.google?.accounts?.oauth2) {
    try {
      google.accounts.oauth2.revoke(token, () => {});
    } catch {}
  }
  localStorage.removeItem(STORAGE_KEY);
}

async function fetchWebSteps() {
  const token = getStoredToken();
  if (!token) throw new Error('Not connected');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      aggregateBy: [{
        dataTypeName: 'com.google.step_count.delta',
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: startOfDay.getTime(),
      endTimeMillis: endOfDay.getTime(),
    }),
  });

  if (response.status === 401) {
    clearToken();
    throw new Error('Session expired. Please reconnect Google Fit.');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch Google Fit data');
  }

  const data = await response.json();
  let totalSteps = 0;
  if (data.bucket) {
    for (const bucket of data.bucket) {
      if (bucket.dataset) {
        for (const dataset of bucket.dataset) {
          if (dataset.point) {
            for (const point of dataset.point) {
              if (point.value) {
                for (const val of point.value) {
                  totalSteps += val.intVal || 0;
                }
              }
            }
          }
        }
      }
    }
  }
  return totalSteps;
}

export async function fetchGoogleFitSteps() {
  if (isWeb()) {
    return fetchWebSteps();
  }
  const GoogleFitPlugin = Capacitor.isNativePlatform()
    ? (await import('@capacitor/core')).registerPlugin('GoogleFit')
    : null;
  if (!GoogleFitPlugin) throw new Error('Google Fit is only available on Android');
  if (!getGoogleFitStatus().connected) throw new Error('Not connected');
  try {
    const result = await GoogleFitPlugin.getDailySteps();
    return result?.steps ?? 0;
  } catch (err) {
    disconnectGoogleFit();
    throw err;
  }
}
