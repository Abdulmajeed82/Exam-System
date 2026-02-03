import { Subject } from './types';

// Common Entrance Subjects
export const commonEntranceSubjects: Subject[] = [
  {
    id: 'eng',
    name: 'English',
    examType: 'common-entrance',
    description: 'English Language and Comprehension',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'math',
    name: 'Mathematics',
    examType: 'common-entrance',
    description: 'Mathematical Concepts and Problem Solving',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sci',
    name: 'Science',
    examType: 'common-entrance',
    description: 'Basic Sciences including Physics, Chemistry, and Biology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'soc',
    name: 'Social & Citizenship Studies',
    examType: 'common-entrance',
    description: 'Social Studies and Citizenship Education',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'crs',
    name: 'CRS',
    examType: 'common-entrance',
    description: 'Christian Religious Studies',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'isl',
    name: 'Islamic Studies',
    examType: 'common-entrance',
    description: 'Islamic Religious Education',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'qr',
    name: 'Quantitative Reasoning',
    examType: 'common-entrance',
    description: 'Numerical and Logical Reasoning',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vr',
    name: 'Verbal Reasoning',
    examType: 'common-entrance',
    description: 'Language and Logical Reasoning',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'phe',
    name: 'Physical Health Education',
    examType: 'common-entrance',
    description: 'Physical Education and Health',
    createdAt: new Date().toISOString(),
  },
];

// WAEC Subjects (for reference)
export const waecSubjects: Subject[] = [
  // Science Stream ✅
  {
    id: 'waec-eng',
    name: 'English Language',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC English Language',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-math',
    name: 'Mathematics',
    examType: 'waec',
    category: 'Science',
    description: 'WAEC Mathematics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-phy',
    name: 'Physics',
    examType: 'waec',
    category: 'Science',
    description: 'WAEC Physics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-chem',
    name: 'Chemistry',
    examType: 'waec',
    category: 'Science',
    description: 'WAEC Chemistry',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-bio',
    name: 'Biology',
    examType: 'waec',
    category: 'Science',
    description: 'WAEC Biology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-agric',
    name: 'Agricultural Science',
    examType: 'waec',
    category: 'Science',
    description: 'WAEC Agricultural Science',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-fm',
    name: 'Further Mathematics',
    examType: 'waec',
    category: 'Science',
    description: 'WAEC Further Mathematics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-geog',
    name: 'Geography',
    examType: 'waec',
    category: 'Science',
    description: 'WAEC Geography',
    createdAt: new Date().toISOString(),
  },

  // Arts Stream ✅
  {
    id: 'waec-lit',
    name: 'Literature-in-English',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Literature-in-English',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-gov',
    name: 'Government',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Government',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-hist',
    name: 'History',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC History',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-crs',
    name: 'Christian Religious Studies',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Christian Religious Studies (CRS)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-isl',
    name: 'Islamic Religious Studies',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Islamic Religious Studies (IRS)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-yor',
    name: 'Yoruba',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Yoruba (A Nigerian Language)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-igbo',
    name: 'Igbo',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Igbo (A Nigerian Language)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-hausa',
    name: 'Hausa',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Hausa (A Nigerian Language)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-fine-arts',
    name: 'Fine Arts',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Fine Arts',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-music',
    name: 'Music',
    examType: 'waec',
    category: 'Arts/Humanities',
    description: 'WAEC Music',
    createdAt: new Date().toISOString(),
  },

  // Commercial Stream ✅
  {
    id: 'waec-fin-acc',
    name: 'Financial Accounting',
    examType: 'waec',
    category: 'Commercial',
    description: 'WAEC Financial Accounting',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-commerce',
    name: 'Commerce',
    examType: 'waec',
    category: 'Commercial',
    description: 'WAEC Commerce',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-econ',
    name: 'Economics',
    examType: 'waec',
    category: 'Commercial',
    description: 'WAEC Economics (Note: Economics availability limited in 2026)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-marketing',
    name: 'Marketing',
    examType: 'waec',
    category: 'Commercial',
    description: 'WAEC Marketing',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-office-practice',
    name: 'Office Practice',
    examType: 'waec',
    category: 'Commercial',
    description: 'WAEC Office Practice',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'waec-bookkeeping',
    name: 'Bookkeeping',
    examType: 'waec',
    category: 'Commercial',
    description: 'WAEC Bookkeeping',
    createdAt: new Date().toISOString(),
  },
];

