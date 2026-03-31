import type { Team, GroupLabel } from '@/types/tournament';

// Official 2026 FIFA World Cup draw — December 5, 2025, Kennedy Center
// 6 slots remain as playoff placeholders (finals: March 31, 2026)

const makeTeam = (
  id: string,
  name: string,
  flagCode: string,
  group: GroupLabel,
  extra?: Partial<Team>
): Team => ({ id, name, flagCode, group, ...extra });

export const ALL_TEAMS: Team[] = [
  // Group A
  makeTeam('MEX', 'Mexico', 'mx', 'A'),
  makeTeam('KOR', 'South Korea', 'kr', 'A'),
  makeTeam('RSA', 'South Africa', 'za', 'A'),
  makeTeam('UEFA_D', 'UEFA Playoff D Winner', 'eu', 'A', {
    isPlayoffWinner: true,
    placeholderLabel: 'UEFA Playoff D Winner',
  }),

  // Group B
  makeTeam('CAN', 'Canada', 'ca', 'B'),
  makeTeam('SUI', 'Switzerland', 'ch', 'B'),
  makeTeam('QAT', 'Qatar', 'qa', 'B'),
  makeTeam('UEFA_A', 'UEFA Playoff A Winner', 'eu', 'B', {
    isPlayoffWinner: true,
    placeholderLabel: 'UEFA Playoff A Winner',
  }),

  // Group C
  makeTeam('BRA', 'Brazil', 'br', 'C'),
  makeTeam('MAR', 'Morocco', 'ma', 'C'),
  makeTeam('SCO', 'Scotland', 'gb-sct', 'C'),
  makeTeam('HAI', 'Haiti', 'ht', 'C'),

  // Group D
  makeTeam('USA', 'USA', 'us', 'D'),
  makeTeam('PAR', 'Paraguay', 'py', 'D'),
  makeTeam('AUS', 'Australia', 'au', 'D'),
  makeTeam('UEFA_C', 'UEFA Playoff C Winner', 'eu', 'D', {
    isPlayoffWinner: true,
    placeholderLabel: 'UEFA Playoff C Winner',
  }),

  // Group E
  makeTeam('GER', 'Germany', 'de', 'E'),
  makeTeam('ECU', 'Ecuador', 'ec', 'E'),
  makeTeam('CIV', "Côte d'Ivoire", 'ci', 'E'),
  makeTeam('CUW', 'Curaçao', 'cw', 'E'),

  // Group F
  makeTeam('NED', 'Netherlands', 'nl', 'F'),
  makeTeam('JPN', 'Japan', 'jp', 'F'),
  makeTeam('TUN', 'Tunisia', 'tn', 'F'),
  makeTeam('UEFA_B', 'UEFA Playoff B Winner', 'eu', 'F', {
    isPlayoffWinner: true,
    placeholderLabel: 'UEFA Playoff B Winner',
  }),

  // Group G
  makeTeam('BEL', 'Belgium', 'be', 'G'),
  makeTeam('IRN', 'Iran', 'ir', 'G'),
  makeTeam('EGY', 'Egypt', 'eg', 'G'),
  makeTeam('NZL', 'New Zealand', 'nz', 'G'),

  // Group H
  makeTeam('ESP', 'Spain', 'es', 'H'),
  makeTeam('URU', 'Uruguay', 'uy', 'H'),
  makeTeam('KSA', 'Saudi Arabia', 'sa', 'H'),
  makeTeam('CPV', 'Cape Verde', 'cv', 'H'),

  // Group I
  makeTeam('FRA', 'France', 'fr', 'I'),
  makeTeam('SEN', 'Senegal', 'sn', 'I'),
  makeTeam('NOR', 'Norway', 'no', 'I'),
  makeTeam('ICP2', 'Inter-Conf. Playoff 2 Winner', 'un', 'I', {
    isPlayoffWinner: true,
    placeholderLabel: 'Inter-Conf. Playoff 2 Winner',
  }),

  // Group J
  makeTeam('ARG', 'Argentina', 'ar', 'J'),
  makeTeam('AUT', 'Austria', 'at', 'J'),
  makeTeam('ALG', 'Algeria', 'dz', 'J'),
  makeTeam('JOR', 'Jordan', 'jo', 'J'),

  // Group K
  makeTeam('POR', 'Portugal', 'pt', 'K'),
  makeTeam('COL', 'Colombia', 'co', 'K'),
  makeTeam('UZB', 'Uzbekistan', 'uz', 'K'),
  makeTeam('ICP1', 'Inter-Conf. Playoff 1 Winner', 'un', 'K', {
    isPlayoffWinner: true,
    placeholderLabel: 'Inter-Conf. Playoff 1 Winner',
  }),

  // Group L
  makeTeam('ENG', 'England', 'gb-eng', 'L'),
  makeTeam('CRO', 'Croatia', 'hr', 'L'),
  makeTeam('PAN', 'Panama', 'pa', 'L'),
  makeTeam('GHA', 'Ghana', 'gh', 'L'),
];

export const GROUPS: Record<GroupLabel, Team[]> = {
  A: ALL_TEAMS.filter((t) => t.group === 'A'),
  B: ALL_TEAMS.filter((t) => t.group === 'B'),
  C: ALL_TEAMS.filter((t) => t.group === 'C'),
  D: ALL_TEAMS.filter((t) => t.group === 'D'),
  E: ALL_TEAMS.filter((t) => t.group === 'E'),
  F: ALL_TEAMS.filter((t) => t.group === 'F'),
  G: ALL_TEAMS.filter((t) => t.group === 'G'),
  H: ALL_TEAMS.filter((t) => t.group === 'H'),
  I: ALL_TEAMS.filter((t) => t.group === 'I'),
  J: ALL_TEAMS.filter((t) => t.group === 'J'),
  K: ALL_TEAMS.filter((t) => t.group === 'K'),
  L: ALL_TEAMS.filter((t) => t.group === 'L'),
};

export const GROUP_LABELS: GroupLabel[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export function getTeamById(id: string): Team | undefined {
  return ALL_TEAMS.find((t) => t.id === id);
}

export function getFlagEmoji(flagCode: string): string {
  if (flagCode === 'eu' || flagCode === 'un') return '🏴';
  if (flagCode === 'gb-sct') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (flagCode === 'gb-eng') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  const codePoints = flagCode
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
