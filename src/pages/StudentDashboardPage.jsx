import { useState } from 'react';
import { ArrowRight, Bell, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Copy, FileText, GraduationCap, Grid2X2, Library, Megaphone, QrCode, Receipt, UserRound, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFacultyByCode, getStudentByNumber } from '../data/students.js';
import { useRoleSession } from '../services/roleAuth.js';

const quickActions = [
  { label: 'Course Registration', icon: UserRound, to: '/services?search=registration' },
  { label: 'Timetable', icon: CalendarDays, to: '/services?search=calendar' },
  { label: 'QR Attendance Check-in', icon: QrCode, to: '/services?search=attendance' },
  { label: 'Results & Grades', icon: BarChartIcon, to: '/services?search=academic' },
  { label: 'Fees & Payments', icon: Wallet, to: '/services?search=fees' },
  { label: 'Assignments', icon: ClipboardList, to: '/services?search=assignment' },
  { label: 'Applications', icon: FileText, to: '/request' },
  { label: 'Notifications', icon: Bell, to: '/services?search=notification' },
];

function BarChartIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}><path d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8V4" /></svg>; }

const timetable = [
  ['09:00 – 11:00', 'DIWP3110 – Web Design II', 'Lab A2', 'Today'],
  ['12:00 – 14:00', 'DAMA3110 – Data Models & Algorithms', 'Lab B1', 'Tomorrow'],
  ['15:00 – 17:00', 'BIPS3110 – Probability & Statistics II', 'Room C3', 'Thursday'],
];

const recentRequests = [
  ['REQ-1054', 'Academic Transcript Request', '20 Nov 2026', 'Completed', 'completed'],
  ['REQ-1051', 'Student ID Replacement', '18 Nov 2026', 'In Progress', 'progress'],
  ['REQ-1048', 'Letter of Recommendation', '15 Nov 2026', 'Pending', 'pending'],
];

export default function StudentDashboardPage() {
  const session = useRoleSession();
  const student = getStudentByNumber(session?.studentId);
  const faculty = getFacultyByCode(student?.faculty);
  const [copied, setCopied] = useState(false);

  async function copyStudentNumber() {
    try { await navigator.clipboard.writeText(student.studentNumber); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
  }

  if (!student) return <section className="reference-dashboard"><div className="reference-empty">Student record unavailable.</div></section>;

  return (
    <section className="reference-dashboard student-reference">
      <div className="reference-heading"><div><h1>Good Morning, {student.name.split(' ')[0]} <span className="wave">👋</span></h1><p>Welcome to your Student Dashboard. Access your academic information, services and requests.</p></div></div>

      <section className="student-profile-card reference-card">
        <div className="student-profile-card__identity"><div className="student-profile-card__avatar">{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><h2>{student.name}</h2><p className="student-profile-card__matric">Matric Number: <strong>{student.studentNumber}</strong> <button type="button" onClick={copyStudentNumber} aria-label="Copy student number"><Copy size={15} /></button>{copied && <span className="copy-feedback">Copied</span>}</p><p><GraduationCap size={17} /> <span>Programme: <strong>{student.programme}</strong></span></p><p><Library size={17} /> <span>Faculty: <strong>{faculty?.name || student.faculty}</strong></span></p><p><BarChartIcon width={18} height={18} /> <span>Level: <strong>{student.year}</strong></span></p></div></div>
        <div className="student-profile-card__summary"><div><Wallet size={25} /><span>Outstanding Fees<strong>M2,450.00</strong></span><Link to="/services?search=fees">Make Payment</Link></div><div><CalendarDays size={25} /><span>Current Semester<strong>{student.year}, Semester 1</strong></span><b className="status-pill status-pill--active"><CheckCircle2 size={14} /> Active</b></div></div>
      </section>

      <section className="reference-section"><h2>Quick Actions</h2><div className="reference-action-grid">{quickActions.map(({ label, icon: Icon, to }) => <Link className="reference-action-card" to={to} key={label}><span className="reference-action-card__icon"><Icon size={22} /></span><strong>{label}</strong><ArrowRight size={17} /></Link>)}</div></section>

      <div className="student-lower-grid">
        <section className="reference-card reference-table-card"><div className="reference-card__heading"><h2>Upcoming Timetable</h2><Link to="/services?search=calendar">View Full Timetable <ArrowRight size={15} /></Link></div><div className="timetable-list">{timetable.map(([time, course, room, day]) => <div className="timetable-row" key={course}><span className="timetable-row__time">{time}</span><span><strong>{course}</strong><small>{room}</small></span><b>{day}</b></div>)}</div></section>
        <section className="reference-card reference-table-card"><div className="reference-card__heading"><h2>Recent Service Requests</h2><Link to="/requests">View All Requests <ArrowRight size={15} /></Link></div><div className="request-table"><div className="request-table__head"><span>Ref. No.</span><span>Service</span><span>Date Submitted</span><span>Status</span></div>{recentRequests.map(([ref, service, date, status, tone]) => <div className="request-table__row" key={ref}><span>{ref}</span><span>{service}</span><span>{date}</span><b className={`status-pill status-pill--${tone}`}>{status}</b></div>)}</div></section>
      </div>
      <p className="reference-footnote"><CheckCircle2 size={15} /> {student.studentNumber} is an active {student.faculty} student profile.</p>
    </section>
  );
}
