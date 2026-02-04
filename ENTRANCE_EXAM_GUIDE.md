# Multi-Subject Entrance Exam System - User Guide

## Overview

The entrance exam system has been enhanced to support multi-subject examinations where students can:
- Select multiple subjects from a dropdown menu
- Take each subject exam sequentially (one at a time)
- Receive individual scores for each subject
- Get a comprehensive total score across all subjects

## Features

### 1. Subject Selection
- **Dropdown Menu**: Students can select all subjects they want to take from a comprehensive list
- **Available Subjects**:
  - English
  - Mathematics
  - Science
  - Social & Citizenship Studies
  - CRS (Christian Religious Studies)
  - Islamic Studies
  - Quantitative Reasoning
  - Verbal Reasoning
  - Physical Health Education

### 2. Sequential Exam Taking
- Students take one subject at a time
- Cannot go back to previous subjects once completed
- Clear progress indicators showing:
  - Current subject being taken
  - Completed subjects (green checkmark)
  - Pending subjects (gray)
  - Current subject (blue highlight)

### 3. Time Management
- **Total time: 2 hours (120 minutes)** allocated for the entire entrance exam
- Real-time countdown timer displayed
- Warning when time is running low (< 10 minutes remaining)
- Auto-submit when time expires

### 4. Question Navigation
- Navigate between questions within current subject
- Visual question navigator showing:
  - Answered questions (green)
  - Current question (blue)
  - Unanswered questions (gray)
- Progress bar showing completion percentage

### 5. Subject Completion
- Review answers before completing each subject
- Confirmation required to move to next subject
- Cannot return to completed subjects
- Automatic transition to next subject

### 6. Comprehensive Results

#### Overall Performance
- Total score across all subjects
- Overall percentage
- Overall grade (A+, A, B, C, D, F)
- Number of subjects taken

#### Subject-wise Performance
- Individual score for each subject
- Percentage for each subject
- Grade for each subject
- Visual progress bars
- Correct/incorrect breakdown

#### Detailed Question Review
- All questions from all subjects
- Correct answers highlighted in green
- Wrong answers highlighted in red
- Explanations for each question
- User's selected answer vs correct answer comparison

## How to Use

### For Students

1. **Login**
   - Enter your full name
   - Enter password (default: "GMIS")
   - Click "Login"

2. **Start Entrance Exam**
   - Click on "School Common Entrance" card
   - Click "Start Entrance Exam" button

3. **Select Subjects**
   - Check all subjects you want to take
   - Review the summary showing:
     - Your name and ID
     - Selected subjects
     - Total time allocated
   - Click "Start Entrance Exam" button

4. **Take First Subject**
   - Read each question carefully
   - Select your answer by clicking on the option
   - Use "Previous" and "Next" buttons to navigate
   - Use the question navigator to jump to specific questions
   - Click "Complete Subject & Continue" when finished

5. **Continue with Remaining Subjects**
   - Review your progress in the header
   - Complete each subject sequentially
   - Cannot go back to previous subjects

6. **Submit Exam**
   - After completing all subjects, review the summary
   - Click "Submit Exam" to finalize
   - View your comprehensive results

7. **Review Results**
   - Check overall performance
   - Review subject-wise scores
   - Study detailed question explanations
   - Click "Back to Dashboard" when done

## Technical Details

### Components

#### [`EntranceExamInterface`](components/entrance-exam-interface.tsx)
Main component handling the multi-subject exam flow:
- Subject selection screen
- Sequential exam taking
- Timer management
- Progress tracking
- Subject completion logic

#### [`EntranceExamResults`](components/entrance-exam-results.tsx)
Comprehensive results display:
- Overall performance metrics
- Subject-wise breakdown
- Detailed question review with explanations

#### [`StudentDashboard`](components/student-dashboard.tsx)
Updated to include entrance exam option:
- New button to start entrance exam
- Integrated with new exam flow

### Data Structure

```typescript
interface SubjectProgress {
  subject: string;
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
  totalQuestions?: number;
  answers: Record<string, string>;
}
```

### Exam Session
The system uses the existing [`ExamSession`](lib/types.ts:43-57) type with:
- `subjects?: string[]` - Array of selected subjects
- `answers: Record<string, string>` - All answers across subjects
- `status: 'in-progress' | 'completed'` - Exam status

## Grading System

| Percentage | Grade |
|------------|-------|
| 90% - 100% | A+    |
| 80% - 89%  | A     |
| 70% - 79%  | B     |
| 60% - 69%  | C     |
| 50% - 59%  | D     |
| 0% - 49%   | F     |

## Best Practices

### For Students
1. **Select subjects carefully** - You cannot change selection after starting
2. **Manage your time** - 30 minutes per subject
3. **Review before completing** - Cannot go back to previous subjects
4. **Use question navigator** - Quickly jump to unanswered questions
5. **Read explanations** - Learn from mistakes in the results

### For Administrators
1. **Ensure questions are available** - All subjects should have questions
2. **Monitor exam sessions** - Track student progress
3. **Review results** - Analyze performance across subjects
4. **Update questions regularly** - Keep content fresh and relevant

## Troubleshooting

### Issue: No questions available
**Solution**: Ensure questions are loaded for all selected subjects in the database

### Issue: Timer not working
**Solution**: Check browser console for errors, refresh the page

### Issue: Cannot submit exam
**Solution**: Ensure all subjects are completed, check network connection

### Issue: Results not showing
**Solution**: Verify exam session was saved properly, check session ID

## Future Enhancements

Potential improvements for future versions:
- [ ] Save progress and resume later
- [ ] Practice mode for individual subjects
- [ ] Performance analytics and trends
- [ ] Comparison with other students
- [ ] Export results as PDF
- [ ] Email results to student/parent
- [ ] Subject-specific time limits
- [ ] Difficulty levels per subject

## Support

For technical support or questions:
- Contact your school administrator
- Check the system documentation
- Review the API integration guides

---

**Last Updated**: January 29, 2026
**Version**: 2.0
**System**: GMIS Exam Portal
