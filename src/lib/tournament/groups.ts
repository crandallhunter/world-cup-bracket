import type { GroupStanding, Team } from '@/types/tournament';

/** 1st-place team in a completed group standing. */
export function getGroupWinner(standing: GroupStanding): Team {
  return standing.rankings[0];
}

/** 2nd-place team in a completed group standing. */
export function getGroupRunnerUp(standing: GroupStanding): Team {
  return standing.rankings[1];
}
