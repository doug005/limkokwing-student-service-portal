import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, BookOpen, GraduationCap, Pencil, Plus, Search, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import { FACULTIES } from '../data/students.js';
import { createDirectoryPerson, deleteDirectoryPerson, updateDirectoryPerson, useDirectory } from '../services/directoryStore.js';
import { useRoleSession } from '../services/roleAuth.js';

const titles = {
  access: 'Access Control', academics: 'Academic Structure', courses: 'Courses & Timetables',
  students: 'Student Management', staff: 'Staff Management', fees: 'Fee Management',
  reports: 'Analytics & Reports', settings: 'System Settings',
};
const link = (view) => `/dashboard/admin?view=${view}`;

function Table({ headers, rows, emptyMessage = 'No matching records.' }) {
  return <div className="ax-table"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.key}>{row.cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <p className="ax-empty">{emptyMessage}</p>}</div>;
}

function Card({ title, children }) {
  return <section className="ax-card"><h2>{title}</h2>{children}</section>;
}

function exportCsv(filename, rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PersonDialog({ person, section, isSelf, onClose, onSave }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(() => ({
    role: person?.role || (section === 'students' ? 'student' : 'lecturer'),
    name: person?.name || person?.displayName || '',
    email: person?.email || '',
    password: '',
    studentNumber: person?.studentNumber || '',
    faculty: person?.faculty || '',
    programme: person?.programme || '',
    year: person?.year || 'Year 1',
    status: person?.status || 'Active',
  }));
  const [error, setError] = useState('');
  const [saving,setSaving]=useState(false);
  const editing = Boolean(person);
  const role = section === 'students' ? 'student' : form.role;

  useEffect(() => {
    dialog.current?.showModal();
    const element = dialog.current;
    return () => { if (element?.open) element.close(); };
  }, []);

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({ ...form, role });
      dialog.current?.close();
      onClose();
    } catch (saveError) {
      setError(saveError.message || 'Unable to save this directory record.');
    } finally { setSaving(false); }
  }

  return <dialog className="ax-dialog" ref={dialog} onCancel={onClose} onClose={onClose} aria-labelledby="person-dialog-title">
    <div className="ax-dialog__heading"><div><span className="ax-eyebrow">{editing ? 'Update directory record' : 'New directory record'}</span><h2 id="person-dialog-title">{editing ? 'Edit' : 'Add'} {role === 'student' ? 'student' : role === 'lecturer' ? 'lecturer' : 'administrator'}</h2></div><button className="ax-icon-button" type="button" onClick={() => dialog.current?.close()} aria-label="Close form">×</button></div>
    <form className="ax-form" onSubmit={submit}>
      {section !== 'students' && <label>Account role<select value={form.role} disabled={isSelf} onChange={(event) => change('role', event.target.value)}><option value="lecturer">Lecturer</option><option value="admin">Administrator</option></select></label>}
      <label>Full name<input autoFocus required maxLength={80} value={form.name} onChange={(event) => change('name', event.target.value)} placeholder="e.g. Naledi Ralefala" /></label>
      <label>Email address<input required type="email" disabled={editing} maxLength={254} value={form.email} onChange={(event) => change('email', event.target.value)} placeholder="name@limkokwing.ac.ls" /></label>
      {role === 'student' && <label>Student number<input required inputMode="numeric" pattern="90101[0-9]{4}" minLength={9} maxLength={9} value={form.studentNumber} onChange={(event) => change('studentNumber', event.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="90101XXXX" /><small>Exactly 9 digits, beginning with 90101.</small></label>}
      {role !== 'admin' && <label>Faculty<select required value={form.faculty} onChange={(event) => change('faculty', event.target.value)}><option value="">Choose a faculty</option>{FACULTIES.map((faculty) => <option key={faculty.code} value={faculty.code}>{faculty.code} · {faculty.name}</option>)}</select></label>}
      {role === 'student' && <>
        <label>Programme<input required maxLength={120} value={form.programme} onChange={(event) => change('programme', event.target.value)} placeholder="Programme name" /></label>
        <label>Study year<select required value={form.year} onChange={(event) => change('year', event.target.value)}>{Array.from({ length: 8 }, (_, index) => `Year ${index + 1}`).map((year) => <option key={year}>{year}</option>)}</select></label>
      </>}
      <label>Account status<select value={form.status} disabled={isSelf} onChange={(event) => change('status', event.target.value)}><option>Active</option><option>Suspended</option></select></label>
      {!editing && <label>Initial sign-in password<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={form.password} onChange={event=>change('password',event.target.value)} placeholder="At least 8 characters" /><small>Managed by Firebase Authentication, not stored in the directory.</small></label>}
      {error && <p className="ax-form-error" role="alert">{error}</p>}
      <div className="ax-dialog__actions"><button className="ax-button ax-button--quiet" type="button" onClick={() => dialog.current?.close()}>Cancel</button><button className="ax-button" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? 'Save changes' : 'Add record'}</button></div>
    </form>
  </dialog>;
}

