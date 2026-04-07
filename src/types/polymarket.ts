export interface TeamOdds {
  teamId: string;           // Matches Team.id
  probability: number;      // 0-1 decimal, e.g. 0.18
  displayPct: string;       // e.g. "18%"
}

export type OddsMap = Record<string, TeamOdds>; // keyed by Team.id
