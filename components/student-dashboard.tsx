'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';
import Link from 'next/link';
import { commonEntranceSubjects } from '@/lib/subjects';
import { Subject } from '@/lib/types';

interface StudentDashboardProps {
  onSelectExam: (examType: 'common-entrance' | 'waec' | 'jamb', subject?: string) => void;
  onSelectEntranceExam?: () => void; // New prop for multi-subject entrance exam
}

export function StudentDashboard({ onSelectExam, onSelectEntranceExam }: StudentDashboardProps) {
  const { student, logout } = useAuth();
  const [selectedExam, setSelectedExam] = useState<'common-entrance' | 'waec' | 'jamb' | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleExamSelect = (examType: 'common-entrance' | 'waec' | 'jamb') => {
    setSelectedExam(examType);
    // For common entrance, we need subject selection
    if (examType !== 'common-entrance') {
      onSelectExam(examType);
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleStartCommonEntrance = () => {
    if (selectedSubject) {
      // Pass both exam type and subject to the parent component
      onSelectExam('common-entrance', selectedSubject.name);
    }
  };

  const handleStartEntranceExam = () => {
    if (onSelectEntranceExam) {
      onSelectEntranceExam();
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
              <h1 className="font-bold text-primary text-lg">GMIS Exam Portal</h1>
              <p className="text-xs text-muted-foreground">Great Model International School</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{student?.name}</p>
              <p className="text-xs text-muted-foreground">ID: {student?.schoolId}</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {student?.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Choose an exam type to begin your practice or take the school entrance exam
          </p>
        </div>

        {selectedExam && (
          <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
            <p className="text-sm text-primary font-medium">
              Selected exam: {selectedExam === 'common-entrance' ? 'School Common Entrance' : selectedExam.toUpperCase()}
            </p>
            <button
              onClick={() => {
                setSelectedExam(null);
                setSelectedSubject(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear selection
            </button>
          </div>
        )}



        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Common Entrance Card */}
          <Card className="border-primary/20 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
            <div className="h-1 bg-linear-to-r from-primary to-secondary" />
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl">📝</span>
              </div>
              <CardTitle className="text-primary">School Common Entrance</CardTitle>
              <CardDescription>
                Official entrance examination for Great Model International School
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-foreground">Type:</span>{' '}
                  <span className="text-muted-foreground">MCQ Based</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">Subjects:</span>{' '}
                  <span className="text-muted-foreground">Multiple</span>
                </p>
              </div>
              <Button
                onClick={handleStartEntranceExam}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Start Entrance Exam
              </Button>
            </CardContent>
          </Card>

          {/* WAEC Past Questions Card */}
          <Card className="border-secondary/20 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
            <div className="h-1 bg-linear-to-r from-secondary to-primary" />
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                <span className="text-2xl">📚</span>
              </div>
              <CardTitle className="text-secondary">WAEC Past Questions</CardTitle>
              <CardDescription>
                Practice with previous WAEC examination questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-foreground">Type:</span>{' '}
                  <span className="text-muted-foreground">MCQ Based</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">Format:</span>{' '}
                  <span className="text-muted-foreground">Practice Mode</span>
                </p>
              </div>
              <Button
                onClick={() => handleExamSelect('waec')}
                variant="outline"
                className="w-full border-secondary/30 text-secondary hover:bg-secondary/5"
              >
                Practice Now
              </Button>
            </CardContent>
          </Card>

          {/* JAMB CBT Card */}
          <Card className="border-primary/20 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
            <div className="h-1 bg-linear-to-r from-primary to-secondary" />
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl">💻</span>
              </div>
              <CardTitle className="text-primary">JAMB CBT Past Questions</CardTitle>
              <CardDescription>
                Prepare for JAMB examination with CBT practice questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-foreground">Type:</span>{' '}
                  <span className="text-muted-foreground">MCQ Based</span>
                </p>
                <p>
                  <span className="font-medium text-foreground">Format:</span>{' '}
                  <span className="text-muted-foreground">Practice Mode</span>
                </p>
              </div>
              <Button
                onClick={() => handleExamSelect('jamb')}
                variant="outline"
                className="w-full border-primary/30 text-primary hover:bg-primary/5"
              >
                Practice Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">Your Recent Results</h3>
          <Card className="border-primary/10">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No exam results yet. Start an exam to see your results here.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
