import { PushNotifications } from '@capacitor/push-notifications';
import { Filesystem } from '@capacitor/filesystem';
import { isCapacitor } from './capacitor';

export async function requestNotificationPermission() {
  if (!isCapacitor) return false;
  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === 'granted') {
      await PushNotifications.register();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function requestStoragePermission() {
  if (!isCapacitor) return true;
  try {
    const perm = await Filesystem.requestPermissions();
    return perm.publicStorage === 'granted';
  } catch {
    return true;
  }
}
