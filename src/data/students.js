export const FACULTIES = [
  {
    code: 'FICT',
    name: 'Faculty of Information & Communication Technology',
    accent: 'cyan',
  },
  {
    code: 'FCMB',
    name: 'Faculty of Communication, Media & Broadcasting',
    accent: 'violet',
  },
  {
    code: 'FBMG',
    name: 'Faculty of Business Management & Globalisation',
    accent: 'gold',
  },
  {
    code: 'FCTH',
    name: 'Faculty of Creative Tourism & Hospitality',
    accent: 'mint',
  },
];

export const students = [
  { id: 'student-01', name: 'Amogelang Mokoena', studentNumber: '901014827', email: 'amogelang.mokoena@student.limkokwing.ac.ls', faculty: 'FICT', programme: 'BSc Computer Systems Engineering', year: 'Year 3', status: 'Active' },
  { id: 'student-02', name: 'Thabo Maseko', studentNumber: '901017194', email: 'thabo.maseko@student.limkokwing.ac.ls', faculty: 'FICT', programme: 'BSc Software Engineering', year: 'Year 2', status: 'Active' },
  { id: 'student-03', name: 'Neo Radebe', studentNumber: '901013058', email: 'neo.radebe@student.limkokwing.ac.ls', faculty: 'FICT', programme: 'BSc Information Technology', year: 'Year 4', status: 'Active' },
  { id: 'student-04', name: 'Karabo Ncube', studentNumber: '901016641', email: 'karabo.ncube@student.limkokwing.ac.ls', faculty: 'FICT', programme: 'BSc Computer Science', year: 'Year 1', status: 'Active' },
  { id: 'student-05', name: 'Lerato Mothibi', studentNumber: '901018936', email: 'lerato.mothibi@student.limkokwing.ac.ls', faculty: 'FICT', programme: 'BSc Multimedia Computing', year: 'Year 3', status: 'Active' },
  { id: 'student-06', name: 'Palesa Nkuebe', studentNumber: '901012517', email: 'palesa.nkuebe@student.limkokwing.ac.ls', faculty: 'FCMB', programme: 'BA Fashion Design', year: 'Year 2', status: 'Active' },
  { id: 'student-07', name: 'Naledi Ramotswe', studentNumber: '901019402', email: 'naledi.ramotswe@student.limkokwing.ac.ls', faculty: 'FCMB', programme: 'BA Interior Architecture', year: 'Year 3', status: 'Active' },
  { id: 'student-08', name: 'Tumelo Phiri', studentNumber: '901014765', email: 'tumelo.phiri@student.limkokwing.ac.ls', faculty: 'FCMB', programme: 'BA Film Production', year: 'Year 1', status: 'Active' },
  { id: 'student-09', name: 'Bokang Thakadu', studentNumber: '901017833', email: 'bokang.thakadu@student.limkokwing.ac.ls', faculty: 'FCMB', programme: 'BA Fashion Business', year: 'Year 4', status: 'Active' },
  { id: 'student-10', name: 'Refiloe Kelebeng', studentNumber: '901013229', email: 'refiloe.kelebeng@student.limkokwing.ac.ls', faculty: 'FCMB', programme: 'BA Product Design', year: 'Year 2', status: 'Active' },
  { id: 'student-11', name: 'Kamohelo Seema', studentNumber: '901015814', email: 'kamohelo.seema@student.limkokwing.ac.ls', faculty: 'FBMG', programme: 'BA Business Management', year: 'Year 3', status: 'Active' },
  { id: 'student-12', name: 'Matjato Mofokeng', studentNumber: '901011673', email: 'matjato.mofokeng@student.limkokwing.ac.ls', faculty: 'FBMG', programme: 'BA Marketing', year: 'Year 2', status: 'Active' },
  { id: 'student-13', name: 'Teboho Molapo', studentNumber: '901019158', email: 'teboho.molapo@student.limkokwing.ac.ls', faculty: 'FBMG', programme: 'BA Entrepreneurship', year: 'Year 4', status: 'Active' },
  { id: 'student-14', name: 'Masechaba Ralebese', studentNumber: '901016305', email: 'masechaba.ralebese@student.limkokwing.ac.ls', faculty: 'FBMG', programme: 'BA International Business', year: 'Year 1', status: 'Active' },
  { id: 'student-15', name: 'Nthabiseng Motsamai', studentNumber: '901014086', email: 'nthabiseng.motsamai@student.limkokwing.ac.ls', faculty: 'FBMG', programme: 'BA Public Relations', year: 'Year 3', status: 'Active' },
  { id: 'student-16', name: 'Lineo Makara', studentNumber: '901018247', email: 'lineo.makara@student.limkokwing.ac.ls', faculty: 'FCTH', programme: 'BA Travel and Tourism', year: 'Year 2', status: 'Active' },
  { id: 'student-17', name: 'Mpho Tseleng', studentNumber: '901012906', email: 'mpho.tseleng@student.limkokwing.ac.ls', faculty: 'FCTH', programme: 'BA Hospitality Management', year: 'Year 4', status: 'Active' },
  { id: 'student-18', name: "Ts'episo Moletsane", studentNumber: '901017452', email: 'tsepiso.moletsane@student.limkokwing.ac.ls', faculty: 'FCTH', programme: 'BA Culinary Arts', year: 'Year 1', status: 'Active' },
  { id: 'student-19', name: 'Kefiloe Tsoeu', studentNumber: '901015639', email: 'kefiloe.tsoeu@student.limkokwing.ac.ls', faculty: 'FCTH', programme: 'BA Event Management', year: 'Year 3', status: 'Active' },
  { id: 'student-20', name: 'Anele Mota', studentNumber: '901011824', email: 'anele.mota@student.limkokwing.ac.ls', faculty: 'FCTH', programme: 'BA Leisure and Recreation', year: 'Year 2', status: 'Active' },
];

export function getStudentByNumber(studentNumber) {
  return students.find((student) => student.studentNumber === String(studentNumber).trim());
}

export function getFacultyByCode(code) {
  return FACULTIES.find((faculty) => faculty.code === code);
}
