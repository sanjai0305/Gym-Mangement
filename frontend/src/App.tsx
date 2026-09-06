import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { MemberDrawer } from './components/common/MemberDrawer';
import { AddMemberModal } from './components/common/AddMemberModal';
import { QRScannerModal } from './components/common/QRScannerModal';
import { InvoiceModal } from './components/common/InvoiceModal';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { MembersPage } from './pages/MembersPage';
import { AttendancePage } from './pages/AttendancePage';
import { ClassesPage } from './pages/ClassesPage';
import { BillingPage } from './pages/BillingPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MemberPortalPage } from './pages/MemberPortalPage';
import { TrainerPortalPage } from './pages/TrainerPortalPage';
import { SettingsPage } from './pages/SettingsPage';

import { api } from './services/api';
import { Member } from './types';
import { Sparkles } from 'lucide-react';

const getViewFromPath = (path: string): string => {
  if (path.includes('memberships') || path.includes('members')) return 'members';
  if (path.includes('attendance') || path.includes('turnstile')) return 'attendance';
  if (path.includes('classes') || path.includes('schedule')) return 'classes';
  if (path.includes('billing') || path.includes('payments') || path.includes('expenses')) return 'billing';
  if (path.includes('workouts')) return 'workouts';
  if (path.includes('reports')) return 'reports';
  if (path.includes('notifications')) return 'notifications';
  if (path.includes('settings')) return 'settings';
  if (path.includes('member') && !path.includes('members')) return 'member-portal';
  if (path.includes('trainer')) return 'trainer-portal';
  if (path.includes('dashboard')) return 'dashboard';
  return 'dashboard';
};

function MainApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation view state initialized from current URL path
  const [currentView, setCurrentView] = useState<string>(() => getViewFromPath(location.pathname));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Drawer state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [activeInvoiceNumber, setActiveInvoiceNumber] = useState<string | null>(null);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize route paths with current view on navigation
  useEffect(() => {
    const matched = getViewFromPath(location.pathname);
    setCurrentView(matched);
  }, [location.pathname]);

  // Auto-route based on authenticated role if landing on root
  useEffect(() => {
    if (user && location.pathname === '/') {
      if (user.role === 'MEMBER') {
        setCurrentView('member-portal');
      } else if (user.role === 'TRAINER') {
        setCurrentView('trainer-portal');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [user?.role, location.pathname]);

  const handleSelectMemberById = async (id: string) => {
    try {
      const res = await api.getMemberById(id);
      setSelectedMember(res.data);
    } catch (e) {
      console.error('Failed to load member:', e);
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    const rolePrefix = user?.role === 'MEMBER' ? '/member' : user?.role === 'TRAINER' ? '/trainer' : '/admin';
    navigate(`${rolePrefix}/${view}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e1e] flex flex-col items-center justify-center text-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-500 flex items-center justify-center text-[#070e1e] font-black shadow-xl shadow-emerald-500/20 animate-pulse">
          <Sparkles className="w-6 h-6 fill-current" />
        </div>
        <div className="text-xs font-mono text-slate-400">Bootstrapping FITCORE Cloud SaaS...</div>
      </div>
    );
  }

  // View Title & Subtitle helper
  const getViewMeta = () => {
    switch (currentView) {
      case 'dashboard':
        return {
          title: 'Facility Executive Overview',
          subtitle: 'Real-time telemetry, revenue trajectory, and floor operations',
        };
      case 'members':
        return {
          title: 'Member Directory & Dossiers',
          subtitle: 'Active rosters, biometric telemetry, and account lifecycles',
        };
      case 'attendance':
        return {
          title: 'Turnstile & Optical Access',
          subtitle: 'Live gate telemetry, check-in validation, and presence logs',
        };
      case 'classes':
        return {
          title: 'Class Schedule & Rosters',
          subtitle: 'Session timetable, coach allocations, and attendee check-ins',
        };
      case 'billing':
        return {
          title: 'Financials & Tax Invoicing',
          subtitle: 'Itemized receipts, P&L expenses, and revenue reconciliation',
        };
      case 'workouts':
        return {
          title: 'Workout Protocols & Prescriptions',
          subtitle: 'Custom set/rep schemes, tempo cues, and progression tracking',
        };
      case 'reports':
        return {
          title: 'Analytics & Financial Reports',
          subtitle: 'Consolidated performance metrics, P&L analysis, and capacity forecasting',
        };
      case 'notifications':
        return {
          title: 'System & Telemetry Alerts',
          subtitle: 'Live turnstile events, payment notifications, and renewal alerts',
        };
      case 'member-portal':
        return {
          title: 'Digital Member Passport',
          subtitle: 'Personal turnstile barcode pass and assigned fitness regimens',
        };
      case 'trainer-portal':
        return {
          title: 'Coach Performance Station',
          subtitle: 'Coaching agenda, assigned athletes, and session check-ins',
        };
      case 'settings':
        return {
          title: 'Facility Settings & Plans',
          subtitle: 'Branding, pricing tiers, operating hours, and sandbox controls',
        };
      default:
        return { title: 'FITCORE Hub', subtitle: 'Athletic Management System' };
    }
  };

  const meta = getViewMeta();

  return (
    <div className="min-h-screen bg-[#070e1e] text-slate-200 flex selection:bg-emerald-500 selection:text-[#070e1e]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenAddMember={() => setShowAddMember(true)}
          onOpenQRScanner={() => setShowQRScanner(true)}
          searchQuery={currentView === 'members' ? searchQuery : undefined}
          onSearchChange={currentView === 'members' ? setSearchQuery : undefined}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-12">
          {currentView === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onOpenQRScanner={() => setShowQRScanner(true)}
              onOpenAddMember={() => setShowAddMember(true)}
              onSelectMember={handleSelectMemberById}
            />
          )}

          {currentView === 'members' && (
            <MembersPage
              onSelectMember={handleSelectMemberById}
              onOpenAddMember={() => setShowAddMember(true)}
            />
          )}

          {currentView === 'attendance' && (
            <AttendancePage
              onOpenQRScanner={() => setShowQRScanner(true)}
              onSelectMember={handleSelectMemberById}
            />
          )}

          {currentView === 'classes' && <ClassesPage />}

          {currentView === 'billing' && (
            <BillingPage
              onOpenInvoice={(inv) => setActiveInvoiceNumber(inv)}
              onSelectMember={handleSelectMemberById}
            />
          )}

          {currentView === 'workouts' && <WorkoutsPage />}

          {currentView === 'reports' && <ReportsPage />}

          {currentView === 'notifications' && <NotificationsPage />}

          {currentView === 'member-portal' && (
            <MemberPortalPage onOpenInvoice={(inv) => setActiveInvoiceNumber(inv)} />
          )}

          {currentView === 'trainer-portal' && (
            <TrainerPortalPage
              onSelectMember={handleSelectMemberById}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'settings' && <SettingsPage />}
        </main>

        {/* Responsive Mobile Bottom Navigation */}
        <MobileBottomNav
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenQRScanner={() => setShowQRScanner(true)}
        />
      </div>

      {/* Slide-in Member Detail Drawer */}
      {selectedMember && (
        <MemberDrawer
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onMemberUpdated={() => handleSelectMemberById(selectedMember._id)}
          onViewWorkouts={() => {
            setSelectedMember(null);
            handleNavigate('workouts');
          }}
        />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={() => {
          if (currentView === 'members') {
            window.location.reload();
          }
        }}
      />

      {/* QR Optical Turnstile Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onCheckInSuccess={() => {
          // Check-in validated
        }}
      />

      {/* Commercial Tax Invoice Modal */}
      <InvoiceModal
        invoiceNumber={activeInvoiceNumber}
        onClose={() => setActiveInvoiceNumber(null)}
      />
    </div>
  );
}

function LandingRouteWrapper() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onEnterApp={() => navigate('/admin/dashboard')}
      onOpenSignIn={() => navigate('/login')}
      onOpenRegister={() => navigate('/register')}
    />
  );
}

function AuthRouteWrapper({ initialMode }: { initialMode: 'signin' | 'register' }) {
  const navigate = useNavigate();
  return (
    <AuthPage
      initialMode={initialMode}
      onSuccess={() => navigate('/admin/dashboard')}
      onBackToHome={() => navigate('/')}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing & Marketing */}
            <Route path="/" element={<LandingRouteWrapper />} />
            <Route path="/features" element={<LandingRouteWrapper />} />
            <Route path="/pricing" element={<LandingRouteWrapper />} />
            <Route path="/about" element={<LandingRouteWrapper />} />
            <Route path="/contact" element={<LandingRouteWrapper />} />

            {/* Auth Sign In / Register */}
            <Route path="/login" element={<AuthRouteWrapper initialMode="signin" />} />
            <Route path="/register" element={<AuthRouteWrapper initialMode="register" />} />

            {/* Core Application Hub & All Direct Role Routes */}
            <Route path="/admin/*" element={<MainApp />} />
            <Route path="/trainer/*" element={<MainApp />} />
            <Route path="/reception/*" element={<MainApp />} />
            <Route path="/member/*" element={<MainApp />} />
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
