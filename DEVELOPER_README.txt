================================================================================
  MEEBITS FUTBOL — 2026 FIFA WORLD CUP BRACKET CHALLENGE
  Developer Handover Document
  Last updated: April 21, 2026
================================================================================

1. PROJECT OVERVIEW
================================================================================

A full-stack bracket builder for the 2026 FIFA World Cup. Users predict group
standings, pick 3rd-place qualifiers, build a knockout bracket, and crown a
champion. Live odds from Polymarket prediction markets are displayed throughout.

Division-based competition: users are placed into divisions (Gold through
Free) based on Meebits Futbol NFT holdings — including NFTs held by vault
wallets that delegated to the user via delegate.xyz. Each division has its
own prize pool. Email-only users compete in the Free division.

Production URL:  https://meebits-futbol.vercel.app
GitHub:          https://github.com/crandallhunter/world-cup-bracket


2. TECH STACK
================================================================================

Runtime & Framework
  - Next.js 16.2.1 (App Router, Turbopack bundler)
  - React 19.2.4
  - TypeScript 5 (strict mode)
  - Node.js 20 (REQUIRED — Turbopack crashes on Node 25)

Styling
  - Tailwind CSS 4 + PostCSS
  - Framer Motion 12 (layout animations, spring transitions)
  - clsx + tailwind-merge (via src/lib/utils/cn.ts)

State Management
  - Zustand 5 (two stores: bracketStore + identityStore)
  - TanStack React Query 5 (wagmi peer dependency)

Web3
  - Wagmi 2 + viem 2 (contract reads, wallet connection)
  - RainbowKit 2 (wallet UI modal, dark theme with gold accent)
  - Alchemy NFT API v3 (getNFTsForOwner for token ID enumeration)
  - Gating contracts (both Ethereum mainnet):
      Meebits Futbol (ERC-721A) — Bronze (1+) and Silver (3+)
        0x8fBb231840BeDF8a49080Ac3001B9c97BF35f4E9
      Meebits (original collection) — Gold (1+)
        0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7
  - Delegate.xyz v2 supported for both contracts independently
    (a vault can delegate one or both to the hot wallet).

External APIs
  - Polymarket Gamma API (event ID 30615) — live World Cup winner odds
  - 5-minute server-side cache, 5-minute client-side polling
  - Hardcoded fallback odds if API is unreachable

