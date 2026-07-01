import { Bell, Dumbbell, Target, Trophy, Calendar, BrainCircuit, Megaphone, Clock } from 'lucide-react';

const NOTIFICATION_ITEMS = [
  { id: 'workoutReminders', icon: Dumbbell, label: 'Workout Reminders', desc: 'Get reminded about scheduled workouts' },
  { id: 'dailyGoals', icon: Target, label: 'Daily Goals', desc: 'Notifications for daily goal completion' },
  { id: 'achievements', icon: Trophy, label: 'Achievement Notifications', desc: 'Alerts when you earn new achievements' },
  { id: 'weeklyReports', icon: Calendar, label: 'Weekly Reports', desc: 'Weekly progress summary' },
  { id: 'aiCoachInsights', icon: BrainCircuit, label: 'AI Coach Insights', desc: 'Personalized tips from your AI Coach' },
  { id: 'systemAnnouncements', icon: Megaphone, label: 'System Announcements', desc: 'Updates and feature announcements' },
];

export default function NotificationSettings({ settings, onUpdate, showToast }) {
  const current = settings.notifications;

  const toggle = (id) => {
    onUpdate(`notifications.${id}`, !current[id]);
    showToast(`${current[id] ? 'Disabled' : 'Enabled'} ${NOTIFICATION_ITEMS.find(n => n.id === id)?.label}`);
  };

  const allOn = NOTIFICATION_ITEMS.every(n => current[n.id]);

  return (
    <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-sl-purple/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-sl-purple-light" />
            Notifications
          </h3>
          <button onClick={() => {
            NOTIFICATION_ITEMS.forEach(n => onUpdate(`notifications.${n.id}`, !allOn));
            showToast(allOn ? 'All notifications disabled' : 'All notifications enabled');
          }}
            className="text-[10px] font-bold text-sl-purple-light hover:text-sl-purple-light/80">
            {allOn ? 'Disable All' : 'Enable All'}
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-sl-purple/10 bg-sl-gray/15">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-sl-purple/15 border border-sl-purple/25">
              <Clock className="w-4 h-4 text-sl-purple-light" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Daily Reminder Time</p>
              <p className="text-[10px] text-sl-purple-light/60 mt-0.5">Time for daily goal reminder notification</p>
            </div>
          </div>
          <input type="time" value={settings.notifications.reminderTime || '19:00'}
            onChange={(e) => onUpdate('notifications.reminderTime', e.target.value)}
            className="w-28 h-8 bg-sl-gray/40 border border-sl-purple/20 rounded-lg text-xs text-white text-center px-2 focus:outline-none focus:border-sl-purple/50"
          />
        </div>
      </div>

      {NOTIFICATION_ITEMS.map(item => {
        const Icon = item.icon;
        const enabled = current[item.id];

        return (
          <div key={item.id} className="px-4 py-3.5 border-b border-sl-purple/10 last:border-b-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                enabled ? 'bg-sl-purple/15 border border-sl-purple/25' : 'bg-sl-gray/30 border border-sl-purple/10'
              }`}>
                <Icon className={`w-4 h-4 ${enabled ? 'text-sl-purple-light' : 'text-sl-gray-light/40'}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${enabled ? 'text-white' : 'text-sl-gray-light/60'}`}>{item.label}</p>
                <p className={`text-[10px] mt-0.5 ${enabled ? 'text-sl-purple-light/60' : 'text-sl-gray-light/40'}`}>{item.desc}</p>
              </div>
            </div>
            <button onClick={() => toggle(item.id)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                enabled ? 'bg-sl-purple' : 'bg-sl-gray/40'
              }`}
              role="switch" aria-checked={enabled} aria-label={item.label}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
