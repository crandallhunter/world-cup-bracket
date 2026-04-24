# Meebits Futbol — 2026 FIFA World Cup Bracket Challenge

A full-stack bracket-prediction app for the 2026 FIFA World Cup. Users
pick group standings, third-place qualifiers, and the full knockout
bracket, then compete for prizes within division tiers gated by NFT
holdings.

- **Production:** https://meebits-futbol.vercel.app
- **Architecture + setup:** see [`DEVELOPER_README.txt`](./DEVELOPER_README.txt)
- **Pre-launch checklist:** see [`PRE_LAUNCH_CHECKLIST.txt`](./PRE_LAUNCH_CHECKLIST.txt)
- **Contributor rules:** see [`AGENTS.md`](./AGENTS.md)

## Quick start

```bash
nvm use 20                            # Node 20.x required (Turbopack breaks on 25)
cp .env.example .env.local            # Fill in DATABASE_URL and friends
npm install
npm run db:migrate                    # Apply Drizzle migrations to your dev DB
npm run dev                           # http://localhost:3000
```

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind 4 + Framer Motion
- Drizzle ORM + postgres-js against PostgreSQL (Supabase for dev, AWS RDS / Aurora for prod)
- Wagmi 2 + viem 2 + RainbowKit for wallet connection
- Delegate.xyz v2 for cold-wallet NFT verification via hot-wallet sign-in
- Polymarket Gamma API for live odds
- API-Football for match results (daily score-update cron as AWS Lambda)

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Regenerate SQL migration from `src/lib/db/schema.ts` |
| `npm run db:migrate` | Apply outstanding migrations |
| `npm run db:studio` | Open Drizzle Studio (web UI over the DB) |
