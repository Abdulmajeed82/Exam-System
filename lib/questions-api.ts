import { Question } from './types';

/**
 * API Service for fetching WAEC and JAMB past questions
 * This service can be configured to use different API providers
 */

// API Configuration
const API_CONFIG = {
  // You can configure different API endpoints here
  // Example: https://questions.aloc.com.ng/api/v2/
  // Or use a custom backend API
  baseUrl: process.env.NEXT_PUBLIC_QUESTIONS_API_URL || '',
  apiKey: process.env.NEXT_PUBLIC_QUESTIONS_API_KEY || '',
};

/**
 * Fetch questions from external API
 * This is a template function that can be adapted to different API providers
 */
export async function fetchQuestionsFromAPI(
  examType: 'waec' | 'jamb',
  subject: string,
  year?: number,
  limit: number = 60
): Promise<Question[]> {
  try {
    // If no API is configured, return empty array
    if (!API_CONFIG.baseUrl) {
      console.warn('No API URL configured. Using local questions only.');
      return [];
    }

    const params = new URLSearchParams({
      exam: examType,
      subject: subject.toLowerCase(),
      limit: limit.toString(),
      ...(year && { year: year.toString() }),
    });

    const response = await fetch(`${API_CONFIG.baseUrl}/questions?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(API_CONFIG.apiKey && { 'Authorization': `Bearer ${API_CONFIG.apiKey}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform API response to our Question format
    return transformAPIResponse(data, examType);
  } catch (error) {
    console.error('Error fetching questions from API:', error);
    return [];
  }
}

/**
 * Transform API response to our Question format
 * Adapt this function based on your API provider's response structure
 */
function transformAPIResponse(data: any, examType: 'waec' | 'jamb'): Question[] {
  if (!data || !Array.isArray(data.questions)) {
    return [];
  }

  return data.questions.map((q: any, index: number) => ({
    id: q.id || `${examType.toUpperCase()}-${q.subject}-${index + 1}`,
    subject: q.subject || '',
    examType: examType,
    questionType: q.type || (examType === 'jamb' ? 'objective' : 'objective'),
    questionNumber: index + 1,
    questionText: q.question || q.text || '',
    year: q.year || new Date().getFullYear(),
    options: q.options ? {
      a: q.options.a || q.options[0] || '',
      b: q.options.b || q.options[1] || '',
      c: q.options.c || q.options[2] || '',
      d: q.options.d || q.options[3] || '',
    } : undefined,
    correctAnswer: q.answer || q.correct_answer || 'a',
    explanation: q.explanation || q.solution || 'No explanation available.',
    essayAnswer: q.essay_answer || q.sample_answer,
    createdAt: new Date().toISOString(),
  }));
}

/**
 * Get available years for past questions
 */
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  // Generate years from 2000 to current year
  for (let year = 2000; year <= currentYear; year++) {
    years.push(year);
  }
  
  return years.reverse(); // Most recent first
}

/**
 * Get subjects available for an exam type
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
    ];
  }
}

/**
 * Validate that we have exactly 60 questions for JAMB/WAEC
 */
export function validateQuestionCount(
  questions: Question[],
  examType: 'waec' | 'jamb'
): { valid: boolean; message: string } {
  const expectedCount = 60;
  
  if (questions.length < expectedCount) {
    return {
      valid: false,
      message: `Insufficient questions. Expected ${expectedCount}, got ${questions.length}`,
    };
  }
  
  if (questions.length > expectedCount) {
    return {
      valid: true,
      message: `Trimming to ${expectedCount} questions`,
    };
  }
  
  return {
    valid: true,
    message: 'Question count is valid',
  };
}

/**
 * Ensure questions array has exactly 60 questions
 */
export function normalizeQuestionCount(questions: Question[]): Question[] {
  const targetCount = 60;
  
  if (questions.length >= targetCount) {
    return questions.slice(0, targetCount);
  }
  
  // If we have fewer than 60, return what we have
  // In production, you'd want to fetch more or show an error
  return questions;
}
