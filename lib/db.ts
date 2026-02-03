import { Student, Question, ExamSession, ExamResult, Teacher } from './types';
import { fetchQuestionsFromAPI, fetchQuestionsMultiPage } from './questions-api-enhanced';
import { generateJAMBGenericQuestions, generateWAECGenericQuestions } from './generate-questions';
import {
  mockStudents,
  commonEntranceQuestions,
  waecMathQuestions,
  waecEnglishQuestions,
  jambMathQuestions,
  jambEnglishQuestions,
  jambPhysicsQuestions,
  jambChemistryQuestions,
  jambBiologyQuestions,
  jambEconomicsQuestions,
  jambCommerceQuestions,
  jambGovernmentQuestions,
  // newly generated JAMB subjects
  jambLiteratureQuestions,
  jambHistoryQuestions,
  jambCRSQuestions,
  jambIRSQuestions,
  jambGeographyQuestions,
  jambAgriculturalQuestions,
  jambFurtherMathQuestions,
  jambFineArtsQuestions,
  jambMusicQuestions,
  jambFinAccQuestions,
  jambMarketingQuestions,
  jambOfficePracticeQuestions,
  jambBookkeepingQuestions,
  jambYorubaQuestions,
  jambIgboQuestions,
  jambHausaQuestions,
  // WAEC generated sets
  waecPhysicsQuestions,
  waecChemistryQuestions,
  waecBiologyQuestions,
  waecAgriculturalQuestions,
  waecFurtherMathQuestions,
  waecGeographyQuestions,
  waecLiteratureQuestions,
  waecGovernmentQuestions,
  waecHistoryQuestions,
  waecCRSQuestions,
  waecIRSQuestions,
  waecYorubaQuestions,
  waecIgboQuestions,
  waecHausaQuestions,
  waecFineArtsQuestions,
  waecMusicQuestions,
  waecFinAccQuestions,
  waecCommerceQuestions,
  waecEconomicsQuestions,
  waecMarketingQuestions,
  waecOfficePracticeQuestions,
  waecBookkeepingQuestions,
  mockTeachers,
  mockResults,
} from './mockData';

// LocalStorage keys
const STORAGE_KEYS = {
  QUESTIONS: 'exam_system_questions',
  STUDENTS: 'exam_system_students',
  RESULTS: 'exam_system_results',
  TEACHERS: 'exam_system_teachers',
};

// Helper functions for localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Initialize with mock data or load from localStorage
const defaultQuestions = [
  ...commonEntranceQuestions,

  // WAEC subjects (generated where available)
  ...waecMathQuestions,
  ...waecEnglishQuestions,
  ...waecPhysicsQuestions,
  ...waecChemistryQuestions,
  ...waecBiologyQuestions,
  ...waecAgriculturalQuestions,
  ...waecFurtherMathQuestions,
  ...waecGeographyQuestions,
  ...waecLiteratureQuestions,
  ...waecGovernmentQuestions,
  ...waecHistoryQuestions,
  ...waecCRSQuestions,
  ...waecIRSQuestions,
  ...waecYorubaQuestions,
  ...waecIgboQuestions,
  ...waecHausaQuestions,
  ...waecFineArtsQuestions,
  ...waecMusicQuestions,
  ...waecFinAccQuestions,
  ...waecCommerceQuestions,
  ...waecEconomicsQuestions,
  ...waecMarketingQuestions,
  ...waecOfficePracticeQuestions,
  ...waecBookkeepingQuestions,

  // JAMB subjects (core + newly added)
  ...jambMathQuestions,
  ...jambEnglishQuestions,
  ...jambPhysicsQuestions,
  ...jambChemistryQuestions,
  ...jambBiologyQuestions,
  ...jambEconomicsQuestions,
  ...jambCommerceQuestions,
  ...jambGovernmentQuestions,
  ...jambLiteratureQuestions,
  ...jambHistoryQuestions,
  ...jambCRSQuestions,
  ...jambIRSQuestions,
  ...jambGeographyQuestions,
  ...jambAgriculturalQuestions,
  ...jambFurtherMathQuestions,
  ...jambFineArtsQuestions,
  ...jambMusicQuestions,
  ...jambFinAccQuestions,
  ...jambMarketingQuestions,
  ...jambOfficePracticeQuestions,
  ...jambBookkeepingQuestions,
  ...jambYorubaQuestions,
  ...jambIgboQuestions,
  ...jambHausaQuestions,
];

