import type { OddsMap } from '@/types/polymarket';

// Snapshot of Polymarket odds as of March 31, 2026
// Used as fallback when the live event API is unreachable.
export const FALLBACK_ODDS: OddsMap = {
  ESP: { teamId: 'ESP', probability: 0.163, displayPct: '16%' },
  ENG: { teamId: 'ENG', probability: 0.127, displayPct: '13%' },
  FRA: { teamId: 'FRA', probability: 0.126, displayPct: '13%' },
  ARG: { teamId: 'ARG', probability: 0.096, displayPct: '10%' },
  BRA: { teamId: 'BRA', probability: 0.087, displayPct: '9%' },
  POR: { teamId: 'POR', probability: 0.068, displayPct: '7%' },
  GER: { teamId: 'GER', probability: 0.054, displayPct: '5%' },
  NED: { teamId: 'NED', probability: 0.034, displayPct: '3%' },
  NOR: { teamId: 'NOR', probability: 0.030, displayPct: '3%' },
  BEL: { teamId: 'BEL', probability: 0.020, displayPct: '2%' },
  COL: { teamId: 'COL', probability: 0.017, displayPct: '2%' },
  USA: { teamId: 'USA', probability: 0.017, displayPct: '2%' },
  MAR: { teamId: 'MAR', probability: 0.016, displayPct: '2%' },
  JPN: { teamId: 'JPN', probability: 0.015, displayPct: '2%' },
  URU: { teamId: 'URU', probability: 0.014, displayPct: '1%' },
  CRO: { teamId: 'CRO', probability: 0.012, displayPct: '1%' },
  MEX: { teamId: 'MEX', probability: 0.012, displayPct: '1%' },
  SUI: { teamId: 'SUI', probability: 0.009, displayPct: '1%' },
  AUT: { teamId: 'AUT', probability: 0.007, displayPct: '1%' },
  SEN: { teamId: 'SEN', probability: 0.006, displayPct: '1%' },
  ECU: { teamId: 'ECU', probability: 0.006, displayPct: '1%' },
  CAN: { teamId: 'CAN', probability: 0.006, displayPct: '1%' },
  KOR: { teamId: 'KOR', probability: 0.005, displayPct: '1%' },
  PAR: { teamId: 'PAR', probability: 0.005, displayPct: '1%' },
  CIV: { teamId: 'CIV', probability: 0.005, displayPct: '1%' },
};

export const FALLBACK_IS_LIVE = false;
