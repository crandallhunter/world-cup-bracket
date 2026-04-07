import type { GroupLabel, GroupStanding, KnockoutMatch, Team } from '@/types/tournament';
import { getGroupWinner, getGroupRunnerUp } from './groups';
import type { ThirdPlaceTeam } from './thirdPlace';

// ─── Fixed R32 matchups (no 3rd-place dependency) ─────────────────────────────
// Based on official FIFA 2026 bracket structure
// M1:  A2 vs B2
// M2:  C1 vs F2
// M4:  F1 vs C2
// M5:  E2 vs I2
// M8:  H1 vs J2
// M11: J1 vs H2
// M12: K2 vs L2
// M14: D2 vs G2

// ─── Variable matchups (3rd-place slot assigned via scenario table) ────────────
// M3:  E1 vs 3rd(A/B/C/D/F)
// M6:  I1 vs 3rd(C/D/F/G/H)
// M7:  A1 vs 3rd(C/E/F/H/I)
// M9:  G1 vs 3rd(A/E/H/I/J)
// M10: D1 vs 3rd(B/E/F/I/J)
// M13: B1 vs 3rd(E/F/G/I/J)
// M15: K1 vs 3rd(D/E/I/J/L)
// M16: L1 vs 3rd(E/H/I/J/K)

// Eligible groups for each 3rd-place slot
const THIRD_PLACE_ELIGIBLE: Record<string, GroupLabel[]> = {
  M3:  ['A', 'B', 'C', 'D', 'F'],
  M6:  ['C', 'D', 'F', 'G', 'H'],
  M7:  ['C', 'E', 'F', 'H', 'I'],
  M9:  ['A', 'E', 'H', 'I', 'J'],
  M10: ['B', 'E', 'F', 'I', 'J'],
  M13: ['E', 'F', 'G', 'I', 'J'],
  M15: ['D', 'E', 'I', 'J', 'L'],
  M16: ['E', 'H', 'I', 'J', 'K'],
};

const VARIABLE_MATCH_IDS = ['M3', 'M6', 'M7', 'M9', 'M10', 'M13', 'M15', 'M16'];

// Greedy assignment: assign each advancing 3rd-place team to the first eligible slot
function assignThirdPlaceTeams(
  advancingThirds: ThirdPlaceTeam[]
): Record<string, ThirdPlaceTeam> {
  const assigned: Record<string, ThirdPlaceTeam> = {};
  const remaining = [...advancingThirds];

  for (const matchId of VARIABLE_MATCH_IDS) {
    const eligible = THIRD_PLACE_ELIGIBLE[matchId];
    const idx = remaining.findIndex((t) => eligible.includes(t.sourceGroup));
    if (idx !== -1) {
      assigned[matchId] = remaining[idx];
      remaining.splice(idx, 1);
    }
  }

  // Fallback: if any slots are still unfilled, assign leftover teams in order
  // (can happen when user's selections don't perfectly match eligibility constraints)
  for (const matchId of VARIABLE_MATCH_IDS) {
    if (!assigned[matchId] && remaining.length > 0) {
      assigned[matchId] = remaining.shift()!;
    }
  }

  return assigned;
}

