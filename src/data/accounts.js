import { students } from './students.js';

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

export const LECTURERS = ['FICT', 'FCMB', 'FBMG', 'FCTH'].map((faculty, index) => ({
  id: `lecturer-${index + 1}`,
  role: 'lecturer',
  faculty,
  index: 0,
  identifier: index === 0 ? DEMO_ACCOUNTS.lecturer.email : `${faculty.toLowerCase()}1@limkokwing.ac.ls`,
  email: index === 0 ? DEMO_ACCOUNTS.lecturer.email : `${faculty.toLowerCase()}1@limkokwing.ac.ls`,
  displayName: index === 0 ? DEMO_ACCOUNTS.lecturer.displayName : `${faculty} Lecturer 1`,
  password: DEMO_ACCOUNTS.lecturer.password,
}));
