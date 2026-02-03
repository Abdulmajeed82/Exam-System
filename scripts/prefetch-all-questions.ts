import 'dotenv/config';
import { prefetchQuestionsForOffline, getSubjectsForExam, getAvailableYears, fetchQuestionsMultiPage } from '../lib/questions-api-enhanced';
import { replaceQuestionsForSubject, clearQuestionsForExamType } from '../lib/db';
import { generateJAMBGenericQuestions, generateWAECGenericQuestions } from '../lib/generate-questions';

async function main() {
  const apiUrl = process.env.NEXT_PUBLIC_QUESTIONS_API_URL;
  const apiKeyStatus = process.env.NEXT_PUBLIC_QUESTIONS_API_KEY ? '✓ present' : '✗ missing';
  const requireApi = process.env.NEXT_PUBLIC_REQUIRE_API === 'true';
  const allowFallback = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';
  const bankSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_BANK_SIZE || '20000', 10);
  const pageSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_PAGE_SIZE || '1000', 10);

  if (!apiUrl) {
    console.error('🔴 NEXT_PUBLIC_QUESTIONS_API_URL not set. Please copy .env.example → .env.local and set your API credentials.');
    process.exit(1);
  }

  console.log('🔎 API URL:', apiUrl);
  console.log('🔑 API Key:', apiKeyStatus);
  console.log('⚙️ requireApi:', requireApi, '| allowFallback:', allowFallback);

  const years = getAvailableYears(2000).filter((y) => y <= 2026);
  console.log(`📅 Will fetch ${years.length} years: ${Math.min(...years)} - ${Math.max(...years)}`);

  // If configured to require API-sourced questions, clear local questions for those exam types first
  if (requireApi) {
    console.log('🔄 NEXT_PUBLIC_REQUIRE_API=true — clearing local JAMB & WAEC question sets before replacement.');
    clearQuestionsForExamType('jamb');
    clearQuestionsForExamType('waec');
  }

  // Prefetch and persist JAMB
  const jambSubjects = getSubjectsForExam('jamb');
  console.log(`📚 JAMB subjects to prefetch (${jambSubjects.length}):`, jambSubjects.join(', '));
  const jambFailures: string[] = [];
  for (const subj of jambSubjects) {
    console.log(`📥 Fetching JAMB - ${subj} (${bankSize} questions)...`);
    const fetched = await fetchQuestionsMultiPage('jamb', subj, undefined, bankSize, pageSize);
    if (fetched.length > 0) {
      replaceQuestionsForSubject('jamb', subj, fetched);
    } else if (allowFallback) {
      console.warn(`⚠️ API returned no questions for JAMB - ${subj}. Generating local fallback.`);
      const generated = generateJAMBGenericQuestions(subj);
      replaceQuestionsForSubject('jamb', subj, generated);
    } else {
      console.error(`❌ No questions for JAMB - ${subj}. API returned none and fallback is disabled.`);
      jambFailures.push(subj);
    }

    // Small delay to avoid hitting strict rate limits
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  const waecFailures: string[] = [];
  // Prefetch and persist WAEC
  const waecSubjects = getSubjectsForExam('waec');
  console.log(`📚 WAEC subjects to prefetch (${waecSubjects.length}):`, waecSubjects.join(', '));
  for (const subj of waecSubjects) {
    console.log(`📥 Fetching WAEC - ${subj} (${bankSize} questions)...`);
    const fetched = await fetchQuestionsMultiPage('waec', subj, undefined, bankSize, pageSize);
    if (fetched.length > 0) {
      replaceQuestionsForSubject('waec', subj, fetched);
    } else if (allowFallback) {
      console.warn(`⚠️ API returned no questions for WAEC - ${subj}. Generating local fallback.`);
      const generated = generateWAECGenericQuestions(subj);
      replaceQuestionsForSubject('waec', subj, generated);
    } else {
      console.error(`❌ No questions for WAEC - ${subj}. API returned none and fallback is disabled.`);
      waecFailures.push(subj);
    }

    // Small delay to avoid hitting strict rate limits
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  // Post-run coverage summary
  const jambZero: string[] = [];
  const waecZero: string[] = [];

  console.log('\n🔎 Verifying persisted question counts...');
  for (const subj of jambSubjects) {
    const q = await (await import('../lib/db')).getQuestionsByExamType('jamb', subj);
    if (!q || q.length === 0) jambZero.push(subj);
  }
  for (const subj of waecSubjects) {
    const q = await (await import('../lib/db')).getQuestionsByExamType('waec', subj);
    if (!q || q.length === 0) waecZero.push(subj);
  }

  console.log('\n✅ Prefetch and persist complete for JAMB & WAEC (2000-2026).');
  if (jambFailures.length || waecFailures.length) {
    console.warn('⚠️ Some subjects had API failures during fetch. See failures list below.');
    if (jambFailures.length) console.warn('JAMB failures:', jambFailures.join(', '));
    if (waecFailures.length) console.warn('WAEC failures:', waecFailures.join(', '));
  }

  if (jambZero.length || waecZero.length) {
    console.warn('\n⚠️ Subjects with ZERO persisted questions after prefetch:');
    if (jambZero.length) console.warn('JAMB:', jambZero.join(', '));
    if (waecZero.length) console.warn('WAEC:', waecZero.join(', '));
  } else {
    console.log('\n✅ All subjects have at least one persisted question.');
  }

  console.log('\n⚠️ Note: Prefetch may take a long time; reduce NEXT_PUBLIC_QUESTION_BANK_SIZE for faster runs during testing.');
}

main().catch((err) => {
  console.error('❌ Prefetch failed:', err);
  process.exit(1);
});