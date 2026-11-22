import { useState } from 'react';
import { ArrowRight, BookOpenCheck, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import PageHeader from '../components/PageHeader.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { DEMO_ACCOUNTS, ROLE_DEFINITIONS, getDashboardPath, signInDemo, useRoleSession } from '../services/roleAuth.js';

const ROLE_OPTIONS = [
  { role: 'student', icon: GraduationCap, label: 'Student', action: 'Open your record' },
  { role: 'lecturer', icon: BookOpenCheck, label: 'Lecturer', action: 'Review students' },
  { role: 'admin', icon: ShieldCheck, label: 'Administrator', action: 'Manage the portal' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = useRoleSession();
  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState(DEMO_ACCOUNTS.student.identifier);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.student.password);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function chooseRole(nextRole) {
    setRole(nextRole);
    setIdentifier(DEMO_ACCOUNTS[nextRole].identifier);
    setPassword(DEMO_ACCOUNTS[nextRole].password);
    setError('');
  }

  function useDemoAccount(nextRole) {
    chooseRole(nextRole);
    setTimeout(() => document.getElementById('portal-identifier')?.focus(), 0);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      signInDemo({ role, identifier, password });
      const redirect = searchParams.get('redirect');
      const safeRedirect = redirect?.startsWith('/dashboard/') ? redirect : getDashboardPath(role);
      navigate(safeRedirect, { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="shell page-section login-page">
      <PageHeader
        eyebrow="Portal access"
        title={<>Choose your <em>access point.</em></>}
        description="Sign in to the workspace that matches your role. This preview includes seeded demo accounts so the portal can be explored without a Firebase setup."
        action={session ? <Button to={getDashboardPath(session.role)} variant="outline">Return to dashboard <ArrowRight size={15} /></Button> : null}
      />

      <div className="login-layout">
        <aside className="role-picker" aria-label="Choose a portal role">
          <div className="role-picker__intro">
            <span className="role-picker__icon"><Sparkles size={19} /></span>
            <p className="eyebrow">Three workspaces</p>
            <h2>One portal.<br /><em>Different views.</em></h2>
            <p>Choose an access point to see the tools and information designed for that role.</p>
          </div>
          <div className="role-picker__options">
            {ROLE_OPTIONS.map(({ role: optionRole, icon: Icon, label, action }) => (
              <button
                className={`role-option${role === optionRole ? ' role-option--selected' : ''}`}
                type="button"
                key={optionRole}
                aria-pressed={role === optionRole}
                onClick={() => chooseRole(optionRole)}
              >
                <span className="role-option__icon"><Icon size={19} /></span>
                <span><strong>{label}</strong><small>{action}</small></span>
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </aside>

        <div className="login-card">
          <div className="login-card__header">
            <div>
              <p className="eyebrow">{ROLE_DEFINITIONS[role].shortLabel}</p>
              <h2>Sign in to your<br /><em>{ROLE_DEFINITIONS[role].label.toLowerCase()} workspace.</em></h2>
            </div>
            <RoleBadge role={role} />
          </div>
          {session && <div className="form-alert form-alert--info" role="status">You are currently signed in as <strong>{session.name}</strong>. Signing in below will switch the active demo role.</div>}
          {error && <div className="form-alert form-alert--error" role="alert">{error}</div>}
          <form className="login-form" onSubmit={handleSubmit}>
            <FormField id="portal-identifier" label={role === 'student' ? 'Student number or student email' : 'Portal username'} required>
              {({ describedBy, invalid }) => (
                <input id="portal-identifier" type={role === 'student' ? 'text' : 'email'} autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={DEMO_ACCOUNTS[role].identifier} required aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            </FormField>
            <FormField id="portal-password" label="Password" required>
              {({ describedBy, invalid }) => (
                <input id="portal-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            </FormField>
            <Button type="submit" disabled={isSubmitting || !identifier || !password}>{isSubmitting ? 'Opening workspace…' : `Continue as ${ROLE_DEFINITIONS[role].label}`} <ArrowRight size={16} /></Button>
          </form>
          <div className="login-demo-credentials">
            <div className="login-demo-credentials__heading"><span>Demo credentials</span><small>Use these values to explore the role</small></div>
            <button type="button" className="demo-credential" onClick={() => useDemoAccount(role)}>
              <RoleBadge role={role} compact />
              <code>{DEMO_ACCOUNTS[role].hint}</code>
            </button>
          </div>
          <p className="login-card__footnote">Demo access is stored only in this browser. Replace it with Firebase Authentication and server-enforced roles before using real student or staff credentials.</p>
        </div>
      </div>
      <p className="login-page__back"><Link className="text-link text-link--quiet" to="/">Return to the public portal <ArrowRight size={15} /></Link></p>
    </section>
  );
}
