import { PushNotifications } from '@capacitor/push-notifications';
import { Filesystem } from '@capacitor/filesystem';
import { isCapacitor } from './capacitor';

export async function requestNotificationPermission() {
  if (!isCapacitor) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return false;
  }
  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === 'granted') {
      await PushNotifications.register();
      PushNotifications.addListener('registration', (token) => {
        try {
          localStorage.setItem('gr_push_token', JSON.stringify(token));
        } catch {}
      });
      PushNotifications.addListener('registrationError', () => {});
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
          LocalNotifications.schedule({
            notifications: [{
              title: notification.title || 'Genesis Rise',
              body: notification.body || '',
              id: notification.id ? Number(notification.id) : Date.now(),
              schedule: { at: new Date() },
              sound: null,
              attachments: null,
              actionTypeId: '',
              extra: null,
            }],
          });
        }).catch(() => {});
      });
      PushNotifications.addListener('pushNotificationActionPerformed', () => {});
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
