// Maps Polymarket country name strings (from "Will [X] win..." questions)
// to our canonical Team.id values.

const POLYMARKET_NAME_MAP: Record<string, string> = {
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
  'Ivory Coast (Côte d\'Ivoire)': 'CIV',
  'Algeria': 'ALG',
  'Bosnia': 'BIH',
  'Bosnia and Herzegovina': 'BIH',
  'Bosnia & Herzegovina': 'BIH',
  'Czech Republic': 'CZE',
  'Czechia': 'CZE',
  'Sweden': 'SWE',
  'Turkey': 'TUR',
  'Türkiye': 'TUR',
  'Iraq': 'IRQ',
  'DR Congo': 'COD',
  'Congo DR': 'COD',
  'Democratic Republic of Congo': 'COD',
};

/**
 * Resolve a Polymarket outcome string (country name) to our canonical
 * Team.id. Returns null if the name has no mapping — callers should
 * treat that as "unknown country, ignore this market".
 */
export function normalizeOutcomeToTeamId(name: string): string | null {
  const trimmed = name.trim();
  return POLYMARKET_NAME_MAP[trimmed] ?? null;
}
