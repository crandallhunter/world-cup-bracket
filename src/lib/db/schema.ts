// ─── Drizzle schema ──────────────────────────────────────────────────────────
// Postgres schema for the bracket app. Shared by Supabase (dev) and Amazon
// RDS / Aurora Postgres (prod) — Drizzle abstracts the driver so the same
// schema.ts and migration files apply to both.
//
// Design notes (per AGENTS.md § 1):
//   - Bracket body kept as JSONB because we always read / write a submission
//     whole. Avoids 4 normalized tables we'd never query individually.
//   - `used_tokens` is its own table (not JSONB) because it's the canonical
//     source of truth for cross-submission token-lock enforcement, and needs
//     a UNIQUE constraint to prevent double-spending a token.
//   - `submission_scores` uses `submission_id` as the primary key (1:1 with
//     submissions) so scores can be upserted cheaply each cron run.
//   - `tournament_results` is a singleton-style table with a fixed id = 1.
//     App code always SELECT/UPSERT id = 1.

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import type { DivisionId } from '@/lib/divisions';
import type {
  GroupStanding,
  KnockoutMatch,
  Team,
  FinalScore,
} from '@/types/tournament';
import type { ThirdPlaceTeam } from '@/lib/tournament/thirdPlace';
import type { RealResults, ScoreBreakdown } from '@/lib/scoring';
import type { IdentityType } from './types';

/**
 * Shape of the JSONB `bracket` column on `submissions`.
 * Holds the user's predictions — distinct from the computed score which
 * lives in `submission_scores` and gets refreshed by the cron.
 */
export interface SubmissionBracketJson {
  groupStandings: GroupStanding[];
  qualifiedThirdPlace: ThirdPlaceTeam[];
  knockoutPicks: KnockoutMatch[];
  champion?: Team;
  finalScore?: FinalScore;
}

// ─── submissions ─────────────────────────────────────────────────────────────

export const submissions = pgTable(
  'submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Wallet address (lowercased) or email address (lowercased). */
    identifier: text('identifier').notNull().unique(),
    identityType: text('identity_type').$type<IdentityType>().notNull(),
    divisionId: text('division_id').$type<DivisionId>().notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    bracket: jsonb('bracket').$type<SubmissionBracketJson>().notNull(),
  },
  (t) => [
    index('submissions_division_idx').on(t.divisionId),
    index('submissions_submitted_at_idx').on(t.submittedAt),
  ],
);

// ─── used_tokens ─────────────────────────────────────────────────────────────

export const usedTokens = pgTable(
  'used_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenId: text('token_id').notNull(),
    /** Lower-cased contract address. */
    contractAddress: text('contract_address').notNull(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    walletAddress: text('wallet_address').notNull(),
    lockedAt: timestamp('locked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Same token on the same contract can only be locked once, globally.
    unique('used_tokens_contract_token_unq').on(t.contractAddress, t.tokenId),
    index('used_tokens_submission_idx').on(t.submissionId),
    index('used_tokens_wallet_idx').on(t.walletAddress),
  ],
);

// ─── submission_scores ───────────────────────────────────────────────────────

export const submissionScores = pgTable('submission_scores', {
  submissionId: uuid('submission_id')
    .primaryKey()
    .references(() => submissions.id, { onDelete: 'cascade' }),
  identifier: text('identifier').notNull(),
  divisionId: text('division_id').$type<DivisionId>().notNull(),
  score: jsonb('score').$type<ScoreBreakdown>().notNull(),
  tiebreaker: integer('tiebreaker'),
  champion: jsonb('champion').$type<Team>(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── tournament_results (singleton) ──────────────────────────────────────────

export const tournamentResults = pgTable('tournament_results', {
  /** Always 1. Enforced by app code — always SELECT/UPSERT id=1. */
  id: integer('id').primaryKey(),
  results: jsonb('results').$type<RealResults>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
