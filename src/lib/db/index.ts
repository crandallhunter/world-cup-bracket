// ─── Data store entry point ──────────────────────────────────────────────────
// Import the active data store implementation here.
// To swap backends, just change this import to point at your production store.
//
// Example for production:
//   export { postgresStore as db } from './postgresStore';

export { localStore as db } from './localStore';

// Re-export types for convenience
export type { DataStore, Submission, UsedToken, IdentityType, SubmissionScore } from './types';
