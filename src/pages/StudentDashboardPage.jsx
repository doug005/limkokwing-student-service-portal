import { useState } from 'react';
import { ArrowRight, Bell, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Copy, FileText, GraduationCap, Grid2X2, Library, Megaphone, QrCode, Receipt, UserRound, Wallet } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getFacultyByCode, getStudentByNumber } from '../data/students.js';
import { useRoleSession } from '../services/roleAuth.js';

const quickActions = [
  { label: 'Course Registration', icon: UserRound, to: '/dashboard/student?view=registration' },
  { label: 'Timetable', icon: CalendarDays, to: '/dashboard/student?view=timetable' },
  { label: 'QR Attendance Check-in', icon: QrCode, to: '/dashboard/student?view=attendance' },
  { label: 'Results & Grades', icon: BarChartIcon, to: '/dashboard/student?view=results' },
  { label: 'Fees & Payments', icon: Wallet, to: '/dashboard/student?view=payments' },
  { label: 'Assignments', icon: ClipboardList, to: '/dashboard/student?view=assignments' },
  { label: 'Applications', icon: FileText, to: '/request' },
  { label: 'Notifications', icon: Bell, to: '/dashboard/student?view=notifications' },
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
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || '';
  const [attendanceCheckedIn, setAttendanceCheckedIn] = useState(false);
  const student = getStudentByNumber(session?.studentId);
  const faculty = getFacultyByCode(student?.faculty);
  const [copied, setCopied] = useState(false);

  async function copyStudentNumber() {
    try { await navigator.clipboard.writeText(student.studentNumber); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
  }

  if (!student) return <section className="reference-dashboard"><div className="reference-empty">Student record unavailable.</div></section>;

  if (view || window.location.hash === '#profile') return <AcademicWorkspace key={view || 'profile'} view={view || 'profile'} student={student}/>;
  const viewContent = {
    academics: { title: 'Academic information', text: 'Your programme, faculty, current semester, and academic support links are available from this workspace.', action: <Link className="reference-primary-button" to="/services">Browse academic services <ArrowRight size={15} /></Link> },
    timetable: { title: 'Academic timetable', text: 'Your upcoming classes are shown below. Use the timetable links to keep your weekly schedule close.', action: <a className="reference-primary-button" href="#timetable">Jump to timetable <ArrowRight size={15} /></a> },
    attendance: { title: 'QR attendance check-in', text: attendanceCheckedIn ? 'Attendance check-in recorded for today in this demo session.' : 'Use the button to record today’s attendance check-in in this demo workspace.', action: <button className="reference-primary-button" type="button" onClick={() => setAttendanceCheckedIn(true)}>{attendanceCheckedIn ? 'Checked in today' : 'Start check-in'} <CheckCircle2 size={15} /></button> },
    results: { title: 'Results & grades', text: `Current academic standing: ${student.year}. Results and grade enquiries can be sent to the Registration Office.`, action: <Link className="reference-primary-button" to="/request?service=academic-transcript">Request academic transcript <ArrowRight size={15} /></Link> },
    payments: { title: 'Fees & payments', text: 'Outstanding balance: M2,450.00. Submit a fee enquiry to the responsible university office for payment assistance.', action: <Link className="reference-primary-button" to="/request?service=general-enquiry">Open fee enquiry <ArrowRight size={15} /></Link> },
    assignments: { title: 'Assignments', text: 'Your current course assignments are tracked through your course workspace. Use the request form for assignment support.', action: <Link className="reference-primary-button" to="/request?service=general-enquiry">Ask for assignment support <ArrowRight size={15} /></Link> },
    notifications: { title: 'Notifications', text: 'You are all caught up. New service updates, request changes, and academic notices will appear here.', action: <Link className="reference-primary-button" to="/requests">View request updates <ArrowRight size={15} /></Link> },
    announcements: { title: 'Announcements', text: 'There are no new announcements in this demo workspace. Check the services directory for the latest support routes.', action: <Link className="reference-primary-button" to="/services">Open services <ArrowRight size={15} /></Link> },
  }[view];


  if (view) return <section className="reference-dashboard student-reference">
    <div className="reference-heading"><div><h1>{viewContent?.title || (view === 'registration' ? 'Course Registration' : 'Profile')}</h1><p>{student.programme} · {student.year}, Semester 1</p></div></div>
    <section className="reference-card" style={{padding:20}}>
    {['academics','registration'].includes(view) && <><h2>Course registration</h2><WorkspaceTable headers={['Course','Schedule','Venue']} rows={timetable.map(([time,course,room])=>[course,time,room])}/><p>Illustrative curriculum. Confirm your official registration with the registrar.</p><Link className="reference-primary-button" to="/request?service=registration-assistance">Request registration assistance</Link></>}
    {view === 'timetable' && <><h2>Weekly lecture timetable</h2><WorkspaceTable headers={['Day','Time','Course','Venue']} rows={timetable.map(([time,course,room,day])=>[day,time,course,room])}/><p>Sample timetable · official exam schedule not available.</p></>}
    {view === 'attendance' && <><h2>Check in to class</h2><p>No verified active attendance session is available.</p><h2>Attendance history</h2><WorkspaceTable headers={['Date','Course','Session','Status']} rows={[]}/></>}
    {view === 'results' && <><div className="reference-stat-grid">{['Semester GPA','Cumulative GPA','Degree classification','Academic standing'].map(label=><article className="reference-stat" key={label}><span><strong>{label}</strong><b>—</b></span></article>)}</div><h2>Semester results</h2><WorkspaceTable headers={['Course code','Course title','Credit units','CA score','Exam score','Total','Grade','Grade point']} rows={[]}/><h2>GPA history</h2><p>No official grades published.</p><Link className="reference-primary-button" to="/request?service=academic-transcript">Request transcript</Link></>}
    {view === 'payments' && <><h2>Fee statement</h2><p>Official outstanding balance unavailable.</p><WorkspaceTable headers={['Description','Amount (M)','Status']} rows={[]}/><h2>Payment history</h2><WorkspaceTable headers={['Reference','Date','Amount (M)','Status']} rows={[]}/><Link className="reference-primary-button" to="/request?service=general-enquiry">Contact finance office</Link></>}
    {view === 'assignments' && <><h2>Course assignments</h2><WorkspaceTable headers={['Course','Assignment','Due date','Status']} rows={[]}/></>}
    {view === 'notifications' && <p>No notifications available.</p>}
    {view === 'announcements' && <p>No published announcements available.</p>}
    {view === 'profile' && <WorkspaceTable headers={['Field','Details']} rows={[[ 'Name',student.name],['Student number',student.studentNumber],['Programme',student.programme],['Faculty',faculty?.name || student.faculty],['Email',student.email]]}/>}
    </section></section>;

  return (
    <section className="reference-dashboard student-reference">
      <div className="reference-heading"><div><h1>Good Morning, {student.name.split(' ')[0]} <span className="wave">👋</span></h1><p>Welcome to your Student Dashboard. Access your academic information, services and requests.</p></div></div>

      <section className="student-profile-card reference-card">
        <div className="student-profile-card__identity"><div className="student-profile-card__avatar">{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div><h2>{student.name}</h2><p className="student-profile-card__matric">Matric Number: <strong>{student.studentNumber}</strong> <button type="button" onClick={copyStudentNumber} aria-label="Copy student number"><Copy size={15} /></button>{copied && <span className="copy-feedback">Copied</span>}</p><p><GraduationCap size={17} /> <span>Programme: <strong>{student.programme}</strong></span></p><p><Library size={17} /> <span>Faculty: <strong>{faculty?.name || student.faculty}</strong></span></p><p><BarChartIcon width={18} height={18} /> <span>Level: <strong>{student.year}</strong></span></p></div></div>
        <div className="student-profile-card__summary"><div><Wallet size={25} /><span>Outstanding Fees<strong>M2,450.00</strong></span><Link to="/dashboard/student?view=payments">Make Payment</Link></div><div><CalendarDays size={25} /><span>Current Semester<strong>{student.year}, Semester 1</strong></span><b className="status-pill status-pill--active"><CheckCircle2 size={14} /> Active</b></div></div>
      </section>


      <section className="reference-section"><h2>Quick Actions</h2><div className="reference-action-grid">{quickActions.map(({ label, icon: Icon, to }) => <Link className="reference-action-card" to={to} key={label}><span className="reference-action-card__icon"><Icon size={22} /></span><strong>{label}</strong><ArrowRight size={17} /></Link>)}</div></section>

      <div className="student-lower-grid">
        <section id="timetable" className="reference-card reference-table-card"><div className="reference-card__heading"><h2>Upcoming Timetable</h2><Link to="/dashboard/student?view=timetable">View Full Timetable <ArrowRight size={15} /></Link></div><div className="timetable-list">{timetable.map(([time, course, room, day]) => <div className="timetable-row" key={course}><span className="timetable-row__time">{time}</span><span><strong>{course}</strong><small>{room}</small></span><b>{day}</b></div>)}</div></section>
        <section className="reference-card reference-table-card"><div className="reference-card__heading"><h2>Recent Service Requests</h2><Link to="/requests">View All Requests <ArrowRight size={15} /></Link></div><div className="request-table"><div className="request-table__head"><span>Ref. No.</span><span>Service</span><span>Date Submitted</span><span>Status</span></div>{recentRequests.map(([ref, service, date, status, tone]) => <div className="request-table__row" key={ref}><span>{ref}</span><span>{service}</span><span>{date}</span><b className={`status-pill status-pill--${tone}`}>{status}</b></div>)}</div></section>
      </div>
      <p className="reference-footnote"><CheckCircle2 size={15} /> {student.studentNumber} is an active {student.faculty} student profile.</p>
    </section>
  );
}

function WorkspaceTable({headers,rows}) {return <div style={{overflowX:'auto',margin:'16px 0'}}><table style={{width:'100%',borderCollapse:'collapse',textAlign:'left',fontSize:14}}><thead style={{background:'#e8eef7'}}><tr>{headers.map(h=><th key={h} style={{padding:12}}>{h}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} style={{padding:12,borderBottom:'1px solid #dce3ed'}}>{cell}</td>)}</tr>):<tr><td colSpan={headers.length} style={{padding:24,textAlign:'center'}}>No records available</td></tr>}</tbody></table></div>}

