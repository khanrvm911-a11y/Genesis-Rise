import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

const ICONS = {
  offline: WifiOff,
  syncing: RefreshCw,
  complete: CheckCircle2,
  partial: AlertTriangle,
  restored: Wifi,
};

const COLORS = {
  offline: { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', icon: '#f87171', text: '#f87171' },
  syncing: { bg: 'rgba(250,204,21,0.15)', border: 'rgba(250,204,21,0.3)', icon: '#facc15', text: '#facc15' },
  complete: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', icon: '#34d399', text: '#34d399' },
  partial: { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', icon: '#fb923c', text: '#fb923c' },
  restored: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', icon: '#34d399', text: '#34d399' },
};

export default function SyncNotification() {
  const { syncToast, dismissToast } = useOffline();
  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (syncToast) {
      setVisible(true);
      setAnimatingOut(false);
    } else if (visible) {
      setAnimatingOut(true);
      const timer = setTimeout(() => { setVisible(false); setAnimatingOut(false); }, 300);
      return () => clearTimeout(timer);
    }
  }, [syncToast]);

  if (!visible && !animatingOut) return null;

  const toast = syncToast || { type: 'offline', message: '' };
  const Icon = ICONS[toast.type] || ICONS.offline;
  const colors = COLORS[toast.type] || COLORS.offline;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        animatingOut ? 'opacity-0 translate-y-[-8px]' : 'opacity-100 translate-y-0'
      }`}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-sl-glow backdrop-blur-sm min-w-[200px]"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        {toast.type === 'syncing' ? (
          <RefreshCw className="w-4 h-4 animate-spin" style={{ color: colors.icon }} />
        ) : (
          <Icon className="w-4 h-4" style={{ color: colors.icon }} />
        )}
        <span className="text-xs font-semibold" style={{ color: colors.text }}>{toast.message}</span>
        <button onClick={dismissToast}
          className="ml-auto p-0.5 rounded hover:bg-white/10 transition"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" style={{ color: colors.text }} />
        </button>
      </div>
    </div>
  );
}
