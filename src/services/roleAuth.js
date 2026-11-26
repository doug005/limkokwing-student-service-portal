import { useEffect, useState } from 'react';
import { DEMO_ACCOUNTS, LECTURERS } from '../data/accounts.js';
import { getDirectory } from './directoryStore.js';

export { DEMO_ACCOUNTS, LECTURERS };

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
  if (!ROLE_DEFINITIONS[normalizedRole]) throw authError('Choose a valid portal role before signing in.');
  if (!normalizedIdentifier || !suppliedPassword) throw authError('Enter your username and password to continue.');
  const account = getDirectory().find((person) => person.role === normalizedRole
    && [person.identifier, person.email, person.studentNumber].some((value) => String(value || '').toLowerCase() === normalizedIdentifier));
  if (!account || account.password !== suppliedPassword) throw authError('Those credentials were not recognised. Check your username and password, then try again.');
  if (account.status !== 'Active') throw authError('This account is suspended. Contact a portal administrator.');
  return saveDirectorySession(account);
}

export function signInWithCredentials({ identifier, password }) {
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase();
  const suppliedPassword = String(password || '');

  if (!normalizedIdentifier || !suppliedPassword) {
    throw authError('Enter your username and password to continue.');
  }

  const account = getDirectory().find((person) => [person.identifier, person.email, person.studentNumber]
    .some((value) => String(value || '').toLowerCase() === normalizedIdentifier));
  if (account && account.password === suppliedPassword && account.status === 'Active') return saveDirectorySession(account);
  if (account && account.status !== 'Active') throw authError('This account is suspended. Contact a portal administrator.');
  throw authError('Those credentials were not recognised. Check your username and password, then try again.');
}

function saveDirectorySession(account) {
  return saveSession({
    id: account.id,
    role: account.role,
    name: account.name || account.displayName,
    email: account.email,
    studentId: account.studentNumber,
    faculty: account.faculty,
    programme: account.programme,
    signedInAt: new Date().toISOString(),
  });
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
