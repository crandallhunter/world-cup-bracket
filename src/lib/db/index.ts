// ─── Data store entry point ──────────────────────────────────────────────────
// The rest of the app imports `db` from here — implementation-agnostic.
// Today this is Drizzle + Postgres (Supabase for dev, AWS RDS for prod).

export { drizzleStore as db } from './drizzleStore';

// Re-export types for convenience
export type { DataStore, Submission, UsedToken, IdentityType, SubmissionScore } from './types';
