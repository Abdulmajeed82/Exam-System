'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { gradeExam, getExamSession } from '@/lib/db';
import { ExamResult, Question } from '@/lib/types';
import { CheckCircle2, XCircle, FileText, Trophy } from 'lucide-react';

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
      setIsLoading(true);
      try {
        // FIX: Added await to ensure data is fetched before grading
        const session = await getExamSession(sessionId);
        
        if (session && student) {
          const examResult = await gradeExam(sessionId, student.schoolId);
          setResult(examResult);
          setQuestions(session.questionDetails || []);
          setAnswers(session.answers || {});
        }
      } catch (error) {
        console.error("Critical Error loading results:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetailedResult();
  }, [sessionId, student]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-medium">Processing Exam Scores...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-800 font-bold mb-2">Results Not Found</p>
            <p className="text-muted-foreground mb-6 text-sm">We couldn't retrieve your score. This happens if the session was interrupted.</p>
            <Button onClick={onDone} className="w-full">Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // JAMB Score Calculation (Scale to 400)
  const isJamb = result.examType === 'jamb';
  const displayScore = isJamb ? Math.round((result.score / result.totalQuestions) * 400) : result.score;
  const scoreLabel = isJamb ? "/ 400" : `out of ${result.totalQuestions}`;

  const gradeColor = result.percentage >= 70 ? 'text-green-700' : result.percentage >= 50 ? 'text-blue-700' : 'text-red-700';
  const gradeBgColor = result.percentage >= 70 ? 'bg-green-50' : result.percentage >= 50 ? 'bg-blue-50' : 'bg-red-50';

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Practice Result</h1>
          <p className="text-slate-500 font-medium">Great Model International School - CBT Portal</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border">
            <TabsTrigger value="summary">Score Summary</TabsTrigger>
            <TabsTrigger value="review">Review Paper</TabsTrigger>
            <TabsTrigger value="explanations">Explanations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card className="border-none shadow-xl overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Student Name</p>
                  <p className="text-lg font-bold">{result.studentName}</p>
                </div>
                <Badge className="bg-primary text-white uppercase">{result.examType}</Badge>
              </div>

              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="p-6 rounded-2xl bg-slate-50 border flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Score</p>
                    <p className="text-5xl font-black text-slate-900">{displayScore}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">{scoreLabel}</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Percentage</p>
                    <p className="text-5xl font-black text-blue-600">{result.percentage.toFixed(1)}%</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Accuracy</p>
                  </div>

                  <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center ${gradeBgColor}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Remark</p>
                    <p className={`text-5xl font-black ${gradeColor}`}>{result.grade}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase">{result.grade === 'A' ? 'Excellent' : 'Completed'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" /> Stats Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between p-2 border-b">
                      <span className="text-slate-500">Correct:</span>
                      <span className="font-bold text-green-600">{result.score}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span className="text-slate-500">Wrong:</span>
                      <span className="font-bold text-red-600">{result.totalQuestions - result.score}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span className="text-slate-500">Exam Date:</span>
                      <span className="font-bold">{new Date(result.completedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b">
                      <span className="text-slate-500">Questions:</span>
                      <span className="font-bold">{result.totalQuestions}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <Card key={question.id} className="border-none shadow-sm overflow-hidden">
                  <div className={`p-1 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                  <CardHeader className="bg-white">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <CardTitle className="text-base mt-2 leading-relaxed">{question.questionText}</CardTitle>
                      </div>
                      {isCorrect ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <XCircle className="text-red-500 w-6 h-6" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 bg-slate-50/50">
                    {Object.entries(question.options || {}).map(([key, value]) => (
                      <div key={key} className={`p-3 rounded-lg border text-sm flex items-center gap-3 ${key === question.correctAnswer ? 'bg-green-100 border-green-300 font-bold' : key === userAnswer ? 'bg-red-100 border-red-300' : 'bg-white'}`}>
                        <span className="uppercase">{key}.</span>
                        <span>{value}</span>
                        {key === question.correctAnswer && <span className="ml-auto text-[10px] text-green-700">CORRECT</span>}
                        {key === userAnswer && key !== question.correctAnswer && <span className="ml-auto text-[10px] text-red-700">YOUR CHOICE</span>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="explanations" className="space-y-4">
             {questions.map((q, i) => (
               <Card key={q.id} className="p-6">
                 <p className="font-bold text-sm mb-2 text-primary">Question {i+1} Explanation:</p>
                 <p className="text-slate-600 text-sm leading-relaxed">{q.explanation || "No explanation provided for this question."}</p>
               </Card>
             ))}
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-4">
          <Button onClick={onDone} className="flex-1 h-12 bg-slate-900 hover:bg-black font-bold">Return to Dashboard</Button>
          <Button variant="outline" onClick={() => window.print()} className="h-12 font-bold px-8">Print Report</Button>
        </div>
      </div>
    </div>
  );
}