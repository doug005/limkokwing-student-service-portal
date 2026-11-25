import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, GraduationCap, Layers3, Search, Settings2, ShieldCheck, UserPlus, UsersRound, Wallet } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { FACULTIES, students } from '../data/students.js';

const activity = [
  ['10:42 AM', 'Admin', 'Approved Service Request', 'REQ-1049 – Academic Transcript', CheckCircle2],
  ['10:15 AM', 'Registrar', 'Updated Timetable', 'DIWP3110 – Web Design II (Tue 11:00)', CalendarDays],
  ['09:48 AM', 'Finance Officer', 'Recorded Fee Payment', 'STD231045 – M5,000', Wallet],
  ['09:20 AM', 'Admin', 'Added User', 'Staff – Dr. T. Naledi (Lecturer)', UserPlus],
  ['08:57 AM', 'System', 'Role Updated', 'User – L. Mokoena → Lecturer', ShieldCheck],
];

const quickActions = [
  ['Add Student', UserPlus, '/dashboard/admin?view=students'], ['Add Staff', UsersRound, '/dashboard/admin?view=staff'], ['Create Course', Layers3, '/dashboard/admin?view=academics'], ['Create Timetable', CalendarDays, '/dashboard/admin?view=academics'], ['Review Approvals', CheckCircle2, '/requests'], ['Generate Report', BarChart3, '#generate-report'],
];

