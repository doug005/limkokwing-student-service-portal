export default function BrandMark({ compact = false }) {
  return (
    <span className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}`}>
      <img className="brand-logo" src="/images/limko.jpg" alt="Limkokwing University of Creative Technology" />
    </span>
  );
}
