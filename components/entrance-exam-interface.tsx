'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  getQuestionsByExamType,
  createExamSession,
  updateExamSession,
} from '@/lib/db';
import { Question, ExamSession } from '@/lib/types';
import { commonEntranceSubjects } from '@/lib/subjects';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface EntranceExamInterfaceProps {
  onComplete: (sessionId: string) => void;
  onBack: () => void;
}

interface SubjectProgress {
  subject: string;
  status: 'pending' | 'in-progress' | 'completed';
  score?: number;
  totalQuestions?: number;
  answers: Record<string, string>;
}

export function EntranceExamInterface({
  onComplete,
  onBack,
}: EntranceExamInterfaceProps) {
  const { student } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showSubjectComplete, setShowSubjectComplete] = useState(false);

  const availableSubjects = commonEntranceSubjects.map(s => s.name);

  // Timer countdown effect
  useEffect(() => {
    if (!isExamStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, timeRemaining]);

  // Format time remaining as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleStartExam = async () => {
    if (!student || selectedSubjects.length === 0) return;

    // Initialize progress for all selected subjects
    const progress: SubjectProgress[] = selectedSubjects.map(subject => ({
      subject,
      status: 'pending',
      answers: {},
    }));
    progress[0].status = 'in-progress'; // Start with first subject

    setSubjectsProgress(progress);

    // Load questions for first subject
    const firstSubjectQuestions = await getQuestionsByExamType('common-entrance', selectedSubjects[0]);
    setCurrentQuestions(firstSubjectQuestions);

    // Create exam session
    const newSession = await createExamSession(
      student.id,
      student.name,
      'common-entrance',
      selectedSubjects
    );
    setSession(newSession);
    setIsExamStarted(true);
    setCurrentSubjectIndex(0);
    setCurrentQuestionIndex(0);

    // Set timer: 30 minutes per subject
    const totalTime = selectedSubjects.length * 30 * 60; // in seconds
    setTimeRemaining(totalTime);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!session) return;

    // Update current subject's answers
    const updatedProgress = [...subjectsProgress];
    updatedProgress[currentSubjectIndex].answers[questionId] = answer;
    setSubjectsProgress(updatedProgress);

    // Update session
    const allAnswers = updatedProgress.reduce((acc, subj) => ({
      ...acc,
      ...subj.answers,
    }), {});

    const updatedSession = updateExamSession(session.id, {
      answers: allAnswers,
    });
    setSession(updatedSession || session);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateSubjectScore = (subjectAnswers: Record<string, string>, questions: Question[]): number => {
    let correct = 0;
    questions.forEach(q => {
      if (q.questionType === 'objective' && subjectAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleCompleteSubject = async () => {
    // Calculate score for current subject
    const score = calculateSubjectScore(
      subjectsProgress[currentSubjectIndex].answers,
      currentQuestions
    );

    // Update progress
    const updatedProgress = [...subjectsProgress];
    updatedProgress[currentSubjectIndex].status = 'completed';
    updatedProgress[currentSubjectIndex].score = score;
    updatedProgress[currentSubjectIndex].totalQuestions = currentQuestions.length;

    // Check if there are more subjects
    if (currentSubjectIndex < selectedSubjects.length - 1) {
      // Move to next subject
      const nextIndex = currentSubjectIndex + 1;
      updatedProgress[nextIndex].status = 'in-progress';
      setSubjectsProgress(updatedProgress);
      
      // Load next subject questions
      const nextSubjectQuestions = await getQuestionsByExamType(
        'common-entrance',
        selectedSubjects[nextIndex]
      );
      setCurrentQuestions(nextSubjectQuestions);
      setCurrentSubjectIndex(nextIndex);
      setCurrentQuestionIndex(0);
      setShowSubjectComplete(true);
      
      // Auto-hide the completion message after 3 seconds
      setTimeout(() => setShowSubjectComplete(false), 3000);
    } else {
      // All subjects completed
      setSubjectsProgress(updatedProgress);
      setShowConfirmSubmit(true);
    }
  };

  const handleSubmitExam = () => {
    setShowConfirmSubmit(false);
    if (session) {
      onComplete(session.id);
    }
  };

  const handleAutoSubmit = async () => {
    // Auto-complete current subject if time runs out
    if (currentSubjectIndex < selectedSubjects.length) {
      const score = calculateSubjectScore(
        subjectsProgress[currentSubjectIndex].answers,
        currentQuestions
      );

      const updatedProgress = [...subjectsProgress];
      updatedProgress[currentSubjectIndex].status = 'completed';
      updatedProgress[currentSubjectIndex].score = score;
      updatedProgress[currentSubjectIndex].totalQuestions = currentQuestions.length;

      // Mark remaining subjects as completed with 0 score
      for (let i = currentSubjectIndex + 1; i < selectedSubjects.length; i++) {
        const questions = await getQuestionsByExamType('common-entrance', selectedSubjects[i]);
        updatedProgress[i].status = 'completed';
        updatedProgress[i].score = 0;
        updatedProgress[i].totalQuestions = questions.length;
      }

      setSubjectsProgress(updatedProgress);
    }
    
    if (session) {
      onComplete(session.id);
    }
  };

  const getTotalScore = () => {
    return subjectsProgress.reduce((sum, subj) => sum + (subj.score || 0), 0);
  };

  const getTotalQuestions = () => {
    return subjectsProgress.reduce((sum, subj) => sum + (subj.totalQuestions || 0), 0);
  };

  // Subject selection screen
  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-3xl mx-auto mt-12">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-primary hover:bg-primary/10"
          >
            ← Back to Dashboard
          </Button>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">School Entrance Examination</CardTitle>
              <p className="text-muted-foreground mt-2">
                Select all subjects you want to take in this entrance exam. You will take each subject one at a time.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Select Subjects (Choose all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSubjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => handleSubjectToggle(subject)}
                      className={`p-4 rounded-lg border-2 transition-all text-left font-medium flex items-center gap-2 ${
                        selectedSubjects.includes(subject)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-primary/20 bg-white text-foreground hover:border-primary/40'
                      }`}
                    >
                      <Checkbox checked={selectedSubjects.includes(subject)} />
                      <span className="text-sm">{subject}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Selected: {selectedSubjects.length} subject(s)
                </p>
              </div>

              {selectedSubjects.length > 0 && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground mb-2">
                    <span className="font-medium">Student:</span> {student?.name}
                  </p>
                  <p className="text-sm text-foreground mb-2">
                    <span className="font-medium">ID:</span> {student?.schoolId}
                  </p>
                  <p className="text-sm text-foreground mb-2">
                    <span className="font-medium">Subjects Selected:</span> {selectedSubjects.join(', ')}
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Time Allocated:</span> {selectedSubjects.length * 30} minutes total
                    ({selectedSubjects.length} subjects × 30 minutes each)
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <span className="font-medium">Important:</span> You will take each subject exam sequentially. 
                  Once you complete a subject, you cannot go back to it. Make sure to review your answers before 
                  moving to the next subject.
                </p>
              </div>

              <Button
                onClick={handleStartExam}
                disabled={selectedSubjects.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {selectedSubjects.length === 0
                  ? 'Select at least one subject to start'
                  : `Start Entrance Exam (${selectedSubjects.length} subjects)`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exam in progress
  if (currentQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No questions available for this subject.
            </p>
            <Button onClick={onBack} className="bg-primary hover:bg-primary/90">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentSubject = selectedSubjects[currentSubjectIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  const currentAnswer = subjectsProgress[currentSubjectIndex].answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5">
      {/* Subject completion notification */}
      {showSubjectComplete && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <Card className="border-green-500 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Subject Completed!</p>
                <p className="text-sm text-green-700">Moving to next subject...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm submit dialog */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Submit Entrance Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You have completed all subjects. Are you sure you want to submit your exam?
              </p>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium mb-2">Summary:</p>
                {subjectsProgress.map((subj, idx) => (
                  <p key={idx} className="text-sm text-foreground">
                    {subj.subject}: {subj.score}/{subj.totalQuestions} correct
                  </p>
                ))}
                <p className="text-sm font-bold text-primary mt-2">
                  Total: {getTotalScore()}/{getTotalQuestions()} correct
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1"
                >
                  Review Answers
                </Button>
                <Button
                  onClick={handleSubmitExam}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Submit Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-primary/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-bold text-primary text-lg">
                {currentSubject} - Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </h1>
              <p className="text-xs text-muted-foreground">
                Subject {currentSubjectIndex + 1} of {selectedSubjects.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-right ${timeRemaining < 600 ? 'text-red-600 font-bold' : ''}`}>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Time Remaining
                </div>
                <div className="text-lg font-mono font-semibold">
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {student?.schoolId}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-secondary/20 rounded-full h-2 mb-3">
            <div
              className="bg-linear-to-r from-primary to-secondary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Subject progress indicators */}
          <div className="flex gap-2 flex-wrap">
            {subjectsProgress.map((subj, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  subj.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : subj.status === 'in-progress'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {subj.status === 'completed' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : subj.status === 'in-progress' ? (
                  <Circle className="w-3 h-3 fill-current" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                {subj.subject}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Objective Question
              </span>
              <span className="text-xs text-muted-foreground">
                Year: {currentQuestion.year}
              </span>
            </div>
            <CardTitle className="text-lg">{currentQuestion.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.questionType === 'objective' && currentQuestion.options ? (
              <div className="space-y-3">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleAnswerSelect(currentQuestion.id, key)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium cursor-pointer hover:shadow-md active:scale-[0.98] ${
                      currentAnswer === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-primary/20 bg-white text-foreground hover:border-primary/40 hover:bg-primary/5'
                    }`}
                  >
                    <span className="font-bold mr-3 text-lg">{key.toUpperCase()}.</span>
                    {value}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="border-primary/30"
              >
                ← Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {Object.keys(subjectsProgress[currentSubjectIndex].answers).length} of{' '}
                {currentQuestions.length} answered
              </div>

              {currentQuestionIndex < currentQuestions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteSubject}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {currentSubjectIndex < selectedSubjects.length - 1
                    ? 'Complete Subject & Continue'
                    : 'Complete Final Subject'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question navigator */}
        <Card className="mt-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {currentQuestions.map((q, idx) => {
                const isAnswered = subjectsProgress[currentSubjectIndex].answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                      idx === currentQuestionIndex
                        ? 'border-primary bg-primary text-white'
                        : isAnswered
                        ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary/40'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
