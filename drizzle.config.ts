// ─── drizzle-kit configuration ───────────────────────────────────────────────
// Used by `npm run db:generate` (produce a SQL migration from schema changes)
// and `npm run db:migrate` (apply outstanding migrations to the database).
//
// Migrations go in ./drizzle and are committed to git. The schema source of
// truth is src/lib/db/schema.ts.
//
// drizzle-kit is a standalone CLI — it does NOT auto-load Next.js env files.
// We load .env.local explicitly here so `npm run db:*` commands Just Work.

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import type { Config } from 'drizzle-kit';

loadEnv({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    '[drizzle.config] DATABASE_URL is not set. ' +
      'Populate it in .env.local (see .env.example) before running drizzle-kit.',
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