Data Layer
  - Pluggable DataStore interface (src/lib/db/types.ts)
  - Drizzle ORM + postgres-js against a PostgreSQL database
  - Dev: Supabase Postgres (database only; no Auth/Storage/Functions)
  - Prod: AWS RDS Postgres or Aurora Postgres
  - Schema: src/lib/db/schema.ts  (source of truth)
  - Migrations: ./drizzle/*.sql (committed; regenerated via drizzle-kit)

Production cron
  - AWS Lambda at lambdas/update-scores/index.ts, triggered by EventBridge
  - Shared business logic at src/lib/cron/updateScores.ts
  - The Next.js route at /api/cron/update-scores is LOCAL / TESTING ONLY


3. GETTING STARTED
================================================================================

Prerequisites:
  - Node.js 20.x (use nvm: `nvm use 20`)
  - npm
  - A Supabase project (PostgreSQL connection string) for development

Setup:
  1. git clone https://github.com/crandallhunter/world-cup-bracket.git
  2. cd world-cup-bracket
  3. cp .env.example .env.local       # Fill in your keys (see below)
  4. npm install
  5. npm run db:migrate                # Apply migrations to your dev DB
  6. npm run dev                       # http://localhost:3000

Provisioning a Supabase dev database:
  1. Sign in at https://supabase.com/dashboard and create a new project.
  2. Project Settings → Database → Connection string → "URI".
     Copy the connection string. It looks like:
       postgres://postgres:<password>@db.<hash>.supabase.co:5432/postgres
  3. Paste into .env.local as DATABASE_URL.
  4. Run `npm run db:migrate` to create the tables.

  Per AGENTS.md, Supabase is for DB only. Do NOT use Supabase Auth,
  Storage, or Functions. The schema is designed to migrate cleanly
  from Supabase Postgres to AWS RDS / Aurora Postgres for production.

Database commands:
  npm run db:generate  Regenerate the SQL migration from schema.ts
  npm run db:migrate   Apply outstanding migrations
  npm run db:push      Push schema directly (dev only — bypasses migrations)
  npm run db:studio    Open Drizzle Studio (web UI over your DB)

Environment Variables (.env.local):
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID   WalletConnect Cloud project ID
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS       Meebits Futbol contract
                                         (0x8fBb231840BeDF8a49080Ac3001B9c97BF35f4E9)
  NEXT_PUBLIC_MEEBIT_CONTRACT_ADDRESS    Meebits (original) contract
                                         (0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7)
  NEXT_PUBLIC_ALCHEMY_API_KEY            Alchemy API key for NFT lookups
                                         (see "Alchemy API key" gotcha below)
  NEXT_PUBLIC_APP_URL                    Public URL (for share cards / OG)

  Server-only (not exposed to browser):
  DATABASE_URL                           PostgreSQL connection string
                                         (Supabase for dev; RDS / Aurora for prod)
  APISPORTS_KEY                          API-Football key for the daily score cron
  CRON_SECRET                            Shared secret for the local / testing
                                         Next.js cron route. Production Lambda
                                         uses EventBridge + IAM, not this secret.
  RAPIDAPI_KEY                           Reserved for future use (API-Football
                                         via RapidAPI alternate path)

  All six keys are currently set in the Vercel project's Production environment.
  Run `vercel env pull .env.local --environment=production` to sync locally.

Scripts:
  npm run dev      Start dev server (Turbopack, port 3000)
  npm run build    Production build
  npm run start    Start production server
  npm run lint     ESLint check


4. DIRECTORY STRUCTURE
================================================================================

src/
├── app/                            Next.js 16 App Router pages
│   ├── page.tsx                    Homepage (hero, how-it-works, odds)
│   ├── layout.tsx                  Root layout (providers, header)
│   ├── globals.css                 Global styles + Tailwind import
│   ├── bracket/page.tsx            Bracket builder (3-step flow)
│   ├── divisions/page.tsx          Division overview page
│   ├── leaderboard/page.tsx        Leaderboard view
│   ├── my-brackets/page.tsx        Submitted bracket view
│   ├── my-brackets/[id]/page.tsx   Single bracket detail view
│   └── api/
│       ├── odds/route.ts           Polymarket odds API proxy
│       ├── submit/route.ts         Bracket submission + lookup API
│       ├── leaderboard/route.ts    Leaderboard + scored entries
│       ├── divisions/route.ts      Division participant counts
│       └── cron/update-scores/     Daily scoring job (Vercel Cron)
│
├── components/
│   ├── bracket/                    Knockout bracket components
│   │   ├── BracketView.tsx         Horizontal scrolling bracket UI + champion modal
│   │   ├── BracketMatch.tsx        Single match card (clickable teams)
│   │   └── ThirdPlaceSelector.tsx  Pick 8 of 12 3rd-place teams
│   │
│   ├── groups/                     Group stage components
│   │   ├── GroupStage.tsx          12-group overview + confirm all button
│   │   ├── GroupCard.tsx           Single group with drag-reorder
│   │   └── TeamRow.tsx             Individual team in a group
│   │
│   ├── odds/                       Polymarket odds display
│   │   ├── TopContenders.tsx       Top 3 favorites (hero cards)
│   │   ├── GroupOddsGrid.tsx       12-group odds grid (A-L)
│   │   └── OddsBadge.tsx          Inline "<1% WC" badge
│   │
│   ├── divisions/
│   │   └── DivisionBadge.tsx       Reusable division badge (sm/md/lg)
│   │
│   ├── welcome/
│   │   └── WelcomeModal.tsx        Initial welcome modal (3 paths)
│   │
│   ├── submission/
│   │   ├── SubmitModal.tsx         Success modal with division badge
│   │   └── ShareCard.tsx           Shareable bracket summary
│   │
│   ├── wallet/
│   │   └── WalletButton.tsx        RainbowKit connect button
│   │
│   ├── layout/
│   │   └── Header.tsx              Sticky nav bar with wallet + division
│   │
│   └── ui/                         Reusable UI primitives
│       ├── Button.tsx              Variants: primary/secondary/ghost/danger
│       ├── Modal.tsx               Backdrop overlay modal
│       ├── Spinner.tsx             Loading spinner
│       └── StageIntroModal.tsx     Onboarding modal per bracket stage
│
├── context/
│   ├── OddsContext.tsx             Polls /api/odds every 5 min
│   └── Providers.tsx               Wagmi + RainbowKit + QueryClient + Odds
│
├── store/
│   ├── bracketStore.ts             Zustand store (bracket state)
│   └── identityStore.ts           Zustand store (wallet/email identity)
│
├── hooks/
│   └── useOdds.ts                  Team odds consumer hook
│
├── types/
│   ├── tournament.ts               Team, GroupStanding, KnockoutMatch, etc.
│   └── polymarket.ts               TeamOdds, OddsMap
│
├── lib/
│   ├── tournament/
│   │   ├── teams.ts                48 teams, 12 groups, GROUPS map
│   │   ├── r32Seeding.ts           R32 bracket structure + FIFA R16 pairings
│   │   ├── annexC.ts               FIFA Annexe C 495-row lookup (auto-generated)
│   │   ├── groups.ts               Group standing helpers
│   │   └── thirdPlace.ts           3rd-place eligibility logic
│   │
│   ├── divisions.ts                Division tiers, thresholds, config
│   │
│   ├── polymarket/
│   │   ├── mapOdds.ts              Polymarket name -> team ID map
│   │   └── fallbackOdds.ts         Static odds snapshot
│   │
│   ├── web3/
│   │   ├── wagmiConfig.ts          Wagmi chains + transports (mainnet)
│   │   ├── nftContract.ts          NFT contract address + ABI
│   │   ├── delegateRegistry.ts     Delegate.xyz v2 registry address + ABI
│   │   ├── alchemy.ts              Alchemy getNFTsForOwner utility
│   │   └── hooks/
│   │       ├── useNFTBalance.ts    Read NFT balance from chain
│   │       ├── useDelegatedBalance.ts  Discover delegated vaults + balances
│   │       └── useUserDivision.ts  Derive division from direct + delegated count
│   │
│   ├── db/
│   │   ├── types.ts                DataStore interface, Submission, UsedToken
│   │   ├── schema.ts               Drizzle Postgres schema (source of truth)
│   │   ├── client.ts               postgres-js + Drizzle singleton
│   │   ├── drizzleStore.ts         DataStore impl against Postgres
│   │   └── index.ts                DB entry point (re-exports drizzleStore)
│   │
│   ├── cron/
│   │   └── updateScores.ts         Pure score-refresh logic (runtime-agnostic)
│   │
│   └── utils/
│       └── cn.ts                   clsx + tailwind-merge helper


5. APPLICATION FLOW
================================================================================

WELCOME MODAL (first visit to /bracket)
  Three entry paths:
  1. Connect Wallet — verifies NFT holdings, assigns to division
  2. Play with Email — enters Open division
  3. Just Exploring — browse without submitting

HOMEPAGE (/)
  Hero section -> How It Works (4 steps) -> "What Are The Odds?" section
  - TopContenders: top 3 teams by Polymarket win probability
  - GroupOddsGrid: 12 group cards with per-team probability bars

BRACKET BUILDER (/bracket)
  Three-step flow with animated transitions:

  Step 1: GROUP STAGE
    - 12 groups displayed as drag-reorderable cards
    - User ranks teams 1st through 4th
    - Single "Confirm All Groups & Continue" button
    - OddsBadge shows next to each team

  Step 2: THIRD-PLACE SELECTION
    - Shows all 12 third-place finishers
    - User selects exactly 8 that advance

  Step 3: KNOCKOUT BRACKET
    - Horizontal scrolling bracket (R32 -> R16 -> QF -> SF -> Final)
    - Click a team to advance them
    - Champion modal collects final score prediction
    - Submit calls POST /api/submit

DIVISIONS (/divisions)
  Shows all 4 tiers with participant counts, user's current division

MY BRACKETS (/my-brackets)
  Shows submitted bracket from API, with division badge


6. KEY ARCHITECTURE DECISIONS
================================================================================

BRACKET STORE (bracketStore.ts)
  Zustand store manages all bracket state:
  - groupStandings: Record<GroupLabel, GroupStanding>
  - selectedThirdPlace: ThirdPlaceTeam[]
  - knockoutBracket: KnockoutMatch[]
  - finalScore: FinalScore | null
  - currentStep: 'GROUPS' | 'THIRD_PLACE' | 'KNOCKOUT' | 'SUBMITTED'

  Key methods:
  - setGroupRanking()        Update team order in a group
  - markAllGroupsComplete()  Lock all groups at once
  - setSelectedThirdPlace()  Set the 8 advancing 3rd-place teams
  - rebuildKnockoutBracket() Generate full bracket from group results
  - setKnockoutPick()        Pick a match winner (propagates forward)
  - markSubmitted()          Set step to SUBMITTED
  - resetBracket()           Clear all state for a new bracket

IDENTITY STORE (identityStore.ts)
  Zustand store with localStorage persistence (key: wcb_identity):
  - identity: { type: 'wallet' } | { type: 'email', email: string } | { type: 'explore' }
  - hasSeenWelcome: boolean

R32 SEEDING (r32Seeding.ts + annexC.ts)
  The Round of 32 has 16 matches:
  - 8 FIXED matches (group winners/runners-up vs specific opponents)
  - 8 VARIABLE matches (3rd-place teams assigned by FIFA Annexe C)

  Variable slot assignment uses the official FIFA 2026 Annexe C table
  (495 rows = C(12,8)) encoded in annexC.ts. Given the 8 advancing
  groups, the table deterministically assigns each group's 3rd-placer
  to a specific R32 slot. The table is regenerated from the FIFA
  Regulations PDF via scripts/parse-annex-c.py — do not hand-edit.

  R32->R16 propagation uses FIFA's official non-sequential bracket
  pairings via R32_TO_R16 lookup table. R16->QF->SF->F use sequential.

DIVISION SYSTEM (divisions.ts)
  4 tiers, gated by NFT holdings across two contracts (direct + delegated
  via delegate.xyz):
    Gold    1+ Meebit (original collection, 0x7Bd2…6Bc7)
    Silver  3+ Meebits Futbol
    Bronze  1+ Meebits Futbol
    Free    none — everyone else (email or 0 gating NFTs)

  Gold overrides Futbol counts (a Meebit holder is Gold regardless of
  their Futbol count).

  Token ID locking prevents double-use per contract: the used_tokens
  table records (contract_address, token_id) → submission. If the NFT
  is transferred, the new owner can't re-submit with that same token.
  Locks are scoped per-contract so Meebits Futbol token 123 and Meebits
  token 123 don't collide.

  Division upgrades are allowed before tournament lock (June 11, 2026).

SUBMISSION API (api/submit/route.ts)
  POST: Validates identity, checks for existing submission, queries
  used tokens, calculates division, saves submission + locks tokens.
  GET: Fetch by ?identifier= (check exists) or ?id= (full submission).

DATA STORE (lib/db/)
  Pluggable DataStore interface. Active implementation is drizzleStore.ts
  which runs against PostgreSQL via Drizzle ORM + postgres-js.

  Schema lives in schema.ts and is the source of truth. Migrations are
  auto-generated via `npm run db:generate` and applied with
  `npm run db:migrate`. Migration files go in ./drizzle and are committed.

  Dev: Supabase Postgres (database only — no Auth/Storage/Functions).
  Prod: AWS RDS Postgres or Aurora Postgres.

  The bracket body is stored as JSONB (see SubmissionBracketJson).
  `used_tokens` is its own table with a unique (contract, token_id)
  constraint to prevent the same NFT being used twice.

ODDS INTEGRATION
  Server route (/api/odds) fetches from Polymarket Gamma API:
    https://gamma-api.polymarket.com/events/30615
  Parses "Will [Country] win the 2026 FIFA World Cup?" markets.
  Falls back to FALLBACK_ODDS if API returns error.
  Client polls every 5 minutes via OddsContext.


7. THINGS TO KNOW / GOTCHAS
================================================================================

NODE VERSION
  Must use Node 20. Turbopack crashes on Node 25 when spawning CSS
  worker processes. Use nvm: `nvm use 20`

NEXT.JS 16 DIFFERENCES
  This uses Next.js 16 which has breaking changes from 15:
  - Turbopack is the default bundler
  - Check node_modules/next/dist/docs/ for current API docs

FLAGS
  All country flags render via the <Flag> component at
  src/components/ui/Flag.tsx, which uses SVG images from flagcdn.com
  (free, no API key, ISO 3166-1 alpha-2 codes). This works on every
  browser regardless of OS emoji support (Windows Chrome does NOT
  render country flag emojis natively). The legacy getFlagEmoji()
  helper in teams.ts is kept for ONE purpose only: building the tweet
  text in ShareCard, since Twitter renders flag codepoints via Twemoji.

POLYMARKET EVENT ID
  The Gamma API event ID is 30615. If Polymarket restructures their
  events, this ID would need updating in src/app/api/odds/route.ts.

ALCHEMY API KEY
  Currently exposed client-side via NEXT_PUBLIC_ALCHEMY_API_KEY.
  For production, proxy through an API route to protect the key.

STALE .next CACHE
  If you see weird build errors after switching branches or Node
  versions, clear the cache: rm -rf .next


8. DEPLOYMENT
================================================================================

The app deploys to Vercel:
  - Push to main -> auto-deploys via Vercel Git integration
  - Or manually: `npx vercel --prod`
  - Environment variables must be set in Vercel dashboard

Custom domain:
  meebits-futbol.vercel.app is registered as a Project Domain on the
  `world-cup-bracket` Vercel project. It auto-advances to every new
  production deployment — no manual `vercel alias set` calls required.

Daily cron:
  Production: AWS Lambda at lambdas/update-scores/index.ts, triggered
  by an EventBridge schedule (cron(0 15 * * ? *) — daily 15:00 UTC).
  Both Lambda and the Next.js route below call the same shared logic
  at src/lib/cron/updateScores.ts.

  Local/testing: Next.js route at /api/cron/update-scores still exists,
  protected by CRON_SECRET. vercel.json keeps a schedule for
  Vercel-preview deployments the team shares for review, but that is
  NOT the authoritative production cron.


9. TYPES REFERENCE
================================================================================

TOURNAMENT TYPES (src/types/tournament.ts)
  Team              { id, name, flagCode, group, isPlayoffWinner?, placeholderLabel? }
  GroupLabel         'A' | 'B' | ... | 'L'
  GroupStanding      { group, rankings: [Team x4], isComplete }
  KnockoutMatch      { matchId, round, position, homeTeam?, awayTeam?, winner? }
  BracketStep        'GROUPS' | 'THIRD_PLACE' | 'KNOCKOUT' | 'SUBMITTED'
  FinalScore         { home: number, away: number }

DB TYPES (src/lib/db/types.ts)
  Submission         Full bracket submission with identity + division + token locks
  UsedToken          Token ID locked to a specific submission
  DataStore          Interface for storage backends

DIVISION TYPES (src/lib/divisions.ts)
  DivisionId             'gold' | 'silver' | 'bronze' | 'open'
  Division               { id, name, requirement, icon, color, bgGradient, prize }
  DivisionRequirement    { type: 'none' }
                       | { type: 'futbol'; min: number }
                       | { type: 'meebit'; min: number }
  NFTHoldings            { futbolCount; meebitCount }

  Tier rules (direct + delegated counted for each collection):
    Gold    1+ Meebit (original collection)
    Silver  3+ Meebits Futbol
    Bronze  1+ Meebits Futbol
    Free    0  (id: 'open', name: 'Free' — ID and display name differ)

  Gold overrides Futbol counts — a Meebit holder is Gold regardless of
  how many (or how few) Meebits Futbol NFTs they hold.


================================================================================
  End of Developer Handover Document
================================================================================
