'use client';

import { useState } from 'react';
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

function StudentApp() {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'exam' | 'entrance-exam' | 'results' | 'entrance-results'
  >('dashboard');
  const [selectedExamType, setSelectedExamType] = useState<
    'common-entrance' | 'waec' | 'jamb' | null
  >(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <StudentLogin />;
  }

  if (currentView === 'entrance-exam') {
    return (
      <EntranceExamInterface
        onComplete={(completedSessionId) => {
          setSessionId(completedSessionId);
          setCurrentView('entrance-results');
        }}
        onBack={() => {
          setCurrentView('dashboard');
        }}
      />
    );
  }

  if (currentView === 'exam' && selectedExamType) {
    return (
      <ExamInterface
        examType={selectedExamType}
        selectedSubject={selectedSubject || undefined}
        onComplete={(completedSessionId) => {
          setSessionId(completedSessionId);
          setCurrentView('results');
        }}
        onBack={() => {
          setCurrentView('dashboard');
          setSelectedExamType(null);
          setSelectedSubject(null);
        }}
      />
    );
  }

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

  return (
    <StudentDashboard
      onSelectExam={(examType, subject) => {
        setSelectedExamType(examType);
        setSelectedSubject(subject || null);
        setCurrentView('exam');
      }}
      onSelectEntranceExam={() => {
        setCurrentView('entrance-exam');
      }}
    />
  );
}

function TeacherApp() {
  const { isAuthenticated } = useTeacherAuth();

  if (!isAuthenticated) {
    return <TeacherLogin />;
  }

  return <AdminDashboard />;
}

function MainPage() {
  const [appMode, setAppMode] = useState<'choose' | 'student' | 'teacher'>(
    'choose'
  );

  if (appMode === 'choose') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                G
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              GMIS Exam Portal
            </h1>
            <p className="text-muted-foreground">
              Great Model International School
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setAppMode('student')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
            >
              Student Login
            </Button>
            <Button
              onClick={() => setAppMode('teacher')}
              variant="outline"
              className="w-full border-secondary text-secondary hover:bg-secondary/5 py-6 text-lg font-semibold"
            >
              Teacher Portal
            </Button>
          </div>

          <div className="mt-8 space-y-4 text-sm text-muted-foreground">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">For Students:</p>
              <p className="text-blue-800">
                Practice with WAEC and JAMB past questions, or take the official
                school entrance exam
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <p className="font-semibold text-purple-900 mb-2">For Teachers:</p>
              <p className="text-purple-800">
                Create and manage school entrance exam questions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appMode === 'student') {
    return <StudentApp />;
  }

  if (appMode === 'teacher') {
    return <TeacherApp />;
  }
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
