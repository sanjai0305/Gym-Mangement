import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Filter,
  Info,
  AlertTriangle,
  CreditCard,
  UserCheck,
  Calendar,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { formatDate, formatDateTime } from '../utils';

export const NotificationsPage: React.FC = () => {
  const { success } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      success('Notification marked as read');
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All alerts marked as read', 'Notifications');
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('payment') || lower.includes('invoice') || lower.includes('renew')) {
      return <CreditCard className="w-5 h-5 text-emerald-400" />;
    }
    if (lower.includes('turnstile') || lower.includes('check-in') || lower.includes('attendance')) {
      return <UserCheck className="w-5 h-5 text-blue-400" />;
    }
    if (lower.includes('class') || lower.includes('booking')) {
      return <Calendar className="w-5 h-5 text-purple-400" />;
    }
    if (lower.includes('alert') || lower.includes('expire') || lower.includes('overdue')) {
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
    return <Info className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e172e] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Telemetry & System Notifications</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live facility turnstile alerts, billing events, and scheduled class updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.every((n) => n.isRead)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14203d] hover:bg-[#1b2b52] disabled:opacity-40 disabled:pointer-events-none border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 transition shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#090f20] p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread Only ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-800/40 border border-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-[#0e172e] border border-slate-800/80 rounded-2xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You are all caught up! When members scan in or payments are processed, alerts will appear here.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${
                notif.isRead
                  ? 'bg-[#0e172e]/60 border-slate-800/60 opacity-80'
                  : 'bg-[#0e172e] border-emerald-500/30 shadow-lg shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#090f20] border border-slate-800 shrink-0 mt-0.5">
                  {getNotificationIcon(notif.title)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="text-[11px] text-slate-500 font-mono mt-2">
                    {formatDateTime(notif.createdAt)}
                  </div>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
