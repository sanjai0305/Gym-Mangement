import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    const interval = setInterval(fetchDashboard, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#7888ad] animate-pulse">
        Loading facility telemetry...
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalMembers: 1248,
    mrr: 84250,
    floorCapacityPercent: 84,
    currentFloorCount: 118,
    maxFloorLimit: 140,
    expiringIn7Days: 18,
  };

  const revenueSeries = data?.revenueSeries || [
    { month: 'Jan', actual: 64000, projected: 62000 },
    { month: 'Feb', actual: 69000, projected: 67000 },
    { month: 'Mar', actual: 74500, projected: 73000 },
    { month: 'Apr', actual: 78200, projected: 79000 },
    { month: 'May', actual: 81400, projected: 82000 },
    { month: 'Jun', actual: 84250, projected: 85500 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-[#dae2fd]">
      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Members */}
        <div className="p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b] hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-xs text-[#8090b4]">
            <span>Total Active Members</span>
            <span className="material-symbols-outlined text-base text-primary">group</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-white">
              {metrics.totalMembers.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              +4.2% <span className="material-symbols-outlined text-xs">arrow_upward</span>
            </span>
          </div>
          <div className="text-[11px] text-[#69799d] mt-1">vs last month</div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b] hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-xs text-[#8090b4]">
            <span>Monthly Recurring Rev</span>
            <span className="material-symbols-outlined text-base text-emerald-400">payments</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-white">
              {gym?.currency || '₹'}
              {metrics.mrr.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
              +12.8% <span className="material-symbols-outlined text-xs">arrow_upward</span>
            </span>
          </div>
          <div className="text-[11px] text-[#69799d] mt-1">Direct debit & cash fees</div>
        </div>

        {/* Floor Capacity Ring */}
        <div className="p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b] hover:border-primary/40 transition">
          <div className="flex items-center justify-between text-xs text-[#8090b4]">
            <span>Live Floor Density</span>
            <span className="material-symbols-outlined text-base text-primary">sensor_occupied</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-primary">
              {metrics.floorCapacityPercent}%
            </span>
            <span className="text-xs text-[#a0b0d4]">
              ({metrics.currentFloorCount}/{metrics.maxFloorLimit})
            </span>
          </div>
          {/* Visual capacity bar */}
          <div className="w-full h-1.5 rounded-full bg-[#17223b] overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-[#a3e635] rounded-full"
              style={{ width: `${metrics.floorCapacityPercent}%` }}
            />
          </div>
        </div>

        {/* Expiring in 7 Days */}
        <div className="p-5 rounded-2xl bg-[#0f182e] border border-[#202c4b] hover:border-amber-400/40 transition">
          <div className="flex items-center justify-between text-xs text-[#8090b4]">
            <span>Expiring in 7 Days</span>
            <span className="material-symbols-outlined text-base text-amber-400">warning</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-extrabold text-2xl text-amber-400">
              {metrics.expiringIn7Days}
            </span>
            <span className="text-[11px] font-semibold text-rose-400">Action Needed</span>
          </div>
          <div className="text-[11px] text-[#69799d] mt-1">Churn risk watchlist</div>
        </div>
      </div>

      {/* Main Section: Analytics Graph + Renewal Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue & Trajectory Analytics */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0f182e] border border-[#202c4b] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Revenue & Trajectory Analytics
              </h3>
              <p className="text-xs text-[#7b8cae]">Monthly performance vs algorithmic forecast</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[#96a5cb]">Actual Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#8e9cb8] border-b border-dashed" />
                <span className="text-[#96a5cb]">Projected</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ccff80" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ccff80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2542" vertical={false} />
                <XAxis dataKey="month" stroke="#5d6c8e" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#5d6c8e"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121c35',
                    borderColor: '#263456',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#ccff80"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#7888ab"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Renewal Watchlist */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0f182e] border border-[#202c4b] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2744]">
              <div>
                <h3 className="font-display font-bold text-base text-white">Renewal Watchlist</h3>
                <span className="text-xs text-amber-400 font-mono font-semibold">
                  {metrics.expiringIn7Days} Accounts Expiring
                </span>
              </div>
              <button
                onClick={() => onNavigate('members')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                View Roster
              </button>
            </div>

            <div className="divide-y divide-[#17233f] max-h-72 overflow-y-auto mt-2">
              {data?.renewalWatchlist?.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#707f9f]">
                  No accounts expiring in next 7 days
                </div>
              ) : (
                data?.renewalWatchlist?.map((item: any) => (
                  <div
                    key={item._id}
                    className="py-3 flex items-center justify-between gap-3 group"
                  >
                    <div
                      onClick={() => onSelectMember(item._id)}
                      className="cursor-pointer flex items-center gap-3 min-w-0"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#141f38] border border-[#223053] flex items-center justify-center font-bold text-xs text-white shrink-0">
                        {item.name[0]}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white group-hover:text-primary transition truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          Expires in {item.daysRemaining} days
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`https://wa.me/${item.phone?.replace(/[^0-9]/g, '')}?text=Hi%20${item.name},%20your%20membership%20at%20${gym?.name}%20expires%20soon.%20Tap%20to%20renew!`}
                        target="_blank"
                        rel="noreferrer"
                        title="Send WhatsApp Reminder"
                        className="p-1.5 rounded-lg bg-[#14203a] hover:bg-emerald-500/20 text-emerald-400 border border-[#213054] transition"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                      </a>
                      <button
                        onClick={() => onSelectMember(item._id)}
                        className="px-2 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[10px] font-bold transition"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('members')}
            className="w-full py-2.5 rounded-xl bg-[#14203a] hover:bg-[#1b2b4e] border border-[#223154] text-xs text-white font-semibold transition"
          >
            Bulk Remind via SMS / WhatsApp
          </button>
        </div>
      </div>

      {/* Bottom Row: Upcoming Sessions & Live Operational Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0f182e] border border-[#202c4b] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2744]">
            <div>
              <h3 className="font-display font-bold text-base text-white">Upcoming Classes Today</h3>
              <p className="text-xs text-[#7b8cae]">Session rosters and live check-in capacity</p>
            </div>
            <button
              onClick={() => onNavigate('classes')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Full Schedule
            </button>
          </div>

          <div className="space-y-3">
            {data?.upcomingClasses?.slice(0, 3).map((c: any) => (
              <div
                key={c._id}
                onClick={() => onNavigate('classes')}
                className="p-3.5 rounded-2xl bg-[#121c35] border border-[#1f2d50] hover:border-primary/40 transition cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">{c.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#182649] text-primary border border-primary/30 font-mono">
                      {c.category}
                    </span>
                  </div>
                  <div className="text-xs text-[#8090b4] mt-1">
                    {c.startTime} - {c.endTime} • {c.room} • Coach {c.trainerName}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-white">
                    {c.enrolledMemberIds?.length || 0} / {c.capacity} spots
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    {c.capacity - (c.enrolledMemberIds?.length || 0)} Available
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Operational Stream */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-[#0f182e] border border-[#202c4b] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2744]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-display font-bold text-base text-white">
                Live Operational Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Gate Logs
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {data?.recentActivity?.map((act: any) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-[#111b33] border border-[#1e2c4e] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      act.type === 'CHECK_IN'
                        ? 'bg-primary/20 text-primary'
                        : act.type === 'PAYMENT'
                        ? 'bg-emerald-400/20 text-emerald-400'
                        : 'bg-secondary/20 text-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {act.type === 'CHECK_IN'
                        ? 'sensor_door'
                        : act.type === 'PAYMENT'
                        ? 'receipt'
                        : 'group_add'}
                    </span>
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white">{act.title}</span>
                    <span className="text-[#8494b8] ml-2">{act.subtitle}</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#6c7d9f] whitespace-nowrap ml-2">
                  {act.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
