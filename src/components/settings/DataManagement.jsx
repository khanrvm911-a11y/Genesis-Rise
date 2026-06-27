import { Database, Download, Upload, BarChart3, Heart, Settings2, Archive } from 'lucide-react';

export default function DataManagement({ settings, onUpdate, showToast }) {
  const handleExport = (type) => {
    let data = {};
    switch (type) {
      case 'workout':
        try { data = JSON.parse(localStorage.getItem('sl_workout_history') || '[]'); } catch {}
        break;
      case 'progress':
        data = {
          xp: localStorage.getItem('sl_user_xp'),
          level: localStorage.getItem('sl_user_level'),
          powerLevel: localStorage.getItem('sl_power_level'),
          personalRecords: JSON.parse(localStorage.getItem('sl_personal_records') || '{}'),
        };
        break;
      case 'health':
        try { data = JSON.parse(localStorage.getItem('sl_daily_goals') || '{}'); } catch {}
        break;
      case 'backup':
        const keys = [
          'sl_exercises', 'sl_workout_history', 'sl_personal_records', 'sl_workout_templates',
          'sl_user_settings', 'sl_mission_progress', 'sl_user_xp', 'sl_user_level',
          'sl_power_level', 'sl_weekly_change', 'gr_avatar', 'gr_avatar_type',
          'gr_workout_plans', 'gr_weekly_schedule', 'gr_active_plan_id',
          'sl_daily_goals', 'gr_coach_conversations', 'gr_app_settings',
        ];
        keys.forEach(k => {
          try { const val = localStorage.getItem(k); if (val) data[k] = JSON.parse(val); }
          catch { try { const val = localStorage.getItem(k); if (val) data[k] = val; } catch {} }
        });
        break;
    }
    data._exportedAt = new Date().toISOString();
    data._type = type;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-rise-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} data exported`);
  };

  const handleRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result);
        let count = 0;
        Object.entries(data).forEach(([key, value]) => {
          if (!key.startsWith('_') && typeof value !== 'function') {
            try { localStorage.setItem(key, JSON.stringify(value)); count++; } catch {}
          }
        });
        showToast(`Restored ${count} items. Please refresh the page.`);
      } catch {
        showToast('Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const items = [
    { id: 'workout', icon: Database, label: 'Export Workout History', desc: 'All completed workouts and sets' },
    { id: 'progress', icon: BarChart3, label: 'Export Progress Analytics', desc: 'XP, level, power level, records' },
    { id: 'health', icon: Heart, label: 'Export Health Data', desc: 'Daily goals and health metrics' },
    { id: 'backup', icon: Archive, label: 'Export Full Backup', desc: 'Complete app data backup' },
  ];

  return (
    <div className="rounded-xl border border-sl-purple/15 bg-sl-gray/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-sl-purple/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-sl-purple-light" />
          Data Management
        </h3>
      </div>

      {items.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="px-4 py-3.5 border-b border-sl-purple/10 last:border-b-0">
            <button onClick={() => handleExport(item.id)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sl-purple/15 border border-sl-purple/25 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-sl-purple-light" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[10px] text-sl-purple-light/60 mt-0.5 truncate">{item.desc}</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-sl-purple-light/40 shrink-0" />
            </button>
          </div>
        );
      })}

      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sl-gray/30 border border-sl-purple/10 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-sl-gray-light/50" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-sl-gray-light/60">Restore Backup</p>
            <p className="text-[10px] text-sl-gray-light/40 mt-0.5">Coming soon</p>
          </div>
          <label className="px-3 py-1.5 rounded-lg bg-sl-gray/30 border border-sl-purple/10 text-[10px] font-bold text-sl-gray-light/50 cursor-not-allowed">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            Restore
            <input type="file" accept=".json" className="hidden" disabled />
          </label>
        </div>
      </div>
    </div>
  );
}
