import React from 'react';
import { LayoutDashboard, Users, QrCode, Calendar, CreditCard, Dumbbell, UserCheck, IdCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenQRScanner?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenQRScanner,
}) => {
  const { user } = useAuth();
  const role = user?.role || 'OWNER';

  if (role === 'MEMBER') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090f20]/95 backdrop-blur-md border-t border-slate-800/80 z-40 px-3 flex items-center justify-around">
        <button
          onClick={() => onNavigate('member-portal')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            currentView === 'member-portal' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <IdCard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Passport</span>
        </button>
        <button
          onClick={() => onNavigate('classes')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            currentView === 'classes' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium">Classes</span>
        </button>
        <button
          onClick={() => onNavigate('workouts')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            currentView === 'workouts' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Workouts</span>
        </button>
      </div>
    );
  }

  if (role === 'TRAINER') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090f20]/95 backdrop-blur-md border-t border-slate-800/80 z-40 px-3 flex items-center justify-around">
        <button
          onClick={() => onNavigate('trainer-portal')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            currentView === 'trainer-portal' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium">Coaching</span>
        </button>
        <button
          onClick={() => onNavigate('classes')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            currentView === 'classes' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium">Classes</span>
        </button>
        <button
          onClick={() => onNavigate('workouts')}
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            currentView === 'workouts' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Workouts</span>
        </button>
      </div>
    );
  }

  // Admin / Owner / Receptionist Bottom Nav
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090f20]/95 backdrop-blur-md border-t border-slate-800/80 z-40 px-3 flex items-center justify-around">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentView === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Overview</span>
      </button>

      <button
        onClick={() => onNavigate('members')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentView === 'members' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px]">Members</span>
      </button>

      {/* Floating Center Turnstile Action */}
      {onOpenQRScanner && (
        <button
          onClick={onOpenQRScanner}
          className="w-12 h-12 -mt-5 rounded-2xl bg-emerald-500 text-[#070e1e] flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-[#090f20] active:scale-95 transition-transform"
          aria-label="Scan Turnstile Barcode"
        >
          <QrCode className="w-6 h-6" />
        </button>
      )}

      <button
        onClick={() => onNavigate('attendance')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentView === 'attendance' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px]">Turnstile</span>
      </button>

      <button
        onClick={() => onNavigate('billing')}
        className={`flex flex-col items-center gap-1 p-1 transition-colors ${
          currentView === 'billing' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
        }`}
      >
        <CreditCard className="w-5 h-5" />
        <span className="text-[10px]">Billing</span>
      </button>
    </div>
  );
};
