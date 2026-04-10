import type { GroupLabel, GroupStanding, Team } from '@/types/tournament';

/**
 * A group's 3rd-place finisher tagged with its source group.
 * Used by the 3rd-place selector to let users choose which 8 of the 12
 * 3rd-placers advance to the Round of 32.
 */
export interface ThirdPlaceTeam extends Team {
  sourceGroup: GroupLabel;
}

/**
 * Return the 3rd-place team from every group's current standing.
 * Assumes all 12 groups are present in the standings map.
 */
export function getAllThirdPlaceTeams(
  standings: Record<GroupLabel, GroupStanding>
): ThirdPlaceTeam[] {
  return Object.values(standings).map((s) => ({
    ...s.rankings[2],
    sourceGroup: s.group,
  }));
}
