import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Users, Bell, Crown, BarChart3,
  FileText, Flag, Shield, Settings, ChevronLeft,
  ChevronRight, Menu
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/premium', icon: Crown, label: 'Premium' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/content', icon: FileText, label: 'Content' },
  { to: '/admin/reports', icon: Flag, label: 'Reports' },
  { to: '/admin/security', icon: Shield, label: 'Security' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) => {
    if (item.end) return location.pathname === '/admin';
    return location.pathname.startsWith(item.to);
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col bg-[#0a0a1a]/95 backdrop-blur-xl border-r border-white/10
        transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
            GR
          </div>
          {!collapsed && <span className="font-bold text-white text-lg whitespace-nowrap">Admin Panel</span>}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive(item)
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-12 border-t border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>
    </>
  );
}
