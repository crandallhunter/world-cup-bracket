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

export interface ThirdPlaceFinisher extends Team {
  sourceGroup: GroupLabel;
}

export interface R32Slot {
  type: 'GROUP_WINNER' | 'GROUP_RUNNER_UP' | 'THIRD_PLACE';
  group?: GroupLabel;
  resolvedTeam?: Team;
}

export interface R32Match {
  matchId: string;      // e.g. "R32_M1"
  homeSlot: R32Slot;
  awaySlot: R32Slot;
  matchNumber: number;  // 1-16
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

export interface BracketSubmission {
  id: string;               // UUID
  walletAddress: string;
  submittedAt: number;      // Unix timestamp ms
  groupStandings: GroupStanding[];
  qualifiedThirdPlace: Team[]; // 8 teams user picks to advance
  knockoutPicks: KnockoutMatch[];
  champion?: Team;
  finalScore?: FinalScore;  // Tiebreaker score prediction
}

export type BracketStep = 'GROUPS' | 'THIRD_PLACE' | 'KNOCKOUT' | 'REVIEW' | 'SUBMITTED';
