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

// The 8 advancing 3rd-place groups determine which R32 slot they fill.
// Returns sorted string key like "BCDEFGHI" used for scenario lookup.
export function getThirdPlaceKey(advancingThirds: ThirdPlaceTeam[]): string {
  return advancingThirds
    .map((t) => t.sourceGroup)
    .sort()
    .join('');
}
