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

  const displayPct = odds?.displayPct ?? '<1%';
  // If no odds data at all, show a dimmer badge since it's a fallback estimate
  const pctStyle = odds ? 'text-white/70' : 'text-white/35';

  return (
    <span
      className={`inline-flex items-center gap-1 tabular-nums ${className ?? ''}`}
      title="Chance of winning the 2026 World Cup · Polymarket prediction market"
    >
      <span className={`text-xs font-bold ${pctStyle}`}>{displayPct}</span>
      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wide">
        {isLive ? 'WC ●' : 'WC'}
      </span>
    </span>
  );
}
