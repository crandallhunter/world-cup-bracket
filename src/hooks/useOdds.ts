'use client';

import { useOddsContext } from '@/context/OddsContext';

export function useOdds() {
  return useOddsContext();
}

export function useTeamOdds(teamId: string) {
  const { odds } = useOddsContext();
  return odds[teamId] ?? null;
}
