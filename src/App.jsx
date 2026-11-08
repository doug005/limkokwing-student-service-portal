import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'));
const ServiceDetailsPage = lazy(() => import('./pages/ServiceDetailsPage.jsx'));
const RequestPage = lazy(() => import('./pages/RequestPage.jsx'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage.jsx'));
const RequestsPage = lazy(() => import('./pages/RequestsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteContent({ children }) {
  return (
    <Suspense fallback={<div className="route-loading" role="status"><span className="spinner" /><span>Opening the student portal…</span></div>}>
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<RouteContent><HomePage /></RouteContent>} />
          <Route path="services" element={<RouteContent><ServicesPage /></RouteContent>} />
          <Route path="services/:serviceId" element={<RouteContent><ServiceDetailsPage /></RouteContent>} />
          <Route path="request" element={<RouteContent><RequestPage /></RouteContent>} />
          <Route path="confirmation" element={<RouteContent><ConfirmationPage /></RouteContent>} />
          <Route path="requests" element={<RouteContent><RequestsPage /></RouteContent>} />
          <Route path="*" element={<RouteContent><NotFoundPage /></RouteContent>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
