import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { getDashboardPath, useRoleSession } from './services/roleAuth.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'));
const ServiceDetailsPage = lazy(() => import('./pages/ServiceDetailsPage.jsx'));
const RequestPage = lazy(() => import('./pages/RequestPage.jsx'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage.jsx'));
const RequestsPage = lazy(() => import('./pages/RequestsPage.jsx'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage.jsx'));
const LecturerDashboardPage = lazy(() => import('./pages/LecturerDashboardPage.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteContent({ children }) {
  return (
    <Suspense fallback={<div className="route-loading" role="status"><span className="spinner" /><span>Opening the student portal…</span></div>}>
      {children}
    </Suspense>
  );
}

function AuthenticatedRoutes({ session }) {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to={getDashboardPath(session.role)} replace />} />
        <Route path="services" element={<RouteContent><ServicesPage /></RouteContent>} />
        <Route path="services/:serviceId" element={<RouteContent><ServiceDetailsPage /></RouteContent>} />
        <Route path="request" element={<RouteContent><RequestPage /></RouteContent>} />
        <Route path="confirmation" element={<RouteContent><ConfirmationPage /></RouteContent>} />
        <Route path="requests" element={<RouteContent><RequestsPage /></RouteContent>} />
        <Route path="login" element={<Navigate to={getDashboardPath(session.role)} replace />} />
        <Route path="*" element={<RouteContent><NotFoundPage /></RouteContent>} />
        <Route path="dashboard/student" element={<RouteContent><ProtectedRoute role="student"><StudentDashboardPage /></ProtectedRoute></RouteContent>} />
        <Route path="dashboard/lecturer" element={<RouteContent><ProtectedRoute role="lecturer"><LecturerDashboardPage /></ProtectedRoute></RouteContent>} />
        <Route path="dashboard/admin" element={<RouteContent><ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute></RouteContent>} />
      </Route>
    </Routes>
  );
}

function AppGate() {
  const session = useRoleSession();
  const location = useLocation();

  if (!session) return <LoginPage key={location.pathname} />;
  return <AuthenticatedRoutes session={session} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppGate />
    </BrowserRouter>
  );
}
