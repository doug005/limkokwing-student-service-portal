import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__main">
        <div className="site-footer__brand">
          <Link to="/" aria-label="Return to home"><BrandMark /></Link>
          <p>A clearer way to connect with the services that support your time at university.</p>
        </div>
        <div className="site-footer__links">
          <span className="footer-label">Explore</span>
          <Link to="/services">Student services</Link>
          <Link to="/requests">Request management</Link>
          <Link to="/request">Submit a request <ArrowUpRight size={13} /></Link>
        </div>
        <div className="site-footer__note">
          <span className="footer-label">Student support</span>
          <p>For urgent matters, please contact the relevant university office directly.</p>
        </div>
      </div>
      <div className="shell site-footer__bottom">
        <span>Limkokwing University of Creative Technology</span>
        <span>Maseru, Lesotho <i aria-hidden="true">·</i> Student Service Portal</span>
      </div>
    </footer>
  );
}
