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
        <Route path="requests" element={<RouteContent>{session.role === "student" ? <StudentRequestHistory session={session}/> : <RequestsPage />}</RouteContent>} />
        <Route path="login" element={<Navigate to={getDashboardPath(session.role)} replace />} />
        <Route path="*" element={<RouteContent><NotFoundPage /></RouteContent>} />
        <Route path="dashboard/student" element={<RouteContent><ProtectedRoute role="student"><StudentDashboardPage /></ProtectedRoute></RouteContent>} />
        <Route path="dashboard/lecturer" element={<RouteContent><ProtectedRoute role="lecturer"><LecturerDashboardPage /></ProtectedRoute></RouteContent>} />
        <Route path="dashboard/admin" element={<RouteContent><ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute></RouteContent>} />
      </Route>
    </Routes>
  );
}

function StudentRequestHistory({session}) {
 let records=[];try{records=JSON.parse(localStorage.getItem('portal-submissions:'+session.studentId)||'[]')}catch{}
 return <section className="reference-dashboard student-reference"><div className="reference-heading"><div><h1>My Requests</h1><p>Requests submitted from this browser. Live status tracking requires secure student authentication.</p></div></div><section className="reference-card" style={{padding:20,color:'#14243b'}}>{records.length?<div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left'}}><thead><tr><th>Reference</th><th>Service</th><th>Date</th><th>Submission status</th></tr></thead><tbody>{records.map(r=><tr key={r.id}>{[r.id,r.serviceName,r.requestDate,r.status].map((v,i)=><td key={i} style={{padding:12,borderBottom:'1px solid #dce3ed'}}>{v}</td>)}</tr>)}</tbody></table></div>:<p>No requests submitted from this browser.</p>}</section></section>
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
