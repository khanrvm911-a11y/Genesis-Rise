import { Capacitor, registerPlugin } from '@capacitor/core';

const GenesisLaunch = registerPlugin('GenesisLaunch');

let dismissPromise = null;

export function dismissNativeLaunchSplash() {
  if (!Capacitor.isNativePlatform()) {
    return Promise.resolve();
  }

  if (!dismissPromise) {
    dismissPromise = GenesisLaunch.dismissSplash().catch(() => {});
  }

  return dismissPromise;
}
