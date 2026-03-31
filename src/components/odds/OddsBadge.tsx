'use client';

import { useTeamOdds } from '@/hooks/useOdds';
import { useOddsContext } from '@/context/OddsContext';

interface OddsBadgeProps {
  teamId: string;
  className?: string;
}

export function OddsBadge({ teamId, className }: OddsBadgeProps) {
  const odds = useTeamOdds(teamId);
  const { isLive } = useOddsContext();

  if (!odds) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-mono tabular-nums text-text-muted ${className ?? ''}`}
      title={isLive ? 'Polymarket live probability' : 'Estimated win probability'}
    >
      {odds.displayPct}
      <span className="text-[10px] text-text-muted/50">{isLive ? '●' : 'est.'}</span>
    </span>
  );
}
