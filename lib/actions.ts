import mongo from './mongo';
import { Question } from './types';

// Server-side action: Save question to MongoDB
export async function saveQuestion(question: Partial<Question>): Promise<Question> {
  // Basic validation
  if (!question.subject || !question.questionText) {
    throw new Error('subject and questionText are required');
  }

  const saved = await mongo.saveQuestionToDb(question as any);
  return saved;
}

// Replace/clear exposures for convenience
export async function clearQuestionsForExamType(examType: 'common-entrance' | 'waec' | 'jamb') {
  await mongo.clearQuestionsForExamType(examType);
}
