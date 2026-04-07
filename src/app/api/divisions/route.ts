import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DIVISIONS } from '@/lib/divisions';
import type { DivisionId } from '@/lib/divisions';

/**
 * GET /api/divisions
 * Returns division info with participant counts.
 */
export async function GET() {
  try {
    const submissions = await db.getAllSubmissions();

    // Count submissions per division
    const counts: Record<DivisionId, number> = {
      diamond: 0,
      platinum: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      open: 0,
    };

    for (const sub of submissions) {
      if (sub.divisionId in counts) {
        counts[sub.divisionId]++;
      }
    }

    const divisions = DIVISIONS.map((div) => ({
      ...div,
      participantCount: counts[div.id],
    }));

    return NextResponse.json({ divisions, totalParticipants: submissions.length });
  } catch (err) {
    console.error('[Divisions API] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
