'use client';

import { motion } from 'framer-motion';
import type { Team } from '@/types/tournament';
import { Flag } from '@/components/ui/Flag';
import { OddsBadge } from '@/components/odds/OddsBadge';
import { cn } from '@/lib/utils/cn';

interface TeamRowProps {
  team: Team;
  position: number;
  onClick?: () => void;
  showPosition?: boolean;
}

const positionStyles = [
  'text-white/60',       // 1st
  'text-white/45',       // 2nd
  'text-white/35',       // 3rd
  'text-white/25',       // 4th
];

export function TeamRow({ team, position, onClick, showPosition = true }: TeamRowProps) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors',
        onClick && 'cursor-pointer hover:bg-white/5'
      )}
    >
      {showPosition && (
        <span className={cn('text-xs font-bold w-4 shrink-0 tabular-nums', positionStyles[position - 1])}>
          {position}
        </span>
      )}

      <Flag flagCode={team.flagCode} alt={team.name} size={20} />

      <span className={cn(
        'text-sm flex-1 min-w-0 truncate',
        team.isPlayoffWinner ? 'italic text-white/35' : 'text-white/80'
      )}>
        {team.isPlayoffWinner ? team.placeholderLabel : team.name}
      </span>

      {!team.isPlayoffWinner && (
        <OddsBadge teamId={team.id} className="shrink-0" />
      )}
    </motion.div>
  );
}
