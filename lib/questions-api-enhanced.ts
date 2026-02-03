import { Question } from './types';

/**
 * Enhanced API Service for WAEC and JAMB Past Questions
 * Supports 20,000-60,000 questions with caching, pagination, and offline support
 */

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_QUESTIONS_API_URL || '',
  apiKey: process.env.NEXT_PUBLIC_QUESTIONS_API_KEY || '',
  waecUrl: process.env.NEXT_PUBLIC_WAEC_API_URL || '',
  jambUrl: process.env.NEXT_PUBLIC_JAMB_API_URL || '',
  enableCache: process.env.NEXT_PUBLIC_ENABLE_QUESTION_CACHE === 'true',
  cacheDuration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION_HOURS || '24') * 60 * 60 * 1000,
};

// Cache interface
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache
const memoryCache = new Map<string, CachedData<any>>();

/**
 * Generate cache key
 */
function getCacheKey(examType: string, subject: string, year?: number, page?: number): string {
  return `${examType}-${subject}-${year || 'all'}-${page || 1}`;
}

/**
 * Check if cached data is valid
 */
function isCacheValid<T>(cached: CachedData<T> | undefined): boolean {
  if (!cached || !API_CONFIG.enableCache) return false;
  return Date.now() < cached.expiresAt;
}

/**
 * Get from cache
 */
function getFromCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached && isCacheValid(cached)) {
    console.log(`✅ Cache hit: ${key}`);
    return cached.data;
  }
  return null;
}

/**
 * Save to cache
 */
function saveToCache<T>(key: string, data: T): void {
  if (!API_CONFIG.enableCache) return;
  
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + API_CONFIG.cacheDuration,
  });
  
  console.log(`💾 Cached: ${key}`);
}

/**
 * Clear cache for specific exam type or all
 */
export function clearCache(examType?: 'waec' | 'jamb'): void {
  if (examType) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(examType)) {
        memoryCache.delete(key);
      }
    }
    console.log(`🗑️ Cleared ${examType} cache`);
  } else {
    memoryCache.clear();
    console.log('🗑️ Cleared all cache');
  }
}

/**
 * Fetch with retry and exponential backoff and timeout support
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  timeoutMs: number = 15000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);

      if (response.ok) {
        return response;
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000 * (i + 1);
        console.warn(`⏳ Rate limited. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Handle server errors
      if (response.status >= 500) {
        console.warn(`⚠️ Server error ${response.status}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      // For client errors (400-499), return response for caller to inspect
      return response;
    } catch (error) {
      clearTimeout(id);
      if (i === retries - 1) {
        throw error;
      }
      console.warn(`⚠️ Request failed. Retry ${i + 1}/${retries}... (${String(error)})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Fetch questions from external API with pagination support
 */
export async function fetchQuestionsFromAPI(
  examType: 'waec' | 'jamb',
  subject: string,
  year?: number,
  limit: number = 60,
  page: number = 1
): Promise<Question[]> {
  try {
    if (!API_CONFIG.baseUrl) {
      console.warn('⚠️ No API URL configured. Using local questions only.');
      return [];
    }

    // Check cache first
    const cacheKey = getCacheKey(examType, subject, year, page);
    const cached = getFromCache<Question[]>(cacheKey);
    if (cached) return cached;

    // Determine API endpoint base
    const baseUrl = examType === 'waec' ? (API_CONFIG.waecUrl || API_CONFIG.baseUrl) : (API_CONFIG.jambUrl || API_CONFIG.baseUrl);

    // Generate subject variants to try different API naming conventions
    function generateSubjectVariants(name: string): string[] {
      const lower = name.toLowerCase();
      const variants = new Set<string>([
        lower,
        lower.replace(/\s+/g, '-'),
        lower.replace(/\s+/g, '_'),
        lower.replace(/\s+/g, ''),
        lower.split(' ')[0],
      ]);

      // Common shorthand mappings
      const synonyms: Record<string, string[]> = {
        'english language': ['english', 'english-language', 'english_language'],
        'mathematics': ['mathematics', 'math', 'maths'],
        'further mathematics': ['further-mathematics', 'furthermathematics', 'fm'],
        'literature-in-english': ['literature', 'literature-in-english'],
      };

      const normalized = name.toLowerCase().replace(/\s+/g, ' ').trim();
      if (synonyms[normalized]) synonyms[normalized].forEach(s => variants.add(s));

      return Array.from(variants);
    }

    const variants = generateSubjectVariants(subject);

    // Build other params
    const extraParams: Record<string, string> = {
      page: page.toString(),
      ...(year && { year: year.toString() }),
      ...(limit && { limit: limit.toString() }),
    };

    // Try endpoints for each subject variant until we get valid questions
    for (const subjVariant of variants) {
      const params = new URLSearchParams({ subject: subjVariant, ...extraParams });
      const endpoint = (limit && limit > 40) ? `${baseUrl}/m/${limit}?${params}` : `${baseUrl}/q?${params}`;

      try {
        const response = await fetchWithRetry(
          endpoint,
          {
            headers: {
              'Accept': 'application/json',
              ...(API_CONFIG.apiKey && { 'AccessToken': API_CONFIG.apiKey }),
            },
          },
          4, // retries
          20000 // timeout ms
        );

        // If client error, skip variant
        if (!response.ok && response.status >= 400 && response.status < 500) {
          const bodyText = await response.text().catch(() => '');
          console.warn(`⚠️ API returned ${response.status} for subject variant '${subjVariant}': ${bodyText.substring(0,200)}`);
          continue;
        }

        // Check content-type before parsing
        const contentType = response.headers.get('content-type') || '';
        let data: any;
        try {
          if (contentType.includes('application/json') || contentType.includes('application/vnd.api+json')) {
            data = await response.json();
          } else {
            // Fallback: try to parse JSON even if content-type is wrong, else log and continue
            const text = await response.text();
            try { data = JSON.parse(text); }
            catch (e) {
              console.warn(`⚠️ Non-JSON response for ${subjVariant}: ${text.substring(0,200)}`);
              continue;
            }
          }
        } catch (err) {
          console.warn(`⚠️ Failed to parse response for ${subjVariant}: ${String(err)}`);
          continue;
        }

        const questions = transformAPIResponse(data, examType);

        if (questions.length > 0) {
          saveToCache(getCacheKey(examType, subject, year, page), questions);
          console.log(`✅ Fetched ${questions.length} questions from API (variant: ${subjVariant})`);
          return questions;
        }

        // else: continue to next variant
      } catch (err) {
        console.warn(`⚠️ Error fetching for variant '${subjVariant}': ${String(err)}`);
        continue;
      }
    }

    console.warn(`⚠️ No API result for subject '${subject}' after trying ${variants.length} variants.`);
    return [];
  } catch (error) {
    console.error('❌ Error fetching questions from API:', error);
    return [];
  }
}

