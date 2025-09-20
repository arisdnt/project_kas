import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCalculator } from '../hooks/use-calculator';
import { CalculatorModal } from '../components/ui/calculator-modal';
import { StatusBar } from '@/core/components/StatusBar';
import { DashboardHeader } from '@/core/layouts/dashboard/components/DashboardHeader';
import { NavMobile } from '@/core/layouts/dashboard/components/NavMobile';
import { DashboardRoutes } from '@/core/layouts/dashboard/DashboardRoutes';
import { useFullscreen } from '@/core/layouts/dashboard/hooks/useFullscreen';
import { NewsTrackerBar } from '@/features/berita/components/NewsTrackerBar';

export function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { isCalculatorOpen, openCalculator, closeCalculator, handleCalculatorResult } = useCalculator();

  const handleLogout = () => logout();
  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  
  const handleManualRefresh = () => {
    // Broadcast refresh event for components that listen
    window.dispatchEvent(new CustomEvent('app:refresh'));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <DashboardHeader
          pathname={location.pathname}
          user={user}
          onLogout={handleLogout}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenCalculator={openCalculator}
          onRefresh={handleManualRefresh}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
        />
        <NavMobile
          pathname={location.pathname}
          isOpen={isMobileMenuOpen}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenCalculator={openCalculator}
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
          onLogout={handleLogout}
        />
      </nav>
      
      <main className="flex-1 min-h-0 py-3 sm:py-4 px-2 sm:px-4 lg:px-6 pb-32">
        <div className="h-full w-full max-w-none flex flex-col">
          <DashboardRoutes />
        </div>
      </main>
      <footer>
        <NewsTrackerBar />
        <StatusBar />
      </footer>
      
      {/* Calculator Modal */}
      <CalculatorModal 
        open={isCalculatorOpen} 
        onOpenChange={closeCalculator}
        onResult={handleCalculatorResult}
      />
    </div>
  );
}
