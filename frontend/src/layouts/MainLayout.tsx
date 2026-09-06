import React from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';

interface MainLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  title: string;
  subtitle: string;
  onOpenAddMember?: () => void;
  onOpenQRScanner?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentView,
  onNavigate,
  title,
  subtitle,
  onOpenAddMember,
  onOpenQRScanner,
  searchQuery,
  onSearchChange,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#070e1e] text-[#dae2fd] flex selection:bg-primary selection:text-[#0b1326]">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenAddMember={onOpenAddMember}
          onOpenQRScanner={onOpenQRScanner}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      </div>
    </div>
  );
};
