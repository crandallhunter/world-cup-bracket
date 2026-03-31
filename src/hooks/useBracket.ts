'use client';

import { useBracketStore } from '@/store/bracketStore';
import { GROUP_LABELS } from '@/lib/tournament/teams';

export function useBracket() {
  const store = useBracketStore();
  const currentGroup = GROUP_LABELS[store.currentGroupIndex];
  const currentStanding = store.groupStandings[currentGroup];
  const completedCount = Object.values(store.groupStandings).filter((s) => s.isComplete).length;
  const champion = store.knockoutBracket.find((m) => m.round === 'F')?.winner;

  return {
    ...store,
    currentGroup,
    currentStanding,
    completedCount,
    champion,
    isAllGroupsComplete: completedCount === 12,
  };
}
