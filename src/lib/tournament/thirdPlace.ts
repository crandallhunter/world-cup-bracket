import type { GroupLabel, GroupStanding, Team } from '@/types/tournament';

export interface ThirdPlaceTeam extends Team {
  sourceGroup: GroupLabel;
}

export function getThirdPlaceTeams(
  standings: Partial<Record<GroupLabel, GroupStanding>>
): ThirdPlaceTeam[] {
  const thirds: ThirdPlaceTeam[] = [];
  for (const standing of Object.values(standings)) {
    if (standing?.isComplete) {
      const third = standing.rankings[2];
      thirds.push({ ...third, sourceGroup: standing.group });
    }
  }
  return thirds;
}

export function getAllThirdPlaceTeams(
  standings: Record<GroupLabel, GroupStanding>
): ThirdPlaceTeam[] {
  return Object.values(standings).map((s) => ({
    ...s.rankings[2],
    sourceGroup: s.group,
  }));
}

