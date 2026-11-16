import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service, compact = false }) {
  const ServiceIcon = service.icon;

  return (
    <article className={`service-card${compact ? ' service-card--compact' : ''}`}>
      <span className="service-card__icon" aria-hidden="true"><ServiceIcon size={21} strokeWidth={1.8} /></span>
      <div className="service-card__content">
        <div className="service-card__heading">
          <span className="service-card__number">{service.number}</span>
          <p className="service-card__category">{service.category}</p>
        </div>
        <h3>{service.name}</h3>
        <p className="service-card__description">{service.shortDescription}</p>
      </div>
      <Link className="text-link service-card__link" to={`/services/${service.id}`} aria-label={`View ${service.name} details`}>
        <span className="service-card__link-label">View service</span><ArrowUpRight size={17} />
      </Link>
      <div className="service-card__meta">
        <span><Clock3 size={15} /> {service.availability}</span>
        <span>{service.department}</span>
      </div>
    </article>
  );
}
