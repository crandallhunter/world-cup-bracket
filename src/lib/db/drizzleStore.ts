// ─── Drizzle + Postgres implementation of DataStore ──────────────────────────
// Active data-access implementation. Works against any Postgres
// (Supabase for dev, AWS RDS / Aurora for prod). Schema is defined in
// ./schema.ts.
//
// Invariants the caller relies on:
//   - getSubmissionByIdentity normalizes the identifier to lowercase
//     (matches how we store it) so wallet-address case doesn't matter.
//   - saveScores is a replace-all: it truncates submission_scores and
//     re-inserts, so stale rows from deleted submissions can't linger.

import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { dbClient } from './client';
import {
  submissions,
  usedTokens,
  submissionScores,
  tournamentResults,
  type SubmissionBracketJson,
} from './schema';
import type { DataStore, Submission, SubmissionScore } from './types';
import type { DivisionId } from '@/lib/divisions';
import type { RealResults } from '@/lib/scoring';

// ─── Row <-> domain shape conversion ─────────────────────────────────────────

type SubmissionRow = typeof submissions.$inferSelect;

async function rowToSubmission(row: SubmissionRow): Promise<Submission> {
  const tokenRows = await dbClient
    .select({ tokenId: usedTokens.tokenId })
    .from(usedTokens)
    .where(eq(usedTokens.submissionId, row.id));

  const bracket = row.bracket as SubmissionBracketJson;

  return {
    id: row.id,
    identifier: row.identifier,
    identityType: row.identityType,
    divisionId: row.divisionId,
    lockedTokenIds: tokenRows.map((t) => t.tokenId),
    submittedAt: row.submittedAt.getTime(),
    username: row.username ?? undefined,
    ensName: row.ensName ?? undefined,
    groupStandings: bracket.groupStandings,
    qualifiedThirdPlace: bracket.qualifiedThirdPlace,
    knockoutPicks: bracket.knockoutPicks,
    champion: bracket.champion,
    finalScore: bracket.finalScore,
  };
}

function submissionToInsert(sub: Submission) {
  const bracket: SubmissionBracketJson = {
    groupStandings: sub.groupStandings,
    qualifiedThirdPlace: sub.qualifiedThirdPlace,
    knockoutPicks: sub.knockoutPicks,
    champion: sub.champion,
    finalScore: sub.finalScore,
  };
  return {
    id: sub.id,
    identifier: sub.identifier.toLowerCase(),
    identityType: sub.identityType,
    divisionId: sub.divisionId,
    submittedAt: new Date(sub.submittedAt),
    bracket,
    // Username stored as-typed for display; case-insensitive uniqueness
    // is enforced by submissions_username_lower_unq.
    username: sub.username ?? null,
    ensName: sub.ensName ?? null,
  };
}

// ─── DataStore implementation ────────────────────────────────────────────────

