import { NextResponse } from 'next/server';
import mongo from '@/lib/mongo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examType, answers } = body;
    if (!examType || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const result = await mongo.gradeAnswersServerSide(examType, answers);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err.message || err) }, { status: 500 });
  }
}