let students: Student[] = loadFromStorage(STORAGE_KEYS.STUDENTS, [...mockStudents]);
let questions: Question[] = loadFromStorage(STORAGE_KEYS.QUESTIONS, defaultQuestions);
let examSessions: ExamSession[] = [];
let results: ExamResult[] = loadFromStorage(STORAGE_KEYS.RESULTS, [...mockResults]);
let teachers: Teacher[] = loadFromStorage(STORAGE_KEYS.TEACHERS, [...mockTeachers]);

// Student Database Operations
export function getStudentBySchoolId(schoolId: string): Student | undefined {
  return students.find((s) => s.schoolId === schoolId);
}

export function createStudent(name: string, schoolId: string, password?: string): Student {
  const newStudent: Student = {
    id: `STU${Date.now()}`,
    name,
    schoolId,
    ...(password && { password }), // Only add password if provided
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  students.push(newStudent);
  saveToStorage(STORAGE_KEYS.STUDENTS, students);
  return newStudent;
}

export function getAllStudents(): Student[] {
  return students;
}

// Question Database Operations
export async function getQuestionsByExamType(
  examType: 'common-entrance' | 'waec' | 'jamb',
  subject?: string
): Promise<Question[]> {
  let filtered = questions.filter((q) => q.examType === examType);
  if (subject) {
    filtered = filtered.filter((q) => q.subject === subject);
  }

  // API-first: Try fetching a large bank from external API when a subject is requested (only for WAEC/JAMB)
  const requireApi = process.env.NEXT_PUBLIC_REQUIRE_API === 'true';
  if (subject && (filtered.length === 0 || requireApi) && (examType === 'waec' || examType === 'jamb')) {
    const bankSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_BANK_SIZE || '20000', 10);
    const pageSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_PAGE_SIZE || '1000', 10);
    const allowFallback = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';

    try {
      const apiQuestions = await fetchQuestionsMultiPage(examType, subject, undefined, bankSize, pageSize);

      if (apiQuestions.length > 0) {
        // Remove any existing questions for this subject to avoid duplicates when forcing API
        if (requireApi) {
          questions = questions.filter((q) => !(q.examType === examType && q.subject === subject));
        }

        // Persist API questions locally and re-filter
        questions.push(...apiQuestions);
        saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
        filtered = questions.filter((q) => q.examType === examType && q.subject === subject);
        console.log(`✅ Fetched and stored ${filtered.length} questions from API for ${subject}`);
      } else {
        if (allowFallback) {
          console.warn(`⚠️ API returned no questions for ${subject}. Falling back to local generator.`);
          let generated: Question[] = [];
          if (examType === 'waec') generated = generateWAECGenericQuestions(subject);
          else if (examType === 'jamb') generated = generateJAMBGenericQuestions(subject);

          questions.push(...generated);
          saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
          filtered = questions.filter((q) => q.examType === examType && q.subject === subject);
          console.log(`✅ Generated and stored ${filtered.length} local questions for ${subject}`);
        } else {
          console.error(`❌ No questions available for ${examType} - ${subject}. API returned none and local fallback is disabled.`);
          return [];
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch questions from API:', error);
      if (allowFallback) {
        console.warn('⚠️ Falling back to local generator due to API error.');
        let generated: Question[] = [];
        if (examType === 'waec') generated = generateWAECGenericQuestions(subject);
        else if (examType === 'jamb') generated = generateJAMBGenericQuestions(subject);

        questions.push(...generated);
        saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
        filtered = questions.filter((q) => q.examType === examType && q.subject === subject);
        console.log(`✅ Generated and stored ${filtered.length} local questions for ${subject}`);
      } else {
        return [];
      }
    }
  }

  // For JAMB: English Language gets 60 questions, other subjects get 40 questions each (shuffled)
  if (examType === 'jamb' && subject) {
    const targetCount = subject === 'English Language' ? 60 : 40;
    filtered = shuffleArray(filtered).slice(0, targetCount);
  } else if (examType === 'waec' && subject) {
    // WAEC format: 60 questions total (50 objective + 10 essay) - shuffle within types then combine and shuffle final
    const objectiveQuestions = filtered.filter((q) => q.questionType === 'objective');
    const essayQuestions = filtered.filter((q) => q.questionType === 'essay');

    const selectedObjectives = shuffleArray(objectiveQuestions).slice(0, 50);
    const selectedEssays = shuffleArray(essayQuestions).slice(0, 10);

    let combined = selectedObjectives.concat(selectedEssays);

    // If we don't have 60 after picking top objectives/essays, fill from remaining pool
    if (combined.length < 60) {
      const remainingPool = shuffleArray(filtered.filter((q) => !combined.includes(q))).slice(0, 60 - combined.length);
      combined = combined.concat(remainingPool);
    }

    // Final shuffle to mix objectives and essays
    filtered = shuffleArray(combined).slice(0, 60);
  }

  return filtered;
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function addQuestion(question: Question): void {
  questions.push(question);
  saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
}

export function deleteQuestion(questionId: string): boolean {
  const initialLength = questions.length;
  questions = questions.filter(q => q.id !== questionId);
  if (questions.length < initialLength) {
    saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
    return true;
  }
  return false;
}

export function getAllQuestions(): Question[] {
  return questions;
}

// Replace local questions for a specific exam type + subject with a new set (persisted)
export function replaceQuestionsForSubject(
  examType: 'common-entrance' | 'waec' | 'jamb',
  subject: string,
  newQuestions: Question[]
): void {
  // Remove existing questions for this subject
  questions = questions.filter((q) => !(q.examType === examType && q.subject === subject));
  // Add the new API-sourced questions
  questions.push(...newQuestions);
  saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
  console.log(`✅ Replaced ${newQuestions.length} questions for ${examType} - ${subject}`);
}

// Clear all local questions for an entire exam type (useful when forcing API replacement)
export function clearQuestionsForExamType(
  examType: 'common-entrance' | 'waec' | 'jamb'
): void {
  const before = questions.length;
  questions = questions.filter((q) => q.examType !== examType);
  saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
  console.log(`🗑️ Cleared ${before - questions.length} local questions for ${examType}`);
}

// Fisher-Yates shuffle helper (used by question selection)
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getSubjectsByExamType(
  examType: 'common-entrance' | 'waec' | 'jamb'
): string[] {
  const filtered = questions.filter((q) => q.examType === examType);
  return [...new Set(filtered.map((q) => q.subject))];
}

// Exam Session Operations
export async function createExamSession(
  studentId: string,
  studentName: string,
  examType: 'common-entrance' | 'waec' | 'jamb',
  subjectOrSubjects?: string | string[]
): Promise<ExamSession> {
  // Handle both single subject and multiple subjects
  const isSingleSubject = typeof subjectOrSubjects === 'string';
  const subjects = isSingleSubject ? undefined : (subjectOrSubjects as string[]);
  const subject = isSingleSubject ? (subjectOrSubjects as string) : undefined;
  
  // Get questions for this exam
  let examQuestions: Question[] = [];
  if (subjects && subjects.length > 0) {
    // Multiple subjects - get questions for each subject
    for (const subj of subjects) {
      let subjectQuestions = await getQuestionsByExamType(examType, subj);

      // If none found, try to fetch/generate on-demand (API-first), only for WAEC/JAMB
      if (subjectQuestions.length === 0 && (examType === 'waec' || examType === 'jamb')) {
        try {
          const bankSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_BANK_SIZE || '20000', 10);
          const pageSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_PAGE_SIZE || '1000', 10);
          const allowFallback = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';

          const fetched = await fetchQuestionsMultiPage(examType, subj, undefined, bankSize, pageSize);
          if (fetched.length > 0) {
            replaceQuestionsForSubject(examType, subj, fetched);
            subjectQuestions = fetched;
          } else if (allowFallback) {
            // Generate locally and persist
            const generated = examType === 'waec' ? generateWAECGenericQuestions(subj) : generateJAMBGenericQuestions(subj);
            replaceQuestionsForSubject(examType, subj, generated);
            subjectQuestions = generated;
          }
        } catch (err) {
          console.error(`❌ On-demand fetch/generate failed for ${examType} - ${subj}:`, err);
        }
      }

      examQuestions = [...examQuestions, ...subjectQuestions];
    }
  } else if (subject) {
    // Single subject
    examQuestions = await getQuestionsByExamType(examType, subject);

    // Try on-demand fetch/generate if no questions available
    if (examQuestions.length === 0 && (examType === 'waec' || examType === 'jamb')) {
      try {
        const bankSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_BANK_SIZE || '20000', 10);
        const pageSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_PAGE_SIZE || '1000', 10);
        const allowFallback = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';

        const fetched = await fetchQuestionsMultiPage(examType, subject, undefined, bankSize, pageSize);
        if (fetched.length > 0) {
          replaceQuestionsForSubject(examType, subject, fetched);
          examQuestions = fetched;
        } else if (allowFallback) {
          const generated = examType === 'waec' ? generateWAECGenericQuestions(subject) : generateJAMBGenericQuestions(subject);
          replaceQuestionsForSubject(examType, subject, generated);
          examQuestions = generated;
        }
      } catch (err) {
        console.error(`❌ On-demand fetch/generate failed for ${examType} - ${subject}:`, err);
      }
    }
  } else {
    // No subject specified - get all questions for exam type
    examQuestions = await getQuestionsByExamType(examType);
  }

  // Shuffle combined questions for multi-subject JAMB or WAEC to randomize order
  if (examType === 'jamb' || examType === 'waec') {
    examQuestions = shuffleArray(examQuestions);
  }

  const newSession: ExamSession = {
    id: `SESSION${Date.now()}`,
    studentId,
    studentName,
    examType,
    subject,
    subjects,
    startTime: new Date().toISOString(),
    answers: {},
    status: 'in-progress',
    questionDetails: examQuestions, // Store questions for later review with explanations
    totalQuestions: examQuestions.length,
  }; 
  examSessions.push(newSession);
  return newSession;
}

