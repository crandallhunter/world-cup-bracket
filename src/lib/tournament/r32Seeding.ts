import type { GroupLabel, GroupStanding, KnockoutMatch, R32Match, Team } from '@/types/tournament';
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

// Build subsequent knockout rounds from previous round winners
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

// Build the full initial knockout bracket structure
export function buildFullBracket(
  standings: Record<GroupLabel, GroupStanding>,
  advancingThirds: ThirdPlaceTeam[]
): KnockoutMatch[] {
  const r32 = resolveR32Bracket(standings, advancingThirds);
  const r16 = buildNextRound(r32, 'R16');
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
  const matchesInCurrentRound = updated
    .filter((m) => m.round === match.round)
    .sort((a, b) => a.position - b.position);
  const matchIndexInRound = matchesInCurrentRound.findIndex((m) => m.matchId === matchId);
  const nextMatchPosition = Math.floor(matchIndexInRound / 2) + 1;
  const isHome = matchIndexInRound % 2 === 0;
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

// Get all matches for a specific round
export function getMatchesByRound(
  bracket: KnockoutMatch[],
  round: KnockoutMatch['round']
): KnockoutMatch[] {
  return bracket
    .filter((m) => m.round === round)
    .sort((a, b) => a.position - b.position);
}
