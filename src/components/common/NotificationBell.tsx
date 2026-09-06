import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const interval = setInterval(fetchNotifs, 15000);
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
        return { icon: 'warning', color: 'text-amber-400 bg-amber-400/10' };
      case 'PAYMENT_RECEIVED':
        return { icon: 'check_circle', color: 'text-primary bg-primary/10' };
      case 'NEW_MEMBER':
        return { icon: 'person_add', color: 'text-secondary bg-secondary/10' };
      default:
        return { icon: 'notifications', color: 'text-blue-400 bg-blue-400/10' };
    }
  };

  return (
    <div className="relative">
      <button
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] border border-[#222c47] text-[#97a5c8] hover:text-white transition"
        title="Notifications"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-[#0b1326] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-[#10182d] border border-[#263456] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-4 border-b border-[#202c4b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-white">Facility Alerts</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-mono font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#8292ba] hover:text-primary transition"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-[#18233e]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#707e9e]">
                  No notifications to display
                </div>
              ) : (
                notifications.map((notif) => {
                  const iconConfig = getIcon(notif.type);
                  return (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                      className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-[#15203b] ${
                        !notif.isRead ? 'bg-[#141f3a]/60' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${iconConfig.color}`}>
                        <span className="material-symbols-outlined text-lg">{iconConfig.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-semibold text-white truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-[#6d7b9c] whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#909ebf] line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
