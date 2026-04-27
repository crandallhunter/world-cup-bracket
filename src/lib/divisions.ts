// ─── Division configuration ──────────────────────────────────────────────────
// Thresholds, display names, colors, and prize placeholders for each tier.
//
// Gating rules (2026 season):
//   Gold   — hold 1+ Meebit (original collection)
//   Silver — hold 3+ Meebits Futbol NFTs
//   Bronze — hold 1+ Meebits Futbol NFT
//   Free   — everyone else (email-only or no holdings)
//
// Gold overrides Futbol count: a user with 1 Meebit AND 0 Futbol is Gold,
// and a user with 1 Meebit AND 5 Futbol is also Gold. The eligibility
// resolver below enforces this priority.

export type DivisionId = 'gold' | 'silver' | 'bronze' | 'open';

/** Describes the NFT holdings required to reach a given division. */
export type DivisionRequirement =
  | { type: 'none' }
  | { type: 'futbol'; min: number }
  | { type: 'meebit'; min: number };

export interface Division {
  id: DivisionId;
  name: string;
  /** What a user must hold to enter this division. */
  requirement: DivisionRequirement;
  /** Tailwind gradient / color classes for badges */
  color: string;
  /** Background gradient for cards */
  bgGradient: string;
  /** Icon/emoji */
  icon: string;
  /** Prize description displayed on /divisions and in the welcome modal. */
  prize: string;
}

/** All divisions ordered highest → lowest so getDivisionForHoldings() returns the best eligible tier. */
export const DIVISIONS: Division[] = [
  {
    id: 'gold',
    name: 'Gold',
    requirement: { type: 'meebit', min: 1 },
    color: 'from-yellow-400 to-amber-400',
    bgGradient: 'from-yellow-500/20 to-amber-500/20',
    icon: '🥇',
    prize: 'Pig Meebit #8506',
  },
  {
    id: 'silver',
    name: 'Silver',
    requirement: { type: 'futbol', min: 3 },
    color: 'from-gray-300 to-gray-400',
    bgGradient: 'from-gray-400/20 to-gray-500/20',
    icon: '🥈',
    prize: 'Meebit #10630',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    requirement: { type: 'futbol', min: 1 },
    color: 'from-orange-400 to-amber-600',
    bgGradient: 'from-orange-500/20 to-amber-600/20',
    icon: '🥉',
    prize: '$500 value prize',
  },
  {
    id: 'open',
    name: 'Free',
    requirement: { type: 'none' },
    color: 'from-white/60 to-white/40',
    bgGradient: 'from-white/5 to-white/10',
    icon: '🌍',
    prize: '3 pack of physical Meebit jerseys',
  },
];

/** NFT holdings counted across direct ownership + delegate.xyz delegations. */
export interface NFTHoldings {
  /** Meebits Futbol NFTs. */
  futbolCount: number;
  /** Meebits (original collection) NFTs. */
  meebitCount: number;
}

/**
 * Determine the highest eligible division for a user's NFT holdings.
 * Gold (Meebit-gated) is checked first because it overrides Futbol counts.
 */
export function getDivisionForHoldings(holdings: NFTHoldings): Division {
  for (const div of DIVISIONS) {
    if (matchesRequirement(div.requirement, holdings)) return div;
  }
  return DIVISIONS[DIVISIONS.length - 1];
}

function matchesRequirement(req: DivisionRequirement, h: NFTHoldings): boolean {
  switch (req.type) {
    case 'none':
      return true;
    case 'futbol':
      return h.futbolCount >= req.min;
    case 'meebit':
      return h.meebitCount >= req.min;
  }
}

/**
 * Human-readable copy describing the requirement for a division.
 * Used on the /divisions page and in the welcome modal.
 */
export function requirementText(req: DivisionRequirement): string {
  switch (req.type) {
    case 'none':
      return 'Open to everyone — no NFT required';
    case 'futbol':
      return `Requires ${req.min}+ Meebits Futbol NFT${req.min > 1 ? 's' : ''}`;
    case 'meebit':
      return `Requires ${req.min}+ Meebit${req.min > 1 ? 's' : ''}`;
  }
}

/** Short label for compact UI (e.g. "3+ Futbol", "1+ Meebit", "Free"). */
export function requirementShortLabel(req: DivisionRequirement): string {
  switch (req.type) {
    case 'none':
      return 'Free';
    case 'futbol':
      return `${req.min}+ Futbol`;
    case 'meebit':
      return `${req.min}+ Meebit`;
  }
}

/**
 * Get a division by its ID.
 */
export function getDivisionById(id: DivisionId): Division {
  return DIVISIONS.find((d) => d.id === id) ?? DIVISIONS[DIVISIONS.length - 1];
}

// ─── Tournament lock ─────────────────────────────────────────────────────────

/**
 * After this date, no new submissions or division upgrades are allowed.
 * Set to the first match of the 2026 World Cup: June 11, 2026 at noon EDT.
 */
export const TOURNAMENT_LOCK_DATE = new Date('2026-06-11T16:00:00Z');

/** True once the tournament has started (past TOURNAMENT_LOCK_DATE). */
export function isTournamentLocked(): boolean {
  return new Date() >= TOURNAMENT_LOCK_DATE;
}
