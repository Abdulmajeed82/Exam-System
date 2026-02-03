import { Student, Question, ExamSession, ExamResult, Teacher } from './types';
import {
  generateJAMBMathQuestions,
  generateJAMBEnglishQuestions,
  generateWAECMathQuestions,
  generateWAECEnglishQuestions,
  // WAEC generators
  generateWAECPhysicsQuestions,
  generateWAECChemistryQuestions,
  generateWAECBiologyQuestions,
  generateWAECAgriculturalQuestions,
  generateWAECFurtherMathQuestions,
  generateWAECGeographyQuestions,
  generateWAECLiteratureQuestions,
  generateWAECGovernmentQuestions,
  generateWAECHistoryQuestions,
  generateWAECCRSQuestions,
  generateWAECIRSQuestions,
  generateWAECYorubaQuestions,
  generateWAECIgboQuestions,
  generateWAECHausaQuestions,
  generateWAECFineArtsQuestions,
  generateWAECMusicQuestions,
  generateWAECFinAccQuestions,
  generateWAECCommerceQuestions,
  generateWAECEconomicsQuestions,
  generateWAECMarketingQuestions,
  generateWAECOfficePracticeQuestions,
  generateWAECBookkeepingQuestions,
  generateJAMBPhysicsQuestions,
  generateJAMBChemistryQuestions,
  generateJAMBBiologyQuestions,
  generateJAMBEconomicsQuestions,
  generateJAMBCommerceQuestions,
  generateJAMBGovernmentQuestions,
  // New JAMB generators
  generateJAMBGenericQuestions,
  generateJAMBLiteratureQuestions,
  generateJAMBHistoryQuestions,
  generateJAMBCRSQuestions,
  generateJAMBIRSQuestions,
  generateJAMBGeographyQuestions,
  generateJAMBAgriculturalQuestions,
  generateJAMBFurtherMathQuestions,
  generateJAMBFineArtsQuestions,
  generateJAMBMUSICQuestions,
  generateJAMBFinAccQuestions,
  generateJAMBMarketingQuestions,
  generateJAMBOfficePracticeQuestions,
  generateJAMBBookkeepingQuestions,
  generateJAMBYorubaQuestions,
  generateJAMBIgboQuestions,
  generateJAMBHausaQuestions,
} from './generate-questions';

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'STU001',
    name: 'Chioma Oluwaseun',
    schoolId: 'STU001',
    password: 'GMIS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'STU002',
    name: 'Chukwu Tunde',
    schoolId: 'STU002',
    password: 'GMIS',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Common Entrance Questions - English (keeping original for common entrance)
export const commonEntranceQuestions: Question[] = [
  {
    id: 'CE-EN-001',
    subject: 'English',
    examType: 'common-entrance',
    questionType: 'objective',
    questionNumber: 1,
    questionText: 'Choose the word with the correct spelling:',
    year: 2024,
    options: {
      a: 'Occurence',
      b: 'Occurance',
      c: 'Occurrence',
      d: 'Occuranse',
    },
    correctAnswer: 'c',
    explanation: 'The correct spelling is "Occurrence" with double "r" and double "c"',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CE-EN-002',
    subject: 'English',
    examType: 'common-entrance',
    questionType: 'objective',
    questionNumber: 2,
    questionText: 'Which of these sentences is grammatically correct?',
    year: 2024,
    options: {
      a: 'She go to school yesterday',
      b: 'She goes to school yesterday',
      c: 'She went to school yesterday',
      d: 'She going to school yesterday',
    },
    correctAnswer: 'c',
    explanation: '"Went" is the past tense of "go" and should be used with "yesterday"',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CE-EN-003',
    subject: 'English',
    examType: 'common-entrance',
    questionType: 'objective',
    questionNumber: 3,
    questionText: 'What is the plural of "child"?',
    year: 2024,
    options: {
      a: 'Childs',
      b: 'Children',
      c: 'Childes',
      d: 'Childres',
    },
    correctAnswer: 'b',
    explanation: '"Children" is the irregular plural form of "child"',
    createdAt: new Date().toISOString(),
  },
];

