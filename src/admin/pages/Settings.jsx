import { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLayout from '../components/AdminLayout';
import {
  Save, RefreshCw, Eye, EyeOff
} from 'lucide-react';

export default function AdminSettings() {
  const { logAction } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const generateApiKey = () => 'gr_admin_' + Math.random().toString(36).substring(2, 10);

  const [settings, setSettings] = useState(() => ({
    siteName: 'Genesis Rise',
    siteDescription: 'Rise to your highest potential',
    maintenanceMode: false,
    allowRegistration: true,
    defaultRank: 'bronze',
    maxLevel: 100,
    apiKey: generateApiKey(),
    emailNotifications: true,
    auditLogging: true,
  }));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await logAction('update_settings', 'settings', null, { settings: Object.keys(settings) });
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
              <div className="h-5 w-32 bg-white/10 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-white/10 rounded" />
                <div className="h-10 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-1">General Settings</h3>
          <p className="text-xs text-gray-500 mb-4">Configure your application</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Default Rank</label>
                <select
                  value={settings.defaultRank}
                  onChange={e => setSettings(s => ({ ...s, defaultRank: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                >
                  {['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legendary'].map(r => (
                    <option key={r} value={r} className="bg-[#12122a]">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Site Description</label>
              <input
                type="text"
                value={settings.siteDescription}
                onChange={e => setSettings(s => ({ ...s, siteDescription: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Level</label>
                <input
                  type="number"
                  value={settings.maxLevel}
                  onChange={e => setSettings(s => ({ ...s, maxLevel: parseInt(e.target.value) || 100 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-1">API Key</h3>
          <p className="text-xs text-gray-500 mb-4">Admin API key for integrations</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={settings.apiKey}
                readOnly
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-1">System Controls</h3>
          <p className="text-xs text-gray-500 mb-4">Manage system-wide settings</p>
          <div className="space-y-4">
            {[
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Block user access during maintenance' },
              { key: 'allowRegistration', label: 'Allow Registration', desc: 'Enable new user sign-ups' },
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications to users' },
              { key: 'auditLogging', label: 'Audit Logging', desc: 'Log all admin actions' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings[item.key] ? 'bg-violet-600' : 'bg-white/10'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    settings[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
          >
            {saving ? (
              <><RefreshCw size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Settings</>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
