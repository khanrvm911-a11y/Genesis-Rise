import { WifiOff, RefreshCw } from 'lucide-react';

const DEFAULT_MESSAGES = {
  ai_coach: {
    icon: '🤖',
    title: 'AI Coach is unavailable while offline',
    description: 'Your conversations will resume automatically when your connection returns.',
  },
  notifications: {
    icon: '🔔',
    title: 'Live notifications are paused',
    description: 'New notifications will appear when you\'re back online.',
  },
  sync: {
    icon: '📤',
    title: 'Changes saved locally',
    description: 'Your data will sync automatically when your connection returns.',
  },
  analytics: {
    icon: '📊',
    title: 'Showing cached analytics',
    description: 'Last updated',
  },
};

export default function OfflineBanner({ type = 'ai_coach', cachedTime, onDismiss, className = '' }) {
  const config = DEFAULT_MESSAGES[type] || DEFAULT_MESSAGES.ai_coach;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-4 py-3.5 bg-sl-gray/15 border-amber-500/20 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <WifiOff className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-amber-300">{config.title}</p>
          <p className="text-[11px] text-amber-200/60 mt-1 leading-relaxed">
            {config.description}
            {cachedTime && type === 'analytics' && (
              <span className="text-amber-200/40"> {cachedTime}</span>
            )}
          </p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss}
            className="shrink-0 text-[10px] font-bold text-amber-400/60 hover:text-amber-400 transition"
            aria-label="Dismiss">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
