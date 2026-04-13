'use client';

import { useOddsContext } from '@/context/OddsContext';

/** Look up a single team's Polymarket odds. Returns null if no data for this team. */
export function useTeamOdds(teamId: string) {
  const { odds } = useOddsContext();
  return odds[teamId] ?? null;
}
