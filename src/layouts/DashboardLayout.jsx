import { useEffect, useState } from 'react';
import { BarChart3, Bell, BookOpen, CalendarDays, ClipboardList, FilePlus2, GraduationCap, LayoutDashboard, LogOut, Menu, Search, Settings2, UsersRound, X } from 'lucide-react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark.jsx';
import { getDashboardPath, signOutDemo, useRoleSession } from '../services/roleAuth.js';

const NAVIGATION = {
  student: [
    { label: 'Dashboard', to: '/dashboard/student', icon: LayoutDashboard, end: true },
    { label: 'Services', to: '/services', icon: BookOpen },
    { label: 'My Requests', to: '/requests', icon: ClipboardList },
    { label: 'Academics', to: '/services?search=academic', icon: GraduationCap },
    { label: 'Payments', to: '/services?search=fees', icon: FilePlus2 },
    { label: 'Notifications', to: '/services?search=notification', icon: Bell },
    { label: 'Announcements', to: '/services?search=announcement', icon: BarChart3 },
    { label: 'Profile', to: '/dashboard/student#profile', icon: UsersRound },
  ],
  lecturer: [
    { label: 'Dashboard', to: '/dashboard/lecturer', icon: LayoutDashboard, end: true },
    { label: 'My Courses', to: '/dashboard/lecturer?view=courses', icon: BookOpen },
    { label: 'Students', to: '/dashboard/lecturer?view=students', icon: UsersRound },
    { label: 'Attendance', to: '/dashboard/lecturer?view=attendance', icon: CalendarDays },
    { label: 'Assignments', to: '/dashboard/lecturer?view=assignments', icon: FilePlus2 },
    { label: 'Grades & Results', to: '/dashboard/lecturer?view=results', icon: BarChart3 },
    { label: 'Learning Materials', to: '/services?search=learning', icon: BookOpen },
    { label: 'Announcements', to: '/services?search=announcement', icon: Bell },
    { label: 'Service Requests', to: '/requests', icon: ClipboardList },
  ],
  admin: [
    { label: 'Dashboard', to: '/dashboard/admin', icon: LayoutDashboard, end: true },
    { label: 'Access Control (RBAC)', to: '/dashboard/admin?view=access', icon: UsersRound },
    { label: 'Academic Structure', to: '/dashboard/admin?view=academics', icon: GraduationCap },
    { label: 'Students', to: '/dashboard/admin?view=students', icon: UsersRound },
    { label: 'Staff', to: '/dashboard/admin?view=staff', icon: UsersRound },
    { label: 'Courses & Timetables', to: '/services?search=calendar', icon: CalendarDays },
    { label: 'Fee Management', to: '/services?search=fees', icon: FilePlus2 },
    { label: 'Approvals & Workflows', to: '/requests', icon: ClipboardList },
    { label: 'Service Requests', to: '/requests', icon: ClipboardList },
    { label: 'Analytics & Reports', to: '/dashboard/admin?view=reports', icon: BarChart3 },
    { label: 'System Settings', to: '/dashboard/admin?view=settings', icon: Settings2 },
  ],
};

const ROLE_TITLES = { student: 'Student Service Request System', lecturer: 'Student Service Request System', admin: 'Student Service Request System' };

export default function DashboardLayout() {
  const session = useRoleSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  function handleSignOut() {
    signOutDemo();
    navigate('/login', { replace: true });
  }

  function handleSearch(event) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    const destination = session.role === 'student' ? '/services' : getDashboardPath(session.role);
    navigate(`${destination}?search=${encodeURIComponent(term)}`);
  }

  if (!session) return <Navigate to="/login" replace />;

  const navigation = NAVIGATION[session.role] || NAVIGATION.student;
  const initials = session.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const roleLabel = session.role === 'admin' ? 'Administrator' : session.role[0].toUpperCase() + session.role.slice(1);

  return (
    <div className={`dashboard-app-shell dashboard-app-shell--${session.role}`}>
      <aside className={`dashboard-sidebar${menuOpen ? ' dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-sidebar__brand"><NavLink to={getDashboardPath(session.role)} aria-label="Limkokwing dashboard home"><BrandMark /></NavLink><strong>{ROLE_TITLES[session.role]}</strong></div>
        <nav className="dashboard-sidebar__nav" aria-label={`${roleLabel} navigation`}>
          {navigation.map(({ label, to, icon: Icon, end }) => <NavLink key={label} to={to} end={end} className={({ isActive }) => `dashboard-sidebar__link${isActive ? ' is-active' : ''}`}><Icon size={19} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="dashboard-sidebar__bottom">
          <NavLink to={`${getDashboardPath(session.role)}#settings`} className="dashboard-sidebar__link"><Settings2 size={19} /><span>Settings</span></NavLink>
          <button type="button" className="dashboard-sidebar__link dashboard-sidebar__logout" onClick={handleSignOut}><LogOut size={19} /><span>Logout</span></button>
        </div>
      </aside>
      {menuOpen && <button type="button" className="dashboard-sidebar__scrim" aria-label="Close dashboard navigation" onClick={() => setMenuOpen(false)} />}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button type="button" className="dashboard-menu-toggle" aria-label={menuOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <form className="dashboard-topbar__search" onSubmit={handleSearch} role="search"><Search size={18} aria-hidden="true" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={session.role === 'admin' ? 'Search students, staff, requests…' : session.role === 'lecturer' ? 'Search students, programmes…' : 'Search services, resources…'} aria-label="Search portal" /><kbd>⌘ K</kbd></form>
          <div className="dashboard-topbar__account">
            <div className="dashboard-topbar__notification-wrap"><button type="button" className="dashboard-topbar__notification" aria-label="View notifications" aria-expanded={notificationOpen} onClick={() => setNotificationOpen((open) => !open)}><Bell size={22} /><span className="dashboard-topbar__notification-dot" /></button>{notificationOpen && <div className="dashboard-notification-panel"><strong>Notifications</strong><p>You are all caught up.</p><small>New service updates will appear here.</small></div>}</div>
            <span className="dashboard-topbar__divider" />
            <span className="dashboard-topbar__avatar">{initials}</span>
            <span className="dashboard-topbar__account-copy"><strong>{session.name}</strong><small>{roleLabel}</small></span>
            <button type="button" className="dashboard-topbar__signout" onClick={handleSignOut} aria-label="Sign out"><LogOut size={17} /></button>
          </div>
        </header>
        <main className="dashboard-main__content"><Outlet /></main>
      </div>
    </div>
  );
}