// Generate 60 WAEC Questions with essay questions
export const waecMathQuestions: Question[] = generateWAECMathQuestions();
export const waecEnglishQuestions: Question[] = generateWAECEnglishQuestions();
export const waecPhysicsQuestions: Question[] = generateWAECPhysicsQuestions();
export const waecChemistryQuestions: Question[] = generateWAECChemistryQuestions();
export const waecBiologyQuestions: Question[] = generateWAECBiologyQuestions();
export const waecAgriculturalQuestions: Question[] = generateWAECAgriculturalQuestions();
export const waecFurtherMathQuestions: Question[] = generateWAECFurtherMathQuestions();
export const waecGeographyQuestions: Question[] = generateWAECGeographyQuestions();
export const waecLiteratureQuestions: Question[] = generateWAECLiteratureQuestions();
export const waecGovernmentQuestions: Question[] = generateWAECGovernmentQuestions();
export const waecHistoryQuestions: Question[] = generateWAECHistoryQuestions();
export const waecCRSQuestions: Question[] = generateWAECCRSQuestions();
export const waecIRSQuestions: Question[] = generateWAECIRSQuestions();
export const waecYorubaQuestions: Question[] = generateWAECYorubaQuestions();
export const waecIgboQuestions: Question[] = generateWAECIgboQuestions();
export const waecHausaQuestions: Question[] = generateWAECHausaQuestions();
export const waecFineArtsQuestions: Question[] = generateWAECFineArtsQuestions();
export const waecMusicQuestions: Question[] = generateWAECMusicQuestions();
export const waecFinAccQuestions: Question[] = generateWAECFinAccQuestions();
export const waecCommerceQuestions: Question[] = generateWAECCommerceQuestions();
export const waecEconomicsQuestions: Question[] = generateWAECEconomicsQuestions();
export const waecMarketingQuestions: Question[] = generateWAECMarketingQuestions();
export const waecOfficePracticeQuestions: Question[] = generateWAECOfficePracticeQuestions();
export const waecBookkeepingQuestions: Question[] = generateWAECBookkeepingQuestions();

// Generate 60 JAMB Questions (all objective)
export const jambMathQuestions: Question[] = generateJAMBMathQuestions();
export const jambEnglishQuestions: Question[] = generateJAMBEnglishQuestions();
export const jambPhysicsQuestions: Question[] = generateJAMBPhysicsQuestions();
export const jambChemistryQuestions: Question[] = generateJAMBChemistryQuestions();
export const jambBiologyQuestions: Question[] = generateJAMBBiologyQuestions();
export const jambEconomicsQuestions: Question[] = generateJAMBEconomicsQuestions();
export const jambCommerceQuestions: Question[] = generateJAMBCommerceQuestions();
export const jambGovernmentQuestions: Question[] = generateJAMBGovernmentQuestions();

// Newly added JAMB subjects (generated)
export const jambLiteratureQuestions: Question[] = generateJAMBLiteratureQuestions();
export const jambHistoryQuestions: Question[] = generateJAMBHistoryQuestions();
export const jambCRSQuestions: Question[] = generateJAMBCRSQuestions();
export const jambIRSQuestions: Question[] = generateJAMBIRSQuestions();
export const jambGeographyQuestions: Question[] = generateJAMBGeographyQuestions();
export const jambAgriculturalQuestions: Question[] = generateJAMBAgriculturalQuestions();
export const jambFurtherMathQuestions: Question[] = generateJAMBFurtherMathQuestions();
export const jambFineArtsQuestions: Question[] = generateJAMBFineArtsQuestions();
export const jambMusicQuestions: Question[] = generateJAMBMUSICQuestions();
export const jambFinAccQuestions: Question[] = generateJAMBFinAccQuestions();
export const jambMarketingQuestions: Question[] = generateJAMBMarketingQuestions();
export const jambOfficePracticeQuestions: Question[] = generateJAMBOfficePracticeQuestions();
export const jambBookkeepingQuestions: Question[] = generateJAMBBookkeepingQuestions();
export const jambYorubaQuestions: Question[] = generateJAMBYorubaQuestions();
export const jambIgboQuestions: Question[] = generateJAMBIgboQuestions();
export const jambHausaQuestions: Question[] = generateJAMBHausaQuestions();

// Legacy exports for backward compatibility
export const waecQuestions: Question[] = waecMathQuestions;
export const jambQuestions: Question[] = jambMathQuestions;

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'TEA001',
    name: 'Mrs. Adeyemi',
    email: 'adeyemi@gmisteach.edu',
    password: 'hashed_password_1', // In real app, use bcrypt
    createdAt: new Date().toISOString(),
  },
];

// Mock Exam Results
export const mockResults: ExamResult[] = [
  {
    id: 'RESULT-001',
    studentId: 'STU001',
    studentName: 'Chioma Oluwaseun',
    schoolId: 'STU001',
    examType: 'common-entrance',
    subject: 'English',
    score: 18,
    totalQuestions: 20,
    percentage: 90,
    grade: 'A',
    completedAt: new Date().toISOString(),
  },
];