export default function AdminDashboardPage() {
  const [params] = useSearchParams();
  const view = params.get('view') || '';
  return <div className="ax"><style>{`
    .ax{font:14px Arial,sans-serif;color:#14243b;display:grid;gap:18px}.ax h1{font-size:30px;margin:0}.ax h2{font-size:18px;margin:0 0 16px}.ax p{color:#475569}.ax-card{background:white;border:1px solid #d9e1eb;border-radius:12px;padding:20px;min-width:0}.ax-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.ax-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.ax-stat{background:#e7effb;border-radius:10px;padding:20px;display:flex;gap:14px;align-items:center;color:#14243b;text-decoration:none}.ax-stat b{display:block;font-size:27px;margin-top:8px}.ax-table{overflow:auto}.ax table{width:100%;border-collapse:collapse;color:#14243b}.ax th,.ax td{text-align:left;padding:12px 10px;border-bottom:1px solid #e0e6ee;white-space:nowrap}.ax th{background:#edf2f8}.ax input,.ax select{background:white;color:#14243b;border:1px solid #c5d0df;border-radius:6px;padding:10px;font:inherit;max-width:100%}.ax button,.ax-btn{background:#1858b8;color:white;border:0;border-radius:6px;padding:10px 15px;font:inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:7px}.ax button:disabled{opacity:.55;cursor:not-allowed}.ax-controls{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:16px}.ax-controls input{min-width:min(270px,100%)}.ax-actions{display:flex;gap:12px;flex-wrap:wrap}.ax-actions a{background:#e7effb;color:#1458bd;border-radius:8px;padding:18px;flex:1;min-width:130px;text-decoration:none;text-align:center}.ax-actions a:hover,.ax-stat:hover{background:#dce9fa}.ax-row-actions{display:flex;gap:7px}.ax .ax-button--quiet{background:#edf2f8;color:#24354d}.ax .ax-button--danger{background:#a83232}.ax-empty{padding:15px 4px}.ax-notice{border:1px solid #e6d7a9;background:#fff8e6;color:#57471b;padding:13px 15px;border-radius:8px;line-height:1.5}.ax-notice strong{display:block;margin-bottom:3px}.ax-eyebrow{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#66758b}.ax-dialog{margin:auto;background:white;color:#14243b;border:1px solid #d9e1eb;border-radius:12px;padding:22px;width:min(560px,calc(100vw - 32px));max-height:min(90vh,860px);overflow:auto}.ax-dialog::backdrop{background:#10243f88}.ax-dialog__heading{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}.ax-dialog__heading h2{margin:5px 0 0}.ax .ax-icon-button{background:transparent;color:#14243b;padding:2px 8px;font-size:26px}.ax-form{display:grid;gap:13px}.ax-form label{display:grid;gap:6px;font-weight:600}.ax-form label small{font-weight:400;color:#64748b}.ax-form-error{margin:0;color:#a32626!important;background:#fff0f0;padding:10px;border-radius:6px}.ax-dialog__actions{display:flex;justify-content:flex-end;gap:9px;margin-top:4px}.ax .ax-role{display:inline-block;border-radius:20px;background:#edf2f8;padding:5px 9px;font-size:12px}.dashboard-app-shell--admin .dashboard-sidebar,.dashboard-app-shell--admin .dashboard-sidebar__brand,.dashboard-app-shell--admin .dashboard-sidebar__bottom{background:#10243f;color:white}.dashboard-app-shell--admin .dashboard-sidebar__link{color:white}.dashboard-app-shell--admin .dashboard-sidebar__link.is-active{background:#2058a5}@media(max-width:900px){.ax-grid{grid-template-columns:1fr}.ax-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:540px){.ax-stats{grid-template-columns:1fr 1fr}.ax-card{padding:15px}.ax-controls{align-items:stretch}.ax-controls input,.ax-controls select{width:100%}.ax-dialog{padding:18px}}
  `}</style>
    <header><h1>{titles[view] || 'Administrator Dashboard'}</h1><p>{view ? 'University administration workspace.' : 'Manage academic records, staff and student services.'}</p></header>
    <Workspace key={`${view}:${params.get('search') || ''}`} view={view} search={params.get('search') || ''} />
  </div>;
}

