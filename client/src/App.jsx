import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SetupPage from './pages/SetupPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import WebsitesPage from './pages/WebsitesPage';
import PagesPage from './pages/PagesPage';
import MediaPage from './pages/MediaPage';
import TemplatesPage from './pages/TemplatesPage';
import SettingsPage from './pages/SettingsPage';
import Builder from './editor/Builder';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { user, loading, setupStatus } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        color: 'var(--primary)'
      }}>
        <Loader2 size={36} className="animate-spin" />
      </div>
    );
  }

  // If system is not installed, redirect all routes to /setup
  if (!setupStatus.isInstalled) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // If system is installed but user not logged in, show login or redirect
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated routes
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/setup" element={<Navigate to="/" replace />} />
      
      {/* Visual Builder Fullscreen Route */}
      <Route path="/builder/:pageId" element={<Builder />} />

      {/* Main Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<WebsitesPage />} />
        <Route path="/websites" element={<WebsitesPage />} />
        <Route path="/websites/:websiteId/pages" element={<PagesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
