import { Link } from 'react-router-dom';

export default function Button({
  to,
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) {
  const classes = `button button--${variant} ${className}`.trim();
  if (to) {
    return <Link className={classes} to={to} aria-disabled={disabled || undefined} {...props}>{children}</Link>;
  }
  return <button className={classes} type={type} disabled={disabled} {...props}>{children}</button>;
}
