import { isCapacitor } from '../lib/capacitor';

export async function showDeviceNotification(title, message) {
  if (isCapacitor) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.requestPermissions();
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body: message || '',
          id: Date.now(),
          schedule: { at: new Date() },
          sound: null,
          attachments: null,
          actionTypeId: '',
          extra: null,
        }],
      });
      return;
    } catch {}
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, { body: message, icon: '/icon-192.png' });
    } catch {}
  }
}
