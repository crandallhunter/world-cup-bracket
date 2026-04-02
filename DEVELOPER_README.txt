================================================================================
  MEEBITS FUTBOL — 2026 FIFA WORLD CUP BRACKET CHALLENGE
  Developer Handover Document
  Last updated: April 2, 2026
================================================================================

1. PROJECT OVERVIEW
================================================================================

A full-stack bracket builder for the 2026 FIFA World Cup. Users predict group
standings, pick 3rd-place qualifiers, build a knockout bracket, and crown a
champion. Live odds from Polymarket prediction markets are displayed throughout.
A separate Schedule page shows all 104 tournament matches with dates, times,
stadiums, and integration with the user's bracket picks.

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
  - Zustand 5 (single store: src/store/bracketStore.ts)
  - TanStack React Query 5 (configured but lightly used)

Web3
  - Wagmi 2 + viem 2 (contract reads, wallet connection)
  - RainbowKit 2 (wallet UI modal)
  - NFT token gating via ERC-20 balanceOf()

External APIs
  - Polymarket Gamma API (event ID 30615) — live World Cup winner odds
  - 5-minute server-side cache, 5-minute client-side polling
  - Hardcoded fallback odds if API is unreachable


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
  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS       ERC-20 contract for token gating
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
│   ├── schedule/page.tsx           Match schedule (104 games)
│   ├── my-brackets/page.tsx        Submitted brackets list
│   ├── my-brackets/[id]/page.tsx   Single bracket detail view
│   └── api/odds/route.ts           Polymarket odds API proxy
│
├── components/
│   ├── bracket/                    Knockout bracket components
│   │   ├── BracketView.tsx         Horizontal scrolling bracket UI
│   │   ├── BracketMatch.tsx        Single match card (clickable teams)
│   │   └── ThirdPlaceSelector.tsx  Pick 8 of 12 3rd-place teams
│   │
│   ├── groups/                     Group stage components
│   │   ├── GroupStage.tsx          12-group overview + navigation
│   │   ├── GroupCard.tsx           Single group with drag-reorder
│   │   └── TeamRow.tsx             Individual team in a group
│   │
│   ├── odds/                       Polymarket odds display
│   │   ├── TopContenders.tsx       Top 3 favorites (hero cards)
│   │   ├── GroupOddsGrid.tsx       12-group odds grid (A–L)
│   │   └── OddsBadge.tsx          Inline "<1% WC" badge
│   │
│   ├── schedule/                   Match schedule components
│   │   ├── ScheduleView.tsx        Stage tabs + group sub-tabs
│   │   └── MatchCard.tsx           Single match fixture card
│   │
│   ├── submission/                 Bracket submission flow
│   │   ├── SubmitModal.tsx         Success modal + share card
│   │   └── ShareCard.tsx           Shareable bracket summary
│   │
│   ├── wallet/                     Web3 / NFT gating
│   │   ├── NFTGate.tsx             Token gate wrapper
│   │   ├── WalletButton.tsx        RainbowKit connect button
│   │   └── BracketSlotCounter.tsx  Remaining submission slots
│   │
│   ├── layout/
│   │   └── Header.tsx              Sticky nav bar
│   │
│   └── ui/                         Reusable UI primitives
│       ├── Button.tsx              Variants: primary/secondary/ghost/danger
│       ├── Modal.tsx               Backdrop overlay modal
│       ├── Card.tsx                Container card
│       ├── Badge.tsx               Colored pill badge
│       ├── Spinner.tsx             Loading spinner
│       └── StageIntroModal.tsx     Onboarding modal per bracket stage
│
├── context/
│   ├── OddsContext.tsx             Polls /api/odds every 5 min
│   └── Providers.tsx               React Query + OddsProvider wrapper
│
├── store/
│   └── bracketStore.ts             Zustand store (all bracket state)
│
├── hooks/
│   └── useOdds.ts                  OddsContext consumer hook
│
├── types/
│   ├── tournament.ts               Team, GroupStanding, KnockoutMatch, etc.
│   ├── polymarket.ts               GammaMarket, TeamOdds, OddsMap
│   └── web3.ts                     NFTGateState
│
├── lib/
│   ├── tournament/
│   │   ├── teams.ts                48 teams, 12 groups, getFlagEmoji()
│   │   ├── r32Seeding.ts           R32 bracket structure + propagation
│   │   ├── groups.ts               Group standing helpers
│   │   └── thirdPlace.ts           3rd-place eligibility logic
│   │
│   ├── polymarket/
│   │   ├── client.ts               fetchWorldCupOdds() client call
│   │   ├── mapOdds.ts              Polymarket name -> team ID map
│   │   └── fallbackOdds.ts         Static odds snapshot (Mar 31, 2026)
│   │
│   ├── web3/
│   │   ├── wagmiConfig.ts          Wagmi chains + transports
│   │   ├── nftContract.ts          NFT contract address + ABI
│   │   └── hooks/useNFTBalance.ts  Read NFT balance from chain
│   │
│   ├── storage/
│   │   └── brackets.ts             LocalStorage CRUD for submissions
│   │
│   └── utils/
│       └── cn.ts                   clsx + tailwind-merge helper
│
└── data/
    └── schedule.ts                 All 104 matches (static JSON)


