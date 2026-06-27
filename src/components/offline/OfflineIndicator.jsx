import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

export default function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount, lastSyncTime } = useOffline();

  const formatTimeAgo = (isoString) => {
    if (!isoString) return null;
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isSyncing ? 'Syncing in progress' : isOnline ? 'Connected' : 'Offline'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sl-dark/60 border transition text-xs"
      style={{ borderColor: isSyncing ? 'rgba(250,204,21,0.3)' : isOnline ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)' }}
    >
      {isSyncing ? (
        <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
      ) : isOnline ? (
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <WifiOff className="w-3.5 h-3.5 text-red-400" />
      )}

      <span
        className="font-semibold text-[10px] hidden xs:inline"
        style={{ color: isSyncing ? '#facc15' : isOnline ? '#34d399' : '#f87171' }}
      >
        {isSyncing ? 'Syncing...' : isOnline ? 'Connected' : 'Offline'}
      </span>

      <span className="text-[9px] text-sl-gray-light/50 hidden sm:inline">
        {isSyncing && pendingCount > 0 ? `(${pendingCount})` : ''}
        {!isSyncing && isOnline && lastSyncTime ? formatTimeAgo(lastSyncTime) : ''}
      </span>
    </div>
  );
}
