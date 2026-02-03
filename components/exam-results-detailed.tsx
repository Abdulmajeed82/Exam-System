'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { gradeExam, getExamSession } from '@/lib/db';
import { ExamResult, Question } from '@/lib/types';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';

interface ExamResultsDetailedProps {
  sessionId: string;
  onDone: () => void;
}

export function ExamResultsDetailed({ sessionId, onDone }: ExamResultsDetailedProps) {
  const { student } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    async function loadDetailedResult() {
      const session = getExamSession(sessionId);
      if (session && student) {
        const examResult = await gradeExam(sessionId, student.schoolId);
        setResult(examResult);
        setQuestions(session.questionDetails || []);
        setAnswers(session.answers || {});
      }
      setIsLoading(false);
    }
    loadDetailedResult();
  }, [sessionId, student]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Grading your exam...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md border-primary/20">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Unable to process your exam results.
            </p>
            <Button
              onClick={onDone}
              className="bg-primary hover:bg-primary/90"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gradeColor =
    result.grade === 'A'
      ? 'text-green-700'
      : result.grade === 'B'
        ? 'text-blue-700'
        : result.grade === 'C'
          ? 'text-yellow-700'
          : result.grade === 'D'
            ? 'text-orange-700'
            : 'text-red-700';

  const gradeBgColor =
    result.grade === 'A'
      ? 'bg-green-50 border-green-200'
      : result.grade === 'B'
        ? 'bg-blue-50 border-blue-200'
        : result.grade === 'C'
          ? 'bg-yellow-50 border-yellow-200'
          : result.grade === 'D'
            ? 'bg-orange-50 border-orange-200'
            : 'bg-red-50 border-red-200';

  const objectiveQuestions = questions.filter(q => q.questionType === 'objective');
  const essayQuestions = questions.filter(q => q.questionType === 'essay');

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-5xl mx-auto">
        {/* School Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              G
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Great Model International School
          </h1>
          <p className="text-muted-foreground">Official Exam Result</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="review">Review Answers</TabsTrigger>
            <TabsTrigger value="explanations">Explanations</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader className="bg-linear-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
                <div className="space-y-2">
                  <CardTitle className="text-primary">Exam Result</CardTitle>
                  <CardDescription>
                    {result.examType === 'common-entrance'
                      ? 'School Common Entrance Examination'
                      : result.examType === 'waec'
                        ? 'WAEC Past Questions Practice'
                        : 'JAMB CBT Past Questions Practice'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Student Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-primary/20">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Student Name
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {result.studentName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      School ID
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {result.schoolId}
                    </p>
                  </div>
                  {result.subject && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                        Subject
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {result.subject}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Date Completed
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Score Display */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                      Score
                    </p>
                    <p className="text-4xl font-bold text-primary">
                      {result.score}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      out of {result.totalQuestions}
                    </p>
                  </div>

                  <div className="text-center p-6 rounded-lg bg-secondary/5 border border-secondary/20">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                      Percentage
                    </p>
                    <p className="text-4xl font-bold text-secondary">
                      {result.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Performance</p>
                  </div>

                  <div
                    className={`text-center p-6 rounded-lg border border-solid ${gradeBgColor}`}
                  >
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                      Grade
                    </p>
                    <p className={`text-4xl font-bold ${gradeColor}`}>
                      {result.grade}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.grade === 'A'
                        ? 'Excellent'
                        : result.grade === 'B'
                          ? 'Very Good'
                          : result.grade === 'C'
                            ? 'Good'
                            : result.grade === 'D'
                              ? 'Fair'
                              : 'Needs Improvement'}
                    </p>
                  </div>
                </div>

                {/* Question Type Breakdown */}
                {essayQuestions.length > 0 && (
                  <div className="p-6 rounded-lg bg-foreground/5 border border-foreground/10 mb-6">
                    <h3 className="font-semibold text-foreground mb-3">Question Breakdown</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Objective Questions:</span>
                        <span className="font-medium text-foreground">
                          {objectiveQuestions.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Essay Questions:</span>
                        <span className="font-medium text-foreground">
                          {essayQuestions.length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Summary */}
                <div className="p-6 rounded-lg bg-foreground/5 border border-foreground/10">
                  <h3 className="font-semibold text-foreground mb-3">Performance Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Correct Answers:</span>
                      <span className="font-medium text-foreground">
                        {result.score}/{result.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Incorrect Answers:
                      </span>
                      <span className="font-medium text-foreground">
                        {result.totalQuestions - result.score}/{result.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-medium text-foreground">
                        {result.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Answers Tab - Shows all answers with correct answers highlighted */}
          <TabsContent value="review" className="space-y-4">
            <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Review Guide:</span> Green highlights show correct answers.
                Red highlights show your incorrect answers. This helps you learn from your mistakes.
              </p>
            </div>
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = question.questionType === 'objective' && userAnswer === question.correctAnswer;
              const isAnswered = !!userAnswer;

              return (
                <Card key={question.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Question {index + 1}</Badge>
                          <Badge variant={question.questionType === 'essay' ? 'secondary' : 'default'}>
                            {question.questionType === 'essay' ? 'Essay' : 'Objective'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Year: {question.year}</span>
                          {question.questionType === 'objective' && (
                            <Badge variant={isCorrect ? 'default' : 'destructive'} className={isCorrect ? 'bg-green-600' : 'bg-red-600'}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">
                          {question.questionText}
                        </CardTitle>
                      </div>
                      {question.questionType === 'objective' && (
                        <div>
                          {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {question.questionType === 'objective' && question.options ? (
                      <div className="space-y-2">
                        {Object.entries(question.options).map(([key, value]) => {
                          const isUserAnswer = userAnswer === key;
                          const isCorrectAnswer = question.correctAnswer === key;

                          return (
                            <div
                              key={key}
                              className={`p-3 rounded-lg border-2 transition-colors ${
                                isCorrectAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : isUserAnswer
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{key.toUpperCase()}.</span>
                                <span className="flex-1">{value}</span>
                                {isCorrectAnswer && (
                                  <Badge className="ml-auto bg-green-600 hover:bg-green-700">✓ Correct Answer</Badge>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <Badge className="ml-auto bg-red-600 hover:bg-red-700">✗ Your Answer</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Your Answer:</p>
                          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-sm whitespace-pre-wrap">
                              {userAnswer || 'No answer provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Explanations Tab */}
          <TabsContent value="explanations" className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Question {index + 1}</Badge>
                    <Badge variant={question.questionType === 'essay' ? 'secondary' : 'default'}>
                      {question.questionType === 'essay' ? 'Essay' : 'Objective'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Year: {question.year}</span>
                  </div>
                  <CardTitle className="text-base">
                    {question.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {question.questionType === 'objective' && question.correctAnswer && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-sm font-medium text-green-900 mb-1">
                        Correct Answer: {question.correctAnswer.toUpperCase()}
                      </p>
                      {question.options && (
                        <p className="text-sm text-green-800">
                          {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-2">
                          {question.questionType === 'essay' ? 'Sample Answer:' : 'Explanation:'}
                        </p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                          {question.questionType === 'essay' 
                            ? question.essayAnswer 
                            : question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onDone}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
