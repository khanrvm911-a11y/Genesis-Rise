import { isCapacitor } from '../lib/capacitor';

const REMINDER_IDS = {
  dailyGoals: 1003,
  workout: 1004,
};

export async function scheduleDailyReminder(reminderTime = '19:00') {
  if (!isCapacitor) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);

    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    await cancelAllReminders();

    await LocalNotifications.schedule({
      notifications: [{
        title: 'Time to Log Your Goals',
        body: 'Complete your daily goals to stay on track!',
        id: REMINDER_IDS.dailyGoals,
        schedule: {
          at: scheduled,
          repeats: true,
          every: 'day',
        },
        sound: null,
        attachments: null,
        actionTypeId: '',
        extra: { type: 'goal_reminder' },
      }],
    });
  } catch {}
}

export async function cancelAllReminders() {
  if (!isCapacitor) return;

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({
      notifications: Object.values(REMINDER_IDS).map(id => ({ id })),
    });
  } catch {}
}
