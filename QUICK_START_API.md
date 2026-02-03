# Quick Start: WAEC & JAMB API Integration

## 🚀 Getting Started in 5 Minutes

### Step 1: Get API Credentials

Choose one of these providers:

#### Option A: ALOC API (Recommended)
1. Visit: https://questions.aloc.com.ng
2. Sign up for an account
3. Navigate to API section
4. Copy your API key

#### Option B: MySchool API
1. Visit: https://myschool.ng
2. Contact support for API access
3. Get your API credentials

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

Add your API credentials:
```env
NEXT_PUBLIC_QUESTIONS_API_URL=https://questions.aloc.com.ng/api/v2
NEXT_PUBLIC_QUESTIONS_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_ENABLE_QUESTION_CACHE=true
# Optional: Size of question bank to prefetch/seed (20,000 - 60,000). Default: 20000
NEXT_PUBLIC_QUESTION_BANK_SIZE=20000
# Optional: Page size for multi-page fetches
NEXT_PUBLIC_QUESTION_PAGE_SIZE=1000
# Optional: When false, the app will NOT use local generated questions as fallback. Set to true to allow local fallback.
NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK=false
# Optional: When true, the app will REQUIRE API-sourced questions for WAEC/JAMB and replace local data (if present).
NEXT_PUBLIC_REQUIRE_API=false
```

### Step 3: Test the Connection

Create a test file or use the example:

```typescript
import { testAPIConnection } from '@/lib/questions-api-enhanced';

// Test the connection
const result = await testAPIConnection();
console.log(result);
// Output: { success: true, message: 'API connection successful', questionsCount: 5 }
```

### Step 4: Fetch Your First Questions

```typescript
import { fetchQuestionsFromAPI } from '@/lib/questions-api-enhanced';

// Fetch 60 JAMB Mathematics questions
const questions = await fetchQuestionsFromAPI('jamb', 'Mathematics', 2024, 60);
console.log(`Fetched ${questions.length} questions`);
```

## 📊 Common Use Cases

### Use Case 1: Single Subject Exam (60 questions)

```typescript
// For a JAMB exam session
async function startJAMBExam(subject: string) {
  const questions = await fetchQuestionsFromAPI(
    'jamb',
    subject,
    2024,
    60
  );
  
  // Questions are automatically cached
  return questions;
}

// Usage
const mathQuestions = await startJAMBExam('Mathematics');
```

### Use Case 2: JAMB UTME (Official Format: 180 questions, 2 hours)

```typescript
// Official JAMB UTME: English 60q + 3 subjects 40q each = 180 questions
async function startJAMBUTME(subjects: {
  subject2: string;
  subject3: string;
  subject4: string;
}) {
  // Fetch all in parallel for faster loading
  const [english, sub2, sub3, sub4] = await Promise.all([
    fetchQuestionsFromAPI('jamb', 'English Language', 2024, 60),
    fetchQuestionsFromAPI('jamb', subjects.subject2, 2024, 40),
    fetchQuestionsFromAPI('jamb', subjects.subject3, 2024, 40),
    fetchQuestionsFromAPI('jamb', subjects.subject4, 2024, 40),
  ]);
  
  return [...english, ...sub2, ...sub3, ...sub4]; // 180 questions total
}

// Usage
const utmeQuestions = await startJAMBUTME({
  subject2: 'Mathematics',
  subject3: 'Physics',
  subject4: 'Chemistry'
});
// Total: 180 questions, loads in ~3-4 seconds
// See JAMB_UTME_CONFIGURATION.md for complete details
```

### Use Case 3: Practice Mode (Random years, multiple questions)

```typescript
import { fetchQuestionsMultiPage } from '@/lib/questions-api-enhanced';

async function startPracticeMode(subject: string, count: number) {
  // Fetch questions from multiple years
  const questions = await fetchQuestionsMultiPage(
    'jamb',
    subject,
    undefined, // No specific year
    count,
    60
  );
  
  // Shuffle for variety
  return questions.sort(() => Math.random() - 0.5);
}

// Usage: Get 300 random questions
const practiceQuestions = await startPracticeMode('Physics', 300);
```

### Use Case 4: Year-by-Year Review

```typescript
import { fetchQuestionsByYearRange } from '@/lib/questions-api-enhanced';

async function reviewPastYears(subject: string) {
  const questionsByYear = await fetchQuestionsByYearRange(
    'waec',
    subject,
    2020,
    2024,
    60
  );
  
  // Access questions by year
  const questions2024 = questionsByYear.get(2024);
  const questions2023 = questionsByYear.get(2023);
  
  return questionsByYear;
}

// Usage
const yearlyQuestions = await reviewPastYears('English Language');
```

### Use Case 5: Offline Mode (Pre-fetch for no internet)

```typescript
import { prefetchQuestionsForOffline } from '@/lib/questions-api-enhanced';

async function prepareOfflineMode() {
  const subjects = [
    'Mathematics',
    'English Language',
    'Physics',
    'Chemistry'
  ];
  
  const years = [2024, 2023, 2022];
  
  // Pre-fetch all combinations
  await prefetchQuestionsForOffline('jamb', subjects, years);
  
  console.log('✅ All questions cached for offline use');
}

// Run once when user has internet
await prepareOfflineMode();
```

## 🎯 Integration with Your Exam Interface

Update your existing exam interface to use the API:

