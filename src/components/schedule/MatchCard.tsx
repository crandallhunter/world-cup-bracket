'use client';

import { getFlagEmoji, getTeamById } from '@/lib/tournament/teams';
import { cn } from '@/lib/utils/cn';
import type { GroupLabel, KnockoutMatch } from '@/types/tournament';
import type { ScheduleMatch } from '@/data/schedule';

interface MatchCardProps {
  match: ScheduleMatch;
  userGroupRankings?: Record<GroupLabel, [string, string, string, string]>;
  bracketMatch?: KnockoutMatch;
}

const COUNTRY_FLAGS: Record<'USA' | 'Canada' | 'Mexico', string> = {
  USA: '🇺🇸',
  Canada: '🇨🇦',
  Mexico: '🇲🇽',
};

const POSITION_LABELS = ['1st', '2nd', '3rd', '4th'] as const;

function PositionBadge({ pos }: { pos: number }) {
  const label = POSITION_LABELS[pos];
  const styles = [
    'bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30',   // 1st — gold
    'bg-white/10 text-white/50 border border-white/20',               // 2nd — white/50
    'bg-white/5 text-white/25 border border-white/10',                // 3rd — white/20
    'bg-white/[0.03] text-white/15 border border-white/[0.08]',      // 4th — white/10
  ];
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0',
      styles[pos],
    )}>
      {label}
    </span>
  );
}

function TeamRow({
  teamId,
  label,
  rankPos,
  isWinner,
  showPickCheck,
}: {
  teamId?: string;
  label: string;
  rankPos?: number;
  isWinner?: boolean;
  showPickCheck?: boolean;
}) {
  const team = teamId ? getTeamById(teamId) : undefined;
  const flagEmoji = team ? getFlagEmoji(team.flagCode) : null;

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      {/* Flag */}
      {flagEmoji && (
        <span className="text-base leading-none shrink-0">{flagEmoji}</span>
      )}

      {/* Name */}
      <span className={cn(
        'flex-1 text-[13px] font-medium truncate',
        isWinner ? 'text-white' : 'text-white/70',
      )}>
        {label}
      </span>

      {/* Right-side indicators */}
      <div className="flex items-center gap-1.5 shrink-0">
        {rankPos !== undefined && <PositionBadge pos={rankPos} />}
        {showPickCheck && (
          <span className="text-[10px] font-semibold text-[#c9a84c]/80">✓ Your pick</span>
        )}
      </div>
    </div>
  );
}

export function MatchCard({ match, userGroupRankings, bracketMatch }: MatchCardProps) {
  const countryFlag = COUNTRY_FLAGS[match.country];

  // Group stage: resolve position badges
  let homeRankPos: number | undefined;
  let awayRankPos: number | undefined;
  if (match.round === 'GS' && match.group && userGroupRankings?.[match.group] && match.homeId && match.awayId) {
    const rankings = userGroupRankings[match.group];
    const homeIdx = rankings.indexOf(match.homeId);
    const awayIdx = rankings.indexOf(match.awayId);
    if (homeIdx !== -1) homeRankPos = homeIdx;
    if (awayIdx !== -1) awayRankPos = awayIdx;
  }

  // R32: resolve pick indicators from bracketMatch
  let homeIsWinner = false;
  let awayIsWinner = false;
  let homePickLabel = match.homeLabel;
  let awayPickLabel = match.awayLabel;

  if (bracketMatch) {
    if (bracketMatch.winner) {
      const winnerId = bracketMatch.winner.id;
      const homeTeamId = bracketMatch.homeTeam?.id;
      const awayTeamId = bracketMatch.awayTeam?.id;
      homeIsWinner = !!homeTeamId && homeTeamId === winnerId;
      awayIsWinner = !!awayTeamId && awayTeamId === winnerId;
    }
    // Annotate seeding label with resolved team name if available
    if (bracketMatch.homeTeam && bracketMatch.homeTeam.id !== '__TBD__') {
      const t = bracketMatch.homeTeam;
      const flag = getFlagEmoji(t.flagCode);
      homePickLabel = `${match.homeLabel} (${flag} ${t.name})`;
    }
    if (bracketMatch.awayTeam && bracketMatch.awayTeam.id !== '__TBD__') {
      const t = bracketMatch.awayTeam;
      const flag = getFlagEmoji(t.flagCode);
      awayPickLabel = `${match.awayLabel} (${flag} ${t.name})`;
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Top strip */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.015]">
        {/* Date */}
        <span className="text-[10px] text-white/30 uppercase tracking-widest whitespace-nowrap">
          {formatDate(match.dateISO)} · M{match.matchNum}
        </span>

        {/* Time — centered */}
        <span className="text-[10px] font-semibold text-[#c9a84c]/70 whitespace-nowrap">
          {match.timeEST}
        </span>

        {/* Venue — right-aligned */}
        <span className="text-[10px] text-white/30 truncate max-w-[140px] text-right">
          {countryFlag} {match.city} · {match.stadium}
        </span>
      </div>

      {/* Home team */}
      <TeamRow
        teamId={match.homeId}
        label={match.round === 'GS' ? match.homeLabel : homePickLabel}
        rankPos={homeRankPos}
        isWinner={homeIsWinner}
        showPickCheck={homeIsWinner && !!bracketMatch?.winner}
      />

      {/* Hairline divider */}
      <div className="mx-3 h-px bg-white/[0.05]" />

      {/* Away team */}
      <TeamRow
        teamId={match.awayId}
        label={match.round === 'GS' ? match.awayLabel : awayPickLabel}
        rankPos={awayRankPos}
        isWinner={awayIsWinner}
        showPickCheck={awayIsWinner && !!bracketMatch?.winner}
      />
    </div>
  );
}

function formatDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}`;
}