5. APPLICATION FLOW
================================================================================

HOMEPAGE (/)
  Hero section -> How It Works (4 steps) -> "What Are The Odds?" section
  - TopContenders: top 3 teams by Polymarket win probability
  - GroupOddsGrid: 12 group cards with per-team probability bars

BRACKET BUILDER (/bracket)
  Three-step flow with animated transitions:

  Step 1: GROUP STAGE
    - 12 groups displayed as cards (A through L)
    - Each group has 4 teams in drag-reorderable list
    - User ranks teams 1st through 4th
    - "Confirm Group X" locks in each group
    - OddsBadge shows next to each team

  Step 2: THIRD-PLACE SELECTION
    - Shows all 12 third-place finishers (from user's group rankings)
    - User selects exactly 8 teams that will advance
    - Determines which 3rd-place slots fill in the R32 bracket

  Step 3: KNOCKOUT BRACKET
    - Horizontal scrolling bracket (R32 -> R16 -> QF -> SF -> Final)
    - Click a team to advance them to the next round
    - Auto-scroll to next round when current round is completed
    - Completed rounds dim to 45% opacity
    - Champion modal collects final score prediction (tiebreaker)
    - Submit -> success modal with share card

SCHEDULE (/schedule)
  - Stage tabs: Group Stage / R32 / R16 / QF / SF / 3rd Place / Final
  - Group Stage has A–L sub-tabs to filter by group
  - Each match card shows: date, time (ET), teams, stadium, city
  - User's bracket picks are shown as position badges (group stage)
    and "Your pick" indicators (R32)

MY BRACKETS (/my-brackets)
  - Lists all submitted brackets from LocalStorage
  - Click to view bracket detail


6. KEY ARCHITECTURE DECISIONS
================================================================================

BRACKET STORE (bracketStore.ts)
  Single Zustand store manages all bracket state:
  - groupStandings: Record<GroupLabel, GroupStanding>
  - selectedThirdPlace: ThirdPlaceTeam[]
  - knockoutBracket: KnockoutMatch[]
  - finalScore: FinalScore | null
  - currentStep: 'GROUPS' | 'THIRD_PLACE' | 'KNOCKOUT' | 'SUBMITTED'

  Key methods:
  - setGroupRanking()       Update team order in a group
  - markGroupComplete()     Lock a group's rankings
  - setSelectedThirdPlace() Set the 8 advancing 3rd-place teams
  - rebuildKnockoutBracket() Generate R32 bracket from group results
  - setKnockoutPick()       Pick a match winner (propagates forward)
  - submitBracket()         Save to LocalStorage

R32 SEEDING (r32Seeding.ts)
  The Round of 32 has 16 matches:
  - 8 FIXED matches (group winners/runners-up vs specific opponents)
  - 8 VARIABLE matches (3rd-place teams assigned by eligibility)

  Each variable slot has an eligibility map defining which groups'
  3rd-place finishers can fill it. A greedy algorithm assigns teams
  to the first eligible slot, with a fallback pass for any remaining.

  Winner propagation: setKnockoutPick() -> propagateWinner() updates
  all downstream matches. If a team is deselected, all downstream
  picks involving that team are cleared.

ODDS INTEGRATION
  Server route (/api/odds) fetches from Polymarket Gamma API:
    https://gamma-api.polymarket.com/events/30615
  Parses "Will [Country] win the 2026 FIFA World Cup?" markets.
  Maps country names to team IDs via POLYMARKET_NAME_MAP.
  Falls back to FALLBACK_ODDS if API returns error.

  Client polls every 5 minutes via OddsContext.
  OddsBadge shows "<1%" for teams with very small or no odds data.

NFT TOKEN GATING
  NFTGate component wraps the submit button:
  - Reads balanceOf() from the ERC-20 contract on Ethereum mainnet
  - If balance > 0, shows bracket builder
  - If balance == 0, shows "connect wallet" / "no NFT" gate
  - Dev bypass: skips gate when NODE_ENV === 'development'

SCHEDULE DATA (data/schedule.ts)
  Static array of all 104 matches. Group stage matches include
  homeId/awayId (team IDs) for flag display. Knockout matches use
  seeding labels like "Group A Runner-Up" or "Winner M73".
  R32 matches include bracketMatchId for linking to the bracket store.

PERSISTENCE
  All bracket submissions are stored in browser LocalStorage:
  - Key: `wcb_submissions_${anonId}`
  - Anonymous ID generated via crypto.randomUUID()
  - No server-side persistence currently


7. THINGS TO KNOW / GOTCHAS
================================================================================

NODE VERSION
  Must use Node 20. Turbopack (Next.js 16's default bundler) crashes
  on Node 25 when spawning CSS worker processes. Use nvm:
    nvm use 20

NEXT.JS 16 DIFFERENCES
  This uses Next.js 16 which has breaking changes from 15:
  - Turbopack is the default bundler (no --no-turbopack flag)
  - Check node_modules/next/dist/docs/ for current API docs
  - Some APIs may differ from what you find in older tutorials

FLAG EMOJIS
  Flags use Unicode regional indicator symbols via getFlagEmoji().
  Special cases: England (gb-eng) and Scotland (gb-sct) use explicit
  emoji strings since they're not standard 2-letter ISO codes.
  Note: Windows Chrome does NOT render country flag emojis natively
  (shows letter pairs instead). This is a browser limitation, not a bug.

POLYMARKET EVENT ID
  The Gamma API event ID is 30615. If Polymarket restructures their
  events, this ID would need updating in src/app/api/odds/route.ts.

WEB3 CONTRACT
  The NFT contract address in .env.local is a placeholder/test address.
  Verify and update before production launch:
    NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...

BRACKET STRUCTURE vs FIFA BRACKET
  Our R32 bracket seeding matches FIFA's official structure. However,
  the R16+ bracket pairing in our app uses sequential position pairing
  (positions 1+2, 3+4, etc.) which may differ from FIFA's actual R16
  bracket draw. This should be verified and potentially updated to
  match the official FIFA knockout bracket structure.

STALE .next CACHE
  If you see weird build errors after switching branches or Node
  versions, clear the cache: rm -rf .next


8. DEPLOYMENT
================================================================================

The app deploys to Vercel:
  - Push to main -> auto-deploys via Vercel Git integration
  - Or manually: `npx vercel --prod`
  - Environment variables must be set in Vercel dashboard

Production alias: https://meebits-futbol.vercel.app
  After each deploy, re-alias:
    npx vercel alias set <deploy-url> meebits-futbol.vercel.app


9. REMAINING WORK / KNOWN ISSUES
================================================================================

PRIORITY
  [ ] Verify NFT contract address for production
  [ ] Verify R16+ bracket pairing matches official FIFA bracket structure
  [ ] Add server-side persistence (database) for bracket submissions
  [ ] Set up custom domain (currently using meebits-futbol.vercel.app)

NICE TO HAVE
  [ ] Add unit tests for tournament logic (r32Seeding, thirdPlace)
  [ ] Add error boundary around bracket view
  [ ] Implement share card image generation (OG image for social)
  [ ] Add leaderboard page (compare submitted brackets)
  [ ] Live scores integration once tournament starts (June 11)
  [ ] Responsive polish on mobile for horizontal bracket scroll
  [ ] SEO meta tags on all pages
  [ ] Rate limiting on /api/odds endpoint


10. FILE-BY-FILE REFERENCE (Key Files)
================================================================================

TYPES (src/types/tournament.ts)
  Team              { id, name, flagCode, group, isPlayoffWinner?, placeholderLabel? }
  GroupLabel         'A' | 'B' | ... | 'L'
  GroupStanding      { group, rankings: [Team x4], isComplete }
  KnockoutMatch      { matchId, round, position, homeTeam?, awayTeam?, winner? }
  BracketStep        'GROUPS' | 'THIRD_PLACE' | 'KNOCKOUT' | 'SUBMITTED'
  BracketSubmission  Full bracket state snapshot for localStorage
  FinalScore         { home: number, away: number }

TEAMS (src/lib/tournament/teams.ts)
  ALL_TEAMS          Array of all 48 Team objects
  GROUPS             Record<GroupLabel, Team[]> (4 teams per group)
  GROUP_LABELS       ['A', 'B', ..., 'L']
  getTeamById(id)    Lookup by team ID (e.g., 'ARG', 'BRA')
  getFlagEmoji(code) Convert flag code to emoji (e.g., 'mx' -> flag)

SCHEDULE (src/data/schedule.ts)
  SCHEDULE           Array of 104 ScheduleMatch objects
  ScheduleMatch      { matchNum, round, group?, dateISO, timeEST,
                       homeId?, awayId?, homeLabel, awayLabel,
                       stadium, city, country, bracketMatchId? }

================================================================================
  End of Developer Handover Document
================================================================================
