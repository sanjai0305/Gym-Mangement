import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, gym, switchDemoRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const role = user?.role || 'OWNER';

  // Role-based navigation items
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST'],
    },
    {
      id: 'members',
      label: 'Member Directory',
      icon: 'group',
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST'],
    },
    {
      id: 'attendance',
      label: 'Attendance & QR',
      icon: 'qr_code_scanner',
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST'],
    },
    {
      id: 'classes',
      label: 'Class Schedule',
      icon: 'calendar_month',
      roles: ['OWNER', 'ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER'],
    },
    {
      id: 'billing',
      label: 'Financials & Billing',
      icon: 'receipt_long',
      roles: ['OWNER', 'ADMIN'],
    },
    {
      id: 'workouts',
      label: 'Workout Routines',
      icon: 'fitness_center',
      roles: ['OWNER', 'ADMIN', 'TRAINER', 'MEMBER'],
    },
    {
      id: 'member-portal',
      label: 'My Member ID Card',
      icon: 'badge',
      roles: ['MEMBER'],
    },
    {
      id: 'trainer-portal',
      label: 'Trainer Station',
      icon: 'sports',
      roles: ['TRAINER'],
    },
    {
      id: 'settings',
      label: 'Facility Settings',
      icon: 'settings',
      roles: ['OWNER', 'ADMIN'],
    },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  const roleBadgeColors: Record<UserRole, string> = {
    OWNER: 'bg-primary/20 text-primary border-primary/30',
    ADMIN: 'bg-secondary/20 text-secondary border-secondary/30',
    RECEPTIONIST: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    TRAINER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    MEMBER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  return (
    <aside
      id="fitcore-sidebar"
      className="w-64 bg-[#0b1326] border-r border-[#1a233b] flex flex-col justify-between shrink-0 select-none z-30 h-screen sticky top-0"
    >
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#1a233b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[#a3e635] flex items-center justify-center text-[#0b1326] font-extrabold shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-2xl font-bold">bolt</span>
            </div>
            <div>
              <div className="font-display font-extrabold text-lg tracking-wider text-white flex items-center gap-1.5">
                FITCORE
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-semibold">
                  PRO
                </span>
              </div>
              <div className="text-xs text-[#8c96b5] truncate max-w-[130px]" title={gym?.name}>
                {gym?.name || 'Metropolis Hub'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] uppercase tracking-wider text-[#636f90] font-semibold">
            Operations
          </div>
          {visibleNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-[#17223e] to-[#121c33] text-primary border border-primary/30 shadow-sm'
                    : 'text-[#9ea9cb] hover:text-white hover:bg-[#131d35]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    isActive ? 'text-primary font-semibold' : 'text-[#7d8aa8]'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Role Switcher */}
      <div className="p-3 border-t border-[#1a233b] bg-[#070d1d]/60">
        {/* Role Quick Switch Menu Trigger */}
        <div className="relative mb-2">
          {showRoleMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-[#121b33] border border-[#263354] rounded-2xl shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#8b98bd] uppercase tracking-wider">
                Simulate Role (Demo)
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                      isCurrent
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-[#b2bfdf] hover:bg-[#1b2647] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{r.toLowerCase()}</span>
                      <span className="text-[10px] text-[#717e9f]">({demo.name.split(' ')[0]})</span>
                    </div>
                    {isCurrent && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                );
              })}
            </div>
          )}

          <button
            id="btn-switch-role-menu"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#141e38] hover:bg-[#1a2647] border border-[#202c4c] text-xs text-[#a0add1] transition"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">swap_horiz</span>
              <span>Switch Persona</span>
            </div>
            <span className="material-symbols-outlined text-xs">unfold_more</span>
          </button>
        </div>

        {/* Current User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#0f1830] border border-[#1d2948]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover border border-primary/40 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${
                    roleBadgeColors[role] || 'bg-white/10 text-white'
                  }`}
                >
                  {role}
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-[#7381a3] hover:text-white hover:bg-[#1a2649] rounded-lg transition"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
