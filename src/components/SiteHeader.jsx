import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';
import RoleBadge from './RoleBadge.jsx';
import { getDashboardPath, signOutDemo, useRoleSession } from '../services/roleAuth.js';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Requests', to: '/requests' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = useRoleSession();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  function handleSignOut() {
    signOutDemo();
    navigate('/login');
  }

  return (
    <header className="site-header">
      <div className="site-header__inner shell">
        <Link to="/" className="brand-link" aria-label="Limkokwing Student Service Portal home">
          <BrandMark />
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav${menuOpen ? ' main-nav--open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `main-nav__link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          {session ? (
            <NavLink to={getDashboardPath(session.role)} className={({ isActive }) => `main-nav__link${isActive ? ' is-active' : ''}`}>
              Dashboard
            </NavLink>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `main-nav__link${isActive ? ' is-active' : ''}`}>
              Portal login
            </NavLink>
          )}
          <Link className="header-cta" to="/request">
            New request <ArrowUpRight size={15} />
          </Link>
          {session && <span className="header-session"><RoleBadge role={session.role} compact /><button type="button" className="header-sign-out" onClick={handleSignOut}>Sign out</button></span>}
        </nav>
      </div>
    </header>
  );
}
