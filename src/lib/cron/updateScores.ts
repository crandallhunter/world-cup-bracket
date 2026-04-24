// ─── Daily score-update business logic ───────────────────────────────────────
// Runtime-agnostic implementation of the score refresh. Called from:
//   - src/app/api/cron/update-scores/route.ts   (local / testing only)
//   - lambdas/update-scores/index.ts            (production — EventBridge)
//
// Pure TypeScript. No Next.js / no Vercel / no AWS-specific APIs. Only
// requires an API key + a DataStore. Move it to any runtime that can
// reach the internet and the DB.

import {
  API_NAME_TO_TEAM_ID,
  EMPTY_RESULTS,
  calculateScore,
  calculateTiebreaker,
} from '@/lib/scoring';
import type { RealResults } from '@/lib/scoring';
import type { DataStore, SubmissionScore } from '@/lib/db/types';

const API_BASE = 'https://v3.football.api-sports.io';
const LEAGUE_ID = 1; // FIFA World Cup
const SEASON = 2026;

interface ApiFixture {
  teams: {
    home: { name: string; winner: boolean | null };
    away: { name: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  league: { round: string };
  fixture: { date: string; status: { short: string } };
}

/** Parse API-Football's round strings into our internal round codes. */
function parseRound(apiRound: string): string | null {
  if (apiRound.startsWith('Group')) return 'GROUP';
  if (apiRound === 'Round of 32') return 'R32';
  if (apiRound === 'Round of 16') return 'R16';
  if (apiRound === 'Quarter-finals') return 'QF';
  if (apiRound === 'Semi-finals') return 'SF';
  if (apiRound === '3rd Place') return '3P';
  if (apiRound === 'Final') return 'F';
  return null;
}

function resolveTeamId(apiName: string): string | null {
  return API_NAME_TO_TEAM_ID[apiName] ?? null;
}

export interface UpdateScoresInput {
  /** API-Football key (`APISPORTS_KEY`). */
  apiKey: string;
  /** DataStore instance — whichever backend is active. */
  db: DataStore;
}

export interface UpdateScoresResult {
  fixturesProcessed: number;
  submissionsScored: number;
  results: {
    r32: number;
    r16: number;
    qf: number;
    sf: number;
    final: number;
    champion: string | null;
  };
}

export class UpdateScoresError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'UpdateScoresError';
  }
}

/**
 * Fetch current tournament results, persist them, and recompute every
 * submission's score. Throws `UpdateScoresError` with a suitable status
 * on recoverable failures (so callers can translate to HTTP codes).
 */
export async function runUpdateScores({
  apiKey,
  db,
}: UpdateScoresInput): Promise<UpdateScoresResult> {
  if (!apiKey) {
    throw new UpdateScoresError('APISPORTS_KEY not configured', 500);
  }

  // ── 1. Fetch completed fixtures from API-Football ──
  const res = await fetch(
    `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=FT-AET-PEN`,
    { headers: { 'x-apisports-key': apiKey } },
  );

  if (!res.ok) {
    console.error('[updateScores] API-Football error:', res.status);
    throw new UpdateScoresError('API fetch failed', 502);
  }

  const data = await res.json();
  const fixtures: ApiFixture[] = data.response ?? [];

  // ── 2. Aggregate round-by-round advancement sets ──
  const results: RealResults = { ...EMPTY_RESULTS, updatedAt: Date.now() };
  const r32Set = new Set<string>();
  const r16Set = new Set<string>();
  const qfSet = new Set<string>();
  const sfSet = new Set<string>();
  const finalSet = new Set<string>();
  let actualFinalTotalGoals: number | null = null;

  for (const fix of fixtures) {
    const round = parseRound(fix.league.round);
    if (!round) continue;

    const homeId = resolveTeamId(fix.teams.home.name);
    const awayId = resolveTeamId(fix.teams.away.name);
    if (!homeId || !awayId) continue;

    // Group stage results are derived from knockout fixtures, skip
    if (round === 'GROUP') continue;

    const winnerId = fix.teams.home.winner
      ? homeId
      : fix.teams.away.winner
        ? awayId
        : null;

    if (round === 'R32') {
      r32Set.add(homeId);
      r32Set.add(awayId);
      if (winnerId) r16Set.add(winnerId);
    }
    if (round === 'R16' && winnerId) qfSet.add(winnerId);
    if (round === 'QF' && winnerId) sfSet.add(winnerId);
    if (round === 'SF' && winnerId) finalSet.add(winnerId);
    if (round === 'F') {
      if (winnerId) results.champion = winnerId;
      if (fix.goals.home !== null && fix.goals.away !== null) {
        actualFinalTotalGoals = fix.goals.home + fix.goals.away;
      }
    }
  }

  results.r32Teams = [...r32Set];
  results.r16Teams = [...r16Set];
  results.qfTeams = [...qfSet];
  results.sfTeams = [...sfSet];
  results.finalTeams = [...finalSet];

  // ── 3. Persist aggregate results ──
  await db.saveResults(results);

  // ── 4. Recompute scores for every submission ──
  const submissions = await db.getAllSubmissions();
  const scores: SubmissionScore[] = submissions.map((sub) => ({
    submissionId: sub.id,
    identifier: sub.identifier,
    divisionId: sub.divisionId,
    score: calculateScore(sub.knockoutPicks, sub.champion, results),
    tiebreaker: calculateTiebreaker(sub.finalScore, actualFinalTotalGoals),
    champion: sub.champion,
    updatedAt: Date.now(),
  }));

  await db.saveScores(scores);

  return {
    fixturesProcessed: fixtures.length,
    submissionsScored: scores.length,
    results: {
      r32: results.r32Teams.length,
      r16: results.r16Teams.length,
      qf: results.qfTeams.length,
      sf: results.sfTeams.length,
      final: results.finalTeams.length,
      champion: results.champion,
    },
  };
}
