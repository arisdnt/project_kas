import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/otentikasi/pages/LoginPage';
import { DashboardLayout } from './core/layouts/DashboardLayout';
import { useAuthStore } from './core/store/authStore';
import { Toaster } from './core/components/ui/toaster';
import { ErrorBoundary } from './core/components/ErrorBoundary';
import { useGlobalEscape } from './core/hooks/useGlobalEscape';
// Import to setup custom notifications and replace native dialogs
import './core/utils/notifications';

function App() {
  const { isAuthenticated } = useAuthStore();

  // Global ESC key handler to close modals/drawers across the app
  useGlobalEscape();

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-container h-screen overflow-hidden bg-gray-50">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <LoginPage />
              } 
            />
            <Route 
              path="/dashboard/*" 
              element={
                isAuthenticated ? 
                  <DashboardLayout /> : 
                  <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/" 
              element={
                <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
              } 
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;