export type GroupLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | 'F';

export interface Team {
  id: string;               // ISO alpha-3 code, e.g. "BRA"
  name: string;             // Display name, e.g. "Brazil"
  flagCode: string;         // ISO alpha-2 for flag emoji/SVG, e.g. "br"
  group: GroupLabel;
  isPlayoffWinner?: boolean;
  placeholderLabel?: string; // e.g. "UEFA Playoff A Winner"
}

export interface GroupStanding {
  group: GroupLabel;
  rankings: [Team, Team, Team, Team]; // 1st through 4th
  isComplete: boolean;
}

export interface KnockoutMatch {
  matchId: string;
  round: KnockoutRound;
  homeTeam?: Team;
  awayTeam?: Team;
  winner?: Team;
  position: number; // 1-indexed position in the round
}

export interface FinalScore {
  home: number;
  away: number;
}

export type BracketStep = 'GROUPS' | 'THIRD_PLACE' | 'KNOCKOUT' | 'SUBMITTED';
