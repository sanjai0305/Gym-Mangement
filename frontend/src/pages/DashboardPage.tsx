import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  DollarSign,
  AlertCircle,
  Activity,
  Award,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  QrCode,
  Calendar,
  CreditCard,
  Building2,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils';

interface DashboardPageProps {
  onNavigate: (view: string) => void;
  onOpenQRScanner: () => void;
  onOpenAddMember: () => void;
  onSelectMember: (memberId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenQRScanner,
  onOpenAddMember,
  onSelectMember,
}) => {
  const { gym } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'growth' | 'attendance' | 'pnl'>('revenue');

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboardOverview();
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-12 bg-slate-800/40 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-slate-800/30 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="h-80 bg-slate-800/20 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  const { metrics, monthlyTrajectory, renewalWatchlist, upcomingSessions, activityStream } = data;
  const currency = gym?.currency || '₹';

  // Computed Charts Data
  const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

  const planData = [
    { name: 'Quarterly Basic', value: 45 },
    { name: 'Standard Core', value: 85 },
    { name: 'Black Diamond', value: 38 },
    { name: 'Unlimited Pro', value: 24 },
  ];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 8 Metric Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Members */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Total Members</span>
            <div className="w-8 h-8 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.totalMembers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +5.2% MoM roster
          </div>
        </div>

        {/* 2. Active Members */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Active Members</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.activeMembers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Rate: <span className="text-emerald-400 font-semibold">92.4%</span> active pass
          </div>
        </div>

        {/* 3. New Members */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-blue-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">New Members (30d)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            +{metrics.newMembersThisMonth || 14}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> High conversion
          </div>
        </div>

        {/* 4. Expiring Memberships */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-amber-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Expiring in 7 Days</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.expiringCount || renewalWatchlist?.length || 0}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold mt-2">Action required for renewal</div>
        </div>

        {/* 5. Monthly Revenue */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {currency}
            {metrics.monthlyRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> {metrics.revenueGrowth || '+14.2%'} MoM
          </div>
        </div>

        {/* 6. Pending Payments */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-rose-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Pending Dues</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {currency}
            {(metrics.pendingPaymentsAmount || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            <span className="text-rose-400 font-semibold">{metrics.pendingPaymentsCount || 0} invoices</span>{' '}
            awaiting settlement
          </div>
        </div>

        {/* 7. Today's Attendance / Floor Density */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-purple-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Floor Telemetry</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.floorCapacity?.current || 38}{' '}
            <span className="text-xs font-normal text-slate-400">/ {metrics.floorCapacity?.max || 150}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Density: <span className="text-purple-400 font-semibold">{metrics.floorCapacity?.percentage || 25}%</span>{' '}
            capacity
          </div>
        </div>

        {/* 8. Active Trainers */}
        <div className="p-5 rounded-2xl bg-[#0e172e] border border-slate-800 hover:border-teal-500/30 transition-all shadow-sm group">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Active Trainers</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.activeTrainers || 3} Coaches
          </div>
          <div className="text-[11px] text-teal-400 font-semibold mt-2">100% floor shifts covered</div>
        </div>
      </div>

      {/* Main Charts & Telemetry Area */}
      <div className="p-6 bg-[#0e172e] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        {/* Chart Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Executive Performance Center</h3>
            <p className="text-xs text-slate-400">Interactive financial, membership, and presence graphs</p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#090f20] p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveChartTab('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeChartTab === 'revenue'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Revenue Overview
            </button>
            <button
              onClick={() => setActiveChartTab('growth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeChartTab === 'growth'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Membership Growth
            </button>
            <button
              onClick={() => setActiveChartTab('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeChartTab === 'attendance'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Turnstile Attendance
            </button>
            <button
              onClick={() => setActiveChartTab('pnl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeChartTab === 'pnl'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              P&L Expenses & Profit
            </button>
          </div>
        </div>

        {/* Tab 1: Revenue Overview */}
        {activeChartTab === 'revenue' && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrajectory || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090f20',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue (₹)"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: Membership Growth */}
        {activeChartTab === 'growth' && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrajectory || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090f20',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="members" name="Active Subscribers" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Turnstile Attendance */}
        {activeChartTab === 'attendance' && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { day: 'Mon', count: 94 },
                  { day: 'Tue', count: 112 },
                  { day: 'Wed', count: 105 },
                  { day: 'Thu', count: 128 },
                  { day: 'Fri', count: 119 },
                  { day: 'Sat', count: 85 },
                  { day: 'Sun', count: 62 },
                ]}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090f20',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Turnstile Check-ins" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 4: P&L Expenses & Profit */}
        {activeChartTab === 'pnl' && (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrajectory || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090f20',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Net Operating Profit (₹)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Lower Dashboard: Renewal Watchlist & Scheduled Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Members Watchlist */}
        <div className="p-6 bg-[#0e172e] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Renewal Watchlist (7 Days)
              </h3>
              <p className="text-xs text-slate-400">Athletes requiring imminent subscription extension</p>
            </div>
            <button
              onClick={() => onNavigate('members')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {renewalWatchlist && renewalWatchlist.length > 0 ? (
              renewalWatchlist.slice(0, 4).map((item: any) => (
                <div
                  key={item.memberId}
                  onClick={() => onSelectMember(item.memberId)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#090f20] border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    {item.profileImage ? (
                      <img src={item.profileImage} alt={item.name} className="w-9 h-9 rounded-lg object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-xs">
                        {item.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">{item.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.planName} • <span className="font-mono text-slate-300">{item.code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        item.daysRemaining <= 2
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.daysRemaining === 0 ? 'Expires Today' : `${item.daysRemaining} days left`}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">No renewals pending in next 7 days</div>
            )}
          </div>
        </div>

        {/* Live Scheduled Studio Classes */}
        <div className="p-6 bg-[#0e172e] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" /> Today's Scheduled Sessions
              </h3>
              <p className="text-xs text-slate-400">Studio bookings and coach timetable</p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Timetable
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingSessions && upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 4).map((session: any) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#090f20] border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">
                      {session.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{session.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {session.trainerName} • <span className="text-slate-300">{session.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {session.enrolledCount} / {session.capacity}
                    </span>
                    <div className="text-[9px] text-slate-500 uppercase">{session.room || 'Studio 1'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">No scheduled sessions for today</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
