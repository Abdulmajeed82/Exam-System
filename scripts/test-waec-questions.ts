import { getQuestionsByExamType, getAllQuestions } from '../lib/db';

async function logSubjectCount(subject: string) {
  const q = await getQuestionsByExamType('waec', subject);
  console.log(`${subject}: ${q.length} questions`);
}

(async () => {
  console.log('Total Questions in DB:', getAllQuestions().length);
  await logSubjectCount('Mathematics');
  await logSubjectCount('English Language');
  await logSubjectCount('Physics');
  await logSubjectCount('History');

  // Print sample question
  const math = await getQuestionsByExamType('waec', 'Mathematics');
  if (math.length > 0) {
    console.log('Sample:', math[0]);
  } else {
    console.log('No WAEC Mathematics questions found');
  }
})();
