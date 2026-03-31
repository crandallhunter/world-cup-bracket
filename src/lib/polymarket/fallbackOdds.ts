import type { OddsMap } from '@/types/polymarket';

// Estimated win probabilities based on bookmaker consensus (March 2026)
// Used as fallback when no live Polymarket market exists yet.
// These will be automatically replaced by live data once a market is created.
export const FALLBACK_ODDS: OddsMap = {
  BRA: { teamId: 'BRA', probability: 0.14, displayPct: '14%' },
  FRA: { teamId: 'FRA', probability: 0.13, displayPct: '13%' },
  ENG: { teamId: 'ENG', probability: 0.12, displayPct: '12%' },
  ARG: { teamId: 'ARG', probability: 0.11, displayPct: '11%' },
  GER: { teamId: 'GER', probability: 0.10, displayPct: '10%' },
  ESP: { teamId: 'ESP', probability: 0.09, displayPct: '9%' },
  POR: { teamId: 'POR', probability: 0.07, displayPct: '7%' },
  NED: { teamId: 'NED', probability: 0.06, displayPct: '6%' },
  COL: { teamId: 'COL', probability: 0.03, displayPct: '3%' },
  BEL: { teamId: 'BEL', probability: 0.03, displayPct: '3%' },
  URU: { teamId: 'URU', probability: 0.02, displayPct: '2%' },
  USA: { teamId: 'USA', probability: 0.02, displayPct: '2%' },
  MAR: { teamId: 'MAR', probability: 0.02, displayPct: '2%' },
  JPN: { teamId: 'JPN', probability: 0.01, displayPct: '1%' },
  MEX: { teamId: 'MEX', probability: 0.01, displayPct: '1%' },
  SEN: { teamId: 'SEN', probability: 0.01, displayPct: '1%' },
  NOR: { teamId: 'NOR', probability: 0.01, displayPct: '1%' },
  CRO: { teamId: 'CRO', probability: 0.01, displayPct: '1%' },
  AUT: { teamId: 'AUT', probability: 0.01, displayPct: '1%' },
  DEN: { teamId: 'DEN', probability: 0.01, displayPct: '1%' },
};

export const FALLBACK_IS_LIVE = false;
