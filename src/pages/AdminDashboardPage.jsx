import { useMemo, useState } from 'react';
import { ArrowRight, ClipboardList, Search, Settings2, ShieldCheck, UsersRound } from 'lucide-react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { DEMO_ACCOUNTS, ROLE_DEFINITIONS, useRoleSession } from '../services/roleAuth.js';
import { FACULTIES, students } from '../data/students.js';

const roleOrder = ['student', 'lecturer', 'admin'];

export default function AdminDashboardPage() {
  const session = useRoleSession();
  const [searchTerm, setSearchTerm] = useState('');
  const search = searchTerm.trim().toLowerCase();
  const facultyCounts = useMemo(() => FACULTIES.map((faculty) => ({ ...faculty, count: students.filter((student) => student.faculty === faculty.code).length })), []);
  const filteredStudents = useMemo(() => students.filter((student) => [student.name, student.studentNumber, student.email, student.faculty, student.programme].some((value) => value.toLowerCase().includes(search))), [search]);

  return (
    <section className="shell page-section dashboard-page admin-dashboard">
      <PageHeader
        eyebrow="Administrator dashboard"
        title={<>Keep the portal<br /><em>in good order.</em></>}
        description="Monitor role access, confirm faculty coverage, and move from the seeded directory into the live request-management workspace."
        action={<RoleBadge role="admin" />}
      />

      <div className="dashboard-hero dashboard-hero--admin">
        <div><span className="dashboard-hero__kicker"><span className="dashboard-live-dot" /> Control centre</span><h2>Welcome back, <em>administrator.</em></h2><p>{session?.email} has full demo access across the student portal.</p></div>
        <Button to="/requests" variant="light">Open request management <ArrowRight size={15} /></Button>
      </div>

      <div className="dashboard-metric-grid">
        <article className="dashboard-metric dashboard-metric--accent"><span>Student records</span><strong>{students.length}</strong><small>Ready in the directory</small></article>
        <article className="dashboard-metric"><span>Faculties represented</span><strong>{FACULTIES.length}</strong><small>FICT · FCMB · FBMG · FCTH</small></article>
        <article className="dashboard-metric"><span>Role workspaces</span><strong>{roleOrder.length}</strong><small>Student, lecturer, administrator</small></article>
        <article className="dashboard-metric"><span>Directory coverage</span><strong>100%</strong><small>All seeded records mapped</small></article>
      </div>

      <div className="admin-dashboard-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel__heading"><div><p className="eyebrow">Access map</p><h2>Role <em>workspaces.</em></h2></div><Settings2 size={20} aria-hidden="true" /></div>
          <div className="role-access-list">{roleOrder.map((role) => <div className="role-access-row" key={role}><RoleBadge role={role} compact /><span><strong>{ROLE_DEFINITIONS[role].label}</strong><small>{ROLE_DEFINITIONS[role].description}</small></span><span className="access-state">Enabled</span></div>)}</div>
          <div className="dashboard-panel__callout"><ShieldCheck size={16} /><span>Demo roles are browser-local. Connect Firebase Authentication and server-side claims before production use.</span></div>
        </section>

        <section className="dashboard-panel dashboard-panel--soft">
          <div className="dashboard-panel__heading"><div><p className="eyebrow">Faculty mix</p><h2>Coverage by <em>faculty.</em></h2></div><UsersRound size={20} aria-hidden="true" /></div>
          <div className="admin-faculty-list">{facultyCounts.map((faculty) => <div className="admin-faculty-row" key={faculty.code}><div><strong>{faculty.code}</strong><span>{faculty.name}</span></div><div className="admin-faculty-count"><b>{faculty.count}</b><small>students</small></div></div>)}</div>
        </section>
      </div>

      <section className="directory-section admin-directory-section">
        <div className="directory-heading"><div><p className="eyebrow">Admin directory <span className="eyebrow-count">{filteredStudents.length}</span></p><h2>Search every <em>record.</em></h2></div><label className="search-control directory-search"><Search size={15} aria-hidden="true" /><span className="visually-hidden">Search student records</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search student, faculty, programme…" /></label></div>
        <div className="admin-directory-list">{filteredStudents.map((student) => <article className="admin-directory-row" key={student.id}><span className="admin-directory-row__initials">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{student.name}</strong><small>{student.studentNumber} · {student.email}</small></div><span className="faculty-code">{student.faculty}</span><span className="admin-directory-row__programme">{student.programme}</span><span className="directory-status">{student.status}</span></article>)}</div>
        {filteredStudents.length === 0 && <div className="directory-empty"><UsersRound size={18} /><p>No student records match that search.</p></div>}
      </section>

      <div className="admin-action-strip"><div><p className="eyebrow">Next operational step</p><h2>Review the live service <em>queue.</em></h2><p>Firebase-backed requests stay in the existing protected request-management page.</p></div><Button to="/requests" variant="outline"><ClipboardList size={15} /> Open request management <ArrowRight size={15} /></Button></div>
      <p className="dashboard-note"><ShieldCheck size={17} /><span>The three demo account hints are <strong>{DEMO_ACCOUNTS.student.hint}</strong>, <strong>{DEMO_ACCOUNTS.lecturer.hint}</strong>, and <strong>{DEMO_ACCOUNTS.admin.hint}</strong>.</span></p>
    </section>
  );
}
