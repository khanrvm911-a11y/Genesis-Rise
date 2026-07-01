import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Search, X } from 'lucide-react';
import {
  loadSettings, saveSettings, applyFontSize,
  searchSettings,
} from '../../utils/settingsUtils';
import { scheduleDailyReminder } from '../../utils/notificationScheduler';
import AppearanceSettings from './AppearanceSettings';
import UnitsSettings from './UnitsSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySecurity from './PrivacySecurity';
import DataManagement from './DataManagement';
import AboutSection from './AboutSection';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', component: AppearanceSettings },
  { id: 'units', label: 'Units & Preferences', component: UnitsSettings },
  { id: 'notifications', label: 'Notifications', component: NotificationSettings },
  { id: 'privacy', label: 'Privacy & Security', component: PrivacySecurity },
  { id: 'data', label: 'Data Management', component: DataManagement },
  { id: 'about', label: 'About', component: AboutSection },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(() => loadSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState('');

  const prevReminderTime = useRef(settings.notifications.reminderTime);

  useEffect(() => {
    saveSettings(settings);
    applyFontSize(settings.appearance.fontSize);
  }, [settings]);

  useEffect(() => {
    const newTime = settings.notifications.reminderTime;
    if (newTime && newTime !== prevReminderTime.current) {
      prevReminderTime.current = newTime;
      if (settings.notifications.dailyGoals) {
        scheduleDailyReminder(newTime);
      }
    }
  }, [settings.notifications.reminderTime, settings.notifications.dailyGoals]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  const updateSetting = useCallback((path, value) => {
    setSettings(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    showToast('Setting saved');
  }, [showToast]);

  const visibleSections = searchQuery
    ? SECTIONS.filter(s => searchSettings(searchQuery).includes(s.id))
    : SECTIONS;

  return (
    <div className="min-h-screen bg-sl-gradient">
      <div className="mobile-container py-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)}
                className="text-sl-purple-light/60 hover:text-sl-purple-light transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-sl-purple-light" />
                Settings
              </h1>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sl-purple-light/40" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full h-11 rounded-xl bg-sl-gray/20 border border-sl-purple/15 text-sm text-white placeholder-sl-purple-light/30 pl-10 pr-9 focus:outline-none focus:border-sl-purple/40 transition" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sl-purple-light/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => {
                setExpanded(expanded === s.id ? null : s.id);
                setSearchQuery('');
              }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                  expanded === s.id
                    ? 'bg-sl-purple/20 border-sl-purple/40 text-sl-purple-light'
                    : 'bg-sl-gray/20 border-sl-purple/15 text-sl-purple-light/70 hover:bg-sl-gray/30'
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          {visibleSections.length === 0 && (
            <div className="rounded-xl p-6 border border-sl-purple/15 bg-sl-gray/20 text-center">
              <Search className="w-8 h-8 text-sl-purple-light/30 mx-auto mb-2" />
              <p className="text-sm text-white font-semibold">No settings found</p>
              <p className="text-xs text-sl-purple-light/60 mt-1">Try a different search term</p>
            </div>
          )}

          {visibleSections.map(section => {
            const isExpanded = expanded === section.id || expanded === null;
            if (!isExpanded) return null;
            const Component = section.component;
            return (
              <div key={section.id}>
                <Component
                  settings={settings}
                  onUpdate={updateSetting}
                  showToast={showToast}
                />
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-sl-purple/90 border border-sl-purple/30 text-xs font-semibold text-white shadow-sl-glow animate-fade-slide">
          {toast}
        </div>
      )}
    </div>
  );
}
