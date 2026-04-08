import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  API_NAME_TO_TEAM_ID,
  EMPTY_RESULTS,
  calculateScore,
  calculateTiebreaker,
} from '@/lib/scoring';
import type { RealResults } from '@/lib/scoring';
import type { SubmissionScore, FixtureResult } from '@/lib/db/types';

const API_BASE = 'https://v3.football.api-sports.io';
const API_KEY = process.env.APISPORTS_KEY ?? '';
const LEAGUE_ID = 1; // FIFA World Cup
const SEASON = 2026;

// Vercel cron secret — prevents unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET;

interface ApiFixture {
  teams: {
    home: { name: string; winner: boolean | null };
    away: { name: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  league: { round: string };
  fixture: { date: string; status: { short: string } };
}

/**
 * Parse the API round string into our round format.
 * API returns: "Group Stage - 1", "Round of 32", "Round of 16",
 * "Quarter-finals", "Semi-finals", "Final", "3rd Place"
 */
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

/** Map API round string to our schedule round format */
function toScheduleRound(round: string): string {
  if (round === 'GROUP') return 'GS';
  return round; // R32, R16, QF, SF, 3P, F already match
}

function resolveTeamId(apiName: string): string | null {
  return API_NAME_TO_TEAM_ID[apiName] ?? null;
}

/**
 * GET /api/cron/update-scores
 * Called daily at 10 AM EST by Vercel Cron.
 * Fetches real match results and recalculates all submission scores.
 */
export async function GET(req: NextRequest) {
  // Verify cron secret if configured
  if (CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'APISPORTS_KEY not configured' }, { status: 500 });
  }

  try {
    // ── 1. Fetch completed fixtures from API-Football ──
    const res = await fetch(
      `${API_BASE}/fixtures?league=${LEAGUE_ID}&season=${SEASON}&status=FT-AET-PEN`,
      { headers: { 'x-apisports-key': API_KEY } }
    );

    if (!res.ok) {
      console.error('[Cron] API-Football error:', res.status);
      return NextResponse.json({ error: 'API fetch failed' }, { status: 502 });
    }

    const data = await res.json();
    const fixtures: ApiFixture[] = data.response ?? [];

    // ── 2. Build real results + individual fixture results from fixtures ──
    const results: RealResults = { ...EMPTY_RESULTS, updatedAt: Date.now() };
    const fixtureResults: FixtureResult[] = [];
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

      // Determine winner
      const winnerId = fix.teams.home.winner ? homeId
        : fix.teams.away.winner ? awayId
        : null; // draw in group stage

      // Save individual fixture result
      const fixDate = fix.fixture.date ? fix.fixture.date.split('T')[0] : '';
      fixtureResults.push({
        homeId,
        awayId,
        homeGoals: fix.goals.home ?? 0,
        awayGoals: fix.goals.away ?? 0,
        round: toScheduleRound(round),
        winnerId,
        dateISO: fixDate,
        dateTime: fix.fixture.date ?? '',
        status: fix.fixture.status.short, // FT, AET, PEN
      });

      if (round === 'GROUP') {
        // Group stage: both teams were in R32 contention
        // We'll figure out R32 from the knockout fixtures instead
        continue;
      }

      // For knockout rounds, the teams playing in that round advanced to it
      if (round === 'R32') {
        r32Set.add(homeId);
        r32Set.add(awayId);
        // Winner advances to R16
        if (winnerId) r16Set.add(winnerId);
      }
      if (round === 'R16') {
        // Teams in R16 already counted — winner advances to QF
        if (winnerId) qfSet.add(winnerId);
      }
      if (round === 'QF') {
        if (winnerId) sfSet.add(winnerId);
      }
      if (round === 'SF') {
        if (winnerId) finalSet.add(winnerId);
      }
      if (round === 'F') {
        if (winnerId) results.champion = winnerId;
        // Total goals for tiebreaker
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

    // ── 3. Save results + fixture details ──
    await db.saveResults(results);
    await db.saveFixtures(fixtureResults);

    // ── 4. Recalculate all submission scores ──
    const submissions = await db.getAllSubmissions();
    const scores: SubmissionScore[] = submissions.map((sub) => {
      const score = calculateScore(sub.knockoutPicks, sub.champion, results);
      const tiebreaker = calculateTiebreaker(sub.finalScore, actualFinalTotalGoals);

      return {
        submissionId: sub.id,
        identifier: sub.identifier,
        divisionId: sub.divisionId,
        score,
        tiebreaker,
        champion: sub.champion,
        updatedAt: Date.now(),
      };
    });

    await db.saveScores(scores);

    return NextResponse.json({
      success: true,
      fixturesProcessed: fixtures.length,
      submissionsScored: scores.length,
      fixturesSaved: fixtureResults.length,
      results: {
        r32: results.r32Teams.length,
        r16: results.r16Teams.length,
        qf: results.qfTeams.length,
        sf: results.sfTeams.length,
        final: results.finalTeams.length,
        champion: results.champion,
      },
    });
  } catch (err) {
    console.error('[Cron] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