export function resolveR32Bracket(
  standings: Record<GroupLabel, GroupStanding>,
  advancingThirds: ThirdPlaceTeam[]
): KnockoutMatch[] {
  const w = (g: GroupLabel): Team | undefined => {
    const s = standings[g];
    return s?.isComplete ? getGroupWinner(s) : undefined;
  };
  const r = (g: GroupLabel): Team | undefined => {
    const s = standings[g];
    return s?.isComplete ? getGroupRunnerUp(s) : undefined;
  };

  const thirdAssignment = assignThirdPlaceTeams(advancingThirds);
  const t = (matchId: string): Team | undefined => thirdAssignment[matchId];

  const matches: Array<{ pos: number; home?: Team; away?: Team }> = [
    { pos: 1,  home: r('A'), away: r('B') },         // M1
    { pos: 2,  home: w('C'), away: r('F') },          // M2
    { pos: 3,  home: w('E'), away: t('M3') },         // M3
    { pos: 4,  home: w('F'), away: r('C') },          // M4
    { pos: 5,  home: r('E'), away: r('I') },          // M5
    { pos: 6,  home: w('I'), away: t('M6') },         // M6
    { pos: 7,  home: w('A'), away: t('M7') },         // M7
    { pos: 8,  home: w('H'), away: r('J') },          // M8
    { pos: 9,  home: w('G'), away: t('M9') },         // M9
    { pos: 10, home: w('D'), away: t('M10') },        // M10
    { pos: 11, home: w('J'), away: r('H') },          // M11
    { pos: 12, home: r('K'), away: r('L') },          // M12
    { pos: 13, home: w('B'), away: t('M13') },        // M13
    { pos: 14, home: r('D'), away: r('G') },          // M14
    { pos: 15, home: w('K'), away: t('M15') },        // M15
    { pos: 16, home: w('L'), away: t('M16') },        // M16
  ];

  return matches.map(({ pos, home, away }) => ({
    matchId: `R32_M${pos}`,
    round: 'R32',
    homeTeam: home,
    awayTeam: away,
    winner: undefined,
    position: pos,
  }));
}

// ─── Official FIFA R16 pairings ──────────────────────────────────────────────
// Each entry is [home R32 position, away R32 position].
// Ordered so that sequential pairing in QF/SF/F produces the correct bracket.
//
// Bracket tree (← side 1 | side 2 →):
//   R16_M1 (3v6)  ─┐                           ┌─ R16_M5 (2v5)
//                    ├ QF_M1 ─┐           ┌─ QF_M3 ├
//   R16_M2 (1v4)  ─┘          │           │          └─ R16_M6 (7v16)
//                               ├ SF_M1   SF_M2 ├
//   R16_M3 (12v8) ─┐          │           │          ┌─ R16_M7 (11v14)
//                    ├ QF_M2 ─┘           └─ QF_M4 ├
//   R16_M4 (10v9) ─┘                           └─ R16_M8 (13v15)
//
const R16_PAIRINGS: [number, number][] = [
  [3, 6],    // R16_M1: E1/3rd winner vs I1/3rd winner
  [1, 4],    // R16_M2: A2/B2 winner vs F1/C2 winner
  [12, 8],   // R16_M3: K2/L2 winner vs H1/J2 winner
  [10, 9],   // R16_M4: D1/3rd winner vs G1/3rd winner
  [2, 5],    // R16_M5: C1/F2 winner vs E2/I2 winner
  [7, 16],   // R16_M6: A1/3rd winner vs L1/3rd winner
  [11, 14],  // R16_M7: J1/H2 winner vs D2/G2 winner
  [13, 15],  // R16_M8: B1/3rd winner vs K1/3rd winner
];

// Lookup: R32 position → [R16 match position, isHome]
const R32_TO_R16: Record<number, [number, boolean]> = {};
R16_PAIRINGS.forEach(([homePos, awayPos], idx) => {
  R32_TO_R16[homePos] = [idx + 1, true];
  R32_TO_R16[awayPos] = [idx + 1, false];
});

// Build subsequent knockout rounds from previous round winners (sequential pairing)
export function buildNextRound(
  prevMatches: KnockoutMatch[],
  round: 'R16' | 'QF' | 'SF' | 'F'
): KnockoutMatch[] {
  const nextMatches: KnockoutMatch[] = [];
  for (let i = 0; i < prevMatches.length; i += 2) {
    const m1 = prevMatches[i];
    const m2 = prevMatches[i + 1];
    nextMatches.push({
      matchId: `${round}_M${Math.floor(i / 2) + 1}`,
      round,
      homeTeam: m1?.winner,
      awayTeam: m2?.winner,
      winner: undefined,
      position: Math.floor(i / 2) + 1,
    });
  }
  return nextMatches;
}