export function getExamSession(sessionId: string): ExamSession | undefined {
  return examSessions.find((s) => s.id === sessionId);
}

export function updateExamSession(
  sessionId: string,
  updates: Partial<ExamSession>
): ExamSession | undefined {
  const session = examSessions.find((s) => s.id === sessionId);
  if (session) {
    Object.assign(session, updates);
  }
  return session;
}

export function getStudentExamSessions(
  studentId: string
): ExamSession[] {
  return examSessions.filter((s) => s.studentId === studentId);
}

// Result Operations
export function createResult(result: ExamResult): void {
  results.push(result);
  saveToStorage(STORAGE_KEYS.RESULTS, results);
}

export function getResultsByStudentId(studentId: string): ExamResult[] {
  return results.filter((r) => r.studentId === studentId);
}

export function getAllResults(): ExamResult[] {
  return results;
}

// Delete a result by ID
export function deleteResult(resultId: string): boolean {
  const before = results.length;
  results = results.filter((r) => r.id !== resultId);
  if (results.length < before) {
    saveToStorage(STORAGE_KEYS.RESULTS, results);
    return true;
  }
  return false;
}

export function getResultsByExamType(
  examType: 'common-entrance' | 'waec' | 'jamb'
): ExamResult[] {
  return results.filter((r) => r.examType === examType);
}

