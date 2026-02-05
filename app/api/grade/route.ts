import { NextResponse } from 'next/server';
import mongo from '@/lib/mongo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      examType, 
      answers, 
      studentId, 
      studentName, 
      schoolId, 
      subject 
    } = body;

    // 1. Validate payload
    if (!examType || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    // 2. Calculate the score (The "Grade")
    const gradingResult = await mongo.gradeAnswersServerSide(examType, answers);

    // 3. SAVE THE RESULT (This makes it visible to Admin globally)
    // We package the grade into a Result record for the database
    const resultRecord = {
      studentId: studentId || 'N/A',
      studentName: studentName || 'Unknown Student',
      schoolId: schoolId || 'DEFAULT_SCHOOL',
      examType: examType,
      subject: subject || 'General',
      score: gradingResult.score,
      totalQuestions: gradingResult.total,
      percentage: gradingResult.total > 0 ? (gradingResult.score / gradingResult.total) * 100 : 0,
      completedAt: new Date().toISOString(),
    };

    // This calls the function in your lib/mongo.ts to save to the "results" collection
    await mongo.saveResultToDb(resultRecord);

    // 4. Return response to the student
    return NextResponse.json({ 
      success: true, 
      result: gradingResult,
      message: "Exam submitted and result saved for Admin review." 
    });

  } catch (err: any) {
    console.error("Critical Grading/Saving Error:", err);
    return NextResponse.json({ success: false, error: String(err.message || err) }, { status: 500 });
  }
}