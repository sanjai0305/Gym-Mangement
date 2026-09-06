import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Calendar,
  CreditCard,
  Dumbbell,
  BarChart3,
  Bell,
  Settings,
  IdCard,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  LogOut,
  Layers,
  Receipt,
  Clock,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, gym, switchDemoRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const role = user?.role || 'OWNER';

  // Navigation Items with role-aware groupings
  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST'],
      group: 'Core Operations',
    },
    {
      id: 'members',
      label: 'Member Dossiers',
      shortLabel: 'Members',
      icon: Users,
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST'],
      group: 'Core Operations',
    },
    {
      id: 'attendance',
      label: 'Turnstile & Presence',
      shortLabel: 'Turnstile',
      icon: QrCode,
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST'],
      group: 'Core Operations',
    },
    {
      id: 'classes',
      label: 'Class Timetable',
      shortLabel: 'Classes',
      icon: Calendar,
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER'],
      group: 'Programming',
    },
    {
      id: 'workouts',
      label: 'Workout Protocols',
      shortLabel: 'Workouts',
      icon: Dumbbell,
      roles: ['OWNER', 'ADMIN', 'TRAINER', 'MEMBER'],
      group: 'Programming',
    },
    {
      id: 'billing',
      label: 'Billing & Invoices',
      shortLabel: 'Billing',
      icon: CreditCard,
      roles: ['OWNER', 'ADMIN'],
      group: 'Financials',
    },
    {
      id: 'reports',
      label: 'Analytics & P&L',
      shortLabel: 'Reports',
      icon: BarChart3,
      roles: ['OWNER', 'ADMIN'],
      group: 'Financials',
    },
    {
      id: 'notifications',
      label: 'Telemetry Alerts',
      shortLabel: 'Alerts',
      icon: Bell,
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER'],
      group: 'System',
    },
    {
      id: 'member-portal',
      label: 'Digital Member Passport',
      shortLabel: 'Passport',
      icon: IdCard,
      roles: ['MEMBER'],
      group: 'Member Area',
    },
    {
      id: 'trainer-portal',
      label: 'Trainer Station',
      shortLabel: 'Trainer',
      icon: UserCheck,
      roles: ['TRAINER'],
      group: 'Coaching',
    },
    {
      id: 'settings',
      label: 'Facility Settings',
      shortLabel: 'Settings',
      icon: Settings,
      roles: ['OWNER', 'ADMIN'],
      group: 'System',
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  const roleColors: Record<UserRole, string> = {
    OWNER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    ADMIN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    RECEPTIONIST: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    TRAINER: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    MEMBER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const handleNavClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div
      className={`h-full flex flex-col justify-between select-none bg-[#090f20] border-r border-slate-800/80 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center text-[#070e1e] font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
                  FITCORE
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    PRO
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate" title={gym?.name}>
                  {gym?.name || 'Metropolis Hub'}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Persona Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-[#060a17]">
        {/* Persona Switcher Menu */}
        {!isCollapsed && (
          <div className="relative mb-2">
            {showRoleMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-[#0e172e] border border-slate-700 rounded-2xl shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-emerald-400" /> Simulate Role
                </div>
                {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
                  const demo = DEMO_USERS[r];
                  const isCurrent = user?.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchDemoRole(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{r.toLowerCase()}</span>
                        <span className="text-[10px] text-slate-400">({demo.name.split(' ')[0]})</span>
                      </div>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0e172e] hover:bg-slate-800/70 border border-slate-700/60 text-xs text-slate-300 transition"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium">Switch Role</span>
              </div>
              <span className="text-[10px] text-slate-500">Demo</span>
            </button>
          </div>
        )}

        {/* Current User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#0e172e] border border-slate-700/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            {!isCollapsed && (
              <div className="truncate text-left">
                <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-semibold ${
                      roleColors[role] || 'bg-slate-800 text-white'
                    }`}
                  >
                    {role}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">{sidebarContent}</aside>

      {/* Mobile Slide-over Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-72 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
