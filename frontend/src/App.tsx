import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SubmitReport from './pages/citizen/SubmitReport';
import MyReports from './pages/citizen/MyReports';

import InspectorDashboard from './pages/inspector/InspectorDashboard';
import MaintenanceDashboard from './pages/maintenance/MaintenanceDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';

import ReportDetail from './pages/ReportDetail';
import MapView from './pages/MapView';
import Analytics from './pages/Analytics';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// ── Protected Route ───────────────────────────────────────────
const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-app)' }}>
      <div style={{ width: 28, height: 28, border: '2px solid var(--n-200)', borderTopColor: 'var(--secondary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ── Dashboard Redirect ────────────────────────────────────────
const DashboardRedirect = () => {
  const { user } = useAuth();
  const routes: Record<string, string> = {
    citizen: '/dashboard/citizen',
    inspector: '/dashboard/inspector',
    maintenance_officer: '/dashboard/maintenance',
    admin: '/dashboard/admin',
  };
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={routes[user.role] || '/dashboard/citizen'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* ── Protected Dashboard ── */}
          <Route path="dashboard" element={
            <ProtectedRoute><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<DashboardRedirect />} />

            {/* Citizen */}
            <Route path="citizen" element={
              <ProtectedRoute roles={['citizen', 'admin']}><CitizenDashboard /></ProtectedRoute>
            } />
            <Route path="submit-report" element={
              <ProtectedRoute><SubmitReport /></ProtectedRoute>
            } />
            <Route path="my-reports" element={
              <ProtectedRoute><MyReports /></ProtectedRoute>
            } />

            {/* Inspector */}
            <Route path="inspector" element={
              <ProtectedRoute roles={['inspector', 'admin']}><InspectorDashboard /></ProtectedRoute>
            } />

            {/* Maintenance */}
            <Route path="maintenance" element={
              <ProtectedRoute roles={['maintenance_officer', 'admin']}><MaintenanceDashboard /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="admin" element={
              <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
            } />
            <Route path="admin/reports" element={
              <ProtectedRoute roles={['admin', 'inspector']}><AdminReports /></ProtectedRoute>
            } />

            {/* Shared */}
            <Route path="reports/:id" element={<ProtectedRoute><ReportDetail /></ProtectedRoute>} />
            <Route path="map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
