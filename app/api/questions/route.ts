import { NextResponse } from 'next/server';
import mongo from '@/lib/mongo';
import { saveQuestion } from '@/lib/actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = (searchParams.get('examType') as any) || 'waec';
  const subject = searchParams.get('subject') || undefined;
  const full = searchParams.get('full') === 'true';

  const questions = full
    ? await mongo.getQuestionsFromDb(examType, subject)
    : await mongo.getPublicQuestionsFromDb(examType, subject);

  return NextResponse.json({ success: true, questions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const q = await saveQuestion(body);
    return NextResponse.json({ success: true, question: q });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err.message || err) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body || {};
    if (!id) return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });

    const ok = await mongo.deleteQuestionById(id);
    if (!ok) return NextResponse.json({ success: false, error: 'question not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err.message || err) }, { status: 500 });
  }
}
