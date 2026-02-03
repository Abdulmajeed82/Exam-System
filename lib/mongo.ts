import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { Question } from './types';

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'exam-practice-system';

let client: MongoClient | null = null;
let db: Db | null = null;

async function connect() {
  if (db && client) return { client, db };

  client = new MongoClient(MONGO_URL, {});
  await client.connect();
  db = client.db(DB_NAME);
  return { client, db };
}

function toQuestion(doc: any): Question {
  return {
    id: doc._id?.toString() || doc.id,
    subject: doc.subject,
    examType: doc.examType,
    questionType: doc.questionType,
    questionNumber: doc.questionNumber,
    questionText: doc.questionText,
    year: doc.year,
    options: doc.options || undefined,
    correctAnswer: doc.correctAnswer || undefined,
    explanation: doc.explanation || '',
    essayAnswer: doc.essayAnswer || undefined,
    createdAt: doc.createdAt || undefined,
  } as Question;
}

export async function saveQuestionToDb(q: Partial<Question> & { id?: string }): Promise<Question> {
  const { db } = await connect();
  const coll = db!.collection('questions');

  const now = new Date().toISOString();
  const payload: any = {
    subject: q.subject || 'Unknown',
    examType: q.examType || 'common-entrance',
    questionType: q.questionType || 'objective',
    questionNumber: q.questionNumber || 0,
    questionText: q.questionText || '',
    year: q.year || new Date().getFullYear(),
    options: q.options || null,
    correctAnswer: q.correctAnswer || null,
    explanation: q.explanation || null,
    essayAnswer: q.essayAnswer || null,
    createdAt: q.createdAt || now,
  };

  if (q.id) {
    // try update by string id (assume _id or id)
    try {
      const oid = new ObjectId(q.id);
      await coll.updateOne({ _id: oid }, { $set: payload }, { upsert: true });
      const doc = await coll.findOne({ _id: oid });
      return toQuestion(doc);
    } catch (e) {
      // fallback to using custom id field
      payload.id = q.id;
      await coll.updateOne({ id: q.id }, { $set: payload }, { upsert: true });
      const doc = await coll.findOne({ id: q.id });
      return toQuestion(doc);
    }
  }

  const r = await coll.insertOne(payload);
  const doc = await coll.findOne({ _id: r.insertedId });
  return toQuestion(doc);
}

export async function getQuestionsFromDb(
  examType: 'common-entrance' | 'waec' | 'jamb',
  subject?: string
): Promise<Question[]> {
  const { db } = await connect();
  const coll = db!.collection('questions');
  const q: any = { examType };
  if (subject) q.subject = { $regex: new RegExp(`^${subject}$`, 'i') };

  const docs = await coll.find(q).toArray();
  return docs.map(toQuestion);
}

export async function getPublicQuestionsFromDb(
  examType: 'common-entrance' | 'waec' | 'jamb',
  subject?: string
) {
  const questions = await getQuestionsFromDb(examType, subject);
  return questions.map(({ correctAnswer, ...rest }) => rest);
}

export async function getQuestionById(id: string): Promise<Question | undefined> {
  const { db } = await connect();
  const coll = db!.collection('questions');

  // try _id
  try {
    const doc = await coll.findOne({ _id: new ObjectId(id) });
    if (doc) return toQuestion(doc);
  } catch (e) {
    // ignore
  }

  const doc = await coll.findOne({ id });
  if (!doc) return undefined;
  return toQuestion(doc);
}

export async function clearQuestionsForExamType(examType: 'common-entrance' | 'waec' | 'jamb') {
  const { db } = await connect();
  const coll = db!.collection('questions');
  await coll.deleteMany({ examType });
}

export async function deleteQuestionById(id: string): Promise<boolean> {
  const { db } = await connect();
  const coll = db!.collection('questions');

  // try delete by ObjectId
  try {
    const oid = new ObjectId(id);
    const r = await coll.deleteOne({ _id: oid });
    if (r.deletedCount && r.deletedCount > 0) return true;
  } catch (e) {
    // not an ObjectId or failed - try id field
  }

  const r2 = await coll.deleteOne({ id });
  return (r2.deletedCount || 0) > 0;
}

export async function gradeAnswersServerSide(
  examTypeOrAnswers: 'common-entrance' | 'waec' | 'jamb' | Record<string, string> | Array<{ id: string; answer: string }>,
  maybeAnswers?: Array<{ id: string; answer: string }>
): Promise<{ score: number; total: number; details: { id: string; correct: boolean }[] }> {
  const answersMap: Record<string, string> = {};

  if (typeof examTypeOrAnswers === 'string') {
    const arr = maybeAnswers || [];
    for (const a of arr) {
      if (a && typeof a.id === 'string') answersMap[a.id] = a.answer;
    }
  } else if (Array.isArray(examTypeOrAnswers)) {
    for (const a of examTypeOrAnswers) {
      if (a && typeof a.id === 'string') answersMap[a.id] = a.answer;
    }
  } else {
    Object.assign(answersMap, examTypeOrAnswers as Record<string, string>);
  }

  let score = 0;
  let total = 0;
  const details: { id: string; correct: boolean }[] = [];

  // load questions in batch
  const ids = Object.keys(answersMap);
  if (ids.length === 0) return { score: 0, total: 0, details };

  const { db } = await connect();
  const coll = db!.collection('questions');

  // map possible _id or id
  const objectIds = ids.reduce((acc: ObjectId[], cur) => {
    try {
      acc.push(new ObjectId(cur));
    } catch (e) {
      // not an ObjectId
    }
    return acc;
  }, []);

  const query: any = { $or: [{ _id: { $in: objectIds } }, { id: { $in: ids } }] };
  const docs = await coll.find(query).toArray();

  for (const doc of docs) {
    const qid = doc._id?.toString() || doc.id;
    const ans = answersMap[qid];
    if (!doc || !doc.questionType || doc.questionType !== 'objective') continue;
    if (!doc.correctAnswer) continue;
    total++;
    const correct = String(doc.correctAnswer).toLowerCase() === String(ans).toLowerCase();
    if (correct) score++;
    details.push({ id: qid, correct });
  }

  return { score, total, details };
}

export default {
  saveQuestionToDb,
  getQuestionsFromDb,
  getPublicQuestionsFromDb,
  getQuestionById,
  clearQuestionsForExamType,
  deleteQuestionById,
  gradeAnswersServerSide,
};
