import { useEffect, useState } from 'react';
import { FACULTIES, students as seedStudents } from '../data/students.js';
import { DEMO_ACCOUNTS, LECTURERS } from '../data/accounts.js';

export const DIRECTORY_STORAGE_KEY = 'limkokwing-portal-directory-v1';
const DIRECTORY_CHANGE_EVENT = 'limkokwing-directory-change';
const VALID_ROLES = new Set(['student', 'lecturer', 'admin']);
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STUDENT_NUMBER_PATTERN = /^90101\d{4}$/;

function createSeedDirectory() {
  const students = seedStudents.map((student) => ({
    ...student,
    role: 'student',
    identifier: student.studentNumber,
    displayName: student.name,
    password: DEMO_ACCOUNTS.student.password,
    status: student.status || 'Active',
  }));
  const lecturers = LECTURERS.map((lecturer) => ({
    ...lecturer,
    name: lecturer.displayName,
    status: 'Active',
  }));
  const admin = DEMO_ACCOUNTS.admin;
  return [
    ...students,
    ...lecturers,
    {
      id: 'admin-1',
      role: 'admin',
      identifier: admin.email,
      email: admin.email,
      displayName: admin.displayName,
      name: admin.displayName,
      password: admin.password,
      status: 'Active',
    },
  ];
}

function readStoredDirectory() {
  if (typeof window === 'undefined') return createSeedDirectory();
  try {
    const stored = window.localStorage.getItem(DIRECTORY_STORAGE_KEY);
    if (!stored) return createSeedDirectory();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every((person) => person && typeof person.id === 'string' && VALID_ROLES.has(person.role))) {
      return createSeedDirectory();
    }
    return parsed;
  } catch {
    return createSeedDirectory();
  }
}

export function getDirectory() {
  return readStoredDirectory();
}

function notifyDirectoryChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(DIRECTORY_CHANGE_EVENT));
}

function saveDirectory(directory) {
  if (typeof window === 'undefined') throw new Error('Directory changes can only be saved in a browser.');
  try {
    window.localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(directory));
  } catch {
    throw new Error('Could not save the directory in this browser. Check that local storage is available.');
  }
  notifyDirectoryChanged();
  return directory;
}

export function subscribeToDirectory(onChange) {
  if (typeof window === 'undefined') return () => {};
  const refresh = () => onChange(getDirectory());
  window.addEventListener(DIRECTORY_CHANGE_EVENT, refresh);
  window.addEventListener('storage', refresh);
  return () => {
    window.removeEventListener(DIRECTORY_CHANGE_EVENT, refresh);
    window.removeEventListener('storage', refresh);
  };
}

export function useDirectory() {
  const [directory, setDirectory] = useState(() => getDirectory());
  useEffect(() => subscribeToDirectory(setDirectory), []);
  return directory;
}

