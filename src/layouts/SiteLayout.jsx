import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteFooter from '../components/SiteFooter.jsx';
import SiteHeader from '../components/SiteHeader.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function SiteLayout() {
  return (
    <>
      <ScrollToTop />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      <main id="main-content" className="site-main"><Outlet /></main>
      <SiteFooter />
    </>
  );
}
