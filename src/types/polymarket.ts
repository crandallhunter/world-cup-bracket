export interface GammaMarket {
  id: string;
  question: string;
  slug: string;
  outcomes: string;         // JSON-encoded string array, e.g. '["Brazil","France"]'
  outcomePrices: string;    // JSON-encoded string array of decimals, e.g. '["0.18","0.15"]'
  active: boolean;
  closed: boolean;
  volume: string;
  liquidity: string;
  clobTokenIds?: string;
}

export interface TeamOdds {
  teamId: string;           // Matches Team.id
  probability: number;      // 0-1 decimal, e.g. 0.18
  displayPct: string;       // e.g. "18%"
}

export type OddsMap = Record<string, TeamOdds>; // keyed by Team.id
