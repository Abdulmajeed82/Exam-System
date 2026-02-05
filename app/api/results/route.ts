import { NextResponse } from 'next/server';
import mongo from '@/lib/mongo';

// This ensures the admin always gets fresh results, not cached ones
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    // This fetches the "folder" (Collection) from MongoDB
    const results = await mongo.getAllResultsFromDb(schoolId || undefined);

    return NextResponse.json({ 
      success: true, 
      count: results?.length || 0,
      results 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}