const modules=[['DIWP3110','Web Design II',3,'Monday','09:00 – 11:00','Lab A2'],['DAMA3110','Data Models & Algorithms',4,'Tuesday','12:00 – 14:00','Lab B1'],['BIPS3110','Probability & Statistics II',3,'Wednesday','15:00 – 17:00','Room C3'],['HCI3110','Human–Computer Interaction',3,'Thursday','09:00 – 11:00','Room B2'],['SENG3110','Software Engineering II',4,'Friday','12:00 – 14:00','Lab A1']];
function AcademicTable({headers,rows}){return <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}><thead><tr style={{background:'#e8eef6'}}>{headers.map(h=><th key={h} style={{padding:10,textAlign:'left'}}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j} style={{padding:10,borderBottom:'1px solid #dce3ed'}}>{v}</td>)}</tr>)}</tbody></table></div>}
function AcademicWorkspace({view,student}){
const [tab,setTab]=useState('lecture');const [query,setQuery]=useState('');
const titles={academics:'Course Registration',registration:'Course Registration',timetable:'Timetable',attendance:'Attendance',results:'Results & Grades',payments:'Fees & Payments',assignments:'Assignments',notifications:'Notifications',announcements:'Announcements',profile:'Profile',applications:'Applications'};
const card=(title,body)=><section className="reference-card" style={{padding:20,marginBottom:16}}><h2 style={{marginBottom:16}}>{title}</h2>{body}</section>;
const empty=t=><p style={{padding:20,color:'#64748b'}}>{t}</p>;
return <section className="reference-dashboard student-reference"><div className="reference-heading"><div><h1>{titles[view]||'Student workspace'}</h1><p>{student.programme} · {student.year}, Semester 1</p></div></div>
{['academics','registration'].includes(view)&&<>{card('Registered Courses',empty('No verified enrollment records.'))}{card('Sample curriculum',<><input aria-label="Search courses" placeholder="Search courses" value={query} onChange={e=>setQuery(e.target.value)} style={{padding:10,marginBottom:12}}/><AcademicTable headers={['Code','Course title','Units','Schedule']} rows={modules.filter(c=>c.join(' ').toLowerCase().includes(query.toLowerCase())).map(c=>[c[0],c[1],c[2],c[3]+' '+c[4]])}/><Link className="reference-primary-button" to="/request?service=registration-assistance">Request registration assistance</Link></>)}</>}
{view==='timetable'&&card('Weekly Timetable',<><div style={{display:'flex',gap:10,marginBottom:16}}>{['lecture','exam'].map(t=><button key={t} className="reference-primary-button" style={{opacity:tab===t?1:.6}} onClick={()=>setTab(t)}>{t==='lecture'?'Lecture Timetable':'Exam Timetable'}</button>)}</div>{tab==='lecture'?<><p>Sample schedule</p><AcademicTable headers={['Time','Monday','Tuesday','Wednesday','Thursday','Friday']} rows={['09:00 – 11:00','12:00 – 14:00','15:00 – 17:00'].map(time=>[time,...['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day=>modules.filter(c=>c[3]===day&&c[4]===time).map(c=>c[0]+' · '+c[5]).join(', ')||'—')])}/></>:empty('No published examination schedule.')}</>)}
{view==='attendance'&&<>{card('Check-In to Class',empty('No active lecturer-verified session.'))}{card('Course Attendance Summary',<AcademicTable headers={['Course','Sessions attended','Attendance']} rows={modules.map(c=>[c[1],'—','Not recorded'])}/>)}{card('Attendance History',empty('No verified records.'))}</>}
{view==='results'&&<><div className="reference-stat-grid">{['Semester GPA','Cumulative CGPA','Class of Degree','Academic Standing'].map(t=><article key={t} className="reference-stat"><span><strong>{t}</strong><b>—</b></span></article>)}</div>{card('Semester Results',<AcademicTable headers={['Code','Course','Units','CA','Exam','Total','Grade','Grade Point']} rows={modules.map(c=>[c[0],c[1],c[2],'—','—','—','—','—'])}/>)}{card('GPA History',empty('No published grades.'))}<Link className="reference-primary-button" to="/request?service=academic-transcript">Request transcript</Link></>}
{view==='payments'&&<>{card('Outstanding Balance',empty('No verified fee statement connected.'))}{card('Current Semester Charges',empty('No published charges.'))}{card('Payment History',empty('No verified payments.'))}<Link className="reference-primary-button" to="/request?service=general-enquiry">Contact finance office</Link></>}
{view==='assignments'&&card('Course Assignments',empty('No published assignments.'))}
{view==='notifications'&&card('Notifications',empty('No notifications available.'))}
{view==='announcements'&&card('Announcements & News',empty('No published announcements.'))}
{view==='applications'&&card('Applications',<Link className="reference-primary-button" to="/services">Browse student services</Link>)}
{view==='profile'&&card('Personal Information',<AcademicTable headers={['Field','Details']} rows={[[ 'Name',student.name],['Student number',student.studentNumber],['Email',student.email],['Programme',student.programme],['Faculty',student.faculty]]}/>)}
</section>}
