import React, { useState } from 'react';
import { Search, QrCode, UserPlus, HelpCircle, Menu, LogOut, Shield, ChevronDown, UserCheck } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { HelpModal } from './HelpModal';
import { UserRole } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAddMember?: () => void;
  onOpenQRScanner?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onToggleMobileMenu?: () => void;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenAddMember,
  onOpenQRScanner,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
  onNavigate,
}) => {
  const { user, gym, switchDemoRole, logout } = useAuth();
  const [showHelp, setShowHelp] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';

  return (
    <>
      <header
        id="fitcore-top-header"
        className="h-20 px-4 sm:px-8 border-b border-slate-800/80 bg-[#090f20]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20"
      >
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="truncate">
            <h1 className="font-bold text-lg sm:text-2xl text-white tracking-tight truncate">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5 hidden sm:block truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search input if callback provided */}
          {onSearchChange !== undefined && (
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search member, ID, plan..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-56 lg:w-64 pl-9 pr-4 py-2 rounded-xl bg-[#0e172e] border border-slate-700/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

          {/* Turnstile Check-in Trigger */}
          {canManage && onOpenQRScanner && (
            <button
              id="btn-open-qr-scanner"
              onClick={onOpenQRScanner}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14203d] hover:bg-[#1a2b52] border border-slate-700/60 text-xs font-semibold text-slate-200 transition shadow-sm"
              title="Open Optical Turnstile Scanner"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Turnstile</span>
            </button>
          )}

          {/* Add Member Trigger */}
          {canManage && onOpenAddMember && (
            <button
              id="btn-open-add-member"
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#070e1e] font-bold text-xs shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Member</span>
            </button>
          )}

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2.5 rounded-xl bg-[#0e172e] border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
            title="Help & Demo Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <NotificationBell onOpenNotifications={() => onNavigate && onNavigate('notifications')} />

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl bg-[#0e172e] border border-slate-700/60 hover:border-slate-600 transition-all text-left"
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden xl:block pr-1">
                <div className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</div>
                <div className="text-[10px] text-emerald-400 font-mono tracking-wider">{user?.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-[#0e172e] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="font-bold text-white text-sm">{user?.name}</div>
                  <div className="text-slate-400 truncate">{user?.email}</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1 uppercase font-semibold">
                    {gym?.name || 'FITCORE Facility'}
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold px-2 mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-emerald-400" /> Switch Demo Role
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {(['OWNER', 'ADMIN', 'RECEPTIONIST', 'TRAINER', 'MEMBER'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={(e) => {
                          e.stopPropagation();
                          switchDemoRole(r);
                          setShowProfileMenu(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                          user?.role === r
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SaaS Help & Guide Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
