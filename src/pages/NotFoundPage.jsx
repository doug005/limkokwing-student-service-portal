import { ArrowLeft, Compass } from 'lucide-react';
import Button from '../components/Button.jsx';

export default function NotFoundPage({ message = 'We couldn’t find that page.' }) {
  return (
    <section className="shell not-found-page">
      <span className="not-found-page__icon"><Compass size={26} /></span>
      <p className="eyebrow">404 / Page not found</p>
      <h1>Looks like this<br /><em>isn’t the right path.</em></h1>
      <p>{message} The page may have moved, or the address may be incorrect.</p>
      <Button to="/"><ArrowLeft size={16} /> Return to Home</Button>
    </section>
  );
}
