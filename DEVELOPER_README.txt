================================================================================
  MEEBITS FUTBOL — 2026 FIFA WORLD CUP BRACKET CHALLENGE
  Developer Handover Document
  Last updated: April 6, 2026
================================================================================

1. PROJECT OVERVIEW
================================================================================

A full-stack bracket builder for the 2026 FIFA World Cup. Users predict group
standings, pick 3rd-place qualifiers, build a knockout bracket, and crown a
champion. Live odds from Polymarket prediction markets are displayed throughout.

Division-based competition: users are placed into divisions (Diamond through
Open) based on Meebits Futbol NFT holdings. Each division has its own prize
pool. Email-only users compete in the Open division.

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
  - Contract: Meebits Futbol Group 1 (ERC-721A) on Ethereum mainnet
    Address: 0x8fBb231840BeDF8a49080Ac3001B9c97BF35f4E9

External APIs
  - Polymarket Gamma API (event ID 30615) — live World Cup winner odds
  - 5-minute server-side cache, 5-minute client-side polling
  - Hardcoded fallback odds if API is unreachable

Data Layer
  - Pluggable DataStore interface (src/lib/db/types.ts)
  - Local JSON file store for development (src/lib/db/localStore.ts)
  - Data stored at <project-root>/data/store.json


3. GETTING STARTED
================================================================================

Prerequisites:
  - Node.js 20.x (use nvm: `nvm use 20`)
  - npm

Setup:
  1. git clone https://github.com/crandallhunter/world-cup-bracket.git
  2. cd world-cup-bracket
  3. cp .env.example .env.local       # Fill in your keys (see below)
  4. npm install
  5. npm run dev                       # http://localhost:3000

Environment Variables (.env.local):
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID   WalletConnect Cloud project ID
                                         (f92674d8af9f2b951563902a0b08512d)
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS       ERC-721A contract address
                                         (0x8fBb231840BeDF8a49080Ac3001B9c97BF35f4E9)
  NEXT_PUBLIC_ALCHEMY_API_KEY            Alchemy API key for NFT lookups
  NEXT_PUBLIC_APP_URL                    Public URL (for share cards / OG)

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
│   │   ├── alchemy.ts              Alchemy getNFTsForOwner utility
│   │   └── hooks/
│   │       ├── useNFTBalance.ts    Read NFT balance from chain
│   │       └── useUserDivision.ts  Derive division from NFT count
│   │
│   ├── db/
│   │   ├── types.ts                DataStore interface, Submission, UsedToken
│   │   ├── localStore.ts           Local JSON file implementation (dev only)
│   │   └── index.ts                DB entry point (change import to swap backends)
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
  Shows all 6 tiers with participant counts, user's current division

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

R32 SEEDING (r32Seeding.ts)
  The Round of 32 has 16 matches:
  - 8 FIXED matches (group winners/runners-up vs specific opponents)
  - 8 VARIABLE matches (3rd-place teams assigned by eligibility)

  Each variable slot has an eligibility map defining which groups'
  3rd-place finishers can fill it. Greedy assignment with fallback.

  R32->R16 propagation uses FIFA's official non-sequential bracket
  pairings via R32_TO_R16 lookup table. R16->QF->SF->F use sequential.

DIVISION SYSTEM (divisions.ts)
  6 tiers based on NFT holdings:
    Diamond (10+), Platinum (7+), Gold (5+), Silver (3+), Bronze (1+), Open (0)

  Token ID locking prevents double-use: when a wallet submits, its
  specific token IDs are recorded. If those NFTs are transferred to
  a new wallet, they won't count toward that wallet's division.

  Division upgrades are allowed before tournament lock (June 11, 2026).

SUBMISSION API (api/submit/route.ts)
  POST: Validates identity, checks for existing submission, queries
  used tokens, calculates division, saves submission + locks tokens.
  GET: Fetch by ?identifier= (check exists) or ?id= (full submission).

DATA STORE (lib/db/)
  Pluggable DataStore interface. localStore.ts writes to data/store.json.
  Swap for production DB by changing the import in lib/db/index.ts.
  NOTE: Local JSON won't work on Vercel (read-only filesystem).

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

IMPORTANT: The local JSON data store will NOT work on Vercel (serverless
filesystem is read-only). Swap lib/db/index.ts to use a real database
(Vercel Postgres, Supabase, etc.) before deploying.


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
  DivisionId         'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'open'
  Division           { id, name, minNFTs, icon, color, bgGradient, prize }


================================================================================
  End of Developer Handover Document
================================================================================
