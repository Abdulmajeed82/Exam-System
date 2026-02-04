import { NextResponse } from 'next/server';
import mongo from '@/lib/mongo';
import { saveQuestion } from '@/lib/actions';
import { generateWAECGenericQuestions, generateJAMBGenericQuestions } from '@/lib/generate-questions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = (searchParams.get('examType') as any) || 'waec';
  const subject = searchParams.get('subject') || undefined;
  const full = searchParams.get('full') === 'true';

  let questions = full
    ? await mongo.getQuestionsFromDb(examType, subject)
    : await mongo.getPublicQuestionsFromDb(examType, subject);

  // If no questions exist for a WAEC/JAMB subject, generate and persist server-side so other clients can use them immediately
  if ((questions == null || questions.length === 0) && subject && (examType === 'waec' || examType === 'jamb')) {
    try {
      let generated: any[] = [];
      if (examType === 'waec') {
        generated = generateWAECGenericQuestions(subject);
      } else if (examType === 'jamb') {
        generated = generateJAMBGenericQuestions(subject);
      }

      if (generated.length > 0) {
        // Persist generated questions to MongoDB (best-effort)
        for (const q of generated) {
          try {
            // Use mongo helper directly to avoid re-validation delays
            await mongo.saveQuestionToDb(q as any);
          } catch (e) {
            console.warn('Failed to save generated question to DB:', e);
          }
        }

        // Re-query to return the saved questions (full=true returns full set)
        questions = full
          ? await mongo.getQuestionsFromDb(examType, subject)
          : await mongo.getPublicQuestionsFromDb(examType, subject);

        console.log(`✅ Generated and saved ${questions.length} ${examType} questions for subject ${subject}`);
      }
    } catch (err) {
      console.error('❌ Failed to generate or save questions server-side:', err);
    }
  }

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
