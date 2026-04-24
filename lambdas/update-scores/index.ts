// ─── AWS Lambda: daily score update (PRODUCTION cron path) ───────────────────
// Triggered on a schedule by EventBridge. Runs the same business logic as
// src/app/api/cron/update-scores/route.ts — but this is the authoritative
// production path. The Next.js route is kept for local testing only.
//
// Deployment notes:
//   - Bundle with esbuild / SAM / CDK / Serverless framework — whatever
//     your infra stack prefers. Entry point: lambdas/update-scores/index.ts,
//     exported handler: `handler`.
//   - Environment variables required at the Lambda:
//       DATABASE_URL     Postgres connection string (RDS or Supabase)
//       APISPORTS_KEY    API-Football key
//   - Recommended Lambda config: Node 20.x, 512 MB memory, 60 s timeout
//     (API-Football is usually <2 s; margin for DB writes on many submissions).
//   - EventBridge rule: `cron(0 15 * * ? *)` runs daily at 15:00 UTC
//     (matches the old vercel.json schedule — 10:00 EST in winter / 11:00 EDT).
//
// The handler accepts any EventBridge / scheduled-event payload shape; we
// don't read it. Logs are written to CloudWatch via the standard console.

import { db } from '../../src/lib/db';
import { runUpdateScores, UpdateScoresError } from '../../src/lib/cron/updateScores';

interface LambdaResponse {
  statusCode: number;
  body: string;
}

export async function handler(): Promise<LambdaResponse> {
  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    console.error('[Lambda update-scores] APISPORTS_KEY is not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing APISPORTS_KEY' }) };
  }

  try {
    const result = await runUpdateScores({ apiKey, db });
    console.log('[Lambda update-scores] success', result);
    return { statusCode: 200, body: JSON.stringify({ success: true, ...result }) };
  } catch (err) {
    if (err instanceof UpdateScoresError) {
      console.error('[Lambda update-scores]', err.status, err.message);
      return { statusCode: err.status, body: JSON.stringify({ error: err.message }) };
    }
    console.error('[Lambda update-scores] unhandled error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
}
