# WAEC & JAMB API Integration Guide

## Overview
This guide explains how to integrate external APIs with 20,000-60,000 past questions into your exam practice system.

## Current System Capabilities

Your system already has:
- ✅ API service layer ([`lib/questions-api.ts`](lib/questions-api.ts))
- ✅ Question type definitions ([`lib/types.ts`](lib/types.ts))
- ✅ Mock data generators ([`lib/generate-questions.ts`](lib/generate-questions.ts))
- ✅ Database layer ([`lib/db.ts`](lib/db.ts))
- ✅ Support for WAEC and JAMB exam types

## Available API Providers

### 1. **ALOC API** (Recommended)
- **URL**: https://questions.aloc.com.ng/api/v2/
- **Coverage**: 60,000+ past questions
- **Exams**: WAEC, JAMB, NECO, GCE
- **Subjects**: All major subjects
- **Years**: 2000-present
- **Format**: JSON
- **Authentication**: API Key required

### 2. **MySchool API**
- **URL**: https://myschool.ng/api/
- **Coverage**: 50,000+ questions
- **Exams**: WAEC, JAMB, NECO
- **Authentication**: API Key required

### 3. **PastQuestions.com.ng API**
- **URL**: Contact provider for API access
- **Coverage**: 40,000+ questions
- **Exams**: WAEC, JAMB

## Integration Steps

### Step 1: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# WAEC/JAMB Questions API Configuration
NEXT_PUBLIC_QUESTIONS_API_URL=https://questions.aloc.com.ng/api/v2
NEXT_PUBLIC_QUESTIONS_API_KEY=your_api_key_here

# Optional: Separate endpoints for different exam types
NEXT_PUBLIC_WAEC_API_URL=https://questions.aloc.com.ng/api/v2/waec
NEXT_PUBLIC_JAMB_API_URL=https://questions.aloc.com.ng/api/v2/jamb

# Cache configuration
NEXT_PUBLIC_ENABLE_QUESTION_CACHE=true
NEXT_PUBLIC_CACHE_DURATION_HOURS=24
```

### Step 2: API Response Format

The system expects this JSON structure:

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "WAEC-2024-MATH-001",
        "subject": "Mathematics",
        "exam": "waec",
        "type": "objective",
        "question": "What is 2 + 2?",
        "year": 2024,
        "options": {
          "a": "3",
          "b": "4",
          "c": "5",
          "d": "6"
        },
        "answer": "b",
        "explanation": "2 + 2 equals 4",
        "solution": "Add the two numbers together"
      }
    ],
    "total": 60,
    "page": 1,
    "limit": 60
  }
}
```

### Step 3: Using the API Service

The [`fetchQuestionsFromAPI()`](lib/questions-api.ts:21) function is already implemented:

```typescript
import { fetchQuestionsFromAPI } from '@/lib/questions-api';

// Fetch JAMB Mathematics questions
const questions = await fetchQuestionsFromAPI('jamb', 'Mathematics', 2024, 60);

// Fetch WAEC English questions
const questions = await fetchQuestionsFromAPI('waec', 'English Language', 2023, 60);

// Fetch questions without year filter (gets latest)
const questions = await fetchQuestionsFromAPI('jamb', 'Physics', undefined, 60);
```

## Handling Large Question Databases (20K-60K Questions)

### Strategy 1: Pagination & Lazy Loading

```typescript
// Fetch questions in batches
async function fetchQuestionsBatch(
  examType: 'waec' | 'jamb',
  subject: string,
  page: number = 1,
  limit: number = 60
) {
  const params = new URLSearchParams({
    exam: examType,
    subject: subject.toLowerCase(),
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/questions?${params}`);
  return response.json();
}
```

### Strategy 2: Caching with IndexedDB

```typescript
// Cache questions locally for offline access
import { openDB } from 'idb';

async function cacheQuestions(questions: Question[]) {
  const db = await openDB('exam-questions', 1, {
    upgrade(db) {
      db.createObjectStore('questions', { keyPath: 'id' });
      db.createObjectStore('metadata');
    },
  });

  const tx = db.transaction('questions', 'readwrite');
  await Promise.all(questions.map(q => tx.store.put(q)));
  await tx.done;
}
```

### Strategy 3: Server-Side Caching

```typescript
// Use Next.js API routes with caching
// pages/api/questions/[examType]/[subject].ts

