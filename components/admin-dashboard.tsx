'use client';

import React, { useState, useEffect } from "react";
import { useTeacherAuth } from '@/lib/teacher-auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Question, ExamResult } from '@/lib/types';
import { commonEntranceSubjects } from '@/lib/subjects';
import { Download, Printer, Trash2, RefreshCcw, Loader2 } from 'lucide-react';

export function AdminDashboard({ onLogout }: { onLogout?: () => void }) {
  const { teacher, logout } = useTeacherAuth();
  const [activeTab, setActiveTab] = useState<'add-question' | 'view-questions' | 'view-results'>('add-question');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- DELETE LOGIC ---
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this question from MongoDB?")) return;
    
    try {
      const res = await fetch('/api/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        // Remove from local state immediately
        setQuestions(prev => prev.filter(q => (q as any)._id !== id && q.id !== id));
      } else {
        alert("Delete failed: " + data.error);
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  const handleViewQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/questions?examType=common-entrance&subject=${encodeURIComponent(formData.subject)}&full=true&t=${Date.now()}`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache' } 
      });
      const data = await res.json();
      if (data.success) setResults(data.results || []);
    } catch (err) {
      console.error('MongoDB Result Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view-results') handleViewResults();
    if (activeTab === 'view-questions') handleViewQuestions();
  }, [activeTab, formData.subject]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newQuestion = {
      subject: formData.subject,
      examType: 'common-entrance',
      questionNumber: Number(formData.questionNumber),
      questionText: formData.questionText,
      options: { a: formData.optionA, b: formData.optionB, c: formData.optionC, d: formData.optionD },
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation || 'Exam Question'
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        setFormData(p => ({ 
          ...p, 
          questionNumber: Number(p.questionNumber) + 1, 
          questionText: '', 
          optionA: '', optionB: '', optionC: '', optionD: '' 
        }));
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to save to MongoDB");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-primary italic">GMIS PORTAL | ADMIN</h1>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </header>

      <nav className="bg-white border-b flex px-6 gap-6">
        <button onClick={() => setActiveTab('add-question')} className={`py-4 border-b-2 transition-all ${activeTab === 'add-question' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500'}`}>Add Question</button>
        <button onClick={() => setActiveTab('view-questions')} className={`py-4 border-b-2 transition-all ${activeTab === 'view-questions' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500'}`}>Questions List</button>
        <button onClick={() => setActiveTab('view-results')} className={`py-4 border-b-2 transition-all ${activeTab === 'view-results' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500'}`}>Exam Results</button>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {/* ADD QUESTION TAB */}
        {activeTab === 'add-question' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader><CardTitle>Upload New Question</CardTitle></CardHeader>
            <CardContent>
              {showSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 border border-green-200">✓ Saved to Cloud Database</div>}
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <select name="subject" value={formData.subject} onChange={handleInputChange} className="border p-2 rounded">
                        {commonEntranceSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <Input type="number" name="questionNumber" value={formData.questionNumber} onChange={handleInputChange} />
                </div>
                <textarea name="questionText" placeholder="Type Question..." value={formData.questionText} onChange={handleInputChange} className="w-full border p-2 rounded h-24 outline-none focus:ring-1 ring-primary" />
                <div className="grid grid-cols-2 gap-3">
                  <Input name="optionA" placeholder="Option A" value={formData.optionA} onChange={handleInputChange} required />
                  <Input name="optionB" placeholder="Option B" value={formData.optionB} onChange={handleInputChange} required />
                  <Input name="optionC" placeholder="Option C" value={formData.optionC} onChange={handleInputChange} required />
                  <Input name="optionD" placeholder="Option D" value={formData.optionD} onChange={handleInputChange} required />
                </div>
                <select name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} className="w-full border p-2 rounded">
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                </select>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : "Save to MongoDB"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* VIEW QUESTIONS TAB */}
        {activeTab === 'view-questions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded border shadow-sm">
                <h2 className="text-xl font-bold">Subject: {formData.subject}</h2>
                <Button onClick={handleViewQuestions} variant="ghost" size="sm"><RefreshCcw size={16} className={loading ? "animate-spin" : ""} /></Button>
            </div>
            {questions.map((q: any) => (
              <Card key={q._id || q.id} className="p-4 shadow-sm border-l-4 border-l-primary relative group">
                <div className="flex justify-between items-start mb-3 border-b pb-2">
                  <div className="font-bold text-slate-800">Q{q.questionNumber}: {q.questionText}</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteQuestion(q._id || q.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div className="p-2 bg-slate-50 rounded border"><span className="font-bold text-primary mr-2">A</span> {q.options?.a}</div>
                  <div className="p-2 bg-slate-50 rounded border"><span className="font-bold text-primary mr-2">B</span> {q.options?.b}</div>
                  <div className="p-2 bg-slate-50 rounded border"><span className="font-bold text-primary mr-2">C</span> {q.options?.c}</div>
                  <div className="p-2 bg-slate-50 rounded border"><span className="font-bold text-primary mr-2">D</span> {q.options?.d}</div>
                </div>
                <div className="text-xs font-bold uppercase text-green-600 px-2 py-1 bg-green-50 w-fit rounded">
                    Correct Answer: {q.correctAnswer}
                </div>
              </Card>
            ))}
            {questions.length === 0 && !loading && <p className="text-center text-slate-400 py-10">No questions found.</p>}
          </div>
        )}

        {/* VIEW RESULTS TAB */}
        {activeTab === 'view-results' && (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center border-b pb-4">
              <CardTitle>Cloud Sync: Student Results</CardTitle>
              <Button onClick={handleViewResults} variant="outline" size="sm"><RefreshCcw size={14} className={loading ? "animate-spin mr-2" : "mr-2"}/> Sync Database</Button>
            </CardHeader>
            <CardContent className="mt-4">
              <table className="w-full text-left">
                <thead><tr className="text-slate-500 text-sm border-b"><th className="pb-3">Student Name</th><th className="pb-3">Score</th><th className="pb-3">Percentage</th><th className="pb-3">Date</th></tr></thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id || Math.random()} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-medium">{r.studentName}</td>
                      <td className="py-4 font-bold text-primary">{r.score}/{r.totalQuestions}</td>
                      <td className="py-4"><span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">{r.percentage?.toFixed(0)}%</span></td>
                      <td className="py-4 text-sm text-slate-500">{new Date(r.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}