/**
 * Fetch multiple pages of questions (for large datasets)
 */
export async function fetchQuestionsMultiPage(
  examType: 'waec' | 'jamb',
  subject: string,
  year?: number,
  totalQuestions: number = 60,
  questionsPerPage: number = 60
): Promise<Question[]> {
  const pages = Math.ceil(totalQuestions / questionsPerPage);
  const allQuestions: Question[] = [];
  
  console.log(`📚 Fetching ${totalQuestions} questions across ${pages} pages...`);
  
  for (let page = 1; page <= pages; page++) {
    const questions = await fetchQuestionsFromAPI(
      examType,
      subject,
      year,
      questionsPerPage,
      page
    );
    
    allQuestions.push(...questions);
    
    // Stop if we have enough questions
    if (allQuestions.length >= totalQuestions) {
      break;
    }
    
    // Small delay to avoid rate limiting
    if (page < pages) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return allQuestions.slice(0, totalQuestions);
}

/**
 * Fetch questions by year range (for comprehensive practice)
 */
export async function fetchQuestionsByYearRange(
  examType: 'waec' | 'jamb',
  subject: string,
  startYear: number,
  endYear: number,
  questionsPerYear: number = 60
): Promise<Map<number, Question[]>> {
  const questionsByYear = new Map<number, Question[]>();
  
  console.log(`📅 Fetching questions from ${startYear} to ${endYear}...`);
  
  for (let year = startYear; year <= endYear; year++) {
    const questions = await fetchQuestionsFromAPI(
      examType,
      subject,
      year,
      questionsPerYear
    );
    
    if (questions.length > 0) {
      questionsByYear.set(year, questions);
      console.log(`✅ ${year}: ${questions.length} questions`);
    }
    
    // Small delay between years
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return questionsByYear;
}

/**
 * Transform API response to our Question format
 */
function transformAPIResponse(data: any, examType: 'waec' | 'jamb'): Question[] {
  // Support multiple ALOC response shapes:
  // - { subject, status, data: { id, question, option, answer, examtype, examyear } }
  // - { subject, status, data: [ { ... }, ... ] }
  let rawQuestions: any[] = [];

  if (!data) return [];

  if (Array.isArray(data)) {
    rawQuestions = data;
  } else if (Array.isArray(data?.data)) {
    rawQuestions = data.data;
  } else if (data?.data && typeof data.data === 'object' && data.data.question) {
    rawQuestions = [data.data];
  } else if (Array.isArray(data?.questions)) {
    rawQuestions = data.questions;
  } else if (Array.isArray(data?.data?.questions)) {
    rawQuestions = data.data.questions;
  } else {
    // Fallback: try to find any array under data
    const possible = data?.data || data;
    if (Array.isArray(possible)) rawQuestions = possible;
  }

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    console.warn('⚠️ Invalid or empty API response structure');
    return [];
  }

  return rawQuestions
    .map((q: any, index: number): Question | null => {
      try {
        // Map ALOC naming conventions
        const options = q.option || q.options || q.choices || q.optionsMap;

        return {
          id: q.id ? String(q.id) : `${examType.toUpperCase()}-${(q.subject || subjectFallback(q)).replace(/\s+/g, '-')}-${index + 1}`,
          subject: q.subject || subjectFallback(q),
          examType: examType as 'waec' | 'jamb',
          questionType: (q.questionType || q.type || (q.examtype ? 'objective' : 'objective')) as 'objective' | 'essay',
          questionNumber: q.number || q.questionNumber || index + 1,
          questionText: q.question || q.questionText || q.text || '',
          year: Number(q.examyear || q.year) || new Date().getFullYear(),
          options: options ? {
            a: options.a || options.A || options[0] || '',
            b: options.b || options.B || options[1] || '',
            c: options.c || options.C || options[2] || '',
            d: options.d || options.D || options[3] || '',
          } : undefined,
          correctAnswer: (q.answer || q.correct_answer || q.correctAnswer || 'a').toLowerCase() as 'a' | 'b' | 'c' | 'd',
          explanation: q.explanation || q.solution || q.hint || 'No explanation available.',
          essayAnswer: q.essay_answer || q.sample_answer || q.essayAnswer,
          createdAt: new Date().toISOString(),
        } as Question;
      } catch (error) {
        console.warn('⚠️ Failed to transform question:', error);
        return null;
      }
    })
    .filter((q): q is Question => q !== null);
}

function subjectFallback(q: any): string {
  return q.subject || q.category || q.subject_name || 'Unknown';
}

/**
 * Validate question data
 */
export function validateQuestion(q: any): q is Question {
  return (
    typeof q === 'object' &&
    typeof q.id === 'string' &&
    typeof q.subject === 'string' &&
    typeof q.questionText === 'string' &&
    typeof q.examType === 'string' &&
    (q.examType === 'waec' || q.examType === 'jamb' || q.examType === 'common-entrance') &&
    typeof q.year === 'number' &&
    q.year >= 2000 &&
    q.year <= new Date().getFullYear()
  );
}

/**
 * Get available subjects for exam type
 */
export function getSubjectsForExam(examType: 'waec' | 'jamb'): string[] {
  if (examType === 'jamb') {
    return [
      'English Language',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Economics',
      'Commerce',
      'Accounting',
      'Government',
      'Literature in English',
      'Christian Religious Studies',
      'Islamic Religious Studies',
      'Geography',
      'Agricultural Science',
      'Computer Studies',
    ];
  } else {
    // WAEC subjects
    return [
      'English Language',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Economics',
      'Commerce',
      'Accounting',
      'Government',
      'Literature in English',
      'Christian Religious Studies',
      'Islamic Religious Studies',
      'Geography',
      'Agricultural Science',
      'Further Mathematics',
      'Technical Drawing',
      'Civic Education',
      'Computer Studies',
      'French',
      'Yoruba',
      'Igbo',
      'Hausa',
    ];
  }
}

/**
 * Get available years for past questions
 */
export function getAvailableYears(startYear: number = 2000): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }
  
  return years;
}