function Workspace({ view, search }) {
  const directory = useDirectory();
  const session = useRoleSession();
  const [query, setQuery] = useState(search);
  const [faculty, setFaculty] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const actingUserId = session?.id || directory.find((person) => person.role === 'admin' && person.email === session?.email)?.id;
  const students = useMemo(() => directory.filter((person) => person.role === 'student'), [directory]);
  const lecturers = useMemo(() => directory.filter((person) => person.role === 'lecturer'), [directory]);
  const admins = useMemo(() => directory.filter((person) => person.role === 'admin'), [directory]);
  const counts = FACULTIES.map((item) => [item.code, item.name, students.filter((student) => student.faculty === item.code).length, lecturers.filter((person) => person.faculty === item.code).length]);
  const studentRows = students.filter((student) => (!faculty || student.faculty === faculty) && [student.name, student.studentNumber, student.programme, student.email].join(' ').toLowerCase().includes(query.toLowerCase()));
  const staffRows = directory.filter((person) => person.role !== 'student' && (!roleFilter || person.role === roleFilter) && (!faculty || person.role !== 'lecturer' || person.faculty === faculty) && [person.name, person.email, person.faculty, person.role].join(' ').toLowerCase().includes(query.toLowerCase()));
  const facultyTable = <Table headers={['Code', 'Faculty', 'Students', 'Lecturers']} rows={counts.map(([code, name, studentCount, lecturerCount]) => ({ key: code, cells: [code, name, studentCount, lecturerCount] }))} />;

  async function savePerson(values) {
    if (editing?.person) await updateDirectoryPerson(editing.person.id, values, { actingUserId });
    else await createDirectoryPerson(values);
    setEditing(null);
    setActionMessage(`${values.role === 'student' ? 'Student' : values.role === 'lecturer' ? 'Lecturer' : 'Administrator'} ${editing?.person ? 'updated' : 'added'} in Firebase.`);
  }

  async function removePerson(person) {
    const label = person.role === 'student' ? `student ${person.name} (${person.studentNumber})` : `${person.role === 'admin' ? 'administrator' : 'lecturer'} ${person.name} (${person.email})`;
    if (!window.confirm(`Delete ${label}? This removes portal access and the directory record.`)) return;
    try {
      await deleteDirectoryPerson(person.id, { actingUserId });
      setActionMessage(`${person.name} was removed from the Firebase directory.`);
    } catch (error) {
      setActionMessage(error.message || 'Unable to delete this record.');
    }
  }

  const actionButtons = (person) => person.bootstrap ? <span>Firebase administrator</span> : <div className="ax-row-actions"><button className="ax-button--quiet" type="button" onClick={() => setEditing({ person, section: person.role === 'student' ? 'students' : 'staff' })} aria-label={`Edit ${person.name}`}><Pencil size={14} />Edit</button><button className="ax-button--danger" type="button" onClick={() => removePerson(person)} aria-label={`Delete ${person.name}`}><Trash2 size={14} />Delete</button></div>;
  const notice = <>{directory.error && <p className="ax-notice" role="alert">Firebase directory unavailable: {directory.error}</p>}{actionMessage && <p role="status">{actionMessage}</p>}</>;
  const modal = editing && <PersonDialog person={editing.person} section={editing.section} isSelf={editing.person?.id === actingUserId} onSave={savePerson} onClose={() => setEditing(null)} />;

  if (!view && !search) return <>
    <div className="ax-stats">{[
      ['Students', students.length, GraduationCap, 'students'],
      ['Lecturers', lecturers.length, UsersRound, 'staff'],
      ['Faculties', FACULTIES.length, BookOpen, 'academics'],
      ['Administrators', admins.length, ShieldCheck, 'staff'],
    ].map(([label, value, Icon, target]) => <Link key={label} className="ax-stat" to={target === 'staff' ? link('staff') : link(target)}><Icon size={26} /><span>{label}<b>{value}</b></span></Link>)}</div>
    {notice}
    <Card title="Quick Actions"><div className="ax-actions"><Link to={link('students')}>Manage Students</Link><Link to={link('staff')}>Manage Lecturers & Admins</Link><Link to={link('academics')}>Academic Structure</Link><Link to="/requests">Review Service Requests</Link><Link to={link('reports')}>Generate Reports</Link></div></Card>
    <Card title="Faculty Overview">{facultyTable}</Card>
    <div className="ax-grid"><Card title="Service Requests"><p>Review submitted requests in the existing Firebase request manager.</p><Link className="ax-btn" to="/requests">Open request manager</Link></Card><Card title="System Overview"><p>{students.length} student records, {lecturers.length} lecturers, and {admins.length} administrators in the Firebase directory.</p><p>Live fees and activity logs are not connected.</p><Link to={link('access')}>Review role permissions</Link></Card></div>
  </>;

  if (view === 'students' || (!view && search)) return <>
    {notice}<Card title={`Student Directory (${studentRows.length})`}>
      <div className="ax-controls"><label className="visually-hidden" htmlFor="student-search">Search students</label><input id="student-search" type="search" placeholder="Search name, number, programme or email" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter students by faculty" value={faculty} onChange={(event) => setFaculty(event.target.value)}><option value="">All faculties</option>{FACULTIES.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}</select><button type="button" onClick={() => { setEditing({ person: null, section: 'students' }); setActionMessage(''); }}><Plus size={16} />Add student</button><button className="ax-button--quiet" type="button" onClick={() => exportCsv('student-directory.csv', [['Student number', 'Name', 'Email', 'Faculty', 'Programme', 'Year', 'Status'], ...studentRows.map((student) => [student.studentNumber, student.name, student.email, student.faculty, student.programme, student.year, student.status])])}>Export CSV</button></div>
      <Table headers={['Student number', 'Name', 'Email', 'Faculty', 'Programme', 'Year', 'Status', 'Actions']} rows={studentRows.map((student) => ({ key: student.id, cells: [student.studentNumber, student.name, student.email, student.faculty, student.programme, student.year, student.status, actionButtons(student)] }))} emptyMessage="No students match this search." />
    </Card>{modal}
  </>;

  if (view === 'staff') return <>
    {notice}<Card title={`Lecturers & Administrators (${staffRows.length})`}>
      <div className="ax-controls"><label className="visually-hidden" htmlFor="staff-search">Search staff</label><input id="staff-search" type="search" placeholder="Search name, email, role or faculty" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter staff by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="">All staff roles</option><option value="lecturer">Lecturers</option><option value="admin">Administrators</option></select><select aria-label="Filter staff by faculty" value={faculty} onChange={(event) => setFaculty(event.target.value)}><option value="">All faculties</option>{FACULTIES.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}</select><button type="button" onClick={() => { setEditing({ person: null, section: 'staff' }); setActionMessage(''); }}><Plus size={16} />Add lecturer / admin</button></div>
      <Table headers={['Name', 'Role', 'Faculty', 'Email', 'Status', 'Actions']} rows={staffRows.map((person) => ({ key: person.id, cells: [person.name, <span className="ax-role">{person.role === 'admin' ? 'Administrator' : 'Lecturer'}</span>, person.faculty || 'University-wide', person.email, person.status, actionButtons(person)] }))} emptyMessage="No staff records match this search." />
    </Card>{modal}
  </>;

  if (view === 'academics') return <Card title="Faculties">{facultyTable}</Card>;
  if (view === 'courses') return <Card title="Teaching Allocation"><Table headers={['Faculty', 'Lecturer', 'Students']} rows={lecturers.map((person) => ({ key: person.id, cells: [person.faculty, person.name, students.filter((student) => student.faculty === person.faculty).length] }))} /></Card>;
  if (view === 'access') return <><Card title="Role Permissions"><Table headers={['Role', 'Workspace', 'Scope']} rows={[
    { key: 'student', cells: ['Student', 'Student services', 'Own profile'] },
    { key: 'lecturer', cells: ['Lecturer', 'Teaching', 'Faculty directory'] },
    { key: 'admin', cells: ['Administrator', 'Administration', 'Directory and service requests'] },
  ]} /></Card></>;
  if (view === 'reports') return <><Card title="Faculty Enrollment">{facultyTable}<button type="button" onClick={() => exportCsv('faculty-enrollment.csv', [['Faculty', 'Students', 'Lecturers'], ...counts.map(([code, , studentCount, lecturerCount]) => [code, studentCount, lecturerCount])])}>Export enrollment</button></Card><Card title="Enrollment Distribution">{counts.map(([code, name, count]) => <div key={code} style={{ marginBottom: 12 }}><p>{code} · {name} · {count} students</p><div style={{ background: '#e7effb', height: 12, borderRadius: 6 }}><div style={{ background: '#1858b8', height: 12, borderRadius: 6, width: `${students.length ? (count / students.length) * 100 : 0}%` }} /></div></div>)}</Card></>;
  if (view === 'fees') return <Card title="Fee Enquiries"><p>No verified fee ledger is connected. Review fee-related service requests in the request manager.</p><Link className="ax-btn" to="/requests">Open requests</Link></Card>;
  return <Card title="System Configuration"><Table headers={['Setting', 'Value']} rows={[
    { key: 'auth', cells: ['Authentication', 'Firebase Authentication'] },
    { key: 'directory', cells: ['Directory storage', 'Cloud Firestore'] },
    { key: 'faculty', cells: ['Faculties', FACULTIES.length] },
  ]} /><p>New accounts are provisioned in Firebase Authentication; deleting the directory profile revokes portal access.</p></Card>;
}
