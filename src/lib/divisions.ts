// ─── Division configuration ──────────────────────────────────────────────────
// Thresholds, display names, colors, and prize placeholders for each tier.
// Ordered from highest to lowest so we can iterate and find the first match.

export interface Division {
  id: DivisionId;
  name: string;
  /** Minimum number of *unused* NFTs required to enter this division */
  minNFTs: number;
  /** Tailwind gradient / color classes for badges */
  color: string;
  /** Background gradient for cards */
  bgGradient: string;
  /** Icon/emoji */
  icon: string;
  /** Prize description — TBD, will be filled before launch */
  prize: string;
}

export type DivisionId = 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'open';

// Ordered highest → lowest so getDivision() returns the best eligible tier
export const DIVISIONS: Division[] = [
  {
    id: 'diamond',
    name: 'Diamond',
    minNFTs: 10,
    color: 'from-purple-400 to-indigo-400',
    bgGradient: 'from-purple-500/20 to-indigo-500/20',
    icon: '💎',
    prize: 'TBD',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    minNFTs: 7,
    color: 'from-cyan-300 to-blue-300',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    icon: '🏅',
    prize: 'TBD',
  },
  {
    id: 'gold',
    name: 'Gold',
    minNFTs: 5,
    color: 'from-yellow-400 to-amber-400',
    bgGradient: 'from-yellow-500/20 to-amber-500/20',
    icon: '🥇',
    prize: 'TBD',
  },
  {
    id: 'silver',
    name: 'Silver',
    minNFTs: 3,
    color: 'from-gray-300 to-gray-400',
    bgGradient: 'from-gray-400/20 to-gray-500/20',
    icon: '🥈',
    prize: 'TBD',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    minNFTs: 1,
    color: 'from-orange-400 to-amber-600',
    bgGradient: 'from-orange-500/20 to-amber-600/20',
    icon: '🥉',
    prize: 'TBD',
  },
  {
    id: 'open',
    name: 'Open',
    minNFTs: 0,
    color: 'from-white/60 to-white/40',
    bgGradient: 'from-white/5 to-white/10',
    icon: '🌍',
    prize: 'TBD',
  },
];

/**
 * Determine the highest eligible division for a given number of eligible NFTs.
 * Returns 'open' if eligibleCount is 0 or negative.
 */
export function getDivisionForCount(eligibleCount: number): Division {
  for (const div of DIVISIONS) {
    if (eligibleCount >= div.minNFTs) return div;
  }
  // Fallback — should never reach here since open requires 0
  return DIVISIONS[DIVISIONS.length - 1];
}

/**
 * Get a division by its ID.
 */
export function getDivisionById(id: DivisionId): Division {
  return DIVISIONS.find((d) => d.id === id) ?? DIVISIONS[DIVISIONS.length - 1];
}

// ─── Tournament lock ─────────────────────────────────────────────────────────
// After this date, no new submissions or division upgrades are allowed.
// Set to the first match of the 2026 World Cup: June 11, 2026 at noon EDT.
export const TOURNAMENT_LOCK_DATE = new Date('2026-06-11T16:00:00Z');

export function isTournamentLocked(): boolean {
  return new Date() >= TOURNAMENT_LOCK_DATE;
}
