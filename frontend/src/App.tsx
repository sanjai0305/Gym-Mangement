import React, { useState, useEffect } from 'react';
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

function MainApp() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Drawer state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [activeInvoiceNumber, setActiveInvoiceNumber] = useState<string | null>(null);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize route paths with current view
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('members') || path.includes('membership')) setCurrentView('members');
    else if (path.includes('attendance') || path.includes('turnstile')) setCurrentView('attendance');
    else if (path.includes('classes') || path.includes('schedule')) setCurrentView('classes');
    else if (path.includes('billing') || path.includes('payments') || path.includes('expenses')) setCurrentView('billing');
    else if (path.includes('workouts')) setCurrentView('workouts');
    else if (path.includes('reports')) setCurrentView('reports');
    else if (path.includes('notifications')) setCurrentView('notifications');
    else if (path.includes('settings')) setCurrentView('settings');
    else if (path.includes('member') && !path.includes('members')) setCurrentView('member-portal');
    else if (path.includes('trainer')) setCurrentView('trainer-portal');
    else if (path.includes('dashboard')) setCurrentView('dashboard');
  }, [location.pathname]);

  // Auto-route based on authenticated role
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
    // Update browser URL without reloading
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing & Marketing */}
            <Route
              path="/"
              element={
                <LandingPage
                  onEnterApp={() => window.location.assign('/admin/dashboard')}
                  onOpenSignIn={() => window.location.assign('/login')}
                  onOpenRegister={() => window.location.assign('/register')}
                />
              }
            />
            <Route
              path="/features"
              element={
                <LandingPage
                  onEnterApp={() => window.location.assign('/admin/dashboard')}
                  onOpenSignIn={() => window.location.assign('/login')}
                  onOpenRegister={() => window.location.assign('/register')}
                />
              }
            />
            <Route
              path="/pricing"
              element={
                <LandingPage
                  onEnterApp={() => window.location.assign('/admin/dashboard')}
                  onOpenSignIn={() => window.location.assign('/login')}
                  onOpenRegister={() => window.location.assign('/register')}
                />
              }
            />
            <Route
              path="/about"
              element={
                <LandingPage
                  onEnterApp={() => window.location.assign('/admin/dashboard')}
                  onOpenSignIn={() => window.location.assign('/login')}
                  onOpenRegister={() => window.location.assign('/register')}
                />
              }
            />
            <Route
              path="/contact"
              element={
                <LandingPage
                  onEnterApp={() => window.location.assign('/admin/dashboard')}
                  onOpenSignIn={() => window.location.assign('/login')}
                  onOpenRegister={() => window.location.assign('/register')}
                />
              }
            />

            {/* Auth Sign In / Register */}
            <Route
              path="/login"
              element={
                <AuthPage
                  initialMode="signin"
                  onSuccess={() => window.location.assign('/admin/dashboard')}
                  onBackToHome={() => window.location.assign('/')}
                />
              }
            />
            <Route
              path="/register"
              element={
                <AuthPage
                  initialMode="register"
                  onSuccess={() => window.location.assign('/admin/dashboard')}
                  onBackToHome={() => window.location.assign('/')}
                />
              }
            />

            {/* Core Application Hub */}
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
