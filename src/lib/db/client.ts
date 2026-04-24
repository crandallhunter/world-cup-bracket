// ─── Postgres client singleton ───────────────────────────────────────────────
// Held once per Node process. In Next.js dev mode the module is evaluated
// fresh on HMR, but the underlying `postgres` pool reconnects lazily so this
// is fine. In prod (Amplify / ECS) the process is long-lived and the pool
// reuses connections across requests — no connection storm on RDS.
//
// `postgres` (the npm package, v3) is the Drizzle-recommended client for
// Node runtimes. We use a modest pool size since most queries are fast and
// per-request concurrency is low.

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    '[db] DATABASE_URL is not set. Populate it in .env.local (dev) or the AWS environment (prod).',
  );
}

// Cache the client across HMR reloads in dev so we don't leak connections.
// In prod this is just a plain module-level singleton.
const globalForDb = globalThis as unknown as { __wcbPgClient?: ReturnType<typeof postgres> };

const client =
  globalForDb.__wcbPgClient ??
  postgres(connectionString, {
    // Keep the pool small — the app's steady-state query volume is tiny.
    max: 10,
    // Don't buffer queries indefinitely if the pool is exhausted.
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__wcbPgClient = client;
}

export const pgClient = client;
export const dbClient = drizzle(client, { schema });
export type DbClient = typeof dbClient;
