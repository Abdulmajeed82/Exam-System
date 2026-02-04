'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createExamSession, updateExamSession } from '@/lib/db';
import { getSubjectsByExamType } from '@/lib/subjects';
import { Question, ExamSession, Subject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function ExamInterface({ examType, onComplete, onBack }: any) {
  const [mounted, setMounted] = useState(false);
  const { student } = useAuth();
  const { toast } = useToast();

  // State Management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [activeSubject, setActiveSubject] = useState('English Language');

  // JAMB Subject Picker
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [e1, setE1] = useState('');
  const [e2, setE2] = useState('');

  useEffect(() => { setMounted(true); setSubjects(getSubjectsByExamType('jamb')); }, []);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [isStarted, timeLeft]);

  const startExam = async () => {
    if (!e1 || !e2) return toast({ title: "Pick Electives", description: "Select your remaining 2 subjects." });
    
    const finalSubs = ['English Language', 'Mathematics', e1, e2];
    const res = await createExamSession(student.id, student.name, 'jamb', finalSubs);
    
    // Correct Slicing: 60 English, 40 Others
    const eng = res.questionDetails?.filter(q => q.subject === 'English Language').slice(0, 60) || [];
    const mat = res.questionDetails?.filter(q => q.subject === 'Mathematics').slice(0, 40) || [];
    const s1 = res.questionDetails?.filter(q => q.subject === e1).slice(0, 40) || [];
    const s2 = res.questionDetails?.filter(q => q.subject === e2).slice(0, 40) || [];
    
    setQuestions([...eng, ...mat, ...s1, ...s2]);
    setSession(res);
    setIsStarted(true);
  };

  const handleSelect = (val: string) => {
    if (!session) return;
    const newAns = { ...session.answers, [questions[currentIdx].id]: val };
    updateExamSession(session.id, { answers: newAns });
    setSession({ ...session, answers: newAns });
  };

  if (!mounted) return null;

  // --- 1. THE LOGIN / SETUP SCREEN ---
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-t-4 border-blue-700 shadow-xl">
          <div className="p-6 text-center border-b">
            <h1 className="text-xl font-bold text-blue-900">JAMB CBT PORTAL</h1>
            <p className="text-xs text-slate-500 uppercase">2026 Examination Session</p>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold border-b pb-2">
                <span>1. Use of English</span> <span className="text-blue-600">(60 Qs)</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-b pb-2">
                <span>2. Mathematics</span> <span className="text-blue-600">(40 Qs)</span>
              </div>
              <Select onValueChange={setE1}><SelectTrigger><SelectValue placeholder="Select Elective 1 (40 Qs)" /></SelectTrigger>
                <SelectContent>{subjects.filter(s => !['English Language', 'Mathematics'].includes(s.name)).map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={setE2}><SelectTrigger><SelectValue placeholder="Select Elective 2 (40 Qs)" /></SelectTrigger>
                <SelectContent>{subjects.filter(s => !['English Language', 'Mathematics', e1].includes(s.name)).map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-blue-700 hover:bg-blue-800 h-12" onClick={startExam}>Login & Start Exam</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- 2. THE EXAM INTERFACE ---
  const filteredQuestions = questions.filter(q => q.subject === activeSubject);
  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header: Timer & Progress */}
      <header className="bg-[#003366] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex gap-4">
          {['English Language', 'Mathematics', e1, e2].map(s => (
            <button 
              key={s} 
              onClick={() => { setActiveSubject(s); setCurrentIdx(questions.findIndex(q => q.subject === s)); }}
              className={`px-3 py-1 text-xs font-bold rounded ${activeSubject === s ? 'bg-white text-blue-900' : 'bg-blue-800 text-blue-200'}`}
            >
              {s.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="bg-red-600 px-4 py-1 rounded font-mono text-xl animate-pulse">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Exam Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-end">
               <span className="text-blue-900 font-bold uppercase text-sm tracking-widest">{currentQ?.subject}</span>
               <span className="text-slate-400 text-xs font-bold">QUESTION {currentIdx + 1}</span>
            </div>
            <h2 className="text-xl font-medium text-slate-800 mb-10 leading-relaxed">{currentQ?.questionText}</h2>
            
            <div className="grid gap-4">
              {Object.entries(currentQ?.options || {}).map(([key, val]) => (
                <div 
                  key={key} 
                  onClick={() => handleSelect(key)}
                  className={`p-4 border-2 rounded-lg cursor-pointer flex items-center gap-4 transition-all ${session?.answers[currentQ.id] === key ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${session?.answers[currentQ.id] === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'}`}>{key.toUpperCase()}</div>
                  <span className="text-slate-700">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Question Map (Just like real JAMB) */}
        <aside className="w-64 bg-slate-50 border-l p-4 overflow-y-auto hidden lg:block">
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase">Question Map</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-8 h-8 text-[10px] font-bold rounded border ${i === currentIdx ? 'bg-blue-600 text-white border-blue-600' : session?.answers[q.id] ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-400'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button className="w-full mt-8 bg-red-600 hover:bg-red-700" onClick={() => onComplete(session!.id)}>Submit Exam</Button>
        </aside>
      </div>

      {/* Footer Navigation */}
      <footer className="p-4 bg-slate-100 border-t flex justify-center gap-4">
        <Button variant="outline" className="w-32" onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}>Previous</Button>
        <Button className="w-32 bg-blue-700" onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))}>Next</Button>
      </footer>
    </div>
  );
}