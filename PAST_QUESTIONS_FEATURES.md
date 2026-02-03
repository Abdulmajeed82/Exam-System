# WAEC and JAMB Past Questions Features

## Overview
This document describes the implementation of WAEC and JAMB past questions features in the exam practice system.

## Key Features Implemented

### 1. **Past Questions from 2000 to Present**
- All WAEC and JAMB questions include the year they were asked (2000-2024)
- Questions are distributed across different years to provide comprehensive practice
- Year information is displayed during the exam and in results

### 2. **60 Questions Per Exam**
- **JAMB**: Exactly 60 objective questions per subject
- **WAEC**: 60 questions total per subject (50 objective + 10 essay questions)
- System automatically limits questions to 60 for both exam types

### 3. **Question Types**

#### JAMB (All Objective)
- 60 multiple-choice questions
- Options: A, B, C, D
- Instant grading after submission
- Detailed explanations for each answer

#### WAEC (Mixed Format)
- **50 Objective Questions**: Multiple-choice with instant grading
- **10 Essay Questions**: Long-form answers with sample responses
- Essay questions are for practice only (not auto-graded)

### 4. **Answer Explanations**
After completing an exam, students can:
- View correct answers for all objective questions
- Read detailed explanations for why each answer is correct
- See sample answers for essay questions
- Review their own answers alongside correct answers

### 5. **Subjects Available**

#### JAMB Subjects
- English Language
- Mathematics
- Physics
- Chemistry
- Biology
- Economics
- Commerce
- Accounting
- Government
- Literature in English
- Christian Religious Studies
- Islamic Religious Studies
- Geography
- Agricultural Science

#### WAEC Subjects
WAEC subjects are grouped by typical school streams for easier selection and practice:

- **Science Stream**
  - Physics
  - Chemistry
  - Biology
  - Agricultural Science
  - Further Mathematics
  - Geography

- **Arts Stream**
  - Literature-in-English
  - Government / History
  - Christian / Islamic Religious Studies (CRS / IRS)
  - A Nigerian Language (Yoruba, Igbo, Hausa)
  - Fine Arts / Music
  - Economics (Limited in 2026)*

- **Commercial Stream**
  - Financial Accounting
  - Commerce
  - Economics
  - Marketing
  - Office Practice
  - Bookkeeping

*Note: "Economics (Limited in 2026)" indicates availability changes may apply for 2026 exams.

## Technical Implementation

### File Structure

```
lib/
├── types.ts                    # Updated Question type with year, explanation, questionType
├── questions-api.ts            # API service for fetching external questions
├── generate-questions.ts       # Generates 60 questions for each subject
├── mockData.ts                 # Mock data with generated questions
└── db.ts                       # Database operations with 60-question limit

components/
├── exam-interface.tsx          # Updated to handle essay questions
└── exam-results-detailed.tsx   # New component showing answers & explanations
```

### Question Type Structure

```typescript
interface Question {
  id: string;
  subject: string;
  examType: 'common-entrance' | 'waec' | 'jamb';
  questionType: 'objective' | 'essay';
  questionNumber: number;
  questionText: string;
  year: number;                  // Year of past question (2000-present)
  options?: {                    // For objective questions
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer?: 'a' | 'b' | 'c' | 'd';
  explanation: string;           // Explanation for correct answer
  essayAnswer?: string;          // Sample answer for essay questions
  createdAt: string;
}
```

### API Integration

The system includes an API service ([`lib/questions-api.ts`](lib/questions-api.ts:1)) that can be configured to fetch questions from external sources:

```typescript
// Configure in .env.local
NEXT_PUBLIC_QUESTIONS_API_URL=https://your-api-endpoint.com
NEXT_PUBLIC_QUESTIONS_API_KEY=your-api-key
```

Example API providers:
- https://questions.aloc.com.ng/api/v2/
- Custom backend API
- Any REST API that provides past questions

### Results Display

The new results interface ([`components/exam-results-detailed.tsx`](components/exam-results-detailed.tsx:1)) includes three tabs:

1. **Summary Tab**
   - Overall score and percentage
   - Grade (A-F)
   - Performance breakdown
   - Question type distribution

2. **Review Answers Tab**
   - All questions with user's answers
   - Correct answers highlighted in green
   - Wrong answers highlighted in red
   - Essay answers displayed in full

3. **Explanations Tab**
   - Detailed explanation for each question
   - Why the correct answer is right
   - Sample answers for essay questions
   - Learning resources

## Usage Guide

### For Students

1. **Select Exam Type**: Choose WAEC or JAMB from the dashboard
2. **Select Subject**: Pick from available subjects
3. **Start Exam**: Begin with 60 questions
4. **Answer Questions**:
   - Objective: Click on A, B, C, or D
   - Essay: Type your answer in the text area
5. **Navigate**: Use Previous/Next buttons or question navigator
6. **Submit**: Review and submit when done
7. **View Results**: See score, review answers, and read explanations

### For Developers

#### Adding New Questions

```typescript
import { Question } from './types';

const newQuestion: Question = {
  id: 'JAMB-MATH-061',
  subject: 'Mathematics',
  examType: 'jamb',
  questionType: 'objective',
  questionNumber: 61,
  questionText: 'Your question here',
  year: 2024,
  options: {
    a: 'Option A',
    b: 'Option B',
    c: 'Option C',
    d: 'Option D',
  },
  correctAnswer: 'a',
  explanation: 'Detailed explanation here',
  createdAt: new Date().toISOString(),
};
```

#### Fetching from External API

```typescript
import { fetchQuestionsFromAPI } from '@/lib/questions-api';

const questions = await fetchQuestionsFromAPI(
  'jamb',           // exam type
  'Mathematics',    // subject
  2024,            // year (optional)
  60               // limit
);
```

## Current Mock Data

The system currently includes:
- **JAMB Mathematics**: 60 objective questions (2000-2024)
- **JAMB English**: 60 objective questions (2000-2024)
- **WAEC Mathematics**: 50 objective + 10 essay questions (2000-2024)
- **WAEC English**: 50 objective + 10 essay questions (2000-2024)

## Future Enhancements

1. **More Subjects**: Add questions for all available subjects
2. **Real API Integration**: Connect to actual past questions database
3. **Teacher Grading**: Allow teachers to grade essay questions
4. **Performance Analytics**: Track student progress over time
5. **Difficulty Levels**: Categorize questions by difficulty
6. **Timed Exams**: Add countdown timers for realistic practice
7. **Bookmarking**: Let students save questions for later review
8. **Print Results**: Generate PDF reports

## Testing

To test the implementation:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Login as a student
3. Select WAEC or JAMB exam
4. Choose a subject (Mathematics or English Language)
5. Complete the 60-question exam
6. Review results with explanations

## Notes

- Essay questions are for practice only and show sample answers
- Objective questions are automatically graded
- All questions include year and detailed explanations
- The system ensures exactly 60 questions per exam
- Questions are stored in the session for review after submission

## Support

For issues or questions about the past questions feature:
1. Check the question generation logic in [`lib/generate-questions.ts`](lib/generate-questions.ts:1)
2. Review the API service in [`lib/questions-api.ts`](lib/questions-api.ts:1)
3. Examine the exam interface in [`components/exam-interface.tsx`](components/exam-interface.tsx:1)
4. Check results display in [`components/exam-results-detailed.tsx`](components/exam-results-detailed.tsx:1)
