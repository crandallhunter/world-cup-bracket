// ─── Database types ──────────────────────────────────────────────────────────
// Shared types for the data access layer. These remain constant regardless of
// whether the backend is local JSON, Vercel Postgres, or another provider.

import type { DivisionId } from '@/lib/divisions';
import type { GroupStanding, KnockoutMatch, Team, FinalScore } from '@/types/tournament';
import type { ThirdPlaceTeam } from '@/lib/tournament/thirdPlace';

export type IdentityType = 'wallet' | 'email';

export interface Submission {
  id: string;
  identityType: IdentityType;
  /** Wallet address (checksummed) or email address */
  identifier: string;
  divisionId: DivisionId;
  /** Token IDs locked to this submission (empty for email users) */
  lockedTokenIds: string[];
  submittedAt: number; // Unix timestamp ms
  /** Full bracket data */
  groupStandings: GroupStanding[];
  qualifiedThirdPlace: ThirdPlaceTeam[];
  knockoutPicks: KnockoutMatch[];
  champion?: Team;
  finalScore?: FinalScore;
}

export interface UsedToken {
  tokenId: string;
  /** The submission ID that locked this token */
  submissionId: string;
  /** The wallet that held the token at submission time */
  walletAddress: string;
  lockedAt: number; // Unix timestamp ms
}

/**
 * Data access interface — implement this for any storage backend.
 * All methods are async to support both local and remote backends.
 */
export interface DataStore {
  // ── Submissions ──
  /** Save a new submission */
  createSubmission(submission: Submission): Promise<void>;
  /** Get submission by identity (wallet address or email) */
  getSubmissionByIdentity(identifier: string): Promise<Submission | null>;
  /** Get all submissions (for admin/division counts) */
  getAllSubmissions(): Promise<Submission[]>;
  /** Delete a submission (for re-submission / division upgrade) */
  deleteSubmission(id: string): Promise<void>;

  // ── Token locking ──
  /** Lock token IDs to a submission */
  lockTokens(tokens: UsedToken[]): Promise<void>;
  /** Get all used token IDs (across all submissions) */
  getUsedTokenIds(): Promise<UsedToken[]>;
  /** Check which of the given token IDs are already locked */
  filterUsedTokens(tokenIds: string[]): Promise<string[]>;
  /** Unlock tokens for a submission (for re-submission) */
  unlockTokensForSubmission(submissionId: string): Promise<void>;
}
