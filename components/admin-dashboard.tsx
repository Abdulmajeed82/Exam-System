'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useTeacherAuth } from '@/lib/teacher-auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  getQuestionsByExamType,
  addQuestion,
  deleteQuestion,
  getSubjectsByExamType,
  getAllResults,
  deleteResult,
} from '@/lib/db';
import { Question, ExamResult } from '@/lib/types';
import { commonEntranceSubjects } from '@/lib/subjects';
import { Download, Printer, Eye, FileText, Trash2 } from 'lucide-react';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { teacher, logout } = useTeacherAuth();
  const [activeTab, setActiveTab] = useState<'add-question' | 'view-questions' | 'view-results'>(
    'add-question'
  );
  const [formData, setFormData] = useState({
    subject: 'English',
    questionNumber: 1,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'a' as 'a' | 'b' | 'c' | 'd',
    explanation: '',
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-numbering and suggestions for Add Question
  const [autoNumber, setAutoNumber] = useState(true);
  const [textSuggestions, setTextSuggestions] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'questionNumber' ? (parseInt(value as string, 10) || 0) : value,
    }));
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.questionText ||
      !formData.optionA ||
      !formData.optionB ||
      !formData.optionC ||
      !formData.optionD
    ) {
      alert('Please fill in all fields');
      return;
    }

    const newQuestion: Question = {
      // let backend assign a stable id; keep this client id as a fallback
      id: `CE-${formData.subject.substring(0, 2).toUpperCase()}-${Date.now()}`,
      subject: formData.subject,
      examType: 'common-entrance',
      questionType: 'objective',
      questionNumber: parseInt(formData.questionNumber.toString()),
      questionText: formData.questionText,
      year: new Date().getFullYear(),
      options: {
        a: formData.optionA,
        b: formData.optionB,
        c: formData.optionC,
        d: formData.optionD,
      },
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation || 'Explanation will be added by teacher.',
      createdAt: new Date().toISOString(),
    };

    try {
      // POST to server API which persists to MongoDB
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save question');
      }

      // Optionally add to local store for immediate UX (keeps offline behavior)
      addQuestion(data.question);

      setSuccessMessage(`Question added and saved to DB! ID: ${data.question.id}`);
      setShowSuccess(true);

      // Reset form and compute next number if auto-numbering is enabled
      if (autoNumber) {
        await updateNextNumber(formData.subject);
        setFormData((prev) => ({
          ...prev,
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'a',
          explanation: '',
        }));
      } else {
        setFormData({
          subject: formData.subject, // Keep the same subject
          questionNumber: formData.questionNumber + 1,
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'a',
          explanation: '',
        });
      }

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save question to DB:', err);
      alert('Failed to save question to database. Please try again.');
    }
  };

  const handleViewQuestions = async () => {
    try {
      const res = await fetch(`/api/questions?examType=common-entrance&subject=${encodeURIComponent(
        formData.subject
      )}&full=true`);
      const data = await res.json();
      if (res.ok && data.success) {
        setQuestions(data.questions || []);
      } else {
        console.error('Failed to fetch questions from server:', data.error);
        // fallback to local questions
        const subjectQuestions = await getQuestionsByExamType('common-entrance', formData.subject);
        setQuestions(subjectQuestions);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      const subjectQuestions = await getQuestionsByExamType('common-entrance', formData.subject);
      setQuestions(subjectQuestions);
    }

    setActiveTab('view-questions');
  };

  const handleViewResults = () => {
    const allResults = getAllResults();
    setResults(allResults);
    setSelectedResult(null);
    setActiveTab('view-results');
  };

  // Auto-refresh results when they change in localStorage (e.g., new exam submissions)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'exam_system_results') {
        setResults(getAllResults());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Update next available question number and suggestions for the selected subject
  const updateNextNumber = async (subject?: string) => {
    const subj = subject || formData.subject;
    if (!subj) return;
    try {
      const subjectQuestions = await getQuestionsByExamType('common-entrance', subj);
      const max = subjectQuestions.reduce((m, q) => Math.max(m, q.questionNumber || 0), 0);
      const next = max + 1;
      setFormData((prev) => ({ ...prev, questionNumber: next }));
      const recent = subjectQuestions.slice(-10).map((q) => q.questionText).filter(Boolean);
      setTextSuggestions(recent);
    } catch (err) {
      console.error('Failed to compute next question number:', err);
    }
  };

  useEffect(() => {
    if (autoNumber) {
      updateNextNumber(formData.subject);
    }
  }, [formData.subject, autoNumber]);

  const handlePrintResult = (result: ExamResult) => {
    setSelectedResult(result);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadCSV = () => {
    const csvHeaders = ['Student Name', 'School ID', 'Subject', 'Score', 'Total Questions', 'Percentage', 'Grade', 'Date'];
    const csvRows = results.map(result => [
      result.studentName,
      result.schoolId,
      result.subject || result.subjects?.join(', ') || '-',
      result.score.toString(),
      result.totalQuestions.toString(),
      result.percentage.toFixed(1),
      result.grade,
      new Date(result.completedAt).toLocaleDateString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exam-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewResultDetail = (result: ExamResult) => {
    setSelectedResult(result);
  };

  const handleBackToResults = () => {
    setSelectedResult(null);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        const res = await fetch('/api/questions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: questionId }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');

        // Refresh the questions list from server
        const refreshed = await fetch(`/api/questions?examType=common-entrance&subject=${encodeURIComponent(formData.subject)}`);
        const json = await refreshed.json();
        setQuestions(json.questions || []);

        setSuccessMessage('Question deleted successfully!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to delete question:', err);
        alert('Failed to delete question. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b border-primary/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <div>
              <h1 className="font-bold text-primary text-lg">Teacher Dashboard</h1>
              <p className="text-xs text-muted-foreground">GMIS Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{teacher?.name}</p>
              <p className="text-xs text-muted-foreground">{teacher?.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-4 flex gap-4">
          <button
            onClick={() => setActiveTab('add-question')}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === 'add-question'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Add Question
          </button>
          <button
            onClick={handleViewQuestions}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === 'view-questions'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            View Questions
          </button>
          <button
            onClick={handleViewResults}
            className={`px-4 py-4 font-medium border-b-2 transition-colors ${
              activeTab === 'view-results'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            View Results
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Add Question Tab */}
        {activeTab === 'add-question' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Add New Common Entrance Question</CardTitle>
                  <CardDescription>
                    Create a new multiple choice question for the school entrance exam
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-900">
                      <p className="font-medium">{successMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleAddQuestion} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          {commonEntranceSubjects.map((subject) => (
                            <option key={subject.id} value={subject.name}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Question Number</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            name="questionNumber"
                            value={formData.questionNumber}
                            onChange={handleInputChange}
                            className="border-primary/30"
                          />

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={autoNumber}
                              onChange={(e) => setAutoNumber(e.target.checked)}
                            />
                            <span>Auto</span>
                          </label>

                          <span className="text-xs text-muted-foreground ml-2">Next: <span className="font-medium">{formData.questionNumber}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Question Text</label>
                      <textarea
                        name="questionText"
                        value={formData.questionText}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter the question here"
                      />
                      {textSuggestions.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {textSuggestions.map((s, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setFormData((prev) => ({ ...prev, questionText: s }))}
                              className="text-xs px-2 py-1 bg-secondary/10 rounded"
                            >
                              {s.length > 60 ? s.slice(0, 60) + '…' : s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium block">Options</label>
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div key={option} className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Option {option}
                          </label>
                          <Input
                            name={`option${option}`}
                            value={formData[`option${option}` as keyof typeof formData] as string}
                            onChange={handleInputChange}
                            placeholder={`Enter option ${option}`}
                            className="border-primary/30"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Correct Answer</label>
                      <select
                        name="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="a">Option A</option>
                        <option value="b">Option B</option>
                        <option value="c">Option C</option>
                        <option value="d">Option D</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Explanation (Optional)</label>
                      <textarea
                        name="explanation"
                        value={formData.explanation}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter explanation for the correct answer"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Add Question
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Quick Guide</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">1.</span> Select the
                    subject
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">2.</span> Enter question
                    number
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">3.</span> Write the
                    question
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">4.</span> Enter all
                    four options
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">5.</span> Select the
                    correct answer
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">6.</span> Click Add
                    Question
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* View Questions Tab */}
        {activeTab === 'view-questions' && (
          <div>
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>
                  Questions - {formData.subject}
                </CardTitle>
                <CardDescription>
                  Total: {questions.length} questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showSuccess && (
                  <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-900">
                    <p className="font-medium">{successMessage}</p>
                  </div>
                )}
                {questions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No questions found for {formData.subject}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        className="p-4 rounded-lg border border-primary/20 bg-primary/5"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground flex-1">
                            Q{question.questionNumber}: {question.questionText}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                              {question.id}
                            </span>
                            <Button
                              onClick={() => handleDeleteQuestion(question.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {question.options && (
                          <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          {Object.entries(question.options).map(([key, value]) => (
                            <div
                              key={key}
                              className={
                                question.correctAnswer === key
                                  ? 'text-green-700 font-medium'
                                  : 'text-foreground'
                              }
                            >
                              <span className="font-semibold">{key.toUpperCase()}.</span> {value}
                              {question.correctAnswer === key && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  ✓ Correct
                                </span>
                              )}
                            </div>
                          ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Results Tab */}
        {activeTab === 'view-results' && (
          <div>
            {!selectedResult ? (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Student Exam Results</CardTitle>
                      <CardDescription>
                        Total Results: {results.length}
                      </CardDescription>
                    </div>
                    {results.length > 0 && (
                      <Button
                        onClick={handleDownloadCSV}
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/5"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {results.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No exam results yet
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/20 bg-primary/5">
                            <th className="text-left p-3 font-semibold">Student Name</th>
                            <th className="text-left p-3 font-semibold">School ID</th>
                            <th className="text-left p-3 font-semibold">Subject</th>
                            <th className="text-left p-3 font-semibold">Score</th>
                            <th className="text-left p-3 font-semibold">Percentage</th>
                            <th className="text-left p-3 font-semibold">Grade</th>
                            <th className="text-left p-3 font-semibold">Date</th>
                            <th className="text-left p-3 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((result) => (
                            <tr
                              key={result.id}
                              className="border-b border-primary/10 hover:bg-primary/5"
                            >
                              <td className="p-3">{result.studentName}</td>
                              <td className="p-3">{result.schoolId}</td>
                              <td className="p-3">{result.subject || result.subjects?.join(', ') || '-'}</td>
                              <td className="p-3 font-medium">
                                {result.score}/{result.totalQuestions}
                              </td>
                              <td className="p-3 font-medium">{result.percentage.toFixed(1)}%</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded font-bold text-xs ${
                                    result.grade === 'A'
                                      ? 'bg-green-100 text-green-700'
                                      : result.grade === 'B'
                                        ? 'bg-blue-100 text-blue-700'
                                        : result.grade === 'C'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : result.grade === 'D'
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {result.grade}
                                </span>
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {new Date(result.completedAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleViewResultDetail(result)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handlePrintResult(result)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="Print Result"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      if (confirm('Delete this result? This action cannot be undone.')) {
                                        const ok = deleteResult(result.id);
                                        if (ok) {
                                          setResults(getAllResults());
                                          setSuccessMessage('Result deleted successfully.');
                                          setShowSuccess(true);
                                          setTimeout(() => setShowSuccess(false), 3000);
                                        } else {
                                          alert('Failed to delete result.');
                                        }
                                      }
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete Result"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div>
                {/* Detailed Result View */}
                <div className="mb-4 print:hidden">
                  <Button
                    onClick={handleBackToResults}
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/5"
                  >
                    ← Back to Results
                  </Button>
                </div>

                <Card className="border-primary/20">
                  <CardHeader className="bg-linear-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
                    <div className="flex items-center justify-between print:block">
                      <div>
                        <CardTitle className="text-primary">Student Exam Result</CardTitle>
                        <CardDescription>
                          {selectedResult.examType === 'common-entrance'
                            ? 'School Common Entrance Examination'
                            : selectedResult.examType === 'waec'
                              ? 'WAEC Past Questions Practice'
                              : 'JAMB CBT Past Questions Practice'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 print:hidden mt-4">
                        <Button
                          onClick={() => handlePrintResult(selectedResult)}
                          variant="outline"
                          className="border-primary/30 text-primary hover:bg-primary/5"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    {/* School Header - Print Only */}
                    <div className="hidden print:block text-center mb-8 pb-6 border-b border-primary/20">
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

                    {/* Student Info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-primary/20">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          Student Name
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {selectedResult.studentName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          School ID
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {selectedResult.schoolId}
                        </p>
                      </div>
                      {selectedResult.subject && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                            Subject
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {selectedResult.subject}
                          </p>
                        </div>
                      )}
                      {selectedResult.subjects && selectedResult.subjects.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                            Subjects
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {selectedResult.subjects.join(', ')}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          Date Completed
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {new Date(selectedResult.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                          Exam Type
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {selectedResult.examType.toUpperCase()}
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
                          {selectedResult.score}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          out of {selectedResult.totalQuestions}
                        </p>
                      </div>

                      <div className="text-center p-6 rounded-lg bg-secondary/5 border border-secondary/20">
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                          Percentage
                        </p>
                        <p className="text-4xl font-bold text-secondary">
                          {selectedResult.percentage.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Performance</p>
                      </div>

                      <div
                        className={`text-center p-6 rounded-lg border border-solid ${
                          selectedResult.grade === 'A'
                            ? 'bg-green-50 border-green-200'
                            : selectedResult.grade === 'B'
                              ? 'bg-blue-50 border-blue-200'
                              : selectedResult.grade === 'C'
                                ? 'bg-yellow-50 border-yellow-200'
                                : selectedResult.grade === 'D'
                                  ? 'bg-orange-50 border-orange-200'
                                  : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                          Grade
                        </p>
                        <p
                          className={`text-4xl font-bold ${
                            selectedResult.grade === 'A'
                              ? 'text-green-700'
                              : selectedResult.grade === 'B'
                                ? 'text-blue-700'
                                : selectedResult.grade === 'C'
                                  ? 'text-yellow-700'
                                  : selectedResult.grade === 'D'
                                    ? 'text-orange-700'
                                    : 'text-red-700'
                          }`}
                        >
                          {selectedResult.grade}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedResult.grade === 'A'
                            ? 'Excellent'
                            : selectedResult.grade === 'B'
                              ? 'Very Good'
                              : selectedResult.grade === 'C'
                                ? 'Good'
                                : selectedResult.grade === 'D'
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
                            {selectedResult.score}/{selectedResult.totalQuestions}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Incorrect Answers:</span>
                          <span className="font-medium text-foreground">
                            {selectedResult.totalQuestions - selectedResult.score}/{selectedResult.totalQuestions}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Success Rate:</span>
                          <span className="font-medium text-foreground">
                            {selectedResult.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer - Print Only */}
                    <div className="hidden print:block mt-8 pt-6 border-t border-primary/20 text-center text-sm text-muted-foreground">
                      <p>This is an official result from Great Model International School</p>
                      <p className="mt-2">Printed on: {new Date().toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
