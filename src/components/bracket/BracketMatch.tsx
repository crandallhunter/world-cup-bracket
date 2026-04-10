'use client';

import { motion } from 'framer-motion';
import type { KnockoutMatch, Team } from '@/types/tournament';
import { Flag } from '@/components/ui/Flag';
import { OddsBadge } from '@/components/odds/OddsBadge';
import { useBracketStore } from '@/store/bracketStore';
import { cn } from '@/lib/utils/cn';

interface BracketMatchProps {
  match: KnockoutMatch;
  compact?: boolean;
}

// Placeholder used when a bracket slot hasn't been filled yet
const TBD_TEAM: Team = {
  id: '__TBD__',
  name: 'TBD',
  flagCode: 'un',
  group: 'A',
};

function TeamSlot({
  team,
  isWinner,
  isLoser,
  onClick,
  compact,
  isTbd,
}: {
  team: Team;
  isWinner?: boolean;
  isLoser?: boolean;
  onClick?: () => void;
  compact?: boolean;
  isTbd?: boolean;
}) {
  return (
    <motion.button
      whileTap={onClick && !isTbd ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-1.5 transition-colors text-left disabled:cursor-default',
        compact ? 'text-xs' : 'text-sm',
        isTbd && 'opacity-30 cursor-default',
        !isTbd && isWinner && 'bg-white/10 text-white',
        !isTbd && isLoser && 'opacity-25',
        !isTbd && !isWinner && !isLoser && onClick && 'hover:bg-white/5 text-white/60 hover:text-white/90 cursor-pointer',
        !isTbd && !isWinner && !isLoser && !onClick && 'text-white/50',
      )}
    >
      {isTbd ? (
        <span className="text-white/20 text-xs italic w-full">TBD</span>
      ) : (
        <>
          <Flag
            flagCode={team.flagCode}
            alt={team.name}
            size={compact ? 16 : 20}
          />
          <span className="font-medium truncate flex-1 text-xs">
            {team.isPlayoffWinner ? (team.placeholderLabel ?? team.name) : team.name}
          </span>
          {!team.isPlayoffWinner && <OddsBadge teamId={team.id} className="shrink-0" />}
          {isWinner && <span className="text-white/40 text-xs shrink-0">✓</span>}
        </>
      )}
    </motion.button>
  );
}

export function BracketMatch({ match, compact = false }: BracketMatchProps) {
  const { setKnockoutPick } = useBracketStore();

  const homeTeam = match.homeTeam ?? TBD_TEAM;
  const awayTeam = match.awayTeam ?? TBD_TEAM;
  const homeTbd = !match.homeTeam;
  const awayTbd = !match.awayTeam;

  // Can pick any slot that has a real team (not TBD)
  const homeIsWinner = match.winner?.id === homeTeam.id;
  const awayIsWinner = match.winner?.id === awayTeam.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-lg border overflow-hidden',
        compact ? 'min-w-[130px]' : 'min-w-[170px]',
        'border-white/8 bg-surface-2'
      )}
    >
      <TeamSlot
        team={homeTeam}
        isTbd={homeTbd}
        isWinner={homeIsWinner}
        isLoser={Boolean(match.winner && !homeIsWinner)}
        onClick={!homeTbd ? () => setKnockoutPick(match.matchId, homeTeam) : undefined}
        compact={compact}
      />
      <div className="h-px bg-white/6 mx-2" />
      <TeamSlot
        team={awayTeam}
        isTbd={awayTbd}
        isWinner={awayIsWinner}
        isLoser={Boolean(match.winner && !awayIsWinner)}
        onClick={!awayTbd ? () => setKnockoutPick(match.matchId, awayTeam) : undefined}
        compact={compact}
      />
    </motion.div>
  );
}