// Teacher Operations
export function getTeacherByEmail(email: string): Teacher | undefined {
  return teachers.find((t) => t.email === email);
}

export function addTeacher(teacher: Teacher): void {
  teachers.push(teacher);
  saveToStorage(STORAGE_KEYS.TEACHERS, teachers);
}

export function getAllTeachers(): Teacher[] {
  return teachers;
}

// Grading Logic
export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

export async function gradeExam(
  sessionId: string,
  schoolId: string
): Promise<ExamResult | null> {
  const session = getExamSession(sessionId);
  if (!session || session.status !== 'in-progress') return null;

  const examQuestions = session.questionDetails || (await getQuestionsByExamType(
    session.examType,
    session.subject
  ));
  let score = 0;
  let objectiveQuestions = 0;

  // Only grade objective questions automatically
  for (const question of examQuestions) {
    if (question.questionType === 'objective') {
      objectiveQuestions++;
      const selectedAnswer = session.answers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        score++;
      }
    }
  }

  // For now, we only calculate score based on objective questions
  // Essay questions would need manual grading by teachers
  const totalQuestions = objectiveQuestions;
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
  const grade = calculateGrade(percentage);

  const result: ExamResult = {
    id: `RESULT${Date.now()}`,
    studentId: session.studentId,
    studentName: session.studentName,
    schoolId,
    examType: session.examType,
    subject: session.subject,
    subjects: session.subjects,
    score,
    totalQuestions,
    percentage,
    grade,
    completedAt: new Date().toISOString(),
  };

  createResult(result);
  updateExamSession(sessionId, { status: 'completed', score, totalQuestions });

  return result;
}
