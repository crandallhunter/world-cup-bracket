// ─── Database types ──────────────────────────────────────────────────────────
// Shared types for the data access layer. These remain constant regardless of
// whether the backend is local JSON, Vercel Postgres, or another provider.

import type { DivisionId } from '@/lib/divisions';
import type { GroupStanding, KnockoutMatch, Team, FinalScore } from '@/types/tournament';
import type { ThirdPlaceTeam } from '@/lib/tournament/thirdPlace';
import type { RealResults, ScoreBreakdown } from '@/lib/scoring';

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
  /**
   * Self-chosen display name for the leaderboard. 3-20 chars,
   * alphanumerics + dash + underscore. Optional; nullable when the
   * user didn't pick one. Case-insensitively unique across all
   * submissions (enforced at the DB level).
   */
  username?: string;
  /**
   * ENS reverse name resolved at submission time for wallet identities
   * that didn't pick a username. Used as a fallback display label on
   * the leaderboard before falling through to the truncated address.
   * One-shot — does not refresh after submission.
   */
  ensName?: string;
  /** Full bracket data */
  groupStandings: GroupStanding[];
  qualifiedThirdPlace: ThirdPlaceTeam[];
  knockoutPicks: KnockoutMatch[];
  champion?: Team;
  finalScore?: FinalScore;
}

export interface UsedToken {
  tokenId: string;
  /** Lower-cased contract address — distinguishes Meebits Futbol vs. Meebits. */
  contractAddress: string;
  /** The submission ID that locked this token */
  submissionId: string;
  /** The wallet that held the token at submission time */
  walletAddress: string;
  lockedAt: number; // Unix timestamp ms
}

/** Cached score for a submission */
export interface SubmissionScore {
  submissionId: string;
  identifier: string;
  divisionId: DivisionId;
  score: ScoreBreakdown;
  tiebreaker: number | null;
  champion?: Team;
  updatedAt: number;
  /** Display-name passthrough so the leaderboard can render labels without a join. */
  username?: string;
  ensName?: string;
}

/**
 * Data access interface — implement this for any storage backend.
 * All methods are async to support both local and remote backends.
 */
export interface DataStore {
  // ── Submissions ──
  /** Save a new submission */
  createSubmission(submission: Submission): Promise<void>;
  /** Get submission by its unique ID */
  getSubmissionById(id: string): Promise<Submission | null>;
  /** Get submission by identity (wallet address or email) */
  getSubmissionByIdentity(identifier: string): Promise<Submission | null>;
  /** Get all submissions (for admin/division counts) */
  getAllSubmissions(): Promise<Submission[]>;
  /** Delete a submission (for re-submission / division upgrade) */
  deleteSubmission(id: string): Promise<void>;
  /**
   * Whether a username is available (not already claimed by another submission).
   * Comparison is case-insensitive — "Alice" and "alice" collide.
   */
  isUsernameAvailable(username: string): Promise<boolean>;

  // ── Token locking ──
  /** Lock token IDs to a submission. Each token carries its own contract address. */
  lockTokens(tokens: UsedToken[]): Promise<void>;
  /** Get all used token IDs (across all submissions) */
  getUsedTokenIds(): Promise<UsedToken[]>;
  /**
   * Of the given token IDs, return the ones that are already locked against
   * the given contract. Scoped per-contract so Meebits Futbol token 123 and
   * Meebits token 123 don't collide.
   */
  filterUsedTokens(contractAddress: string, tokenIds: string[]): Promise<string[]>;
  /** Unlock tokens for a submission (for re-submission) */
  unlockTokensForSubmission(submissionId: string): Promise<void>;

  // ── Tournament results & scores ──
  /** Save or update real tournament results */
  saveResults(results: RealResults): Promise<void>;
  /** Get the current real tournament results */
  getResults(): Promise<RealResults | null>;
  /** Save all submission scores (replaces previous scores) */
  saveScores(scores: SubmissionScore[]): Promise<void>;
  /** Get all submission scores, sorted by total desc */
  getScores(): Promise<SubmissionScore[]>;
}
