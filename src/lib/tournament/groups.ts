import type { GroupLabel, GroupStanding, Team } from '@/types/tournament';
import { GROUPS, GROUP_LABELS } from './teams';

export function getDefaultStandings(): Record<GroupLabel, GroupStanding> {
  const standings = {} as Record<GroupLabel, GroupStanding>;
  for (const label of GROUP_LABELS) {
    const teams = GROUPS[label];
    standings[label] = {
      group: label,
      rankings: [teams[0], teams[1], teams[2], teams[3]] as [Team, Team, Team, Team],
      isComplete: false,
    };
  }
  return standings;
}

export function getGroupWinner(standing: GroupStanding): Team {
  return standing.rankings[0];
}

export function getGroupRunnerUp(standing: GroupStanding): Team {
  return standing.rankings[1];
}

export function getGroupThird(standing: GroupStanding): Team {
  return standing.rankings[2];
}

export function countCompletedGroups(
  standings: Partial<Record<GroupLabel, GroupStanding>>
): number {
  return Object.values(standings).filter((s) => s?.isComplete).length;
}

export function allGroupsComplete(
  standings: Partial<Record<GroupLabel, GroupStanding>>
): boolean {
  return countCompletedGroups(standings) === 12;
}