export const drizzleStore: DataStore = {
  // ── Submissions ──

  async createSubmission(submission) {
    await dbClient.insert(submissions).values(submissionToInsert(submission));
  },

  async getSubmissionById(id) {
    const [row] = await dbClient
      .select()
      .from(submissions)
      .where(eq(submissions.id, id))
      .limit(1);
    return row ? rowToSubmission(row) : null;
  },

  async getSubmissionByIdentity(identifier) {
    const [row] = await dbClient
      .select()
      .from(submissions)
      .where(eq(submissions.identifier, identifier.toLowerCase()))
      .limit(1);
    return row ? rowToSubmission(row) : null;
  },

  async getAllSubmissions() {
    const rows = await dbClient
      .select()
      .from(submissions)
      .orderBy(desc(submissions.submittedAt));
    return Promise.all(rows.map(rowToSubmission));
  },

  async deleteSubmission(id) {
    // ON DELETE CASCADE on used_tokens and submission_scores handles cleanup.
    await dbClient.delete(submissions).where(eq(submissions.id, id));
  },

  async isUsernameAvailable(username) {
    // Case-insensitive existence check. Mirrors the unique index on
    // lower(username), so a "true" here means the subsequent insert won't
    // collide (modulo a race we accept — concurrent claims would surface
    // as a Postgres unique-violation error and bubble up as a 409 from
    // the submit route).
    const [hit] = await dbClient
      .select({ id: submissions.id })
      .from(submissions)
      .where(sql`lower(${submissions.username}) = ${username.toLowerCase()}`)
      .limit(1);
    return !hit;
  },

  // ── Token locking ──

  async lockTokens(tokens) {
    if (tokens.length === 0) return;
    await dbClient.insert(usedTokens).values(
      tokens.map((t) => ({
        tokenId: t.tokenId,
        contractAddress: t.contractAddress.toLowerCase(),
        submissionId: t.submissionId,
        walletAddress: t.walletAddress.toLowerCase(),
        lockedAt: new Date(t.lockedAt),
      })),
    );
  },

  async getUsedTokenIds() {
    const rows = await dbClient.select().from(usedTokens);
    return rows.map((r) => ({
      tokenId: r.tokenId,
      contractAddress: r.contractAddress,
      submissionId: r.submissionId,
      walletAddress: r.walletAddress,
      lockedAt: r.lockedAt.getTime(),
    }));
  },

  async filterUsedTokens(contractAddress, tokenIds) {
    if (tokenIds.length === 0) return [];
    const rows = await dbClient
      .select({ tokenId: usedTokens.tokenId })
      .from(usedTokens)
      .where(
        and(
          eq(usedTokens.contractAddress, contractAddress.toLowerCase()),
          inArray(usedTokens.tokenId, tokenIds),
        ),
      );
    return rows.map((r) => r.tokenId);
  },

  async unlockTokensForSubmission(submissionId) {
    await dbClient
      .delete(usedTokens)
      .where(eq(usedTokens.submissionId, submissionId));
  },

  // ── Tournament results & scores ──

  async saveResults(results: RealResults) {
    await dbClient
      .insert(tournamentResults)
      .values({ id: 1, results, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: tournamentResults.id,
        set: { results, updatedAt: new Date() },
      });
  },

  async getResults() {
    const [row] = await dbClient
      .select()
      .from(tournamentResults)
      .where(eq(tournamentResults.id, 1))
      .limit(1);
    return row ? (row.results as RealResults) : null;
  },

  async saveScores(scores: SubmissionScore[]) {
    // Replace-all semantics: the cron recomputes scores from scratch every
    // run, so the simplest correct thing is to wipe the table and re-insert.
    // A partial upsert would leak stale rows for deleted submissions.
    await dbClient.transaction(async (tx) => {
      await tx.delete(submissionScores);
      if (scores.length === 0) return;
      await tx.insert(submissionScores).values(
        scores.map((s) => ({
          submissionId: s.submissionId,
          identifier: s.identifier,
          divisionId: s.divisionId,
          score: s.score,
          tiebreaker: s.tiebreaker,
          champion: s.champion,
          updatedAt: new Date(s.updatedAt),
        })),
      );
    });
  },

  async getScores() {
    // Tie-breaking order:
    //   1. total DESC
    //   2. tiebreaker ASC (smaller = closer to actual final score)
    //   3. Postgres ASC puts NULL last by default, which is what we want
    //      (a scored tiebreaker beats an absent one).
    const rows = await dbClient
      .select()
      .from(submissionScores)
      .orderBy(
        desc(sql`(${submissionScores.score}->>'total')::int`),
        sql`${submissionScores.tiebreaker} ASC NULLS LAST`,
      );

    return rows.map((r) => ({
      submissionId: r.submissionId,
      identifier: r.identifier,
      divisionId: r.divisionId as DivisionId,
      score: r.score,
      tiebreaker: r.tiebreaker,
      champion: r.champion ?? undefined,
      updatedAt: r.updatedAt.getTime(),
    }));
  },
};
