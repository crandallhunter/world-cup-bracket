import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { DivisionId } from '@/lib/divisions';

/**
 * GET /api/leaderboard
 * Returns scored submissions for the leaderboard.
 *
 * Query params:
 *   ?division=diamond  — filter by division (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const divisionFilter = req.nextUrl.searchParams.get('division') as DivisionId | null;

    const scores = await db.getScores();
    const results = await db.getResults();

    const filtered = divisionFilter
      ? scores.filter((s) => s.divisionId === divisionFilter)
      : scores;

    return NextResponse.json({
      leaderboard: filtered,
      lastUpdated: results?.updatedAt ?? null,
      totalParticipants: scores.length,
    });
  } catch (err) {
    console.error('[Leaderboard API] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
