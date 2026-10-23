import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';

import { LandingPage } from './pages/LandingPage';
import { RulesPage } from './pages/RulesPage';
import { LoginPage } from './pages/LoginPage';
import { GameDashboard } from './pages/GameDashboard';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { AdminIndex } from './pages/admin/AdminIndex';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLiveControl } from './pages/admin/AdminLiveControl';
import { AdminRounds } from './pages/admin/AdminRounds';
import { AdminTeams } from './pages/admin/AdminTeams';
import { AdminQuestions } from './pages/admin/AdminQuestions';
import { AdminSubmissions } from './pages/admin/AdminSubmissions';
import { AdminScores } from './pages/admin/AdminScores';
import { AdminQRCodes } from './pages/admin/AdminQRCodes';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminSettings } from './pages/admin/AdminSettings';

// Protected Admin Route wrapper
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06070a] text-white flex items-center justify-center font-mono text-xs">
        AUTHENTICATING ADMIN CONSOLE...
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SoundProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Team Gameplay Route */}
            <Route path="/game" element={<GameDashboard />} />

            {/* Admin Command Center Routes */}
            <Route path="/admin" element={<AdminIndex />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/live-control"
              element={
                <ProtectedAdminRoute>
                  <AdminLiveControl />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/rounds"
              element={
                <ProtectedAdminRoute>
                  <AdminRounds />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/teams"
              element={
                <ProtectedAdminRoute>
                  <AdminTeams />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <ProtectedAdminRoute>
                  <AdminQuestions />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/submissions"
              element={
                <ProtectedAdminRoute>
                  <AdminSubmissions />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/scores"
              element={
                <ProtectedAdminRoute>
                  <AdminScores />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/qr"
              element={
                <ProtectedAdminRoute>
                  <AdminQRCodes />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedAdminRoute>
                  <AdminAuditLogs />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedAdminRoute>
                  <AdminSettings />
                </ProtectedAdminRoute>
              }
            />

            {/* 404 Handler */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SoundProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
