// ─── Scoring configuration & engine ─────────────────────────────────────────
// ESPN-style doubling system starting at R32.
// Each round doubles the per-correct-pick value.

import type { KnockoutMatch, Team } from '@/types/tournament';

/** Points awarded per correct pick in each knockout round. Doubles every round. */
export const POINTS_PER_ROUND: Record<string, number> = {
  R32: 10,
  R16: 20,
  QF: 40,
  SF: 80,
  F: 160,
  CHAMPION: 320,
};

/**
 * Maximum achievable score (1,920). Each round contributes 320 max:
 * R32 32×10, R16 16×20, QF 8×40, SF 4×80, F 2×160, Champion 1×320.
 */
export const MAX_POINTS = 1920;

/**
 * API-Football team name → our canonical 3-letter team ID.
 * API-Football uses full country names; our app uses 3-letter codes.
 */
export const API_NAME_TO_TEAM_ID: Record<string, string> = {
  'Mexico': 'MEX',
  'South Korea': 'KOR',
  'South Africa': 'RSA',
  'Czechia': 'CZE',
  'Czech Republic': 'CZE',
  'Canada': 'CAN',
  'Switzerland': 'SUI',
  'Qatar': 'QAT',
  'Bosnia and Herzegovina': 'BIH',
  'Bosnia & Herzegovina': 'BIH',
  'Brazil': 'BRA',
  'Morocco': 'MAR',
  'Scotland': 'SCO',
  'Haiti': 'HAI',
  'USA': 'USA',
  'United States': 'USA',
  'Paraguay': 'PAR',
  'Australia': 'AUS',
  'Turkey': 'TUR',
  'Türkiye': 'TUR',
  'Germany': 'GER',
  'Ecuador': 'ECU',
  'Ivory Coast': 'CIV',
  'Cote D\'Ivoire': 'CIV',
  'Côte d\'Ivoire': 'CIV',
  'Curacao': 'CUW',
  'Curaçao': 'CUW',
  'Netherlands': 'NED',
  'Japan': 'JPN',
  'Tunisia': 'TUN',
  'Sweden': 'SWE',
  'Belgium': 'BEL',
  'Iran': 'IRN',
  'Egypt': 'EGY',
  'New Zealand': 'NZL',
  'Spain': 'ESP',
  'Uruguay': 'URU',
  'Saudi Arabia': 'KSA',
  'Cape Verde': 'CPV',
  'France': 'FRA',
  'Senegal': 'SEN',
  'Norway': 'NOR',
  'Iraq': 'IRQ',
  'Argentina': 'ARG',
  'Austria': 'AUT',
  'Algeria': 'ALG',
  'Jordan': 'JOR',
  'Portugal': 'POR',
  'Colombia': 'COL',
  'Uzbekistan': 'UZB',
  'DR Congo': 'COD',
  'Congo DR': 'COD',
  'England': 'ENG',
  'Croatia': 'CRO',
  'Panama': 'PAN',
  'Ghana': 'GHA',
};

// ─── Real tournament results structure ──────────────────────────────────────

export interface RealResults {
  /** Team IDs that actually advanced to R32 (up to 32) */
  r32Teams: string[];
  /** Team IDs that actually advanced to R16 (up to 16) */
  r16Teams: string[];
  /** Team IDs that actually advanced to QF (up to 8) */
  qfTeams: string[];
  /** Team IDs that actually advanced to SF (up to 4) */
  sfTeams: string[];
  /** Team IDs that actually made the Final (up to 2) */
  finalTeams: string[];
  /** The actual champion team ID */
  champion: string | null;
  /** Last updated timestamp */
  updatedAt: number;
}

export const EMPTY_RESULTS: RealResults = {
  r32Teams: [],
  r16Teams: [],
  qfTeams: [],
  sfTeams: [],
  finalTeams: [],
  champion: null,
  updatedAt: 0,
};

// ─── Scoring engine ─────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  r32: number;
  r16: number;
  qf: number;
  sf: number;
  final: number;
  champion: number;
  total: number;
  correctPicks: {
    r32: number;
    r16: number;
    qf: number;
    sf: number;
    final: number;
    champion: boolean;
  };
}

/**
 * Extract the set of team IDs that a user's bracket predicts will be in each round.
 */