```typescript
// In your exam component
import { fetchQuestionsFromAPI } from '@/lib/questions-api-enhanced';
import { generateJAMBMathQuestions } from '@/lib/generate-questions';

async function loadQuestions(
  examType: 'waec' | 'jamb',
  subject: string
) {
  try {
    // Try API first
    const apiQuestions = await fetchQuestionsFromAPI(
      examType,
      subject,
      2024,
      60
    );
    
    if (apiQuestions.length >= 60) {
      return apiQuestions;
    }
  } catch (error) {
    console.warn('API unavailable, using local questions');
  }
  
  // Fallback to local generated questions
  return generateJAMBMathQuestions();
}
```

## 📈 Scaling to 60,000 Questions

### Strategy 1: Lazy Loading

```typescript
// Load questions as needed, not all at once
const [currentBatch, setCurrentBatch] = useState(1);

async function loadNextBatch() {
  const questions = await fetchQuestionsFromAPI(
    'jamb',
    'Mathematics',
    2024,
    60,
    currentBatch
  );
  
  setCurrentBatch(prev => prev + 1);
  return questions;
}
```

### Strategy 2: Background Prefetching

```typescript
// Prefetch next batch while user is on current batch
useEffect(() => {
  if (currentQuestion > 50) {
    // User is near the end, prefetch next batch
    fetchQuestionsFromAPI('jamb', subject, year, 60, nextPage);
  }
}, [currentQuestion]);
```

### Strategy 3: Smart Caching

```typescript
import { getCacheStats, clearCache } from '@/lib/questions-api-enhanced';

// Monitor cache size
const stats = getCacheStats();
if (stats.size > 100) {
  // Clear old cache entries
  clearCache();
}
```

## 🔧 Troubleshooting

### Problem: API returns empty array

**Solution:**
```typescript
// Check API configuration
console.log('API URL:', process.env.NEXT_PUBLIC_QUESTIONS_API_URL);
console.log('API Key:', process.env.NEXT_PUBLIC_QUESTIONS_API_KEY ? 'Set' : 'Not set');

// Test connection
const result = await testAPIConnection();
console.log(result);
```

### Problem: Rate limiting (429 errors)

**Solution:**
```typescript
// The enhanced API already handles this with retry logic
// But you can also add delays between requests:

for (const subject of subjects) {
  const questions = await fetchQuestionsFromAPI('jamb', subject);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
}
```

### Problem: Slow loading

**Solution:**
```typescript
// Enable caching
NEXT_PUBLIC_ENABLE_QUESTION_CACHE=true

// Prefetch during idle time
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    prefetchQuestionsForOffline('jamb', ['Mathematics'], [2024]);
  });
}
```

## 📱 Mobile Optimization

For mobile apps, use aggressive caching:

```typescript
// Cache questions for 7 days on mobile
const MOBILE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// Check if mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Prefetch common subjects
  await prefetchQuestionsForOffline(
    'jamb',
    ['Mathematics', 'English Language'],
    [2024, 2023]
  );
}
```

## 💰 Cost Optimization

### Minimize API Calls

```typescript
// ✅ Good: Fetch once, cache, reuse
const questions = await fetchQuestionsFromAPI('jamb', 'Math', 2024, 60);
// Questions are automatically cached

// ❌ Bad: Fetch every time
// Don't do this repeatedly without caching
```

### Use Pagination Wisely

```typescript
// ✅ Good: Fetch only what you need
const questions = await fetchQuestionsFromAPI('jamb', 'Math', 2024, 60);

// ❌ Bad: Fetch everything at once
// const allQuestions = await fetchQuestionsMultiPage('jamb', 'Math', 2024, 10000);
```

## 🎓 Best Practices

1. **Always handle errors gracefully**
   ```typescript
   try {
     const questions = await fetchQuestionsFromAPI(...);
   } catch (error) {
     // Fallback to local questions
     const questions = generateLocalQuestions();
   }
   ```

2. **Cache aggressively**
   ```typescript
   NEXT_PUBLIC_ENABLE_QUESTION_CACHE=true
   NEXT_PUBLIC_CACHE_DURATION_HOURS=24
   ```

3. **Test with small datasets first**
   ```typescript
   // Start with 5 questions for testing
   const testQuestions = await fetchQuestionsFromAPI('jamb', 'Math', 2024, 5);
   ```

4. **Monitor performance**
   ```typescript
   console.time('fetch-questions');
   const questions = await fetchQuestionsFromAPI('jamb', 'Math', 2024, 60);
   console.timeEnd('fetch-questions');
   ```

5. **Provide loading states**
   ```typescript
   const [loading, setLoading] = useState(false);
   
   setLoading(true);
   const questions = await fetchQuestionsFromAPI(...);
   setLoading(false);
   ```

## 📚 Next Steps

1. ✅ Set up API credentials
2. ✅ Test with 5-10 questions
3. ✅ Integrate with your exam interface
4. ✅ Test with 60 questions (full exam)
5. ✅ Enable caching
6. ✅ Test offline mode
8. ✅ (Optional) Seed large question banks for all subjects (uses `NEXT_PUBLIC_QUESTION_BANK_SIZE`)

   Run: `npx tsx scripts/seed-question-bank.ts` (be careful — this may use a lot of API quota)

9. ✅ Scale to multiple subjects
10. ✅ Deploy to production

## 🆘 Need Help?

- Check [`API_INTEGRATION_GUIDE.md`](API_INTEGRATION_GUIDE.md) for detailed documentation
- See [`examples/api-usage-example.tsx`](examples/api-usage-example.tsx) for working examples
- Review [`lib/questions-api-enhanced.ts`](lib/questions-api-enhanced.ts) for API implementation

---

**You're ready to use 20,000-60,000 past questions!** 🎉
