import { NextResponse } from 'next/server';
import mongo from '@/lib/mongo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examType = (searchParams.get('examType') as any) || 'waec';
    const subject = searchParams.get('subject') || undefined;

    const questions = await mongo.getQuestionsFromDb(examType, subject);
    let lastUpdated: string | null = null;

    for (const q of questions) {
      if (q.createdAt) {
        if (!lastUpdated || new Date(q.createdAt) > new Date(lastUpdated)) {
          lastUpdated = q.createdAt;
        }
      }
    }

    return NextResponse.json({ success: true, lastUpdated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err.message || err) }, { status: 500 });
  }
}
