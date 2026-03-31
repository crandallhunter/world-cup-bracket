// Maps Polymarket outcome strings to our canonical Team.id values
// Polymarket may use different spellings, so we normalize here

export const POLYMARKET_NAME_MAP: Record<string, string> = {
  // Common variations
  'Argentina': 'ARG',
  'Australia': 'AUS',
  'Austria': 'AUT',
  'Belgium': 'BEL',
  'Brazil': 'BRA',
  'Canada': 'CAN',
  'Cape Verde': 'CPV',
  'Colombia': 'COL',
  'Croatia': 'CRO',
  'Curacao': 'CUW',
  'Curaçao': 'CUW',
  'Ecuador': 'ECU',
  'Egypt': 'EGY',
  'England': 'ENG',
  'France': 'FRA',
  'Germany': 'GER',
  'Ghana': 'GHA',
  'Haiti': 'HAI',
  'Iran': 'IRN',
  'Japan': 'JPN',
  'Jordan': 'JOR',
  'Mexico': 'MEX',
  'Morocco': 'MAR',
  'Netherlands': 'NED',
  'New Zealand': 'NZL',
  'Norway': 'NOR',
  'Panama': 'PAN',
  'Paraguay': 'PAR',
  'Portugal': 'POR',
  'Qatar': 'QAT',
  'Saudi Arabia': 'KSA',
  'Scotland': 'SCO',
  'Senegal': 'SEN',
  'South Africa': 'RSA',
  'South Korea': 'KOR',
  'Spain': 'ESP',
  'Switzerland': 'SUI',
  'Tunisia': 'TUN',
  'Uruguay': 'URU',
  'USA': 'USA',
  'United States': 'USA',
  'Uzbekistan': 'UZB',
  'Ivory Coast': 'CIV',
  "Côte d'Ivoire": 'CIV',
  "Cote d'Ivoire": 'CIV',
  'Côte dIvoire': 'CIV',
  'Belgium ': 'BEL', // trailing space guard
};

export function normalizeOutcomeToTeamId(outcome: string): string | null {
  const trimmed = outcome.trim();
  return POLYMARKET_NAME_MAP[trimmed] ?? null;
}
