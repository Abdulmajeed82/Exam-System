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
  // Always start with local questions (mock data)
  let filtered = questions.filter((q) => q.examType === examType);
  if (subject) {
    filtered = filtered.filter((q) => q.subject === subject);
  }

  // If we have local questions, use them and enhance with API if available
  if (filtered.length > 0) {
    console.log(`✅ Using local questions: ${filtered.length} for ${examType}${subject ? ' - ' + subject : ''}`);
  }

  // Try to enhance with server MongoDB data (optional enhancement, not requirement)
  if (typeof window !== 'undefined' && subject && filtered.length < 10) {
    try {
      const res = await fetch(`/api/questions?examType=${encodeURIComponent(examType)}&subject=${encodeURIComponent(subject)}&full=true`);
      const data = await res.json();
      if (res.ok && data && Array.isArray(data.questions) && data.questions.length > 0) {
        try {
          replaceQuestionsForSubject(examType, subject, data.questions);
        } catch (e) {
          console.warn('Could not replace local questions from server response:', e);
        }
        filtered = data.questions;
        console.log(`✅ Enhanced with server questions: ${filtered.length}`);
      }
    } catch (e) {
      console.log('Server DB not available, using local questions');
    }
  }

  // For WAEC/JAMB: Try to enhance with external API (optional, not required)
  // Always prioritize local mock data, API is just an enhancement
  const requireApi = process.env.NEXT_PUBLIC_REQUIRE_API === 'true';
  const allowFallback = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK !== 'false'; // Default to true

  // If we have enough local questions, skip API fetch
  const hasEnoughQuestions = filtered.length >= 40;

  if (subject && !hasEnoughQuestions && (examType === 'waec' || examType === 'jamb')) {
    const bankSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_BANK_SIZE || '20000', 10);
    const pageSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_PAGE_SIZE || '1000', 10);

    try {
      const apiQuestions = await fetchQuestionsMultiPage(examType, subject, undefined, bankSize, pageSize);

      if (apiQuestions.length > 0) {
        // Merge API questions with local (remove duplicates based on questionText)
        const localTexts = new Set(filtered.map(q => q.questionText));
        const newQuestions = apiQuestions.filter(q => !localTexts.has(q.questionText));
        
        if (newQuestions.length > 0) {
          questions.push(...newQuestions);
          saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
          filtered = [...filtered, ...newQuestions];
          console.log(`✅ Enhanced with API questions: +${newQuestions.length} total: ${filtered.length}`);
        }
      } else {
        console.log('API returned no questions, using local mock data');
      }
    } catch (error) {
      console.log('API fetch failed, using local mock data');
    }
  }

  // Generate additional questions if still not enough (fallback)
  if (filtered.length < 20 && (examType === 'waec' || examType === 'jamb') && subject && allowFallback) {
    console.log(`⚠️ Only ${filtered.length} questions found. Generating more...`);
    let generated: Question[] = [];
    if (examType === 'waec') generated = generateWAECGenericQuestions(subject);
    else if (examType === 'jamb') generated = generateJAMBGenericQuestions(subject);

    // Filter out duplicates
    const localTexts = new Set(filtered.map(q => q.questionText));
    const newGenerated = generated.filter(q => !localTexts.has(q.questionText));
    
    if (newGenerated.length > 0) {
      questions.push(...newGenerated);
      saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
      filtered = [...filtered, ...newGenerated];
      console.log(`✅ Generated ${newGenerated.length} additional questions. Total: ${filtered.length}`);
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

  // Final check: ensure we always return at least some questions from mock data
  if (filtered.length === 0 && (examType === 'waec' || examType === 'jamb') && subject && allowFallback) {
    console.log(`⚠️ No questions found at all. Generating fresh questions for ${subject}`);
    let generated: Question[] = [];
    if (examType === 'waec') generated = generateWAECGenericQuestions(subject);
    else if (examType === 'jamb') generated = generateJAMBGenericQuestions(subject);
    
    questions.push(...generated);
    saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
    filtered = generated;
  }

  console.log(`📚 Final questions count for ${examType}${subject ? ' - ' + subject : ''}: ${filtered.length}`);
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

  console.log(`📝 Creating exam session: ${examType}${subject ? ' - ' + subject : ''}${subjects ? ' - ' + subjects.join(', ') : ''}`);

  // Get questions for this exam
  let examQuestions: Question[] = [];
  const allowFallback = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK !== 'false';

  if (subjects && subjects.length > 0) {
    // Multiple subjects - get questions for each subject
    for (const subj of subjects) {
      let subjectQuestions = await getQuestionsByExamType(examType, subj);
      examQuestions = [...examQuestions, ...subjectQuestions];
    }
  } else if (subject) {
    // Single subject
    examQuestions = await getQuestionsByExamType(examType, subject);
  } else {
    // No subject specified - get all questions for exam type
    examQuestions = await getQuestionsByExamType(examType);
  }

  // Final safety check: generate questions if still none
  if (examQuestions.length === 0 && (examType === 'waec' || examType === 'jamb')) {
    console.log('⚠️ No questions found. Generating fallback questions...');
    
    if (subjects && subjects.length > 0) {
      for (const subj of subjects) {
        let generated: Question[] = [];
        if (examType === 'waec') generated = generateWAECGenericQuestions(subj);
        else if (examType === 'jamb') generated = generateJAMBGenericQuestions(subj);
        
        questions.push(...generated);
        examQuestions = [...examQuestions, ...generated];
      }
    } else if (subject) {
      let generated: Question[] = [];
      if (examType === 'waec') generated = generateWAECGenericQuestions(subject);
      else if (examType === 'jamb') generated = generateJAMBGenericQuestions(subject);
      
      questions.push(...generated);
      examQuestions = generated;
    }
    
    saveToStorage(STORAGE_KEYS.QUESTIONS, questions);
    console.log(`✅ Generated ${examQuestions.length} fallback questions`);
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

  console.log(`✅ Exam session created with ${examQuestions.length} questions`);
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
