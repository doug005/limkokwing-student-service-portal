import { useEffect, useState } from 'react';
import { BarChart3, Bell, BookOpen, CalendarDays, ClipboardList, FilePlus2, GraduationCap, LayoutDashboard, LogOut, Menu, Search, Settings2, UsersRound, X } from 'lucide-react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import BrandMark from '../components/BrandMark.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { getDashboardPath, signOutDemo, useRoleSession } from '../services/roleAuth.js';

const NAVIGATION = {
  student: [
    { label: 'Dashboard', to: '/dashboard/student', icon: LayoutDashboard, end: true },
    { label: 'Services', to: '/services', icon: BookOpen },
    { label: 'New request', to: '/request', icon: FilePlus2 },
    { label: 'Academic calendar', to: '/services?search=calendar', icon: CalendarDays },
  ],
  lecturer: [
    { label: 'Dashboard', to: '/dashboard/lecturer', icon: LayoutDashboard, end: true },
    { label: 'Student directory', to: '/dashboard/lecturer', icon: UsersRound },
    { label: 'Services', to: '/services', icon: BookOpen },
    { label: 'Reports', to: '/dashboard/lecturer?view=reports', icon: BarChart3 },
  ],
  admin: [
    { label: 'Dashboard', to: '/dashboard/admin', icon: LayoutDashboard, end: true },
    { label: 'Request queue', to: '/requests', icon: ClipboardList },
    { label: 'Student directory', to: '/dashboard/admin', icon: UsersRound },
    { label: 'Portal services', to: '/services', icon: BookOpen },
  ],
};

const ROLE_TITLES = { student: 'Student workspace', lecturer: 'Lecturer workspace', admin: 'Admin panel' };

export default function DashboardLayout() {
  const session = useRoleSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => setMenuOpen(false), [location.pathname]);

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
  const roleTitle = ROLE_TITLES[session.role] || 'Portal workspace';

  return (
    <div className={`dashboard-app-shell dashboard-app-shell--${session.role}`}>
      <aside className={`dashboard-sidebar${menuOpen ? ' dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-sidebar__brand"><NavLink to={getDashboardPath(session.role)} aria-label="Limkokwing dashboard home"><BrandMark /></NavLink></div>
        <div className="dashboard-sidebar__identity"><span className="dashboard-sidebar__avatar">{session.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>{roleTitle}</strong><small>{session.name}</small></span></div>
        <p className="dashboard-sidebar__label">Workspace</p>
        <nav className="dashboard-sidebar__nav" aria-label={`${roleTitle} navigation`}>
          {navigation.map(({ label, to, icon: Icon, end }) => <NavLink key={label} to={to} end={end} className={({ isActive }) => `dashboard-sidebar__link${isActive ? ' is-active' : ''}`}><Icon size={17} /><span>{label}</span></NavLink>)}
        </nav>
        <div className="dashboard-sidebar__divider" />
        <p className="dashboard-sidebar__label">Account</p>
        <nav className="dashboard-sidebar__nav">
          <NavLink to={`${getDashboardPath(session.role)}#profile`} className="dashboard-sidebar__link"><Settings2 size={17} /><span>Profile settings</span></NavLink>
          <button type="button" className="dashboard-sidebar__link dashboard-sidebar__logout" onClick={handleSignOut}><LogOut size={17} /><span>Sign out</span></button>
        </nav>
        <div className="dashboard-sidebar__footer"><span className="dashboard-sidebar__footer-mark"><GraduationCap size={20} /></span><span><strong>Limkokwing</strong><small>Maseru student portal</small></span></div>
      </aside>
      {menuOpen && <button type="button" className="dashboard-sidebar__scrim" aria-label="Close dashboard navigation" onClick={() => setMenuOpen(false)} />}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button type="button" className="dashboard-menu-toggle" aria-label={menuOpen ? 'Close dashboard navigation' : 'Open dashboard navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <form className="dashboard-topbar__search" onSubmit={handleSearch} role="search"><Search size={16} aria-hidden="true" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={session.role === 'admin' ? 'Search students, requests, reports…' : session.role === 'lecturer' ? 'Search students, programmes…' : 'Search services, resources…'} aria-label="Search portal" /><kbd>Enter</kbd></form>
          <div className="dashboard-topbar__account">
            <div className="dashboard-topbar__notification-wrap"><button type="button" className="dashboard-topbar__notification" aria-label="View notifications" aria-expanded={notificationOpen} onClick={() => setNotificationOpen((open) => !open)}><Bell size={17} /><span className="dashboard-topbar__notification-dot" /></button>{notificationOpen && <div className="dashboard-notification-panel"><strong>Notifications</strong><p>You are all caught up.</p><small>New service updates will appear here.</small></div>}</div>
            <span className="dashboard-topbar__account-copy"><strong>{session.name}</strong><small>{session.email}</small></span>
            <RoleBadge role={session.role} compact />
            <button type="button" className="dashboard-topbar__signout" onClick={handleSignOut}>Sign out</button>
          </div>
        </header>
        <main className="dashboard-main__content"><Outlet /></main>
      </div>
    </div>
  );
}
