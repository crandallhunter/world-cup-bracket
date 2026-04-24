// ─── drizzle-kit configuration ───────────────────────────────────────────────
// Used by `npm run db:generate` (produce a SQL migration from schema changes)
// and `npm run db:migrate` (apply outstanding migrations to the database).
//
// Migrations go in ./drizzle and are committed to git. The schema source of
// truth is src/lib/db/schema.ts.
//
// Connection string resolution for migrations (first non-empty wins):
//   1. DATABASE_URL_MIGRATION    — explicit override (unusual)
//   2. POSTGRES_URL_NON_POOLING  — auto-provisioned by the Supabase ↔ Vercel
//                                  integration; DIRECT connection (port 5432)
//                                  which is what drizzle-kit needs for
//                                  transactional migration runs.
//   3. DATABASE_URL              — fallback; works when the DB is reachable
//                                  directly (e.g. AWS RDS from a VPC).
//   4. POSTGRES_URL              — pooled; works but is slower / has pgbouncer
//                                  quirks. Last resort.
//
// drizzle-kit is a standalone CLI — it does NOT auto-load Next.js env files.
// We load .env.local explicitly here so `npm run db:*` commands Just Work.

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import type { Config } from 'drizzle-kit';

loadEnv({ path: '.env.local' });

const connectionString =
  process.env.DATABASE_URL_MIGRATION ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    '[drizzle.config] No Postgres connection string found. Populate .env.local ' +
      'with DATABASE_URL (or run `vercel env pull .env.local` to inherit the ' +
      'POSTGRES_URL_NON_POOLING provisioned by the Supabase ↔ Vercel integration).',
  );
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: connectionString },
  strict: true,
  verbose: true,
} satisfies Config;
