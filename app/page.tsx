'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { TeacherAuthProvider, useTeacherAuth } from '@/lib/teacher-auth-context';
import { StudentLogin } from '@/components/student-login';
import { StudentDashboard } from '@/components/student-dashboard';
import { ExamInterface } from '@/components/exam-interface';
import { EntranceExamInterface } from '@/components/entrance-exam-interface';
import { ExamResultsDetailed } from '@/components/exam-results-detailed';
import { EntranceExamResults } from '@/components/entrance-exam-results';
import { TeacherLogin } from '@/components/teacher-login';
import { AdminDashboard } from '@/components/admin-dashboard';
import { Button } from '@/components/ui/button';

// --- SUB-COMPONENTS ---

function StudentApp() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'exam' | 'entrance-exam' | 'results' | 'entrance-results'>('dashboard');
  const [selectedExamType, setSelectedExamType] = useState<'common-entrance' | 'waec' | 'jamb' | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const viewPath = currentView === 'exam' && selectedExamType ? `${selectedExamType}:${selectedSubject || ''}` : currentView;
      window.location.hash = `#student:${viewPath}`;
    } catch (e) { /* ignore */ }
  }, [currentView, selectedExamType, selectedSubject, isAuthenticated]);

  if (!isAuthenticated) return <StudentLogin />;

  // 1. Entrance Exam View
  if (currentView === 'entrance-exam') {
    return (
      <EntranceExamInterface 
        onComplete={(id: string) => { 
          setSessionId(id); 
          setCurrentView('entrance-results'); 
        }} 
        onBack={() => setCurrentView('dashboard')} 
      />
    );
  }

  // 2. Main Exam View (JAMB / WAEC)
  if (currentView === 'exam' && selectedExamType) {
    return (
      <ExamInterface
        examType={selectedExamType}
        selectedSubject={selectedSubject || undefined}
        onComplete={(id: string) => { 
          setSessionId(id); 
          setCurrentView('results'); // Immediately switches to Results
        }}
        onBack={() => { 
          setCurrentView('dashboard'); 
          setSelectedExamType(null); 
          setSelectedSubject(null); 
        }}
      />
    );
  }

  // 3. Results View (Calculates and shows score immediately)
  if (currentView === 'results' && sessionId) {
    return (
      <ExamResultsDetailed 
        sessionId={sessionId} 
        onDone={() => { 
          setCurrentView('dashboard'); 
          setSelectedExamType(null); 
          setSessionId(null); 
        }} 
      />
    );
  }

  // 4. Entrance Results View
  if (currentView === 'entrance-results' && sessionId) {
    return (
      <EntranceExamResults 
        sessionId={sessionId} 
        onDone={() => { 
          setCurrentView('dashboard'); 
          setSessionId(null); 
        }} 
      />
    );
  }

  // Default Dashboard
  return (
    <StudentDashboard
      onSelectExam={(type, sub) => { 
        setSelectedExamType(type); 
        setSelectedSubject(sub || null); 
        setCurrentView('exam'); 
      }}
      onSelectEntranceExam={() => setCurrentView('entrance-exam')}
    />
  );
}

function TeacherApp() {
  const { isAuthenticated } = useTeacherAuth();
  return isAuthenticated ? <AdminDashboard /> : <TeacherLogin />;
}

function MainPage() {
  const [appMode, setAppMode] = useState<'choose' | 'student' | 'teacher'>('choose');

  useEffect(() => {
    const applyHash = () => {
      const h = (window.location.hash || '').replace('#', '').toLowerCase();
      if (h.startsWith('student')) setAppMode('student');
      else if (h.startsWith('teacher')) setAppMode('teacher');
      else setAppMode('choose');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  if (appMode === 'student') return <StudentApp />;
  if (appMode === 'teacher') return <TeacherApp />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-primary italic">GMIS PORTAL</h1>
        <div className="grid gap-4">
          <Button onClick={() => setAppMode('student')} className="py-8 text-xl">Student Portal</Button>
          <Button onClick={() => setAppMode('teacher')} variant="outline" className="py-8 text-xl">Teacher Portal</Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <TeacherAuthProvider>
        <MainPage />
      </TeacherAuthProvider>
    </AuthProvider>
  );
}