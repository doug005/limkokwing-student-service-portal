import { useState } from 'react';
import { BarChart3, BookOpen, Eye, EyeOff, GraduationCap, KeyRound, LockKeyhole, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import { useDirectory } from '../services/directoryStore.js';
import { getDashboardPath, signInWithCredentials } from '../services/roleAuth.js';

const ACCESS_FEATURES = [
  { icon: GraduationCap, label: 'Student portal' },
  { icon: BookOpen, label: 'Course services' },
  { icon: BarChart3, label: 'Academic records' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const directory = useDirectory();
  const demoStudent = directory.find((person) => person.role === 'student' && person.status === 'Active') || directory.find((person) => person.role === 'student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const session = signInWithCredentials({ identifier, password });
      navigate(getDashboardPath(session.role), { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-gateway">
      <div className="login-gateway__overlay" />
      <section className="login-gateway__content" aria-label="Limkokwing Student Service Portal sign in">
        <div className="login-gateway__brand">
          <div className="login-gateway__mark"><GraduationCap size={27} /></div>
          <div><strong>Limkokwing</strong><span>Student Service Portal</span></div>
        </div>
        <div className="login-gateway__message">
          <p className="login-gateway__kicker"><span /> Limkokwing University of Creative Technology</p>
          <h1>Support for every<br /><em>student journey.</em></h1>
          <p className="login-gateway__description">A single campus gateway for student services, academic records, requests, and the people who keep learning moving.</p>
          <div className="login-gateway__features">
            {ACCESS_FEATURES.map(({ icon: Icon, label }) => <span key={label}><Icon size={18} /><small>{label}</small></span>)}
          </div>
        </div>
        <p className="login-gateway__footer">Maseru campus · Student services made clear</p>
      </section>

      <section className="login-gateway__card">
        <div className="login-gateway__card-brand"><ShieldCheck size={25} /><span>Secure campus access</span></div>
        <div className="login-gateway__card-heading">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to your<br /><em>portal account.</em></h2>
          <p>Use your student number or staff email. Your account automatically opens the correct dashboard.</p>
        </div>
        {error && <div className="form-alert form-alert--error" role="alert">{error}</div>}
        <form className="login-gateway__form" onSubmit={handleSubmit}>
          <FormField id="portal-identifier" label="Student number or staff email" required>
            {({ describedBy, invalid }) => (
              <div className="login-gateway__input-wrap"><Mail size={17} aria-hidden="true" /><input id="portal-identifier" type="text" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="901014827 or name@limkokwing.ac.ls" required aria-invalid={invalid} aria-describedby={describedBy} /></div>
            )}
          </FormField>
          <FormField id="portal-password" label="Password" required>
            {({ describedBy, invalid }) => (
              <div className="login-gateway__input-wrap"><LockKeyhole size={17} aria-hidden="true" /><input id="portal-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required aria-invalid={invalid} aria-describedby={describedBy} /><button className="login-gateway__password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            )}
          </FormField>
          <button className="login-gateway__submit" type="submit" disabled={isSubmitting || !identifier || !password}>{isSubmitting ? 'Opening your workspace…' : 'Sign in'} {isSubmitting ? <span className="spinner spinner--small" /> : <LogIn size={18} />}</button>
        </form>
        <div className="login-gateway__demo">
          <div><KeyRound size={15} /><strong>Demo access</strong></div>
          {demoStudent ? <p>Student: <code>{demoStudent.identifier}</code> / <code>{demoStudent.password}</code></p> : <p>No student demo account is available. Ask a portal administrator to add one.</p>}
          <p>Lecturer or admin: use the staff demo credentials supplied in the project README. Admin-managed demo accounts also sign in here with their assigned email or student number.</p>
        </div>
        <p className="login-gateway__note">This preview uses browser-local demo authentication. Replace it with Firebase Authentication and server-enforced roles before using real credentials.</p>
      </section>
    </main>
  );
}