export default function AdminDashboardPage() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  useEffect(() => setSearchTerm(searchParams.get('search') || ''), [searchParams]);
  const view = searchParams.get('view') || '';
  const workspaceMessage = view ? ({
    access: ['Access Control (RBAC)', 'Role access is enabled for Student, Lecturer, and Administrator demo workspaces. Production claims should replace browser-local access before launch.'],
    academics: ['Academic structure', 'Use the academic quick actions to review course and timetable coverage. The seeded directory currently represents four faculties.'],
    students: ['Student management', 'The student directory below contains all 20 seeded records and supports search by name, student number, faculty, and programme.'],
    staff: ['Staff management', 'Lecturer and administrator access is available through the role-aware sign-in gateway.'],
    fees: ['Fee management', 'Fee collections are represented in the operational overview. Use the request queue for student fee enquiries.'],
    reports: ['Analytics & reports', 'Generate a CSV report from the quick actions above, or review the activity and system cards below.'],
    settings: ['System settings', 'Portal settings are represented by the current service, role, and faculty coverage shown in this workspace.'],
  }[view] || null) : null;
  const search = searchTerm.trim().toLowerCase();
  const facultyCounts = useMemo(() => FACULTIES.map((faculty) => ({ ...faculty, count: students.filter((student) => student.faculty === faculty.code).length })), []);
  const filteredStudents = useMemo(() => students.filter((student) => [student.name, student.studentNumber, student.email, student.faculty, student.programme].some((value) => value.toLowerCase().includes(search))), [search]);

  function generateReport(event) {
    event.preventDefault();
    const csv = ['Student number,Name,Faculty,Programme,Year,Status', ...students.map((student) => [student.studentNumber, student.name, student.faculty, student.programme, student.year, student.status].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'limkokwing-student-directory.csv'; anchor.click(); URL.revokeObjectURL(url);
  }

  if (view) {
    const titles = {access:'Access Control (RBAC)',academics:'Academic Structure',courses:'Courses & Timetables',students:'Students',staff:'Staff',fees:'Fee Management',reports:'Analytics & Reports',settings:'System Settings'};
    return <section className="reference-dashboard admin-reference"><div className="reference-heading"><h1>{titles[view] || 'Workspace'}</h1></div><section className="reference-card" style={{padding:20}}>
      {view === 'students' && <><label className="reference-search"><Search size={16}/><input aria-label="Search students" placeholder="Search students" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/></label><div className="admin-directory-table">{filteredStudents.map(s=><div key={s.id}><span>{s.studentNumber}</span><strong>{s.name}<small>{s.programme}</small></strong><b>{s.faculty}</b><span>{s.status}</span></div>)}</div>{!filteredStudents.length && <p>No matching students.</p>}</>}
      {view === 'access' && <div className="system-list">{[['Student','Own academic workspace and service submissions'],['Lecturer','Course workspace and class directory'],['Administrator','University directory and request management']].map(([role,permissions])=><div key={role}><ShieldCheck size={18}/><strong>{role}</strong><span>{permissions}</span></div>)}<p>Demo roles only. Production role editing is not configured.</p></div>}
      {view === 'academics' && <div className="system-list">{facultyCounts.map(f=><div key={f.code}><GraduationCap size={18}/><strong>{f.name}</strong><span>{f.count} students</span></div>)}</div>}
      {view === 'courses' && <p>No centrally managed course or timetable records are configured.</p>}
      {view === 'staff' && <div className="system-list"><div><UsersRound size={18}/><strong>Lecturer</strong><span>lecturer@limkokwing.ac.ls</span></div><div><ShieldCheck size={18}/><strong>Administrator</strong><span>admin@limkokwing.ac.ls</span></div><p>Demo accounts</p></div>}
      {view === 'fees' && <p>No verified fee ledger is connected.</p>}
      {view === 'reports' && <><div className="system-list">{facultyCounts.map(f=><div key={f.code}><span>{f.name}</span><b>{f.count}</b></div>)}</div><button className="reference-primary-button" onClick={generateReport}>Export student directory CSV</button></>}
      {view === 'settings' && <div className="system-list"><div><Settings2 size={18}/><span>Authentication</span><b>Demo</b></div><div><Layers3 size={18}/><span>Student services</span><b>6</b></div><div><GraduationCap size={18}/><span>Faculties</span><b>{FACULTIES.length}</b></div></div>}
    </section></section>;
  }

  return (
    <section className="reference-dashboard admin-reference">
      <div className="reference-heading reference-heading--with-date"><div><h1>Welcome, Administrator</h1><p>Manage university services, users, academic data and system operations.</p></div><span className="reference-date"><CalendarDays size={17} /> Tue, 25 Nov 2026</span></div>
      <div className="reference-stat-grid"><Stat icon={GraduationCap} label="Total Students" value="4,286" tone="teal" /><Stat icon={UsersRound} label="Total Staff" value="318" tone="blue" /><Stat icon={CheckCircle2} label="Pending Approvals" value="27" tone="gold" /><Stat icon={Wallet} label="Fee Collections" value="M1,248,500" tone="green" /></div>

      <section className="reference-section admin-quick-section"><h2>Quick Actions</h2><div className="admin-quick-grid">{quickActions.map(([label, Icon, to]) => label === 'Generate Report' ? <a className="admin-quick-card" href={to} onClick={generateReport} key={label}><Icon size={27} /><strong>{label}</strong></a> : <Link className="admin-quick-card" to={to} key={label}><Icon size={27} /><strong>{label}</strong></Link>)}</div></section>

      <div className="admin-lower-grid"><section className="reference-card activity-card"><div className="reference-card__heading"><h2>Recent Activity</h2><Link to="/requests">View All Activity <ArrowRight size={15} /></Link></div><div className="activity-table"><div className="activity-table__head"><span>Time</span><span>User</span><span>Activity</span><span>Details</span></div>{activity.map(([time, user, action, detail, Icon]) => <div className="activity-table__row" key={`${time}-${action}`}><span>{time}</span><span><UsersRound size={15} /> <strong>{user}</strong></span><span><Icon size={15} /> {action}</span><span>{detail}</span></div>)}</div></section><section className="reference-card system-overview"><div className="reference-card__heading"><h2>System Overview</h2></div><div className="system-list"><div><Layers3 size={18} /><span>Active Services</span><b>6</b></div><div><BookOpen size={18} /><span>Active Courses</span><b>42</b></div><div><CalendarDays size={18} /><span>Timetables</span><b>12</b></div><div><ClipboardList size={18} /><span>Open Requests</span><b>63</b></div><div><BarChart3 size={18} /><span>System Status</span><b className="system-status"><CheckCircle2 size={13} /> Operational</b></div></div></section></div>

      <section id="admin-directory" className="reference-card admin-directory-card"><div className="reference-card__heading"><div><h2>Student Directory</h2><small>{filteredStudents.length} seeded records across {FACULTIES.length} faculties</small></div><label className="reference-search"><Search size={16} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search students, staff, requests…" aria-label="Search student directory" /></label></div><div className="admin-directory-table">{filteredStudents.slice(0, 8).map((student) => <div key={student.id}><span className="directory-initials">{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{student.name}<small>{student.studentNumber} · {student.programme}</small></strong><b>{student.faculty}</b><span>{student.status}</span></div>)}</div></section>
      <p className="reference-footnote"><ShieldCheck size={15} /> Faculty coverage: {facultyCounts.map((faculty) => `${faculty.code} (${faculty.count})`).join(' · ')}.</p>
    </section>
  );
}

function Stat({ icon: Icon, label, value, tone }) { return <article className={`reference-stat reference-stat--${tone}`}><span className="reference-stat__icon"><Icon size={25} /></span><span><strong>{label}</strong><b>{value}</b></span></article>; }
