'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  fetchQuestionsFromAPI, 
  fetchQuestionsMultiPage,
  fetchQuestionsByYearRange,
  testAPIConnection,
  getQuestionStats,
  clearCache,
  getCacheStats,
  prefetchQuestionsForOffline,
  getSubjectsForExam,
  getAvailableYears
} from '@/lib/questions-api-enhanced';
import { Question } from '@/lib/types';

/**
 * Example Component: Using WAEC/JAMB API with 20K-60K Questions
 * 
 * This demonstrates various ways to fetch and use questions from the API
 */
export default function APIUsageExample() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  // Test API connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    const result = await testAPIConnection();
    setApiStatus(result.success ? 'connected' : 'disconnected');
    if (!result.success) {
      setError(result.message);
    }
  };

  // Example 1: Fetch 60 JAMB Mathematics questions
  const fetchJAMBMath = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestionsFromAPI('jamb', 'Mathematics', 2024, 60);
      setQuestions(data);
      console.log(`✅ Fetched ${data.length} JAMB Mathematics questions`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Fetch 60 WAEC English questions
  const fetchWAECEnglish = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestionsFromAPI('waec', 'English Language', 2023, 60);
      setQuestions(data);
      console.log(`✅ Fetched ${data.length} WAEC English questions`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Fetch 300 questions across multiple pages
  const fetchMultiplePages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuestionsMultiPage('jamb', 'Physics', 2024, 300, 60);
      setQuestions(data);
      console.log(`✅ Fetched ${data.length} questions across multiple pages`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Fetch questions from multiple years (2020-2024)
  const fetchMultipleYears = async () => {
    setLoading(true);
    setError(null);
    try {
      const questionsByYear = await fetchQuestionsByYearRange('jamb', 'Chemistry', 2020, 2024, 60);
      
      // Flatten all questions
      const allQuestions: Question[] = [];
      questionsByYear.forEach((questions, year) => {
        allQuestions.push(...questions);
      });
      
      setQuestions(allQuestions);
      console.log(`✅ Fetched ${allQuestions.length} questions from 2020-2024`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  // Example 5: Get question statistics
  const showStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await getQuestionStats('jamb');
      console.log('📊 Question Statistics:', stats);
      alert(`Total Questions: ${stats.totalQuestions}\nSubjects: ${Object.keys(stats.subjects).length}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  // Example 6: Pre-fetch for offline use
  const prefetchForOffline = async () => {
    setLoading(true);
    setError(null);
    try {
      const subjects = ['Mathematics', 'English Language', 'Physics'];
      const years = [2024, 2023, 2022];
      
      await prefetchQuestionsForOffline('jamb', subjects, years);
      alert('✅ Questions pre-fetched for offline use!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prefetch');
    } finally {
      setLoading(false);
    }
  };

  // Example 7: Clear cache
  const handleClearCache = () => {
    clearCache();
    const stats = getCacheStats();
    alert(`Cache cleared! Previous size: ${stats.totalSize}`);
  };

  // Example 8: Show cache statistics
  const showCacheStats = () => {
    const stats = getCacheStats();
    console.log('💾 Cache Statistics:', stats);
    alert(`Cache Size: ${stats.size} entries\nTotal Size: ${stats.totalSize}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WAEC & JAMB API Integration Examples</CardTitle>
          <CardDescription>
            Demonstrating how to use the API with 20,000-60,000 past questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Status */}
          <Alert variant={apiStatus === 'connected' ? 'default' : 'destructive'}>
            <AlertDescription>
              API Status: {apiStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}
              {error && ` - ${error}`}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={fetchJAMBMath} disabled={loading}>
              JAMB Math (60)
            </Button>
            <Button onClick={fetchWAECEnglish} disabled={loading}>
              WAEC English (60)
            </Button>
            <Button onClick={fetchMultiplePages} disabled={loading}>
              Multi-Page (300)
            </Button>
            <Button onClick={fetchMultipleYears} disabled={loading}>
              Multi-Year (2020-2024)
            </Button>
            <Button onClick={showStats} disabled={loading} variant="outline">
              Show Stats
            </Button>
            <Button onClick={prefetchForOffline} disabled={loading} variant="outline">
              Prefetch Offline
            </Button>
            <Button onClick={showCacheStats} variant="outline">
              Cache Stats
            </Button>
            <Button onClick={handleClearCache} variant="destructive">
              Clear Cache
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading questions...</p>
            </div>
          )}

          {/* Questions Display */}
          {!loading && questions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Loaded {questions.length} Questions
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {questions.slice(0, 10).map((q, index) => (
                  <Card key={q.id}>
                    <CardContent className="pt-4">
                      <p className="font-medium">
                        Q{index + 1}: {q.questionText}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {q.examType.toUpperCase()} • {q.subject} • {q.year}
                      </p>
                      {q.options && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>A: {q.options.a}</div>
                          <div>B: {q.options.b}</div>
                          <div>C: {q.options.c}</div>
                          <div>D: {q.options.d}</div>
                        </div>
                      )}
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Answer: {q.correctAnswer?.toUpperCase()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {questions.length > 10 && (
                  <p className="text-center text-muted-foreground">
                    ... and {questions.length - 10} more questions
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Subjects & Years */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available JAMB Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getSubjectsForExam('jamb').map(subject => (
                <span key={subject} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                  {subject}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Years</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getAvailableYears(2015).map(year => (
                <span key={year} className="px-3 py-1 bg-secondary/10 rounded-full text-sm">
                  {year}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Basic Fetch (60 questions)</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`const questions = await fetchQuestionsFromAPI(
  'jamb',           // Exam type
  'Mathematics',    // Subject
  2024,            // Year (optional)
  60               // Limit
);`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Large Dataset (1000+ questions)</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`const questions = await fetchQuestionsMultiPage(
  'waec',
  'Physics',
  2024,
  1000,  // Total questions needed
  60     // Questions per page
);`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Multiple Years</h4>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`const questionsByYear = await fetchQuestionsByYearRange(
  'jamb',
  'Chemistry',
  2020,  // Start year
  2024,  // End year
  60     // Questions per year
);`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
