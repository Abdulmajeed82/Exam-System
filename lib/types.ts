// Subject Types
export interface Subject {
  id: string;
  name: string;
  examType: 'common-entrance' | 'waec' | 'jamb';
  description?: string;
  category?: 'Science' | 'Arts/Humanities' | 'Commercial'; // For WAEC subjects
  createdAt: string;
}

// Student Types
export interface Student {
  id: string;
  name: string;
  schoolId: string;
  schoolName?: string; // School name for login
  password?: string; // Password for login
  waecSubjects?: string[]; // WAEC subjects the student is taking
  createdAt: string;
  updatedAt: string;
}

// Question Types
export interface Question {
  id: string;
  subject: string;
  examType: 'common-entrance' | 'waec' | 'jamb';
  questionType: 'objective' | 'essay';
  questionNumber: number;
  questionText: string;
  year: number; // Year of the past question (2000-present)
  options?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer?: 'a' | 'b' | 'c' | 'd';
  explanation: string; // Explanation for the correct answer
  essayAnswer?: string; // Sample answer for essay questions
  createdAt: string;
}

// Exam Session Types
export interface ExamSession {
  id: string;
  studentId: string;
  studentName: string;
  examType: 'common-entrance' | 'waec' | 'jamb';
  subject?: string; // For single subject exams (common-entrance)
  subjects?: string[]; // For multiple subject exams (JAMB, WAEC)
  startTime: string;
  endTime?: string;
  answers: Record<string, string>; // questionId -> selected answer (a/b/c/d for objective, essay text for essay)
  score?: number;
  totalQuestions?: number;
  status: 'in-progress' | 'completed';
  questionDetails?: Question[]; // Store questions for review with explanations
}

// Result Types
export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  examType: 'common-entrance' | 'waec' | 'jamb';
  subject?: string; // For single subject exams
  subjects?: string[]; // For multiple subject exams
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  completedAt: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  createdAt: string;
}
