import { useMemo, useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { services } from '../data/services.js';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredServices = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return services;
    return services.filter((service) =>
      [service.name, service.shortDescription, service.department, service.category]
        .some((value) => value.toLowerCase().includes(search)),
    );
  }, [searchTerm]);

  return (
    <section className="shell page-section">
      <PageHeader
        eyebrow="Student services"
        title={<>The right support,<br /><em>all in one place.</em></>}
        description="Browse services by the office that handles them. Every service is available on each working day."
        action={<div className="page-heading__aside"><span>06</span><small>available services</small></div>}
      />
      <div className="services-toolbar">
        <div className="services-toolbar__label"><SlidersHorizontal size={16} /> <span>Browse services</span></div>
        <label className="search-control">
          <Search size={17} aria-hidden="true" />
          <span className="visually-hidden">Search services</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by service or department"
          />
        </label>
      </div>
      {filteredServices.length > 0 ? (
        <div className="service-grid">
          {filteredServices.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      ) : (
        <div className="empty-state empty-state--light">
          <span className="empty-state__icon"><Search size={21} /></span>
          <h2>No service found</h2>
          <p>Try another search term, or send a general enquiry if you are not sure where to start.</p>
          <Link className="text-link" to="/services/general-enquiry">Explore general enquiries <ArrowRight size={16} /></Link>
        </div>
      )}
    </section>
  );
}
