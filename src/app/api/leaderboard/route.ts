import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { DivisionId } from '@/lib/divisions';
import type { ScoreBreakdown } from '@/lib/scoring';
import type { SubmissionScore } from '@/lib/db/types';

/**
 * GET /api/leaderboard
 * Returns the leaderboard for the rendering page.
 *
 * Semantics:
 *   - Every submission appears in the result, even before the daily cron
 *     has run and computed real scores. Pre-tournament entries get a zero
 *     ScoreBreakdown; the frontend shows them in a "participants, no
 *     scores yet" view when every `total` is 0.
 *   - Once the cron starts writing to `submission_scores`, any submission
 *     with a matching row gets its real score; submissions that somehow
 *     haven't been scored keep their zero fallback so nobody falls off
 *     the board.
 *   - Sort is total DESC, tiebreaker ASC (NULLs last). Zero-score entries
 *     sort by submittedAt DESC after the tied-at-zero bucket so newer
 *     submissions show first while the board is unscored.
 *
 * Query params:
 *   ?division=gold  — filter by division (optional)
 */

const ZERO_SCORE: ScoreBreakdown = {
  r32: 0,
  r16: 0,
  qf: 0,
  sf: 0,
  final: 0,
  champion: 0,
  total: 0,
  correctPicks: {
    r32: 0,
    r16: 0,
    qf: 0,
    sf: 0,
    final: 0,
    champion: false,
  },
};

export async function GET(req: NextRequest) {
  try {
    const divisionFilter = req.nextUrl.searchParams.get('division') as DivisionId | null;

    const [scores, submissions, results] = await Promise.all([
      db.getScores(),
      db.getAllSubmissions(),
      db.getResults(),
    ]);

    // Build a quick lookup from submissionId → score row.
    const scoreById = new Map<string, SubmissionScore>();
    for (const s of scores) scoreById.set(s.submissionId, s);

    // Build a leaderboard entry for every submission. Use the real score
    // if we have one, otherwise fall through to a zero breakdown.
    const leaderboard = submissions.map((sub) => {
      const scored = scoreById.get(sub.id);
      if (scored) return scored;

      const fallback: SubmissionScore = {
        submissionId: sub.id,
        identifier: sub.identifier,
        divisionId: sub.divisionId,
        score: ZERO_SCORE,
        tiebreaker: null,
        champion: sub.champion,
        updatedAt: sub.submittedAt,
      };
      return fallback;
    });

    // Sort: total DESC, then tiebreaker ASC (NULLs last), then newest first.
    leaderboard.sort((a, b) => {
      if (b.score.total !== a.score.total) return b.score.total - a.score.total;
      if (a.tiebreaker !== null && b.tiebreaker !== null) return a.tiebreaker - b.tiebreaker;
      if (a.tiebreaker !== null) return -1;
      if (b.tiebreaker !== null) return 1;
      return b.updatedAt - a.updatedAt;
    });

    const filtered = divisionFilter
      ? leaderboard.filter((s) => s.divisionId === divisionFilter)
      : leaderboard;

    return NextResponse.json({
      leaderboard: filtered,
      lastUpdated: results?.updatedAt ?? null,
      totalParticipants: leaderboard.length,
    });
  } catch (err) {
    console.error('[Leaderboard API] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