export default async function handler(req, res) {
  const { examType, subject } = req.query;
  
  // Cache for 24 hours
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  
  const questions = await fetchQuestionsFromAPI(
    examType as 'waec' | 'jamb',
    subject as string
  );
  
  res.status(200).json(questions);
}
```

### Strategy 4: Database Integration

For production with 60K+ questions, use a database:

```typescript
// Using Prisma with PostgreSQL
// prisma/schema.prisma

model Question {
  id              String   @id @default(cuid())
  subject         String
  examType        String   // 'waec' | 'jamb'
  questionType    String   // 'objective' | 'essay'
  questionNumber  Int
  questionText    String   @db.Text
  year            Int
  options         Json?
  correctAnswer   String?
  explanation     String   @db.Text
  essayAnswer     String?  @db.Text
  createdAt       DateTime @default(now())
  
  @@index([examType, subject, year])
  @@index([examType, subject])
}
```

## Performance Optimization

### 1. Question Pre-fetching
```typescript
// Pre-fetch next set of questions
useEffect(() => {
  if (currentQuestion > 50) {
    // Pre-fetch next batch
    fetchQuestionsFromAPI(examType, subject, year, 60);
  }
}, [currentQuestion]);
```

### 2. Service Worker for Offline Access
```typescript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/questions')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### 3. Compression
```typescript
// Enable gzip compression for API responses
// next.config.mjs
export default {
  compress: true,
  // ... other config
};
```

## API Rate Limiting & Error Handling

```typescript
// Implement retry logic with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Cost Estimation

For 60,000 questions:

### Storage
- **JSON Format**: ~60MB (1KB per question)
- **Database**: ~100MB with indexes
- **Cached**: ~80MB compressed

### API Calls
- **Initial Load**: 1 call per exam session (60 questions)
- **With Caching**: Minimal after first load
- **Monthly Estimate**: 1,000 students × 10 exams = 10,000 API calls

### Recommended Hosting
- **Vercel**: Free tier supports up to 100GB bandwidth
- **Railway**: $5/month for PostgreSQL database
- **Cloudflare**: Free CDN for static assets

## Testing the Integration

```typescript
// Test API connection
async function testAPIConnection() {
  try {
    const questions = await fetchQuestionsFromAPI('jamb', 'Mathematics', 2024, 5);
    console.log(`✅ API Connected: ${questions.length} questions fetched`);
    return true;
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
    return false;
  }
}
```

## Fallback Strategy

Your system already has mock data generators. Use this hybrid approach:

```typescript
async function getQuestions(examType: 'waec' | 'jamb', subject: string) {
  try {
    // Try API first
    const apiQuestions = await fetchQuestionsFromAPI(examType, subject);
    if (apiQuestions.length >= 60) {
      return apiQuestions;
    }
  } catch (error) {
    console.warn('API unavailable, using local questions');
  }
  
  // Fallback to local generated questions
  return generateLocalQuestions(examType, subject);
}
```

## Security Best Practices

1. **Never expose API keys in client-side code**
   - Use Next.js API routes as proxy
   - Store keys in environment variables

2. **Validate API responses**
   ```typescript
   function validateQuestion(q: any): q is Question {
     return (
       typeof q.id === 'string' &&
       typeof q.questionText === 'string' &&
       typeof q.correctAnswer === 'string'
     );
   }
   ```

3. **Rate limiting**
   - Implement request throttling
   - Cache aggressively
   - Use CDN for static content

## Next Steps

1. ✅ Choose an API provider (ALOC recommended)
2. ✅ Get API credentials
3. ✅ Configure environment variables
4. ✅ Test with small dataset (100 questions)
5. ✅ Implement caching strategy
6. ✅ Scale to full dataset (60K questions)
7. ✅ Monitor performance and costs

## Support & Resources

- **ALOC API Docs**: https://questions.aloc.com.ng/docs
- **Next.js Caching**: https://nextjs.org/docs/app/building-your-application/caching
- **IndexedDB**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

---

**Your system is ready for API integration!** The infrastructure is already in place - you just need to configure the API endpoint and credentials.
