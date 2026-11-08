import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service, compact = false }) {
  const ServiceIcon = service.icon;

  return (
    <article className={`service-card${compact ? ' service-card--compact' : ''}`}>
      <div className="service-card__topline">
        <span className="service-card__number">{service.number}</span>
        <span className="service-card__icon" aria-hidden="true"><ServiceIcon size={20} strokeWidth={1.8} /></span>
      </div>
      <p className="service-card__category">{service.category}</p>
      <h3>{service.name}</h3>
      <p className="service-card__description">{service.shortDescription}</p>
      <div className="service-card__meta">
        <span><Clock3 size={15} /> {service.availability}</span>
        <span>{service.department}</span>
      </div>
      <Link className="text-link service-card__link" to={`/services/${service.id}`} aria-label={`View ${service.name} details`}>
        View service <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}