function normalizePerson(input, existing = null) {
  const role = String(input.role || existing?.role || '').trim().toLowerCase();
  if (!VALID_ROLES.has(role)) throw new Error('Choose Student, Lecturer, or Administrator.');

  const name = String(input.name ?? input.displayName ?? existing?.name ?? '').trim().replace(/\s+/g, ' ');
  const email = String(input.email ?? existing?.email ?? '').trim().toLowerCase();
  const status = String(input.status ?? existing?.status ?? 'Active').trim();
  const passwordInput = String(input.password ?? '').trim();
  const password = passwordInput || existing?.password || '';
  if (name.length < 3 || name.length > 80) throw new Error('Enter a name between 3 and 80 characters.');
  if (!EMAIL_PATTERN.test(email) || email.length > 254) throw new Error('Enter a valid email address.');
  if (!['Active', 'Suspended'].includes(status)) throw new Error('Choose Active or Suspended status.');
  if (!password) throw new Error('Enter a demo sign-in password.');
  if (password.length < 6 || password.length > 128) throw new Error('The demo password must be at least 6 characters.');

  const record = {
    ...(existing || {}),
    role,
    name,
    displayName: name,
    email,
    identifier: email,
    status,
    password,
  };

  if (role === 'student') {
    const studentNumber = String(input.studentNumber ?? existing?.studentNumber ?? '').trim();
    const faculty = String(input.faculty ?? existing?.faculty ?? '').trim().toUpperCase();
    const programme = String(input.programme ?? existing?.programme ?? '').trim();
    const year = String(input.year ?? existing?.year ?? '').trim();
    if (!STUDENT_NUMBER_PATTERN.test(studentNumber)) throw new Error('Student number must be 9 digits and begin with 90101.');
    if (!FACULTIES.some((item) => item.code === faculty)) throw new Error('Choose a valid faculty.');
    if (!programme || programme.length > 120) throw new Error('Enter a programme name (up to 120 characters).');
    if (!/^Year [1-8]$/.test(year)) throw new Error('Choose a valid study year.');
    record.studentNumber = studentNumber;
    record.identifier = studentNumber;
    record.faculty = faculty;
    record.programme = programme;
    record.year = year;
  } else {
    delete record.studentNumber;
    delete record.programme;
    delete record.year;
    delete record.index;
    if (role === 'lecturer') {
      const faculty = String(input.faculty ?? existing?.faculty ?? '').trim().toUpperCase();
      if (!FACULTIES.some((item) => item.code === faculty)) throw new Error('Choose a valid faculty.');
      record.faculty = faculty;
      record.index = Number.isInteger(existing?.index) ? existing.index : 0;
    } else {
      delete record.faculty;
    }
  }
  return record;
}

function assertUnique(directory, candidate, currentId = null) {
  const duplicateEmail = directory.some((person) => person.id !== currentId && person.email?.toLowerCase() === candidate.email);
  if (duplicateEmail) throw new Error('That email address is already in use.');
  if (candidate.role === 'student') {
    const duplicateNumber = directory.some((person) => person.id !== currentId && person.studentNumber === candidate.studentNumber);
    if (duplicateNumber) throw new Error('That student number is already in use.');
  }
}

function assertAdminRemains(directory) {
  if (!directory.some((person) => person.role === 'admin' && person.status === 'Active')) {
    throw new Error('At least one active administrator must remain.');
  }
}

export function createDirectoryPerson(input) {
  const directory = getDirectory();
  const candidate = normalizePerson(input);
  assertUnique(directory, candidate);
  candidate.id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `directory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const next = [candidate, ...directory];
  assertAdminRemains(next);
  saveDirectory(next);
  return candidate;
}

export function updateDirectoryPerson(personId, input, { actingUserId } = {}) {
  const directory = getDirectory();
  const existing = directory.find((person) => person.id === personId);
  if (!existing) throw new Error('This directory record is no longer available. Refresh and try again.');
  const candidate = normalizePerson(input, existing);
  assertUnique(directory, candidate, personId);
  if (personId === actingUserId && existing.role === 'admin' && candidate.role !== 'admin') {
    throw new Error('You cannot change your own administrator role.');
  }
  if (personId === actingUserId && existing.role === 'admin' && candidate.email !== existing.email) {
    throw new Error('You cannot change the primary email of the administrator account you are currently using.');
  }
  if (personId === actingUserId && existing.role === 'admin' && candidate.status !== 'Active') {
    throw new Error('You cannot suspend the administrator account you are currently using.');
  }
  Object.assign(candidate, { id: existing.id });
  const next = directory.map((person) => person.id === personId ? candidate : person);
  assertAdminRemains(next);
  saveDirectory(next);
  return candidate;
}

export function deleteDirectoryPerson(personId, { actingUserId } = {}) {
  const directory = getDirectory();
  const existing = directory.find((person) => person.id === personId);
  if (!existing) throw new Error('This directory record is no longer available. Refresh and try again.');
  if (personId === actingUserId) throw new Error('You cannot delete the administrator account you are currently using.');
  const next = directory.filter((person) => person.id !== personId);
  assertAdminRemains(next);
  saveDirectory(next);
}
