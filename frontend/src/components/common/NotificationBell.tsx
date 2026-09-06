import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, CreditCard, UserPlus, Info, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import { formatDateTime } from '../../utils';

interface NotificationBellProps {
  onOpenNotifications?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onOpenNotifications }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 20000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'MEMBERSHIP_EXPIRING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'NEW_MEMBER':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-[#0e172e] hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0e172e] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#0e172e] border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#090f20]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Facility Alerts</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No notifications to display
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                    className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-800/40 ${
                      !notif.isRead ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#090f20] border border-slate-800 shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-semibold text-white truncate">{notif.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{notif.message}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {onOpenNotifications && (
              <div className="p-2 border-t border-slate-800 bg-[#090f20] text-center">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenNotifications();
                  }}
                  className="w-full py-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center gap-1.5"
                >
                  <span>View All Alerts</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
