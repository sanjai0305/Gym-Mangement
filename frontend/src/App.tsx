import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
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
import { MemberPortalPage } from './pages/MemberPortalPage';
import { TrainerPortalPage } from './pages/TrainerPortalPage';
import { SettingsPage } from './pages/SettingsPage';

import { api } from './services/api';
import { Member } from './types';

function MainApp() {
  const { user, loading } = useAuth();

  // Navigation view state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isLanding, setIsLanding] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register' | null>(null);

  // Modals & Drawer state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [activeInvoiceNumber, setActiveInvoiceNumber] = useState<string | null>(null);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');

  // Auto route based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'MEMBER') {
        setCurrentView('member-portal');
      } else if (user.role === 'TRAINER') {
        setCurrentView('trainer-portal');
      } else {
        // OWNER, ADMIN, RECEPTIONIST
        if (currentView === 'member-portal' || currentView === 'trainer-portal') {
          setCurrentView('dashboard');
        }
      }
    }
  }, [user?.role]);

  const handleSelectMemberById = async (id: string) => {
    try {
      const res = await api.getMemberById(id);
      setSelectedMember(res.data);
    } catch (e) {
      console.error('Failed to load member:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e1e] flex flex-col items-center justify-center text-[#dae2fd] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-[#a3e635] flex items-center justify-center text-[#0b1326] font-black shadow-xl shadow-primary/20 animate-pulse">
          <span className="material-symbols-outlined text-3xl">bolt</span>
        </div>
        <div className="text-xs font-mono text-[#8b9bc1]">Bootstrapping FITCORE Cloud Engine...</div>
      </div>
    );
  }

  // If public landing page requested
  if (isLanding) {
    return (
      <LandingPage
        onEnterApp={() => setIsLanding(false)}
        onOpenSignIn={() => {
          setIsLanding(false);
          setAuthMode('signin');
        }}
        onOpenRegister={() => {
          setIsLanding(false);
          setAuthMode('register');
        }}
      />
    );
  }

  // If auth page requested
  if (authMode) {
    return (
      <AuthPage
        initialMode={authMode}
        onSuccess={() => setAuthMode(null)}
        onBackToHome={() => {
          setAuthMode(null);
          setIsLanding(true);
        }}
      />
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
          title: 'Workout Routines & Prescriptions',
          subtitle: 'Custom set/rep schemes, tempo cues, and progression tracking',
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
    <div className="min-h-screen bg-[#070e1e] text-[#dae2fd] flex selection:bg-primary selection:text-[#0b1326]">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} onNavigate={(v) => setCurrentView(v)} />

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
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto pb-16">
          {currentView === 'dashboard' && (
            <DashboardPage
              onNavigate={(v) => setCurrentView(v)}
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

          {currentView === 'member-portal' && (
            <MemberPortalPage onOpenInvoice={(inv) => setActiveInvoiceNumber(inv)} />
          )}

          {currentView === 'trainer-portal' && (
            <TrainerPortalPage
              onSelectMember={handleSelectMemberById}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Slide-in Member Detail Drawer */}
      {selectedMember && (
        <MemberDrawer
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onMemberUpdated={() => handleSelectMemberById(selectedMember._id)}
          onViewWorkouts={() => {
            setSelectedMember(null);
            setCurrentView('workouts');
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

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onCheckInSuccess={() => {
          // Refresh current page if needed
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
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