// Build R16 using official FIFA bracket pairings (not sequential)
function buildR16(r32: KnockoutMatch[]): KnockoutMatch[] {
  return R16_PAIRINGS.map(([homePos, awayPos], idx) => {
    const homeR32 = r32.find((m) => m.position === homePos);
    const awayR32 = r32.find((m) => m.position === awayPos);
    return {
      matchId: `R16_M${idx + 1}`,
      round: 'R16' as const,
      homeTeam: homeR32?.winner,
      awayTeam: awayR32?.winner,
      winner: undefined,
      position: idx + 1,
    };
  });
}

// Build the full initial knockout bracket structure
export function buildFullBracket(
  standings: Record<GroupLabel, GroupStanding>,
  advancingThirds: ThirdPlaceTeam[]
): KnockoutMatch[] {
  const r32 = resolveR32Bracket(standings, advancingThirds);
  const r16 = buildR16(r32);
  const qf = buildNextRound(r16, 'QF');
  const sf = buildNextRound(qf, 'SF');
  const final = buildNextRound(sf, 'F');
  return [...r32, ...r16, ...qf, ...sf, ...final];
}

// When a match winner is picked, propagate them into the next round
export function propagateWinner(
  bracket: KnockoutMatch[],
  matchId: string,
  winner: Team
): KnockoutMatch[] {
  const updated = bracket.map((m) =>
    m.matchId === matchId ? { ...m, winner } : m
  );

  const match = updated.find((m) => m.matchId === matchId);
  if (!match) return updated;

  const roundOrder: KnockoutMatch['round'][] = ['R32', 'R16', 'QF', 'SF', 'F'];
  const currentRoundIdx = roundOrder.indexOf(match.round);
  if (currentRoundIdx === roundOrder.length - 1) return updated; // Final

  const nextRound = roundOrder[currentRoundIdx + 1];

  let nextMatchPosition: number;
  let isHome: boolean;

  if (match.round === 'R32') {
    // R32→R16 uses FIFA's non-sequential bracket pairings
    const mapping = R32_TO_R16[match.position];
    if (!mapping) return updated;
    [nextMatchPosition, isHome] = mapping;
  } else {
    // R16→QF, QF→SF, SF→F use sequential pairing
    const matchesInCurrentRound = updated
      .filter((m) => m.round === match.round)
      .sort((a, b) => a.position - b.position);
    const matchIndexInRound = matchesInCurrentRound.findIndex((m) => m.matchId === matchId);
    nextMatchPosition = Math.floor(matchIndexInRound / 2) + 1;
    isHome = matchIndexInRound % 2 === 0;
  }

  const nextMatchId = `${nextRound}_M${nextMatchPosition}`;

  return updated.map((m) => {
    if (m.matchId !== nextMatchId) return m;
    if (isHome) {
      // Clearing old winner if team changed
      return { ...m, homeTeam: winner, winner: undefined };
    } else {
      return { ...m, awayTeam: winner, winner: undefined };
    }
  });
}

// Visual display order for R32 matches — grouped so each pair feeds into
// the adjacent R16 match (e.g. R32 positions 3,6 → R16_M1; 1,4 → R16_M2; etc.)
const R32_DISPLAY_ORDER = [3, 6, 1, 4, 12, 8, 10, 9, 2, 5, 7, 16, 11, 14, 13, 15];

// Get all matches for a specific round
export function getMatchesByRound(
  bracket: KnockoutMatch[],
  round: KnockoutMatch['round']
): KnockoutMatch[] {
  const matches = bracket.filter((m) => m.round === round);
  if (round === 'R32') {
    // Sort R32 by visual display order so they align with R16 matches
    return matches.sort((a, b) => {
      return R32_DISPLAY_ORDER.indexOf(a.position) - R32_DISPLAY_ORDER.indexOf(b.position);
    });
  }
  return matches.sort((a, b) => a.position - b.position);
}
