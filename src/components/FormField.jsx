export default function FormField({ id, label, error, hint, required = false, children, className = '' }) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-field ${className}`.trim()}>
      <label className="form-label" htmlFor={id}>
        {label}{required && <span className="required-mark" aria-hidden="true"> *</span>}
      </label>
      {typeof children === 'function' ? children({ describedBy, invalid: Boolean(error) }) : children}
      {hint && <p className="form-hint" id={descriptionId}>{hint}</p>}
      {error && <p className="form-error" id={errorId} role="alert">{error}</p>}
    </div>
  );
}
