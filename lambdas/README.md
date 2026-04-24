# AWS Lambdas

This folder holds **production** serverless entry points. They are deployed
separately from the Next.js application and are not bundled with it.

## Why separate

Per AGENTS.md § 7, long-running / background work runs as AWS Lambdas
invoked by EventBridge schedules or message queues. Keeping the Lambda
entry points outside `src/app/` makes the production path explicit and
prevents accidental deployment via `next build`.

## Current handlers

### `update-scores/index.ts`

Daily bracket score refresh.

- **Handler:** `lambdas/update-scores/index.ts` → `handler`
- **Schedule:** EventBridge rule `cron(0 15 * * ? *)` (daily 15:00 UTC)
- **Runtime:** Node.js 20.x, 512 MB, 60 s timeout
- **Env vars:** `DATABASE_URL`, `APISPORTS_KEY`
- **Business logic:** re-uses `src/lib/cron/updateScores.ts` (shared with
  the local testing route at `/api/cron/update-scores`)

## Deployment

The repo does not prescribe an IaC framework. Any of SAM, CDK, Serverless
Framework, or `aws lambda update-function-code` will work. The handler is
a plain async function so bundling with esbuild / `@vercel/ncc` is
straightforward:

```bash
# example with esbuild — adjust paths for your infra stack
npx esbuild lambdas/update-scores/index.ts \
  --bundle --platform=node --target=node20 \
  --outfile=dist/update-scores/index.js --external:pg-native
cd dist/update-scores && zip -r ../update-scores.zip .
```

## Local testing

Use the Next.js API route at `/api/cron/update-scores` — same business
logic, runs in-process against your dev DB. `vercel.json` keeps a cron
entry for Vercel-preview deploys that share builds with the team, but
**that path is non-production.**
