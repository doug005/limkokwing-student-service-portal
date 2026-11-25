import { useEffect, useState } from 'react';
import { getStudentByNumber, students } from '../data/students.js';

export const ROLE_SESSION_KEY = 'limkokwing-portal-role-session';
export const ROLE_CHANGE_EVENT = 'limkokwing-role-change';

export const ROLE_DEFINITIONS = {
  student: {
    label: 'Student',
    shortLabel: 'Student access',
    description: 'View your student record, services, and support shortcuts.',
    icon: 'GraduationCap',
  },
  lecturer: {
    label: 'Lecturer',
    shortLabel: 'Lecturer access',
    description: 'Review the seeded student directory and faculty summaries.',
    icon: 'BookOpenCheck',
  },
  admin: {
    label: 'Administrator',
    shortLabel: 'Admin access',
    description: 'Oversee portal access, student coverage, and service requests.',
    icon: 'ShieldCheck',
  },
};

export const DEMO_ACCOUNTS = {
  student: {
    role: 'student',
    identifier: students[0].studentNumber,
    password: 'student123',
    displayName: students[0].name,
    email: students[0].email,
    hint: `${students[0].studentNumber} / student123`,
  },
  lecturer: {
    role: 'lecturer',
    identifier: 'lecturer@limkokwing.ac.ls',
    password: 'lecturer123',
    displayName: 'Dr. Naledi Ralefala',
    email: 'lecturer@limkokwing.ac.ls',
    hint: 'lecturer@limkokwing.ac.ls / lecturer123',
  },
  admin: {
    role: 'admin',
    identifier: 'admin@limkokwing.ac.ls',
    password: 'admin123',
    displayName: 'Portal Administrator',
    email: 'admin@limkokwing.ac.ls',
    hint: 'admin@limkokwing.ac.ls / admin123',
  },
};

export function getDashboardPath(role) {
  return `/dashboard/${role}`;
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(ROLE_SESSION_KEY);
    const session = stored ? JSON.parse(stored) : null;
    if (!session || !ROLE_DEFINITIONS[session.role]) return null;
    return session;
  } catch {
    return null;
  }
}

function notifyRoleChange() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ROLE_CHANGE_EVENT));
}

function saveSession(session) {
  window.localStorage.setItem(ROLE_SESSION_KEY, JSON.stringify(session));
  notifyRoleChange();
  return session;
}

function authError(message) {
  const error = new Error(message);
  error.code = 'demo-auth/invalid-credential';
  return error;
}

export function signInDemo({ role, identifier, password }) {
  const normalizedRole = String(role || '').toLowerCase();
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
  const suppliedPassword = String(password || '');
  const account = DEMO_ACCOUNTS[normalizedRole];

  if (!account) throw authError('Choose a valid portal role before signing in.');
  if (!normalizedIdentifier || !suppliedPassword) throw authError('Enter your username and password to continue.');
  if (suppliedPassword !== account.password) throw authError('The password was not recognised. Use the demo password shown for this role.');

  if (normalizedRole === 'student') {
    const student = getStudentByNumber(normalizedIdentifier) || students.find((item) => item.email.toLowerCase() === normalizedIdentifier);
    if (!student) throw authError('Enter one of the seeded student numbers or the student email shown on this page.');
    return saveSession({
      role: normalizedRole,
      name: student.name,
      email: student.email,
      studentId: student.studentNumber,
      faculty: student.faculty,
      programme: student.programme,
      signedInAt: new Date().toISOString(),
    });
  }

  if (normalizedIdentifier !== account.identifier.toLowerCase()) {
    throw authError(`Use the ${ROLE_DEFINITIONS[normalizedRole].label.toLowerCase()} demo username shown on this page.`);
  }

  return saveSession({
    role: normalizedRole,
    name: account.displayName,
    email: account.email,
    signedInAt: new Date().toISOString(),
  });
}

export function signInWithCredentials({ identifier, password }) {
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
  const suppliedPassword = String(password || '');

  if (!normalizedIdentifier || !suppliedPassword) {
    throw authError('Enter your username and password to continue.');
  }

  const student = getStudentByNumber(normalizedIdentifier)
    || students.find((item) => item.email.toLowerCase() === normalizedIdentifier);

  if (student && suppliedPassword === DEMO_ACCOUNTS.student.password) {
    return saveSession({
      role: 'student',
      name: student.name,
      email: student.email,
      studentId: student.studentNumber,
      faculty: student.faculty,
      programme: student.programme,
      signedInAt: new Date().toISOString(),
    });
  }

  const staffAccount = Object.values(DEMO_ACCOUNTS).find((account) => (
    account.role !== 'student'
    && account.identifier.toLowerCase() === normalizedIdentifier
    && account.password === suppliedPassword
  ));

  if (staffAccount) {
    return saveSession({
      role: staffAccount.role,
      name: staffAccount.displayName,
      email: staffAccount.email,
      signedInAt: new Date().toISOString(),
    });
  }

  throw authError('Those credentials were not recognised. Check your username and password, then try again.');
}

export function signOutDemo() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ROLE_SESSION_KEY);
  notifyRoleChange();
}

export function useRoleSession() {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const syncSession = () => setSession(getSession());
    window.addEventListener(ROLE_CHANGE_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(ROLE_CHANGE_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  return session;
}