function getPickedTeamsPerRound(knockoutPicks: KnockoutMatch[], champion?: Team) {
  const r32Teams = new Set<string>();
  const r16Teams = new Set<string>();
  const qfTeams = new Set<string>();
  const sfTeams = new Set<string>();
  const finalTeams = new Set<string>();

  for (const match of knockoutPicks) {
    // The teams present in a round are the ones scheduled to play in it
    if (match.round === 'R32') {
      if (match.homeTeam?.id && match.homeTeam.id !== '__TBD__') r32Teams.add(match.homeTeam.id);
      if (match.awayTeam?.id && match.awayTeam.id !== '__TBD__') r32Teams.add(match.awayTeam.id);
    }
    // For R16+, the teams that appear are the winners of the previous round
    if (match.round === 'R16') {
      if (match.homeTeam?.id && match.homeTeam.id !== '__TBD__') r16Teams.add(match.homeTeam.id);
      if (match.awayTeam?.id && match.awayTeam.id !== '__TBD__') r16Teams.add(match.awayTeam.id);
    }
    if (match.round === 'QF') {
      if (match.homeTeam?.id && match.homeTeam.id !== '__TBD__') qfTeams.add(match.homeTeam.id);
      if (match.awayTeam?.id && match.awayTeam.id !== '__TBD__') qfTeams.add(match.awayTeam.id);
    }
    if (match.round === 'SF') {
      if (match.homeTeam?.id && match.homeTeam.id !== '__TBD__') sfTeams.add(match.homeTeam.id);
      if (match.awayTeam?.id && match.awayTeam.id !== '__TBD__') sfTeams.add(match.awayTeam.id);
    }
    if (match.round === 'F') {
      if (match.homeTeam?.id && match.homeTeam.id !== '__TBD__') finalTeams.add(match.homeTeam.id);
      if (match.awayTeam?.id && match.awayTeam.id !== '__TBD__') finalTeams.add(match.awayTeam.id);
    }
  }

  return { r32Teams, r16Teams, qfTeams, sfTeams, finalTeams, champion: champion?.id ?? null };
}

/**
 * Calculate a submission's score against real tournament results.
 */
export function calculateScore(
  knockoutPicks: KnockoutMatch[],
  champion: Team | undefined,
  results: RealResults
): ScoreBreakdown {
  const picked = getPickedTeamsPerRound(knockoutPicks, champion);

  const r32Correct = [...picked.r32Teams].filter((id) => results.r32Teams.includes(id)).length;
  const r16Correct = [...picked.r16Teams].filter((id) => results.r16Teams.includes(id)).length;
  const qfCorrect = [...picked.qfTeams].filter((id) => results.qfTeams.includes(id)).length;
  const sfCorrect = [...picked.sfTeams].filter((id) => results.sfTeams.includes(id)).length;
  const finalCorrect = [...picked.finalTeams].filter((id) => results.finalTeams.includes(id)).length;
  const championCorrect = results.champion !== null && picked.champion === results.champion;

  const r32 = r32Correct * POINTS_PER_ROUND.R32;
  const r16 = r16Correct * POINTS_PER_ROUND.R16;
  const qf = qfCorrect * POINTS_PER_ROUND.QF;
  const sf = sfCorrect * POINTS_PER_ROUND.SF;
  const final_ = finalCorrect * POINTS_PER_ROUND.F;
  const champ = championCorrect ? POINTS_PER_ROUND.CHAMPION : 0;

  return {
    r32,
    r16,
    qf,
    sf,
    final: final_,
    champion: champ,
    total: r32 + r16 + qf + sf + final_ + champ,
    correctPicks: {
      r32: r32Correct,
      r16: r16Correct,
      qf: qfCorrect,
      sf: sfCorrect,
      final: finalCorrect,
      champion: championCorrect,
    },
  };
}

/**
 * Calculate tiebreaker value — absolute difference from actual final score total goals.
 * Lower is better. Returns null if no actual final score yet.
 */
export function calculateTiebreaker(
  predictedScore: { home: number; away: number } | undefined,
  actualTotalGoals: number | null
): number | null {
  if (actualTotalGoals === null || !predictedScore) return null;
  const predictedTotal = predictedScore.home + predictedScore.away;
  return Math.abs(predictedTotal - actualTotalGoals);
}
