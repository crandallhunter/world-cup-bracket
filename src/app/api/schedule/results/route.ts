import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/schedule/results
 * Returns all completed fixture results for the schedule page.
 */
export async function GET() {
  try {
    const fixtures = await db.getFixtures();
    return NextResponse.json({ fixtures });
  } catch (err) {
    console.error('[Schedule Results API] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
