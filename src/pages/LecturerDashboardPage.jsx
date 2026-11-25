import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, BookOpen, CalendarCheck, ClipboardList, FileUp, Megaphone, Medal, Search, UsersRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { FACULTIES, students } from '../data/students.js';

const courses = [['DIWP3110', 'Web Design II'], ['DAMA3110', 'Data Models & Algorithms'], ['BIPS3110', 'Probability & Statistics II']];
const classes = [['DIWP3110 – Web Design II', '10:00 – 12:00', 'Lab 2'], ['DAMA3110 – Data Models & Algorithms', '14:00 – 16:00', 'Room 201']];
const pendingResults = [['DIWP3110 – CA 2', '28 students'], ['DAMA3110 – CA 1', '36 students'], ['BIPS3110 – Exam', '24 students']];
const management = [
  ['Class List', 'View and manage course students', UsersRound, 'students'], ['Attendance', 'Start QR or manual attendance session', CalendarCheck, 'attendance'], ['Assignments', 'Create, distribute and manage submissions', ClipboardList, 'assignments'], ['Grading & Feedback', 'Grade submissions and provide feedback', BarChart3, 'results'], ['CA & Exam Results', 'Enter CA and exam grades and submit for approval', Medal, 'results'], ['Learning Materials', 'Upload videos, documents and SCORM content', BookOpen, 'materials'], ['Announcements', 'Post course updates and notices', Megaphone, 'announcements'], ['Student Profiles', 'View student details, performance and attendance', UsersRound, 'students'], ['Course Analytics', 'Engagement, attendance and grade insights', BarChart3, 'analytics'], ['Generate Reports', 'Class lists, results and attendance reports', FileUp, 'reports'],
];

export default function LecturerDashboardPage() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [facultyFilter, setFacultyFilter] = useState('All');
  useEffect(() => setSearchTerm(searchParams.get('search') || ''), [searchParams]);
  const search = searchTerm.trim().toLowerCase();
  const facultyCounts = useMemo(() => FACULTIES.map((faculty) => ({ ...faculty, count: students.filter((student) => student.faculty === faculty.code).length })), []);
  const filteredStudents = useMemo(() => students.filter((student) => {
    const matchesFaculty = facultyFilter === 'All' || student.faculty === facultyFilter;
    const matchesSearch = !search || [student.name, student.studentNumber, student.faculty, student.programme].some((value) => value.toLowerCase().includes(search));
    return matchesFaculty && matchesSearch;
  }), [facultyFilter, search]);

  return (
    <section className="reference-dashboard lecturer-reference">
      <div className="reference-heading"><div><h1>Lecturer Dashboard</h1><p>Welcome back, Dr. T. Naledi</p></div></div>
      <div className="reference-stat-grid"><Stat icon={BookOpen} label="Assigned Courses" value="3" /><Stat icon={UsersRound} label="Registered Students" value={students.length} /><Stat icon={CalendarCheck} label="Today’s Classes" value="2" /><Stat icon={ClipboardList} label="Pending Results" value="12" /></div>

      <div className="lecturer-top-grid">
        <ReferenceList title="My Assigned Courses" link="View All" linkTo="/dashboard/lecturer?view=courses">{courses.map(([code, name]) => <Link className="reference-list-row" to={`/dashboard/lecturer?view=course-${code}`} key={code}><b>{code}</b><span><strong>{name}</strong><small>Year 3 · Semester 1</small></span><ArrowRight size={17} /></Link>)}</ReferenceList>
        <ReferenceList title="Today’s Classes" link="View Schedule" linkTo="/services?search=calendar">{classes.map(([name, time, room]) => <Link className="class-row" to="/services?search=calendar" key={name}><strong>{name}</strong><span><CalendarCheck size={14} /> {time} <i /> <span>{room}</span></span></Link>)}</ReferenceList>
        <ReferenceList title="Pending Results" link="View All" linkTo="/dashboard/lecturer?view=results">{pendingResults.map(([name, count]) => <Link className="reference-list-row reference-list-row--compact" to="/dashboard/lecturer?view=results" key={name}><span><strong>{name}</strong><small>{count}</small></span><ArrowRight size={17} /></Link>)}</ReferenceList>
      </div>

      <section className="reference-card management-card"><div className="reference-card__heading"><h2>Course Management</h2></div><div className="management-grid">{management.map(([label, description, Icon, view]) => <Link className="management-card__item" to={`/dashboard/lecturer?view=${view}`} key={label}><span className="management-card__icon"><Icon size={21} /></span><span><strong>{label}</strong><small>{description}</small></span></Link>)}</div></section>

      <div className="lecturer-analytics-grid"><section className="reference-card lecturer-analytics"><div className="reference-card__heading"><h2>Course Analytics <small>(This Semester)</small></h2></div><div className="analytics-cards"><AnalyticsCard icon={UsersRound} label="Engagement" value="82%" change="↑ +5%" note="Active participation (LMS & classes)" /><AnalyticsCard icon={CalendarCheck} label="Attendance Rate" value="88%" change="↑ +3%" note="Average across my courses" /><AnalyticsCard icon={BarChart3} label="Grade Distribution" value="" change="" note="All courses (latest assessments)" distribution /></div></section><section className="reference-card directory-mini"><div className="reference-card__heading"><h2>Student Directory</h2><span className="reference-count">{filteredStudents.length}</span></div><label className="reference-search"><Search size={16} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search students…" aria-label="Search students" /></label><div className="faculty-filter-row">{facultyCounts.map((faculty) => <button type="button" className={facultyFilter === faculty.code ? 'is-selected' : ''} onClick={() => setFacultyFilter(facultyFilter === faculty.code ? 'All' : faculty.code)} key={faculty.code}>{faculty.code} <span>{faculty.count}</span></button>)}</div><div className="mini-student-list">{filteredStudents.slice(0, 5).map((student) => <div key={student.id}><span>{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><strong>{student.name}<small>{student.faculty} · {student.programme}</small></strong></div>)}</div></section></div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) { return <article className="reference-stat"><span className="reference-stat__icon"><Icon size={25} /></span><span><strong>{label}</strong><b>{value}</b></span></article>; }
function ReferenceList({ title, link, linkTo, children }) { return <section className="reference-card reference-list-card"><div className="reference-card__heading"><h2>{title}</h2><Link to={linkTo}>{link} <ArrowRight size={14} /></Link></div>{children}</section>; }
function AnalyticsCard({ icon: Icon, label, value, change, note, distribution }) { return <article className="analytics-card"><Icon size={22} /><span><strong>{label}</strong>{distribution ? <b className="distribution">A: 24% &nbsp; B: 38% &nbsp; C: 28% &nbsp; D: 8%</b> : <b>{value} <em>{change}</em></b>}<small>{note}</small></span></article>; }
