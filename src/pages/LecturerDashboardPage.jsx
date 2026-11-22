import { useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, Search, UsersRound } from 'lucide-react';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import RoleBadge from '../components/RoleBadge.jsx';
import { FACULTIES, students } from '../data/students.js';
import { useRoleSession } from '../services/roleAuth.js';

export default function LecturerDashboardPage() {
  const session = useRoleSession();
  const [facultyFilter, setFacultyFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const search = searchTerm.trim().toLowerCase();

  const filteredStudents = useMemo(() => students.filter((student) => {
    const matchesFaculty = facultyFilter === 'All' || student.faculty === facultyFilter;
    const matchesSearch = !search || [student.name, student.studentNumber, student.faculty, student.programme, student.email].some((value) => value.toLowerCase().includes(search));
    return matchesFaculty && matchesSearch;
  }), [facultyFilter, search]);

  const facultyCounts = useMemo(() => FACULTIES.map((faculty) => ({ ...faculty, count: students.filter((student) => student.faculty === faculty.code).length })), []);

  return (
    <section className="shell page-section dashboard-page lecturer-dashboard">
      <PageHeader
        eyebrow="Lecturer dashboard"
        title={<>See the student directory<br /><em>at a glance.</em></>}
        description="Review the seeded student records by faculty, programme, or student number. This view is designed for quick academic follow-up."
        action={<RoleBadge role="lecturer" />}
      />

      <div className="dashboard-hero dashboard-hero--lecturer">
        <div><span className="dashboard-hero__kicker"><span className="dashboard-live-dot" /> Faculty directory</span><h2>Good afternoon, <em>{session?.name?.split(' ')[1] || 'lecturer'}.</em></h2><p>Use the directory to orientate student support across all four faculties.</p></div>
        <div className="dashboard-hero__id"><span>Signed in as</span><strong>{session?.email}</strong><small>Lecturer access</small></div>
      </div>

      <div className="dashboard-metric-grid">
        <article className="dashboard-metric dashboard-metric--accent"><span>Total students</span><strong>{students.length}</strong><small>Seeded student records</small></article>
        <article className="dashboard-metric"><span>Faculties</span><strong>{FACULTIES.length}</strong><small>All represented in the directory</small></article>
        <article className="dashboard-metric"><span>Active records</span><strong>{students.filter((student) => student.status === 'Active').length}</strong><small>Current student profiles</small></article>
        <article className="dashboard-metric"><span>Current view</span><strong>{filteredStudents.length}</strong><small>{facultyFilter === 'All' ? 'All faculties' : facultyFilter}</small></article>
      </div>

      <section className="dashboard-panel dashboard-panel--directory">
        <div className="dashboard-panel__heading dashboard-panel__heading--directory"><div><p className="eyebrow">Directory overview</p><h2>Faculty <em>coverage.</em></h2></div><BookOpenCheck size={20} aria-hidden="true" /></div>
        <div className="faculty-summary-grid">
          {facultyCounts.map((faculty) => (
            <button type="button" key={faculty.code} className={`faculty-summary faculty-summary--${faculty.accent}${facultyFilter === faculty.code ? ' faculty-summary--selected' : ''}`} onClick={() => setFacultyFilter(facultyFilter === faculty.code ? 'All' : faculty.code)}>
              <span className="faculty-summary__bar" /><span><strong>{faculty.code}</strong><small>{faculty.count} students</small></span><ArrowRight size={15} />
            </button>
          ))}
        </div>
      </section>

      <section className="directory-section">
        <div className="directory-heading"><div><p className="eyebrow">Student directory <span className="eyebrow-count">{filteredStudents.length}</span></p><h2>Records ready for <em>review.</em></h2></div><label className="search-control directory-search"><Search size={15} aria-hidden="true" /><span className="visually-hidden">Search students</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name, number, programme…" /></label></div>
        <div className="directory-table-wrap">
          <table className="directory-table">
            <thead><tr><th>Student</th><th>Faculty</th><th>Programme</th><th>Year</th><th>Status</th></tr></thead>
            <tbody>{filteredStudents.map((student) => <tr key={student.id}><td><strong>{student.name}</strong><small>{student.studentNumber}</small></td><td><span className="faculty-code">{student.faculty}</span></td><td>{student.programme}</td><td>{student.year}</td><td><span className="directory-status">{student.status}</span></td></tr>)}</tbody>
          </table>
          {filteredStudents.length === 0 && <div className="directory-empty"><UsersRound size={18} /><p>No student records match that search.</p><Button type="button" variant="outline" onClick={() => { setSearchTerm(''); setFacultyFilter('All'); }}>Clear filters</Button></div>}
        </div>
      </section>
    </section>
  );
}
