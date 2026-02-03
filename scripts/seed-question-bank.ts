/**
 * Seed Question Bank Script
 * Usage: npx tsx scripts/seed-question-bank.ts
 *
 * This script will prefetch large banks (default: NEXT_PUBLIC_QUESTION_BANK_SIZE)
 * for all WAEC and JAMB subjects defined in `lib/subjects.ts` and store them
 * in local storage (when run in browser) or persist to local JSON cache when run in Node.
 *
 * Be careful: fetching 20k-60k questions per subject may be slow and costly. Ensure
 * your API key and limits are sufficient before running.
 */

import fs from 'fs';
import path from 'path';
import { fetchQuestionsMultiPage } from '../lib/questions-api-enhanced';
import { getSubjectsForExam } from '../lib/questions-api-enhanced';

async function seed() {
  const bankSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_BANK_SIZE || '20000', 10);
  const pageSize = parseInt(process.env.NEXT_PUBLIC_QUESTION_PAGE_SIZE || '1000', 10);

  console.log('🔧 Seeding question bank...');
  console.log('Bank size per subject:', bankSize);
  console.log('Page size:', pageSize);

  const waecSubjects = getSubjectsForExam('waec');
  const jambSubjects = getSubjectsForExam('jamb');

  // Combine unique subjects and seed each
  const subjects = Array.from(new Set([...waecSubjects, ...jambSubjects]));

  const outputDir = path.resolve(__dirname, '..', 'data', 'seeded-question-banks');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (const subject of subjects) {
    try {
      console.log(`📥 Fetching ${bankSize} questions for: ${subject} ...`);
      const questions = await fetchQuestionsMultiPage(
        waecSubjects.includes(subject) ? 'waec' : 'jamb',
        subject,
        undefined,
        bankSize,
        pageSize
      );

      console.log(`✅ Fetched ${questions.length} questions for ${subject}`);
      const filename = path.join(outputDir, `${subject.replace(/[^a-z0-9]+/gi, '-')}.json`);
      fs.writeFileSync(filename, JSON.stringify(questions, null, 2));
      console.log(`💾 Saved to ${filename}`);

      // small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`❌ Failed to fetch for ${subject}:`, error);
    }
  }

  console.log('🎉 Seeding complete');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});