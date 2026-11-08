import {
  BookOpenCheck,
  FileBadge,
  FileText,
  HelpCircle,
  Laptop,
  UserRoundCog,
} from 'lucide-react';

export const services = [
  {
    id: 'academic-transcript',
    name: 'Academic Transcript Request',
    shortDescription: 'Request an official record of your academic results and course history.',
    description:
      'Request an official academic transcript showing completed courses and recorded results. Before you submit, confirm that any outstanding administrative requirements have been cleared with the relevant university office.',
    availability: 'Every working day',
    department: 'Registration Office',
    instructions: [
      'Use the same full name recorded in your student profile.',
      'Include the purpose of the transcript and any collection or delivery details in your reason.',
      'Registration Office may contact you if additional information is required.',
    ],
    icon: FileText,
    number: '01',
    category: 'Academic records',
  },
  {
    id: 'recommendation-letter',
    name: 'Letter of Recommendation Request',
    shortDescription: 'Ask for a recommendation letter for an academic or professional opportunity.',
    description:
      'Submit the details needed for a recommendation letter for further study, an internship, a scholarship, or another opportunity. Include the recipient, purpose, deadline, and any points the recommender should consider.',
    availability: 'Every working day',
    department: 'Registration Office',
    instructions: [
      'Allow enough time for the faculty member to prepare the letter.',
      'Mention the opportunity and its deadline in your request description.',
      'Attach supporting documents separately if Registration Office asks for them.',
    ],
    icon: FileBadge,
    number: '02',
    category: 'Academic support',
  },
  {
    id: 'registration-assistance',
    name: 'Registration Assistance',
    shortDescription: 'Get help resolving a registration question or enrolment difficulty.',
    description:
      'Ask for help with course enrolment, registration steps, module selection, or a registration issue. Describe where you are in the process and include any error message or module information that may help staff assist you.',
    availability: 'Every working day',
    department: 'Registration Office',
    instructions: [
      'Include the programme and semester relevant to your query.',
      'Describe any registration error exactly as it appears.',
      'Do not include passwords or other account secrets in the request.',
    ],
    icon: UserRoundCog,
    number: '03',
    category: 'Enrolment',
  },
  {
    id: 'student-id-replacement',
    name: 'Student ID Replacement',
    shortDescription: 'Report a lost or damaged student card and request a replacement.',
    description:
      'Request assistance with a lost, stolen, or damaged student identification card. Explain what happened and how staff can reach you if they need to verify your identity before arranging a replacement.',
    availability: 'Every working day',
    department: 'Registration Office',
    instructions: [
      'State whether the card was lost, stolen, or damaged.',
      'Never enter bank details, passwords, or other sensitive credentials.',
      'Follow any identity-verification instructions from Registration Office.',
    ],
    icon: FileBadge,
    number: '04',
    category: 'Student support',
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    shortDescription: 'Get help with a university technology or digital learning issue.',
    description:
      'Report a problem with a university system, campus technology, online learning tool, or student account. Include the device or platform, what you were trying to do, and the steps that led to the issue.',
    availability: 'Every working day',
    department: 'ICT Support',
    instructions: [
      'Describe the issue and include any visible error message.',
      'Mention your device type and the time the issue occurred.',
      'Do not share passwords or authentication codes.',
    ],
    icon: Laptop,
    number: '05',
    category: 'Technology',
  },
  {
    id: 'general-enquiry',
    name: 'General Enquiry',
    shortDescription: 'Send a question that does not fit another listed service.',
    description:
      'Use a general enquiry for a university question that is not covered by another service. The Student Representative Office can help route your question; include enough context for the team to understand what you need.',
    availability: 'Every working day',
    department: 'Student Representative Office',
    instructions: [
      'Choose a clear subject for your question in the request description.',
      'Include any relevant programme, office, or date information.',
      'For urgent matters, contact the relevant university office directly.',
    ],
    icon: HelpCircle,
    number: '06',
    category: 'General support',
  },
];

export const getServiceById = (serviceId) => services.find((service) => service.id === serviceId);
