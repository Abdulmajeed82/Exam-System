'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import {
  getQuestionsByExamType,
  createExamSession,
  getExamSession,
  updateExamSession,
} from '@/lib/db';
import { getSubjectsByExamType } from '@/lib/subjects';
import { Question, ExamSession, Subject } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ExamInterfaceProps {
  examType: 'common-entrance' | 'waec' | 'jamb';
  selectedSubject?: string; // For common entrance, we need a specific subject
  onComplete: (sessionId: string) => void;
  onBack: () => void;
}

export function ExamInterface({
  examType,
  selectedSubject: propSelectedSubject,
  onComplete,
  onBack,
}: ExamInterfaceProps) {
  const { student } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>(propSelectedSubject || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  // JAMB elective selections (two dropdowns)
  const [elective1, setElective1] = useState<string>('');
  const [elective2, setElective2] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds

  // Configurable Common Entrance duration (minutes)
  const CE_DEFAULT_MINUTES = parseInt(process.env.NEXT_PUBLIC_COMMON_ENTRANCE_DEFAULT_DURATION_MINUTES || '120', 10);

  // Load subjects
  useEffect(() => {
    const availableSubjects = getSubjectsByExamType(examType);
    setSubjects(availableSubjects);

    // For JAMB, set English and Mathematics as mandatory (pre-selected if available)
    if (examType === 'jamb') {
      const names = availableSubjects.map((s) => s.name);
      const mandatory = ['English Language', 'Mathematics'].filter((m) => names.includes(m));
      setSelectedSubjects(mandatory);
      // Reset elective dropdowns
      setElective1('');
      setElective2('');
    } else if (examType === 'common-entrance' && propSelectedSubject) {
      // Use the selected subject from props for common entrance
      setSelectedSubject(propSelectedSubject);
    } else if (examType === 'common-entrance' && availableSubjects.length > 0) {
      // Fallback to first subject if none selected
      setSelectedSubject(availableSubjects[0].name);
    }
  }, [examType, propSelectedSubject]);

  // Keep selectedSubjects in sync with JAMB electives
  useEffect(() => {
    if (examType === 'jamb') {
      const base = ['English Language', 'Mathematics'];
      const combined = base.concat(elective1 ? [elective1] : [], elective2 ? [elective2] : []);
      setSelectedSubjects(combined);
    }
  }, [elective1, elective2, examType]);

  // Load questions when subjects are selected (API-first, async)
  useEffect(() => {
    async function loadQuestions() {
      if (examType === 'jamb' && selectedSubjects.length > 0) {
        // For JAMB, load questions from all selected subjects
        let allQuestions: Question[] = [];
        for (const subject of selectedSubjects) {
          const subjectQuestions = await getQuestionsByExamType(examType, subject);
          allQuestions = [...allQuestions, ...subjectQuestions];
        }
        setQuestions(allQuestions);
      } else if (examType === 'waec' && selectedSubjects.length > 0) {
        // For WAEC, load questions for the single selected subject only
        const subject = selectedSubjects[0];
        const subjectQuestions = await getQuestionsByExamType(examType, subject);
        setQuestions(subjectQuestions);
      } else if (examType === 'common-entrance' && selectedSubject) {
        const examQuestions = await getQuestionsByExamType(examType, selectedSubject);
        setQuestions(examQuestions);
      }
    }

    loadQuestions();
  }, [selectedSubjects, selectedSubject, examType]);

  // Timer countdown effect
  useEffect(() => {
    if (!isExamStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          clearInterval(timer);
          if (session) {
            handleSubmitExam();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, timeRemaining, session]);

  // Format time remaining as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubjectToggle = (subject: string) => {
    if (examType === 'jamb') {
      // For JAMB: English and Math are mandatory
      const mandatory = ['English Language', 'Mathematics'];
      if (mandatory.includes(subject)) {
        return; // Cannot deselect mandatory subjects
      }
      
      setSelectedSubjects(prev => {
        if (prev.includes(subject)) {
          return prev.filter(s => s !== subject);
        } else {
          // Limit to 4 subjects total (2 mandatory + 2 elective)
          if (prev.length >= 4) {
            return prev;
          }
          return [...prev, subject];
        }
      });
    } else if (examType === 'waec') {
      // For WAEC: Only one subject can be selected at a time
      setSelectedSubjects([subject]);
    }
  };

  const { toast } = useToast();

  const handleStartExam = async () => {
    if (!student) return;

    if (examType === 'common-entrance' && !selectedSubject) return;
    if (examType === 'jamb') {
      if (!elective1 || !elective2 || elective1 === elective2) return;
    }
    if (examType === 'waec' && selectedSubjects.length === 0) return;

    const subjectParam = examType === 'common-entrance'
      ? selectedSubject
      : examType === 'waec'
        ? selectedSubjects[0]
        : (examType === 'jamb'
            ? ['English Language', 'Mathematics', elective1, elective2]
            : selectedSubjects);
    // ensure selectedSubjects reflects the chosen subjects for UI/component usage
    if (examType === 'jamb') setSelectedSubjects(['English Language', 'Mathematics', elective1, elective2]);

    try {
      const newSession = await createExamSession(
        student.id,
        student.name,
        examType,
        subjectParam
      );

      const qCount = (newSession.questionDetails || []).length;
      if (qCount === 0) {
        toast({
          title: 'No questions available',
          description: `No questions could be loaded for the selected subject(s). Please check API config or enable local fallback.`,
        });
        return;
      }

      setSession(newSession);
      setQuestions(newSession.questionDetails || []);
      setIsExamStarted(true);
      setCurrentQuestionIndex(0);
      
      // Set timer based on exam type
      // JAMB: 3 hours (180 minutes), WAEC: 3 hours, Common Entrance: uses NEXT_PUBLIC_COMMON_ENTRANCE_DEFAULT_DURATION_MINUTES (minutes)
      const examDuration = examType === 'common-entrance' ? CE_DEFAULT_MINUTES * 60 : 180 * 60; // in seconds
      setTimeRemaining(examDuration);
    } catch (err) {
      console.error('Failed to start exam:', err);
      toast({
        title: 'Failed to start exam',
        description: String(err) || 'Unknown error while loading questions. Check API and try again.',
      });
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (!session) return;
    const updatedAnswers = {
      ...session.answers,
      [questionId]: answer,
    };
    const updatedSession = updateExamSession(session.id, {
      answers: updatedAnswers,
    });
    setSession(updatedSession || session);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = () => {
    setShowConfirmSubmit(false);
    if (session) {
      onComplete(session.id);
    }
  };

  const canStartExam = () => {
    if (examType === 'common-entrance') {
      return selectedSubject !== '';
    } else if (examType === 'jamb') {
      // Must have 2 elective subjects selected and they must be different
      return !!elective1 && !!elective2 && elective1 !== elective2;
    } else if (examType === 'waec') {
      // Must have exactly 1 selected subject
      return selectedSubjects.length === 1;
    }
    return false;
  };

  if (!isExamStarted) {
    const mandatory = examType === 'jamb' ? ['English Language', 'Mathematics'] : [];
    const electiveSubjects = subjects.filter(s => !mandatory.includes(s.name));

    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-2xl mx-auto mt-12">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-primary hover:bg-primary/10"
          >
            ← Back to Dashboard
          </Button>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>
                {examType === 'common-entrance'
                  ? 'School Common Entrance Exam'
                  : examType === 'waec'
                    ? 'WAEC Past Questions'
                    : 'JAMB CBT Past Questions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {examType === 'common-entrance' ? (
                            // Common Entrance: Single subject selection
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select Subject
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {subjects.map((subject) => (
                      <button
                        key={subject.name}
                        onClick={() => setSelectedSubject(subject.name)}
                        className={`p-4 rounded-lg border-2 transition-colors text-left font-medium ${
                          selectedSubject === subject.name
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-primary/20 bg-white text-foreground hover:border-primary/40'
                        }`}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Duration: <span className="font-medium">{CE_DEFAULT_MINUTES} minutes ({Math.floor(CE_DEFAULT_MINUTES / 60)} hours)</span>
                  </p>
                </div>
              ) : examType === 'jamb' ? (
                // JAMB: English + Math mandatory, choose 2 more from dropdown
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Mandatory Subjects (Pre-selected)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {mandatory.map((subject) => (
                        <div
                          key={subject}
                          className="p-4 rounded-lg border-2 border-primary bg-primary/10 text-primary font-medium flex items-center gap-2"
                        >
                          <Checkbox checked={true} disabled />
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Select 2 Additional Subjects
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Elective 1 */}
                      <Select value={elective1} onValueChange={(value) => setElective1(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose elective 1" />
                        </SelectTrigger>
                        <SelectContent>
                          {electiveSubjects.map((subject) => (
                            <SelectItem key={subject.name} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Elective 2 */}
                      <Select value={elective2} onValueChange={(value) => setElective2(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose elective 2" />
                        </SelectTrigger>
                        <SelectContent>
                          {electiveSubjects.map((subject) => (
                            <SelectItem key={subject.name} value={subject.name} disabled={subject.name === elective1}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedSubjects.join(', ')}
                    </p>
                  </div>
                </div>
              ) : (
                // WAEC: Accordion by stream
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select WAEC Subject to Practice
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    WAEC exam format: <span className="font-medium">60 questions</span> (50 objective + 10 essay). Duration: <span className="font-medium">3 hours</span>.
                  </p>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="science">
                      <AccordionTrigger>Science Stream</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-3">
                          {subjects.filter(s => s.category === 'Science').map((subject) => (
                            <button
                              key={subject.id}
                              onClick={() => handleSubjectToggle(subject.name)}
                              className={`p-4 rounded-lg border-2 transition-colors text-left font-medium flex items-center gap-2 ${
                                selectedSubjects.includes(subject.name)
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-primary/20 bg-white text-foreground hover:border-primary/40'
                              }`}
                            >
                              <Checkbox checked={selectedSubjects.includes(subject.name)} />
                              <span>{subject.name}</span>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="arts">
                      <AccordionTrigger>Arts Stream</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-3">
                          {subjects.filter(s => s.category === 'Arts/Humanities').map((subject) => (
                            <button
                              key={subject.id}
                              onClick={() => handleSubjectToggle(subject.name)}
                              className={`p-4 rounded-lg border-2 transition-colors text-left font-medium flex items-center gap-2 ${
                                selectedSubjects.includes(subject.name)
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-primary/20 bg-white text-foreground hover:border-primary/40'
                              }`}
                            >
                              <Checkbox checked={selectedSubjects.includes(subject.name)} />
                              <span>{subject.name}</span>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="commercial">
                      <AccordionTrigger>Commercial Stream</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-3">
                          {subjects.filter(s => s.category === 'Commercial').map((subject) => (
                            <button
                              key={subject.id}
                              onClick={() => handleSubjectToggle(subject.name)}
                              className={`p-4 rounded-lg border-2 transition-colors text-left font-medium flex items-center gap-2 ${
                                selectedSubjects.includes(subject.name)
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-primary/20 bg-white text-foreground hover:border-primary/40'
                              }`}
                            >
                              <Checkbox checked={selectedSubjects.includes(subject.name)} />
                              <span>{subject.name}</span>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {selectedSubjects.length > 0 && (
                    <p className="text-sm text-primary font-medium mt-3">
                      Selected: <span className="font-bold">{examType === 'waec' ? selectedSubjects[0] : selectedSubjects.join(', ')}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Student:</span> {student?.name}
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">ID:</span> {student?.schoolId}
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Total Questions:</span>{' '}
                  {questions.length}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <span className="font-medium">Important:</span> Once you submit
                  the exam, you cannot make changes. Please review all your
                  answers before submitting.
                </p>
              </div>

              <Button
                onClick={handleStartExam}
                disabled={!canStartExam()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {examType === 'jamb' && selectedSubjects.length < 4
                  ? `Select ${4 - selectedSubjects.length} more subject(s) to start`
                  : examType === 'waec' && selectedSubjects.length === 0
                  ? 'Select a subject to start'
                  : 'Start Exam' }
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No questions available for this exam.
            </p>
            <Button
              onClick={onBack}
              className="bg-primary hover:bg-primary/90"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b border-primary/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-bold text-primary">
                {currentQuestion.subject} - Question {currentQuestionIndex + 1} of{' '}
                {questions.length}
              </h1>
              {(examType === 'jamb' || examType === 'waec') && (
                <p className="text-xs text-muted-foreground">
                  Subjects: {examType === 'jamb' ? selectedSubjects.join(', ') : selectedSubjects.join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-right ${timeRemaining < 600 ? 'text-red-600 font-bold' : ''}`}>
                <div className="text-xs text-muted-foreground">Time Remaining</div>
                <div className="text-lg font-mono font-semibold">
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {student?.schoolId}
              </span>
            </div>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-2">
            <div
              className="bg-linear-to-r from-primary to-secondary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question */}
          <div className="lg:col-span-3">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {currentQuestion.questionType === 'essay' ? 'Essay Question' : 'Objective Question'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Year: {currentQuestion.year}
                  </span>
                </div>
                <CardTitle className="text-lg">
                  {currentQuestion.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.questionType === 'objective' && currentQuestion.options ? (
                  // Objective question - show options
                  <div className="space-y-3">
                    {Object.entries(currentQuestion.options).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAnswerSelect(
                            currentQuestion.id,
                            key as 'a' | 'b' | 'c' | 'd'
                          );
                        }}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium cursor-pointer hover:shadow-md active:scale-[0.98] ${
                          session?.answers[currentQuestion.id] === key
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-primary/20 bg-white text-foreground hover:border-primary/40 hover:bg-primary/5'
                        }`}
                      >
                        <span className="font-bold mr-3 text-lg">
                          {key.toUpperCase()}.
                        </span>
                        {value}
                      </button>
                    ))}
                  </div>
                ) : (
                  // Essay question - show textarea
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Write your answer in the text area below. Essay questions are for practice and will show sample answers after submission.
                    </p>
                    <Textarea
                      value={session?.answers[currentQuestion.id] || ''}
                      onChange={(e) =>
                        handleAnswerSelect(currentQuestion.id, e.target.value)
                      }
                      placeholder="Type your essay answer here..."
                      className="min-h-72 resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      {session?.answers[currentQuestion.id]?.length || 0} characters
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevious();
                }}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/5 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConfirmSubmit(true);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Submit Exam
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigator */}
          <div>
            <Card className="border-primary/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentQuestionIndex(index);
                      }}
                      className={`aspect-square rounded-lg font-medium text-xs transition-all cursor-pointer hover:shadow-md active:scale-95 ${
                        index === currentQuestionIndex
                          ? 'bg-primary text-primary-foreground'
                          : session?.answers[questions[index].id]
                            ? 'bg-primary/20 text-primary hover:bg-primary/30'
                            : 'bg-secondary/10 text-foreground hover:bg-secondary/20'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/20 rounded" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary/10 rounded" />
                    <span>Unanswered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Submit Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You have answered {Object.keys(session?.answers || {}).length}{' '}
                out of {questions.length} questions.
              </p>
              <p className="text-sm text-muted-foreground">
                Once submitted, you cannot make changes. Are you sure you want to
                submit?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmSubmit(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Continue Exam
                </Button>
                <Button
                  onClick={handleSubmitExam}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