/**
 * Test API connection
 */
export async function testAPIConnection(): Promise<{
  success: boolean;
  message: string;
  questionsCount?: number;
}> {
  try {
    if (!API_CONFIG.baseUrl) {
      return {
        success: false,
        message: 'API URL not configured',
      };
    }

    const questions = await fetchQuestionsFromAPI('jamb', 'Mathematics', undefined, 5);
    
    if (questions.length > 0) {
      return {
        success: true,
        message: 'API connection successful',
        questionsCount: questions.length,
      };
    } else {
      return {
        success: false,
        message: 'API returned no questions',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get question statistics from API
 */
export async function getQuestionStats(
  examType: 'waec' | 'jamb'
): Promise<{
  totalQuestions: number;
  subjects: Record<string, number>;
  years: Record<number, number>;
}> {
  const stats = {
    totalQuestions: 0,
    subjects: {} as Record<string, number>,
    years: {} as Record<number, number>,
  };

  try {
    const subjects = getSubjectsForExam(examType);
    
    for (const subject of subjects) {
      const questions = await fetchQuestionsFromAPI(examType, subject, undefined, 1);
      if (questions.length > 0) {
        stats.subjects[subject] = questions.length;
        stats.totalQuestions += questions.length;
      }
    }
  } catch (error) {
    console.error('Error fetching question stats:', error);
  }

  return stats;
}

/**
 * Pre-fetch questions for offline use
 */
export async function prefetchQuestionsForOffline(
  examType: 'waec' | 'jamb',
  subjects: string[],
  years: number[]
): Promise<void> {
  console.log('📥 Pre-fetching questions for offline use...');
  
  for (const subject of subjects) {
    for (const year of years) {
      await fetchQuestionsFromAPI(examType, subject, year, 60);
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log('✅ Pre-fetch complete');
}

/**
 * Export cache statistics
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
  totalSize: string;
} {
  const keys = Array.from(memoryCache.keys());
  const totalBytes = JSON.stringify(Array.from(memoryCache.values())).length;
  
  return {
    size: memoryCache.size,
    keys,
    totalSize: `${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
  };
}
