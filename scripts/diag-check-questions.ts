import {
  fetchQuestionsFromAPI,
  getSubjectsForExam,
} from '../lib/questions-api-enhanced';
import {
  getQuestionsByExamType,
  getAllQuestions,
  getSubjectsByExamType,
} from '../lib/db';

async function checkExam(examType: 'waec' | 'jamb') {
  console.log(`\n=== Checking ${examType.toUpperCase()} subjects ===`);
  const apiSubjects = getSubjectsForExam(examType);
  console.log(`API-reported subjects (${apiSubjects.length}):`, apiSubjects.join(', '));

  const localSubjects = getSubjectsByExamType(examType);
  console.log(`Local DB subjects (${localSubjects.length}):`, localSubjects.join(', '));

  const problems: string[] = [];

  for (const subj of apiSubjects) {
    try {
      const apiResult = await fetchQuestionsFromAPI(examType, subj, undefined, 1, 1);
      const apiCount = apiResult.length;
      const localQuestions = await getQuestionsByExamType(examType, subj);
      const localCount = localQuestions.length;

      console.log(`- ${subj} | API: ${apiCount} | Local: ${localCount}`);

      if (apiCount === 0 && localCount === 0) {
        problems.push(subj);
      }
    } catch (err) {
      console.error(`Error checking ${subj}:`, err);
      problems.push(subj);
    }

    // brief delay to be friendly to API
    await new Promise((r) => setTimeout(r, 100));
  }

  if (problems.length > 0) {
    console.warn(`⚠️ Subjects with no questions (API and Local): ${problems.join(', ')}`);
  } else {
    console.log(`✅ All subjects returned at least one question from API or local DB.`);
  }
}

async function main() {
  console.log('🔎 Environment:');
  console.log('NEXT_PUBLIC_QUESTIONS_API_URL=', process.env.NEXT_PUBLIC_QUESTIONS_API_URL);
  console.log('NEXT_PUBLIC_QUESTIONS_API_KEY=', process.env.NEXT_PUBLIC_QUESTIONS_API_KEY ? '✓ set' : '✗ not set');
  console.log('NEXT_PUBLIC_REQUIRE_API=', process.env.NEXT_PUBLIC_REQUIRE_API);
  console.log('NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK=', process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK);

  const totalLocal = getAllQuestions().length;
  console.log('\nTotal local questions:', totalLocal);

  await checkExam('jamb');
  await checkExam('waec');

  console.log('\nDiagnostic complete.');
}

main().catch((err) => {
  console.error('Diagnostic failed:', err);
  process.exit(1);
});