import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, FilePlus2, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { getFacultyByCode, getStudentByNumber } from '../data/students.js';
import { useRoleSession } from '../services/roleAuth.js';

export default function StudentDashboardPage() {
  const session = useRoleSession();
  const student = getStudentByNumber(session?.studentId);
  const faculty = getFacultyByCode(student?.faculty);

  if (!student) {
    return <section className="shell page-section"><div className="empty-state empty-state--requests"><p className="eyebrow">Student workspace</p><h2>Student record unavailable</h2><p>Your demo session is not linked to a seeded student record.</p><Button to="/login" variant="outline">Return to login <ArrowRight size={15} /></Button></div></section>;
  }

  return (
    <section className="shell page-section dashboard-page student-dashboard">
      <PageHeader
        eyebrow="Student dashboard"
        title={<>Your student record,<br /><em>in one place.</em></>}
        description="Keep your faculty details close, find the right service quickly, and use the portal as a clear starting point for support."
        action={<RoleBadge role="student" />}
      />

      <div className="dashboard-hero dashboard-hero--student">
        <div>
          <span className="dashboard-hero__kicker"><span className="dashboard-live-dot" /> Active student profile</span>
          <h2>Good to see you, <em>{student.name.split(' ')[0]}.</em></h2>
          <p>{student.programme} · {student.year} · {student.faculty}</p>
        </div>
        <div className="dashboard-hero__id"><span>Student number</span><strong>{student.studentNumber}</strong><small>Active record</small></div>
      </div>

      <div className="dashboard-metric-grid dashboard-metric-grid--student">
        <article className="dashboard-metric dashboard-metric--accent"><span>Faculty</span><strong>{student.faculty}</strong><small>{faculty?.name}</small></article>
        <article className="dashboard-metric"><span>Programme</span><strong>{student.year}</strong><small>{student.programme}</small></article>
        <article className="dashboard-metric"><span>Portal status</span><strong>Ready</strong><small>Services are available</small></article>
        <article className="dashboard-metric"><span>Service options</span><strong>06</strong><small>Available support routes</small></article>
      </div>

      <div className="dashboard-columns dashboard-columns--student">
        <section className="dashboard-panel">
          <div className="dashboard-panel__heading"><div><p className="eyebrow">Your details</p><h2>Profile <em>snapshot.</em></h2></div><ShieldCheck size={20} aria-hidden="true" /></div>
          <dl className="profile-list">
            <div><dt><BookOpen size={15} /> Programme</dt><dd>{student.programme}</dd></div>
            <div><dt><MapPin size={15} /> Faculty</dt><dd>{faculty?.name}</dd></div>
            <div><dt><Mail size={15} /> University email</dt><dd>{student.email}</dd></div>
            <div><dt><CalendarDays size={15} /> Academic standing</dt><dd>{student.year} · {student.status}</dd></div>
          </dl>
        </section>

        <aside className="dashboard-panel dashboard-panel--soft">
          <div className="dashboard-panel__heading"><div><p className="eyebrow">Next steps</p><h2>Find the right <em>support.</em></h2></div><FilePlus2 size={20} aria-hidden="true" /></div>
          <p className="dashboard-panel__copy">Browse a service when you know what you need, or start a request and let the relevant office guide the next step.</p>
          <div className="dashboard-action-list">
            <Link to="/services" className="dashboard-action"><span><strong>Explore services</strong><small>Compare all six support options</small></span><ArrowRight size={16} /></Link>
            <Link to="/request" className="dashboard-action"><span><strong>Submit a request</strong><small>Share your details with the right team</small></span><ArrowRight size={16} /></Link>
          </div>
        </aside>
      </div>

      <div className="dashboard-note"><CheckCircle2 size={17} /><span>Your student number follows the portal format: <strong>90101</strong> plus four randomised digits.</span></div>
    </section>
  );
}
