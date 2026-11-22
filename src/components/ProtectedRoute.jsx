import { Navigate, useLocation } from 'react-router-dom';
import { getDashboardPath, useRoleSession } from '../services/roleAuth.js';

export default function ProtectedRoute({ role, children }) {
  const session = useRoleSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (session.role !== role) {
    return <Navigate to={getDashboardPath(session.role)} replace />;
  }

  return children;
}
