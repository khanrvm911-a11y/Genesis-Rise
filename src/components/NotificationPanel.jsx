import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, CheckCheck, Trash2, Dumbbell, Trophy, Calendar,
  Sparkles, Heart, Activity, Zap, Moon, Star, User, Info,
  Flame
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const CATEGORY_ICONS = {
  achievement: Trophy,
  workout: Dumbbell,
  planner: Calendar,
  rest_day: Moon,
  streak: Zap,
  xp: Star,
  health: Heart,
  ai_coach: Sparkles,
  system: Info,
};

const ALLOWED_ACTION_LINKS = new Set([
  '/',
  '/tracker',
  '/planner',
  '/adviser',
  '/health',
  '/analysis',
  '/profile',
  '/settings',
]);

function getSafeActionLink(actionLink) {
  if (typeof actionLink !== 'string') return null;
  return ALLOWED_ACTION_LINKS.has(actionLink) ? actionLink : null;
}

const getRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    const actionLink = getSafeActionLink(notification.action_link);
    if (actionLink) {
      navigate(actionLink);
    }
    onClose();
  };

  const NotificationIcon = ({ category, icon }) => {
    if (icon && CATEGORY_ICONS[icon]) {
      const Icon = CATEGORY_ICONS[icon];
      return <Icon className="w-5 h-5" />;
    }
    if (CATEGORY_ICONS[category]) {
      const Icon = CATEGORY_ICONS[category];
      return <Icon className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -20, scaleY: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-[60] mx-auto w-full max-w-lg"
            style={{ transformOrigin: 'top center' }}
          >
            <div className="bg-[#1a0a2e] border border-sl-purple/20 rounded-b-2xl shadow-2xl shadow-sl-purple/20 mx-2 mt-1 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-sl-purple/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-[18px] h-[18px] text-sl-purple-light" />
                  <h2 className="text-sm font-bold text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-sl-purple-light/60 bg-sl-purple/10 px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-sl-purple-light/60 hover:text-sl-purple-light px-2 py-1 rounded-lg hover:bg-sl-purple/10 transition"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Mark all read</span>
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); clearAll(); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-red-400/60 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-950/20 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Clear all</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 text-sl-gray-light/50 hover:text-white transition ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-sl-purple/30 border-t-sl-purple rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-sl-purple/5 border border-sl-purple/10 flex items-center justify-center mb-4">
                      <Bell className="w-6 h-6 text-sl-purple-light/30" />
                    </div>
                    <h3 className="text-sm font-bold text-sl-gray-light/50 mb-1.5">No Notifications</h3>
                    <p className="text-[11px] text-sl-gray-light/30 leading-relaxed max-w-[200px]">
                      You're all caught up. We'll notify you whenever something important happens.
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {notifications.map((notification, index) => {
                      const IconComponent = notification.icon && CATEGORY_ICONS[notification.icon]
                        ? CATEGORY_ICONS[notification.icon]
                        : CATEGORY_ICONS[notification.category] || Bell;

                      return (
                        <motion.button
                          key={notification.id || index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(index * 0.03, 0.3) }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-sl-purple/5 hover:bg-sl-purple/5 transition relative ${
                            !notification.read ? 'bg-sl-purple/[0.03]' : 'opacity-60'
                          }`}
                        >
                          {!notification.read && (
                            <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-sl-purple rounded-r-full" />
                          )}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            !notification.read
                              ? 'bg-gradient-to-br from-sl-purple/20 to-sl-red/10 border border-sl-purple/20'
                              : 'bg-sl-gray/20 border border-sl-gray/20'
                          }`}>
                            <IconComponent className={`w-[18px] h-[18px] ${
                              !notification.read ? 'text-sl-purple-light' : 'text-sl-gray-light/50'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-[13px] leading-tight truncate ${
                                !notification.read ? 'font-bold text-white' : 'font-semibold text-sl-gray-light'
                              }`}>
                                {notification.title}
                              </h4>
                              <span className={`text-[9px] whitespace-nowrap shrink-0 mt-0.5 ${
                                !notification.read ? 'text-sl-purple-light/60' : 'text-sl-gray-light/40'
                              }`}>
                                {getRelativeTime(notification.created_at)}
                              </span>
                            </div>
                            {notification.message && (
                              <p className={`text-[11px] leading-relaxed mt-0.5 line-clamp-2 ${
                                !notification.read ? 'text-sl-gray-light/70' : 'text-sl-gray-light/40'
                              }`}>
                                {notification.message}
                              </p>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
