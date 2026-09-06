import React from 'react';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenAddMember?: () => void;
  onOpenQRScanner?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onOpenAddMember,
  onOpenQRScanner,
  searchQuery,
  onSearchChange,
}) => {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';

  return (
    <header
      id="fitcore-top-header"
      className="h-20 px-8 border-b border-[#1a233b] bg-[#0b1326]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20"
    >
      {/* Title & Subtitle */}
      <div>
        <h1 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-[#7e8ba9] mt-0.5">{subtitle}</p>}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search input if callback provided */}
        {onSearchChange !== undefined && (
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#647192]">
              search
            </span>
            <input
              type="text"
              placeholder="Search member, ID, plan..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-60 pl-9 pr-4 py-2 rounded-xl bg-[#121a2d] border border-[#212c49] text-xs text-white placeholder-[#5c6888] focus:outline-none focus:border-primary transition"
            />
          </div>
        )}

        {/* Live Capacity Ring / Badge */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#121a2f] border border-[#212c49]">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="text-xs text-[#8c9abf]">
            Floor: <span className="font-semibold text-white">84%</span>{' '}
            <span className="text-[10px] text-[#5e6b8a]">(118/140)</span>
          </div>
        </div>

        {/* Scan QR Trigger */}
        {canManage && onOpenQRScanner && (
          <button
            id="btn-open-qr-scanner"
            onClick={onOpenQRScanner}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#15203b] hover:bg-[#1c2a4f] border border-[#26355b] text-xs font-semibold text-[#ccd8f7] transition shadow-sm"
          >
            <span className="material-symbols-outlined text-base text-primary">qr_code_scanner</span>
            <span className="hidden sm:inline">Scan Turnstile</span>
          </button>
        )}

        {/* Add Member Trigger */}
        {canManage && onOpenAddMember && (
          <button
            id="btn-open-add-member"
            onClick={onOpenAddMember}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-[#a3e635] hover:brightness-110 text-[#0b1326] font-display font-bold text-xs shadow-lg shadow-primary/25 transition transform active:scale-95"
          >
            <span className="material-symbols-outlined text-base font-bold">add</span>
            <span>Add Member</span>
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
};
