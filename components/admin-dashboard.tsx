'use client';

import React, { useState, useEffect } from "react";
import { useTeacherAuth } from '@/lib/teacher-auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// Corrected Imports: Removing local db functions that caused TS errors
import { Question, ExamResult } from '@/lib/types';
import { commonEntranceSubjects } from '@/lib/subjects';
import { Download, Printer, Trash2 } from 'lucide-react';

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
  const [autoNumber, setAutoNumber] = useState(true);

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

  // --- CLOUD LOGIC: QUESTIONS ---
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText || !formData.optionA || !formData.optionB || !formData.optionC || !formData.optionD) {
      alert('Please fill in all fields');
      return;
    }

    const newQuestion = {
      subject: formData.subject,
      examType: 'common-entrance',
      questionType: 'objective',
      questionNumber: parseInt(formData.questionNumber.toString()),
      questionText: formData.questionText,
      year: new Date().getFullYear(),
      options: { a: formData.optionA, b: formData.optionB, c: formData.optionC, d: formData.optionD },
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation || 'Added by Admin.',
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setSuccessMessage(`Question saved to MongoDB!`);
      setShowSuccess(true);
      
      if (autoNumber) {
        setFormData(prev => ({ 
            ...prev, 
            questionNumber: prev.questionNumber + 1, 
            questionText: '', 
            optionA: '', 
            optionB: '', 
            optionC: '', 
            optionD: '', 
            explanation: '' 
        }));
      }
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save to cloud database. Check your connection.');
    }
  };

  const handleViewQuestions = async () => {
    try {
      const res = await fetch(`/api/questions?examType=common-entrance&subject=${encodeURIComponent(formData.subject)}&full=true`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setActiveTab('view-questions');
  };

  // --- CLOUD LOGIC: RESULTS ---
  const handleViewResults = async () => {
    try {
      const res = await fetch('/api/results');
      const data = await res.json();
      if (res.ok && data.success) {
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch results from MongoDB:', err);
    }
    setActiveTab('view-results');
  };

  // Refresh data when switching tabs
  useEffect(() => {
    if (activeTab === 'view-results') handleViewResults();
    if (activeTab === 'view-questions') handleViewQuestions();
  }, [activeTab]);

  const handleDownloadCSV = () => {
    const csvHeaders = ['Student Name', 'School ID', 'Subject', 'Score', 'Total', '%', 'Date'];
    const csvRows = results.map(r => [
      r.studentName, 
      r.schoolId, 
      r.subject || 'Entrance', 
      r.score, 
      r.totalQuestions, 
      r.percentage.toFixed(1), 
      new Date(r.completedAt).toLocaleDateString()
    ]);
    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `results-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">G</div>
            <h1 className="text-xl font-bold text-primary">GMIS Teacher Portal</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </header>

      <nav className="bg-white border-b flex px-6 gap-6 overflow-x-auto">
        <button onClick={() => setActiveTab('add-question')} className={`py-4 border-b-2 whitespace-nowrap ${activeTab === 'add-question' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500'}`}>Add Question</button>
        <button onClick={() => { handleViewQuestions(); setActiveTab('view-questions'); }} className={`py-4 border-b-2 whitespace-nowrap ${activeTab === 'view-questions' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500'}`}>View Questions</button>
        <button onClick={() => { handleViewResults(); setActiveTab('view-results'); }} className={`py-4 border-b-2 whitespace-nowrap ${activeTab === 'view-results' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500'}`}>View Results</button>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {activeTab === 'add-question' && (
          <Card>
            <CardHeader>
                <CardTitle>Upload Common Entrance Question</CardTitle>
                <CardDescription>Questions saved here are stored in MongoDB and visible to all students.</CardDescription>
            </CardHeader>
            <CardContent>
              {showSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 border border-green-200">✓ {successMessage}</div>}
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full border p-2 rounded bg-white">
                        {commonEntranceSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Question Number</label>
                    <Input type="number" name="questionNumber" value={formData.questionNumber} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Question Text</label>
                    <textarea name="questionText" value={formData.questionText} onChange={handleInputChange} className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Type question here..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input name="optionA" value={formData.optionA} onChange={handleInputChange} placeholder="Option A" />
                  <Input name="optionB" value={formData.optionB} onChange={handleInputChange} placeholder="Option B" />
                  <Input name="optionC" value={formData.optionC} onChange={handleInputChange} placeholder="Option C" />
                  <Input name="optionD" value={formData.optionD} onChange={handleInputChange} placeholder="Option D" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Correct Answer</label>
                    <select name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} className="w-full border p-2 rounded bg-white">
                        <option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option><option value="d">Option D</option>
                    </select>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Save to Cloud Database</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'view-questions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Questions: {formData.subject}</h2>
                <select value={formData.subject} onChange={(e) => { setFormData(p => ({...p, subject: e.target.value})); handleViewQuestions(); }} className="border p-1 rounded text-sm">
                    {commonEntranceSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>
            {questions.length === 0 && <p className="text-center py-10 text-slate-400 border-2 border-dashed rounded">No questions uploaded yet.</p>}
            {questions.map((q) => (
              <Card key={q.id || q.questionNumber} className="p-4 flex justify-between items-center">
                <div>
                    <span className="font-bold text-primary mr-2">Q{q.questionNumber}</span>
                    <span className="text-slate-700">{q.questionText}</span>
                </div>
                <Button variant="ghost" className="text-red-500 hover:bg-red-50"><Trash2 size={16} /></Button>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'view-results' && (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center border-b mb-4">
              <div>
                <CardTitle>Entrance Exam Results</CardTitle>
                <CardDescription>Synced via MongoDB Cloud</CardDescription>
              </div>
              <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="border-primary text-primary"><Download size={16} className="mr-2"/> Export CSV</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="text-slate-500 text-sm border-b">
                        <th className="pb-2">Student Name</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2">Percentage</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((r) => (
                        <tr key={r.id || Math.random()} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-medium">{r.studentName}</td>
                        <td className="py-3">{r.score}/{r.totalQuestions}</td>
                        <td className="py-3">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                {r.percentage ? r.percentage.toFixed(0) : 0}%
                            </span>
                        </td>
                        <td className="py-3 text-sm text-slate-500">{new Date(r.completedAt).toLocaleDateString()}</td>
                        <td className="py-3">
                            <Button variant="ghost" size="sm" onClick={() => window.print()}><Printer size={14}/></Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
              {results.length === 0 && <div className="text-center py-20 text-slate-400">No results found in the cloud database.</div>}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}