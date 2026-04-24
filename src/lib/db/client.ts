// ─── Postgres client singleton ───────────────────────────────────────────────
// Held once per Node process. In Next.js dev mode the module is evaluated
// fresh on HMR, but the underlying `postgres` pool reconnects lazily so this
// is fine. In prod (Amplify / ECS) the process is long-lived and the pool
// reuses connections across requests — no connection storm on RDS.
//
// Connection string resolution (first non-empty wins):
//   1. DATABASE_URL              — canonical; what we use for AWS RDS / Aurora
//   2. POSTGRES_URL              — auto-provisioned by the Supabase ↔ Vercel
//                                  integration (pooled via Supavisor, port 6543)
//
// `postgres` (the npm package, v3) is the Drizzle-recommended client for
// Node runtimes. We use a modest pool size since most queries are fast and
// per-request concurrency is low.

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

type PgClient = ReturnType<typeof postgres>;

// Cache the client across HMR reloads in dev so we don't leak connections.
// In prod this is just a module-level singleton held by the long-lived process.
const globalForDb = globalThis as unknown as {
  __wcbPgClient?: PgClient;
  __wcbDrizzle?: ReturnType<typeof drizzle<typeof schema>>;
};

function resolveConnectionString(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      '[db] No Postgres connection string found. Set DATABASE_URL (or POSTGRES_URL ' +
        'if the Supabase ↔ Vercel integration provides it) in .env.local for dev ' +
        'and in the AWS environment for prod.',
    );
  }
  return url;
}

function createClient(): PgClient {
  return postgres(resolveConnectionString(), {
    // Keep the pool small — the app's steady-state query volume is tiny.
    max: 10,
    // Don't buffer queries indefinitely if the pool is exhausted.
    idle_timeout: 20,
  });
}

/**
 * Lazy proxy: we resolve the connection string and instantiate the pool
 * on first property access, not at module load. This means importing the
 * module during Next.js's "collect page data" build phase — which happens
 * even for unreachable routes — doesn't blow up the build when env vars
 * aren't present at build time.
 */
function getPgClient(): PgClient {
  if (!globalForDb.__wcbPgClient) {
    globalForDb.__wcbPgClient = createClient();
  }
  return globalForDb.__wcbPgClient;
}

function getDrizzle() {
  if (!globalForDb.__wcbDrizzle) {
    globalForDb.__wcbDrizzle = drizzle(getPgClient(), { schema });
  }
  return globalForDb.__wcbDrizzle;
}

// Proxy the Drizzle instance so initialization is deferred until first access.
// Every existing call site — `dbClient.insert(...)`, `dbClient.select(...)`,
// `dbClient.transaction(...)` — works exactly as before.
export const dbClient = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get: (_t, prop) => Reflect.get(getDrizzle(), prop),
  apply: (_t, thisArg, args) => Reflect.apply(getDrizzle() as never, thisArg, args),
});
