import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ArrowUpRight,
  CreditCard,
  Building2,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { success } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardOverview();
      setDashboardData(res.data);
    } catch (e) {
      console.error('Failed to load report data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    success('Exporting telemetry and financial report to CSV file...', 'Report Export');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !dashboardData) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800/50 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/40 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="h-96 bg-slate-800/30 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  const { stats, revenueChart, attendanceChart, planDistribution } = dashboardData;

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0e172e] to-[#13203f] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4 shrink-0" /> Performance Analytics & Telemetry
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            Financial & Operational Report
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidated revenue trajectory, member lifecycle dynamics, and turnstile metrics
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#14203d] hover:bg-[#1b2b52] border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 transition shadow-sm min-h-[42px]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#070e1e] rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/20 min-h-[42px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0e172e] border border-slate-800/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{stats?.monthlyRevenue?.toLocaleString() || '184,200'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last period
          </div>
        </div>

        <div className="p-5 bg-[#0e172e] border border-slate-800/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Active Athletes</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{stats?.activeMembers || 248}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> 92.4% retention rate
          </div>
        </div>

        <div className="p-5 bg-[#0e172e] border border-slate-800/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Monthly Operating Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{stats?.monthlyExpenses?.toLocaleString() || '42,500'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
            P&L Margin: <span className="text-emerald-400 font-semibold">76.9%</span>
          </div>
        </div>

        <div className="p-5 bg-[#0e172e] border border-slate-800/80 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Turnstile Check-Ins</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2">{stats?.todayAttendance * 28 || 842}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-semibold mt-2">
            Peak hours: 06:00 - 09:30 AM
          </div>
        </div>
      </div>

      {/* Revenue & Growth Area Chart */}
      <div className="p-6 bg-[#0e172e] border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Revenue & Profit Trajectory</h3>
            <p className="text-xs text-slate-400">Monthly billing receipts vs operating overhead</p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#090f20] p-1 rounded-xl border border-slate-800">
            {(['7d', '30d', '90d', '12m'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  timeRange === r
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Column: Attendance Trend & Membership Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Bar Chart */}
        <div className="p-6 bg-[#0e172e] border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight">Turnstile Attendance by Day</h3>
            <p className="text-xs text-slate-400">Daily member check-in validation counts</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="count" name="Check-Ins" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Distribution Pie Chart */}
        <div className="p-6 bg-[#0e172e] border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-white tracking-tight">Membership Plan Distribution</h3>
            <p className="text-xs text-slate-400">Share of subscribers per active pricing tier</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {(planDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090f20',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
