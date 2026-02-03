'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getExamSession, getQuestionsByExamType, gradeExam } from '@/lib/db';
import { ExamSession, Question } from '@/lib/types';
import { CheckCircle2, XCircle, Award, TrendingUp } from 'lucide-react';

interface EntranceExamResultsProps {
  sessionId: string;
  onDone: () => void;
}

interface SubjectResult {
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  grade: string;
  questions: Question[];
  answers: Record<string, string>;
}

export function EntranceExamResults({
  sessionId,
  onDone,
}: EntranceExamResultsProps) {
  const { student } = useAuth();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [subjectResults, setSubjectResults] = useState<SubjectResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [overallGrade, setOverallGrade] = useState('');

  useEffect(() => {
    async function loadResults() {
      const examSession = getExamSession(sessionId);
      if (examSession) {
        setSession(examSession);
        // Grade and persist result so teachers/admins can see it immediately
        try {
          if (student) {
            const saved = await gradeExam(sessionId, student.schoolId);
            if (saved) {
              console.log('✅ Entrance exam graded and saved:', saved.id);
            }
          }
        } catch (err) {
          console.error('Failed to grade entrance exam:', err);
        }
        await calculateResults(examSession);
      }
    }
    loadResults();
  }, [sessionId, student]);

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const calculateResults = async (examSession: ExamSession) => {
    if (!examSession.subjects || examSession.subjects.length === 0) return;

    const results: SubjectResult[] = [];
    let totalCorrect = 0;
    let totalQs = 0;

    for (const subject of examSession.subjects) {
      const questions = await getQuestionsByExamType('common-entrance', subject);
      let subjectScore = 0;

      questions.forEach((q) => {
        if (
          q.questionType === 'objective' &&
          examSession.answers[q.id] === q.correctAnswer
        ) {
          subjectScore++;
        }
      });

      const percentage = questions.length > 0 
        ? (subjectScore / questions.length) * 100 
        : 0;
      const grade = calculateGrade(percentage);

      // Get answers for this subject
      const subjectAnswers: Record<string, string> = {};
      questions.forEach((q) => {
        if (examSession.answers[q.id]) {
          subjectAnswers[q.id] = examSession.answers[q.id];
        }
      });

      results.push({
        subject,
        score: subjectScore,
        totalQuestions: questions.length,
        percentage,
        grade,
        questions,
        answers: subjectAnswers,
      });

      totalCorrect += subjectScore;
      totalQs += questions.length;
    }

    setSubjectResults(results);
    setTotalScore(totalCorrect);
    setTotalQuestions(totalQs);
    
    const overallPct = totalQs > 0 ? (totalCorrect / totalQs) * 100 : 0;
    setOverallPercentage(overallPct);
    setOverallGrade(calculateGrade(overallPct));
  };

  if (!session || subjectResults.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-primary to-secondary rounded-full mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Entrance Exam Results
          </h1>
          <p className="text-muted-foreground">
            {student?.name} ({student?.schoolId})
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="border-primary/20 mb-8">
          <CardHeader className="bg-linear-to-r from-primary/10 to-secondary/10">
            <CardTitle className="text-center">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <p className="text-3xl font-bold text-primary">
                  {totalScore}/{totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Percentage</p>
                <p className="text-3xl font-bold text-secondary">
                  {overallPercentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Grade</p>
                <p className="text-3xl font-bold text-primary">{overallGrade}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                <p className="text-3xl font-bold text-foreground">
                  {subjectResults.length}
                </p>
              </div>
            </div>

            {/* Performance indicator */}
            <div className="mt-6 p-4 rounded-lg bg-linear-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">
                  {overallPercentage >= 70
                    ? 'Excellent Performance!'
                    : overallPercentage >= 50
                    ? 'Good Performance!'
                    : 'Keep Practicing!'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Results */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground">Subject-wise Performance</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {subjectResults.map((result, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{result.subject}</span>
                    <span className={`text-2xl font-bold ${
                      result.percentage >= 70 ? 'text-green-600' :
                      result.percentage >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {result.grade}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="text-lg font-bold text-primary">
                        {result.score}/{result.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Percentage</span>
                      <span className="text-lg font-bold text-secondary">
                        {result.percentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          result.percentage >= 70 ? 'bg-green-500' :
                          result.percentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>

                    {/* Correct/Incorrect breakdown */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{result.score} Correct</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>{result.totalQuestions - result.score} Wrong</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Question Review */}
        <Card className="border-primary/20 mb-8">
          <CardHeader>
            <CardTitle>Detailed Question Review</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {subjectResults.map((result, subjectIdx) => (
              <div key={subjectIdx} className="mb-8 last:mb-0">
                <h3 className="text-xl font-bold text-primary mb-4 pb-2 border-b">
                  {result.subject}
                </h3>
                <div className="space-y-6">
                  {result.questions.map((question, qIdx) => {
                    const userAnswer = result.answers[question.id];
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border-2 ${
                          isCorrect
                            ? 'border-green-200 bg-green-50'
                            : userAnswer
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-foreground mb-2">
                              Question {qIdx + 1}: {question.questionText}
                            </p>
                            
                            {question.questionType === 'objective' && question.options && (
                              <div className="space-y-2 mb-3">
                                {Object.entries(question.options).map(([key, value]) => (
                                  <div
                                    key={key}
                                    className={`p-2 rounded text-sm ${
                                      key === question.correctAnswer
                                        ? 'bg-green-100 border border-green-300 font-medium'
                                        : key === userAnswer && !isCorrect
                                        ? 'bg-red-100 border border-red-300'
                                        : 'bg-white'
                                    }`}
                                  >
                                    <span className="font-bold mr-2">{key.toUpperCase()}.</span>
                                    {value}
                                    {key === question.correctAnswer && (
                                      <span className="ml-2 text-green-700 font-medium">
                                        ✓ Correct Answer
                                      </span>
                                    )}
                                    {key === userAnswer && !isCorrect && (
                                      <span className="ml-2 text-red-700 font-medium">
                                        ✗ Your Answer
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-sm font-medium text-blue-900 mb-1">
                                  Explanation:
                                </p>
                                <p className="text-sm text-blue-800">
                                  {question.explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onDone}
            className="bg-primary hover:bg-primary/90 px-8"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
