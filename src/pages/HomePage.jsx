import { ArrowDownRight, ArrowRight, Check, FilePlus2, SearchCheck, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { services } from '../data/services.js';

const steps = [
  { number: '01', icon: SearchCheck, title: 'Find your service', text: 'Explore the options and check the information you need before starting.' },
  { number: '02', icon: FilePlus2, title: 'Send a request', text: 'Share your student details and tell the right team how they can help.' },
  { number: '03', icon: Check, title: 'Follow its progress', text: 'Your request is recorded with a reference and a clear status.' },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-section hero-section--image">
        <div className="hero-visual">
          <div className="hero-image-frame">
            <img
              src="/images/limkokwing-campus-hero.jpg"
              alt="Limkokwing University campus facade with the University of Transformation mural"
            />
            <div className="hero-image-caption">
              <span><strong>Limkokwing University</strong></span>
            </div>
          </div>
        </div>
        <div className="hero-copy shell">
          <p className="eyebrow">Student support, made simpler</p>
          <h1>Your next step<br />starts <em>right here.</em></h1>
          <p className="hero-description">
            One considered place to find the university service you need, submit a request, and keep everything in order.
          </p>
          <div className="hero-actions">
            <Button to="/services">Explore services <ArrowRight size={16} /></Button>
            <Link to="/request" className="text-link text-link--quiet">Submit a request <ArrowDownRight size={16} /></Link>
          </div>
          <div className="hero-trust">
            <span className="hero-trust__icon"><Check size={15} /></span>
            <span>Six services. One simple starting point.</span>
          </div>
        </div>
      </section>

      <section className="service-overview section-space" aria-labelledby="home-services-title">
        <div className="shell">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">Start with what you need</p>
              <h2 id="home-services-title">Support for the<br /><em>important details.</em></h2>
            </div>
            <div className="section-heading__side">
              <p>From academic records to technical help, choose a service and get the details before you submit.</p>
              <Link className="text-link" to="/services">View all six services <ArrowRight size={16} /></Link>
            </div>
          </div>
          <div className="service-grid service-grid--home">
            {services.map((service) => <ServiceCard key={service.id} service={service} compact />)}
          </div>
        </div>
      </section>

      <section className="process-section section-space" aria-labelledby="process-title">
        <div className="shell process-layout">
          <div className="process-intro">
            <p className="eyebrow">A simple process</p>
            <h2 id="process-title">Good support<br />begins with <em>clarity.</em></h2>
            <p>Spend less time finding the right office and more time moving forward.</p>
            <Button to="/request" variant="outline">Make a request <ArrowRight size={16} /></Button>
          </div>
          <div className="process-steps">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <article className="process-step" key={step.number}>
                  <span className="process-step__number">{step.number}</span>
                  <span className="process-step__icon"><StepIcon size={19} strokeWidth={1.8} /></span>
                  <div><h3>{step.title}</h3><p>{step.text}</p></div>
                  <Send className="process-step__arrow" size={16} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-cta shell" aria-label="Submit a student request">
        <div>
          <p className="eyebrow eyebrow--light">Ready when you are</p>
          <h2>Tell us what you need.<br /><em>We’ll help you take it from there.</em></h2>
        </div>
        <Button to="/request" variant="light">Start a request <ArrowRight size={16} /></Button>
      </section>
    </>
  );
}
