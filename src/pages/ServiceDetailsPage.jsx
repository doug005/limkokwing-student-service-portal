import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, CornerDownRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { getServiceById } from '../data/services.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const service = getServiceById(serviceId);

  if (!service) return <NotFoundPage message="We couldn’t find that service." />;
  const ServiceIcon = service.icon;

  return (
    <section className="shell page-section service-detail-page">
      <Link className="back-link" to="/services"><ArrowLeft size={15} /> All services</Link>
      <div className="detail-hero">
        <div className="detail-hero__copy">
          <p className="eyebrow">{service.category}</p>
          <h1>{service.name.split(' ').slice(0, -1).join(' ')}<br /><em>{service.name.split(' ').slice(-1)}</em></h1>
          <p className="detail-hero__description">{service.description}</p>
          <Button to={`/request?service=${service.id}`}>Continue to request <ArrowRight size={16} /></Button>
        </div>
        <div className="detail-hero__symbol">
          <span className="detail-hero__ring"><ServiceIcon size={72} strokeWidth={1.4} /></span>
          <span className="detail-hero__caption">Student service</span>
        </div>
      </div>
      <div className="detail-information">
        <div className="detail-info-card">
          <span className="detail-info-card__icon"><Clock3 size={19} /></span>
          <div><span className="detail-info-card__label">Availability</span><strong>{service.availability}</strong><small>Requests are accepted every working day.</small></div>
        </div>
        <div className="detail-info-card">
          <span className="detail-info-card__icon"><CornerDownRight size={19} /></span>
          <div><span className="detail-info-card__label">Responsible department</span><strong>{service.department}</strong><small>The team best placed to review this request.</small></div>
        </div>
      </div>
      <div className="detail-instructions">
        <div className="detail-instructions__heading">
          <p className="eyebrow">Before you begin</p>
          <h2>A few helpful<br /><em>things to know.</em></h2>
        </div>
        <ul className="instruction-list">
          {service.instructions.map((instruction) => (
            <li key={instruction}><CheckCircle2 size={18} /><span>{instruction}</span></li>
          ))}
        </ul>
      </div>
      <div className="detail-bottom-cta">
        <div><strong>Have what you need?</strong><span>Continue to the request form; your selected service will be filled in.</span></div>
        <Button to={`/request?service=${service.id}`} variant="outline">Start this request <ArrowRight size={16} /></Button>
      </div>
    </section>
  );
}
