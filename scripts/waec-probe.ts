/*
 * Probe ALOC API for WAEC exam type parameter
 * Usage: npx tsx scripts/waec-probe.ts
 */

const baseUrl = process.env.NEXT_PUBLIC_QUESTIONS_API_URL || '';
const token = process.env.NEXT_PUBLIC_QUESTIONS_API_KEY || '';

const fetchFn = (globalThis as any).fetch;

if (!baseUrl || !token) {
  console.error('Please set NEXT_PUBLIC_QUESTIONS_API_URL and NEXT_PUBLIC_QUESTIONS_API_KEY in your environment');
  process.exit(1);
}

const subjectVariants = [
  'English Language',
  'english',
  'english-language',
  'English%20Language'
];

const paramNames = ['type', 'examtype'];
const typeValues = ['waec', 'wasse', 'wassec', 'wasec', 'wace', 'wassce', 'ssce', 'neco', 'waec-wassce', 'wasse/wassce'];
const limits = [5, 60];

async function probe() {
  for (const subj of subjectVariants) {
    for (const param of paramNames) {
      for (const t of typeValues) {
        for (const limit of limits) {
          const endpoint = `${baseUrl}/m/${limit}?subject=${encodeURIComponent(subj)}&${param}=${encodeURIComponent(t)}`;
          try {
            const res = await fetchFn(endpoint, {
              headers: {
                Accept: 'application/json',
                AccessToken: token,
              },
            });
            const text = await res.text();
            let parsed: any = null;
            try { parsed = JSON.parse(text); } catch (e) { parsed = text; }

            console.log(`URL: ${endpoint}`);
            console.log(`Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
              if (Array.isArray(parsed)) {
                console.log('Returned array length:', parsed.length);
              } else if (parsed && parsed.data && Array.isArray(parsed.data)) {
                console.log('Returned data array length:', parsed.data.length);
              } else {
                console.log('Response shape:', typeof parsed === 'object' ? Object.keys(parsed) : typeof parsed);
              }
            } else {
              console.log('Body:', parsed);
            }
            console.log('---');
          } catch (err) {
            console.error('Request failed:', err);
          }
        }
      }
    }
  }
}

probe().catch(err => console.error(err));
