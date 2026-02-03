import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { Question } from './types';

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'exam.db');

// Ensure data dir exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);

// Initialize tables
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  subject TEXT,
  examType TEXT,
  questionType TEXT,
  questionNumber INTEGER,
  questionText TEXT,
  year INTEGER,
  options TEXT,
  correctAnswer TEXT,
  explanation TEXT,
  essayAnswer TEXT,
  createdAt TEXT
);

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  studentName TEXT,
  schoolId TEXT,
  examType TEXT,
  subject TEXT,
  subjects TEXT,
  score INTEGER,
  totalQuestions INTEGER,
  percentage REAL,
  grade TEXT,
  completedAt TEXT
);
`);

// Prepared statements
const insertQuestionStmt = db.prepare(`
INSERT INTO questions (id, subject, examType, questionType, questionNumber, questionText, year, options, correctAnswer, explanation, essayAnswer, createdAt)
VALUES (@id, @subject, @examType, @questionType, @questionNumber, @questionText, @year, @options, @correctAnswer, @explanation, @essayAnswer, @createdAt)
`);

const selectQuestionsStmt = db.prepare(`SELECT * FROM questions WHERE examType = @examType` +
  ` AND (@subject IS NULL OR LOWER(subject) = LOWER(@subject))`);

const selectQuestionByIdStmt = db.prepare('SELECT * FROM questions WHERE id = ?');

const deleteAllQuestionsForExamTypeStmt = db.prepare('DELETE FROM questions WHERE examType = ?');

export function saveQuestionToDb(q: Partial<Question> & { id?: string }): Question {
  const now = new Date().toISOString();
  const id = q.id || `Q-${Date.now()}`;
  const payload = {
    id,
    subject: q.subject || 'Unknown',
    examType: q.examType || 'common-entrance',
    questionType: q.questionType || 'objective',
    questionNumber: q.questionNumber || 0,
    questionText: q.questionText || '',
    year: q.year || new Date().getFullYear(),
    options: q.options ? JSON.stringify(q.options) : null,
    correctAnswer: q.correctAnswer || null,
    explanation: q.explanation || null,
    essayAnswer: q.essayAnswer || null,
    createdAt: q.createdAt || now,
  };

  insertQuestionStmt.run(payload);

  return {
    id: payload.id,
    subject: payload.subject,
    examType: payload.examType as 'common-entrance' | 'waec' | 'jamb',
    questionType: payload.questionType as 'objective' | 'essay',
    questionNumber: payload.questionNumber,
    questionText: payload.questionText,
    year: payload.year,
    options: q.options as Question['options'],
    correctAnswer: payload.correctAnswer as Question['correctAnswer'] | undefined,
    explanation: payload.explanation || '',
    essayAnswer: payload.essayAnswer || undefined,
    createdAt: payload.createdAt,
  } as Question;
}

export function getQuestionsFromDb(examType: 'common-entrance' | 'waec' | 'jamb', subject?: string): Question[] {
  const rows = selectQuestionsStmt.all({ examType, subject: subject || null });
  return rows.map((r: any) => ({
    id: r.id,
    subject: r.subject,
    examType: r.examType,
    questionType: r.questionType,
    questionNumber: r.questionNumber,
    questionText: r.questionText,
    year: r.year,
    options: r.options ? JSON.parse(r.options) : undefined,
    correctAnswer: r.correctAnswer || undefined,
    explanation: r.explanation || '',
    essayAnswer: r.essayAnswer || undefined,
    createdAt: r.createdAt,
  } as Question));
}

export function getPublicQuestionsFromDb(examType: 'common-entrance' | 'waec' | 'jamb', subject?: string) {
  const questions = getQuestionsFromDb(examType, subject);
  return questions.map(({ correctAnswer, ...rest }) => rest);
}

export function getQuestionById(id: string): Question | undefined {
  const r = selectQuestionByIdStmt.get(id);
  if (!r) return undefined;
  return {
    id: r.id,
    subject: r.subject,
    examType: r.examType,
    questionType: r.questionType,
    questionNumber: r.questionNumber,
    questionText: r.questionText,
    year: r.year,
    options: r.options ? JSON.parse(r.options) : undefined,
    correctAnswer: r.correctAnswer || undefined,
    explanation: r.explanation || '',
    essayAnswer: r.essayAnswer || undefined,
    createdAt: r.createdAt,
  } as Question;
}

export function clearQuestionsForExamType(examType: 'common-entrance' | 'waec' | 'jamb') {
  deleteAllQuestionsForExamTypeStmt.run(examType);
}

// Grading: support multiple input shapes:
// - gradeAnswersServerSide(examType, answersArray)
// - gradeAnswersServerSide(answersMap)
// - gradeAnswersServerSide(answersArray)
export function gradeAnswersServerSide(
  examTypeOrAnswers: 'common-entrance' | 'waec' | 'jamb' | Record<string, string> | Array<{ id: string; answer: string }>,
  maybeAnswers?: Array<{ id: string; answer: string }>
): { score: number; total: number; details: { id: string; correct: boolean }[] } {
  const answersMap: Record<string, string> = {};

  if (typeof examTypeOrAnswers === 'string') {
    // (examType, answersArray)
    const arr = maybeAnswers || [];
    for (const a of arr) {
      if (a && typeof a.id === 'string') answersMap[a.id] = a.answer;
    }
  } else if (Array.isArray(examTypeOrAnswers)) {
    // (answersArray)
    for (const a of examTypeOrAnswers) {
      if (a && typeof a.id === 'string') answersMap[a.id] = a.answer;
    }
  } else {
    // (answersMap)
    Object.assign(answersMap, examTypeOrAnswers as Record<string, string>);
  }

  let score = 0;
  let total = 0;
  const details: { id: string; correct: boolean }[] = [];

  for (const [qid, ans] of Object.entries(answersMap)) {
    const q = getQuestionById(qid);
    if (!q) continue;
    if (q.questionType === 'objective' && q.correctAnswer) {
      total++;
      const correct = q.correctAnswer.toLowerCase() === ans.toLowerCase();
      if (correct) score++;
      details.push({ id: qid, correct });
    }
  }

  return { score, total, details };
}

export default {
  saveQuestionToDb,
  getQuestionsFromDb,
  getPublicQuestionsFromDb,
  getQuestionById,
  clearQuestionsForExamType,
  gradeAnswersServerSide,
};
