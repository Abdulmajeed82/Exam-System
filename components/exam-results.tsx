'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { gradeExam, getExamSession } from '@/lib/db';
import { ExamResult } from '@/lib/types';

interface ExamResultsProps {
  sessionId: string;
  onDone: () => void;
}

export function ExamResults({ sessionId, onDone }: ExamResultsProps) {
  const { student } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      const session = getExamSession(sessionId);
      if (session && student) {
        const examResult = await gradeExam(sessionId, student.schoolId);
        setResult(examResult);
      }
      setIsLoading(false);
    }
    loadResult();
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

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-3xl mx-auto">
        {/* School Header */}
        <div className="text-center mb-12">
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

        {/* Result Card */}
        <Card className="border-primary/20 shadow-xl mb-8">
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
              {/* Score */}
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

              {/* Percentage */}
              <div className="text-center p-6 rounded-lg bg-secondary/5 border border-secondary/20">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  Percentage
                </p>
                <p className="text-4xl font-bold text-secondary">
                  {result.percentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">Performance</p>
              </div>

              {/* Grade */}
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

        {/* Grade Interpretation */}
        <Card className="border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="text-base">Grade Scale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-5 gap-3 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-700 mb-1">A</div>
                <div className="text-muted-foreground text-xs">90-100%</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700 mb-1">B</div>
                <div className="text-muted-foreground text-xs">80-89%</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-700 mb-1">C</div>
                <div className="text-muted-foreground text-xs">70-79%</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-700 mb-1">D</div>
                <div className="text-muted-foreground text-xs">60-69%</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-700 mb-1">F</div>
                <div className="text-muted-foreground text-xs">Below 60%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
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