// JAMB Subjects (for reference)
export const jambSubjects: Subject[] = [
  {
    id: 'jamb-eng',
    name: 'English Language',
    examType: 'jamb',
    description: 'JAMB English Language (Mandatory)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-math',
    name: 'Mathematics',
    examType: 'jamb',
    description: 'JAMB Mathematics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-phy',
    name: 'Physics',
    examType: 'jamb',
    description: 'JAMB Physics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-chem',
    name: 'Chemistry',
    examType: 'jamb',
    description: 'JAMB Chemistry',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-bio',
    name: 'Biology',
    examType: 'jamb',
    description: 'JAMB Biology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-agric',
    name: 'Agricultural Science',
    examType: 'jamb',
    description: 'JAMB Agricultural Science',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-fm',
    name: 'Further Mathematics',
    examType: 'jamb',
    description: 'JAMB Further Mathematics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-geog',
    name: 'Geography',
    examType: 'jamb',
    description: 'JAMB Geography',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-lit',
    name: 'Literature-in-English',
    examType: 'jamb',
    description: 'JAMB Literature-in-English',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-hist',
    name: 'History',
    examType: 'jamb',
    description: 'JAMB History',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-crs',
    name: 'Christian Religious Studies',
    examType: 'jamb',
    description: 'JAMB Christian Religious Studies',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-isl',
    name: 'Islamic Religious Studies',
    examType: 'jamb',
    description: 'JAMB Islamic Religious Studies',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-yor',
    name: 'Yoruba',
    examType: 'jamb',
    description: 'JAMB Yoruba',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-igbo',
    name: 'Igbo',
    examType: 'jamb',
    description: 'JAMB Igbo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-hausa',
    name: 'Hausa',
    examType: 'jamb',
    description: 'JAMB Hausa',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-fine-arts',
    name: 'Fine Arts',
    examType: 'jamb',
    description: 'JAMB Fine Arts',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-music',
    name: 'Music',
    examType: 'jamb',
    description: 'JAMB Music',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-fin-acc',
    name: 'Financial Accounting',
    examType: 'jamb',
    description: 'JAMB Financial Accounting',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-marketing',
    name: 'Marketing',
    examType: 'jamb',
    description: 'JAMB Marketing',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-office-practice',
    name: 'Office Practice',
    examType: 'jamb',
    description: 'JAMB Office Practice',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-bookkeeping',
    name: 'Bookkeeping',
    examType: 'jamb',
    description: 'JAMB Bookkeeping',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-econ',
    name: 'Economics',
    examType: 'jamb',
    description: 'JAMB Economics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-comm',
    name: 'Commerce',
    examType: 'jamb',
    description: 'JAMB Commerce',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'jamb-gov',
    name: 'Government',
    examType: 'jamb',
    description: 'JAMB Government',
    createdAt: new Date().toISOString(),
  },
];

// Helper: Get WAEC subjects by stream/category
export function getWaecSubjectsByCategory(category: 'Science' | 'Arts/Humanities' | 'Commercial'): Subject[] {
  return waecSubjects.filter((s) => s.category === category);
}

// Utility function to get subjects by exam type
export function getSubjectsByExamType(examType: 'common-entrance' | 'waec' | 'jamb'): Subject[] {
  switch (examType) {
    case 'common-entrance':
      return commonEntranceSubjects;
    case 'waec':
      return waecSubjects;
    case 'jamb':
      return jambSubjects;
    default:
      return [];
  }
}