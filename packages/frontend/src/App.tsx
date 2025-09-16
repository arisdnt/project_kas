import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/otentikasi/pages/LoginPage';
import { DashboardLayout } from './core/layouts/DashboardLayout';
import { useAuthStore } from './core/store/authStore';
import { Toaster } from './core/components/ui/toaster';
import { ErrorBoundary } from './core/components/ErrorBoundary';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
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