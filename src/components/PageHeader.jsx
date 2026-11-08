export default function PageHeader({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`page-heading ${className}`.trim()}>
      <div className="page-heading__copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h1>{title}</h1>}
        {description && <p className="page-heading__description">{description}</p>}
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </div>
  );
}
