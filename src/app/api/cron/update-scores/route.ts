// ─── LOCAL / TESTING ONLY ────────────────────────────────────────────────────
// Production cron runs as an AWS Lambda (see lambdas/update-scores/index.ts)
// triggered by an EventBridge schedule. This Next.js route exists only for
// local development and manual testing of the same business logic.
//
// Do NOT rely on this path in production. vercel.json keeps a reference for
// the Vercel-based dev/preview deployments we still use to share builds
// with the team, but the authoritative production cron is the Lambda.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runUpdateScores, UpdateScoresError } from '@/lib/cron/updateScores';

const CRON_SECRET = process.env.CRON_SECRET;
const API_KEY = process.env.APISPORTS_KEY ?? '';

/**
 * GET /api/cron/update-scores — local / testing wrapper.
 * Delegates all business logic to `runUpdateScores`, which the production
 * Lambda handler also calls. Keep this file thin.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret if configured (matches the Vercel Cron calling convention)
  if (CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runUpdateScores({ apiKey: API_KEY, db });
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    if (err instanceof UpdateScoresError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[Cron route] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
