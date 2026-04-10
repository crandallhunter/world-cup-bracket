'use client';

import { getTeamById } from '@/lib/tournament/teams';
import { Flag } from '@/components/ui/Flag';
import { cn } from '@/lib/utils/cn';
import type { GroupLabel, KnockoutMatch } from '@/types/tournament';
import type { ScheduleMatch } from '@/data/schedule';
import type { FixtureResult } from '@/lib/db/types';

interface MatchCardProps {
  match: ScheduleMatch;
  userGroupRankings?: Record<GroupLabel, [string, string, string, string]>;
  bracketMatch?: KnockoutMatch;
  fixtureResults?: FixtureResult[];
  allScheduleMatches?: ScheduleMatch[];
}

const HOST_COUNTRY_CODES: Record<'USA' | 'Canada' | 'Mexico', string> = {
  USA: 'us',
  Canada: 'ca',
  Mexico: 'mx',
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

function StatusBadge({ status }: { status: string }) {
  const label = status === 'PEN' ? 'Penalties' : status === 'AET' ? 'Extra Time' : 'Full Time';
  return (
    <span className="text-[9px] uppercase tracking-wider text-white/25 font-medium">
      {label}
    </span>
  );
}

function TeamRow({
  teamId,
  label,
  goals,
  rankPos,
  isWinner,
  showPickCheck,
  isCompleted,
}: {
  teamId?: string;
  label: string;
  goals?: number;
  rankPos?: number;
  isWinner?: boolean;
  showPickCheck?: boolean;
  isCompleted?: boolean;
}) {
  const team = teamId ? getTeamById(teamId) : undefined;

  return (
    <div className="flex items-center gap-2 px-3 py-2.5">
      {/* Flag */}
      {team && <Flag flagCode={team.flagCode} alt={team.name} size={20} />}

      {/* Name */}
      <span className={cn(
        'flex-1 text-[13px] font-medium truncate',
        isCompleted
          ? (isWinner ? 'text-white' : 'text-white/40')
          : (isWinner ? 'text-white' : 'text-white/70'),
      )}>
        {label}
      </span>

      {/* Right-side indicators */}
      <div className="flex items-center gap-1.5 shrink-0">
        {goals !== undefined && (
          <span className={cn(
            'text-sm font-bold tabular-nums min-w-[18px] text-right',
            isWinner ? 'text-white' : 'text-white/40',
          )}>
            {goals}
          </span>
        )}
        {rankPos !== undefined && <PositionBadge pos={rankPos} />}
        {showPickCheck && (
          <span className="text-[10px] font-semibold text-[#c9a84c]/80">✓ Your pick</span>
        )}
      </div>
    </div>
  );
}

/**
 * Parse the EST time string from schedule into an approximate hour for sorting.
 * e.g. "3:00 PM ET" → 15, "9:00 PM ET" → 21
 */
function parseTimeEST(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const isPM = match[3].toUpperCase() === 'PM';
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  return hour;
}

/**
 * Find a matching fixture result for a schedule match.
 * Group stage: match by homeId + awayId (both known).
 * Knockout: match by round + date, disambiguated by time ordering.
 */
function findFixtureResult(
  match: ScheduleMatch,
  fixtures: FixtureResult[],
  allScheduleMatches: ScheduleMatch[],
): FixtureResult | undefined {
  if (match.round === 'GS' && match.homeId && match.awayId) {
    // Group stage: match by team IDs (order might be swapped)
    return fixtures.find(
      (f) =>
        f.round === 'GS' &&
        ((f.homeId === match.homeId && f.awayId === match.awayId) ||
         (f.homeId === match.awayId && f.awayId === match.homeId))
    );
  }

  // Knockout: match by round + date, then by time position
  if (match.round !== 'GS') {
    const roundDateFixtures = fixtures
      .filter((f) => f.round === match.round && f.dateISO === match.dateISO)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime));

    if (roundDateFixtures.length === 0) return undefined;
    if (roundDateFixtures.length === 1) return roundDateFixtures[0];

    // Multiple matches on same date — match by time position
    // Get all schedule matches for this round + date, sorted by time
    const scheduleSameRoundDate = allScheduleMatches
      .filter((m) => m.round === match.round && m.dateISO === match.dateISO)
      .sort((a, b) => parseTimeEST(a.timeEST) - parseTimeEST(b.timeEST));

    const posIndex = scheduleSameRoundDate.findIndex((m) => m.matchNum === match.matchNum);
    if (posIndex >= 0 && posIndex < roundDateFixtures.length) {
      return roundDateFixtures[posIndex];
    }

    return roundDateFixtures[0];
  }

  return undefined;
}

export function MatchCard({ match, userGroupRankings, bracketMatch, fixtureResults, allScheduleMatches }: MatchCardProps) {
  const hostCountryCode = HOST_COUNTRY_CODES[match.country];
  const fixture = fixtureResults?.length && allScheduleMatches?.length
    ? findFixtureResult(match, fixtureResults, allScheduleMatches)
    : undefined;
  const isCompleted = !!fixture;

  // Determine if teams are swapped in the fixture vs schedule (group stage only)
  const isSwapped = isCompleted && match.round === 'GS' &&
    fixture.homeId === match.awayId && fixture.awayId === match.homeId;

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

  // Resolve display data
  let homeLabel = match.homeLabel;
  let awayLabel = match.awayLabel;
  let homeTeamId = match.homeId;
  let awayTeamId = match.awayId;
  let homeGoals: number | undefined;
  let awayGoals: number | undefined;
  let homeIsWinner = false;
  let awayIsWinner = false;

  if (isCompleted) {
    // Show real result
    if (isSwapped) {
      // API returned teams in opposite order
      homeGoals = fixture.awayGoals;
      awayGoals = fixture.homeGoals;
      homeIsWinner = fixture.winnerId === match.homeId;
      awayIsWinner = fixture.winnerId === match.awayId;
    } else {
      homeGoals = fixture.homeGoals;
      awayGoals = fixture.awayGoals;
      homeIsWinner = fixture.winnerId === fixture.homeId;
      awayIsWinner = fixture.winnerId === fixture.awayId;
    }

    // For knockout rounds, show the actual teams from the fixture
    if (match.round !== 'GS') {
      const realHomeId = isSwapped ? fixture.awayId : fixture.homeId;
      const realAwayId = isSwapped ? fixture.homeId : fixture.awayId;
      const homeTeam = getTeamById(realHomeId);
      const awayTeam = getTeamById(realAwayId);
      if (homeTeam) {
        homeLabel = homeTeam.name;
        homeTeamId = homeTeam.id;
      }
      if (awayTeam) {
        awayLabel = awayTeam.name;
        awayTeamId = awayTeam.id;
      }
    }
  } else if (bracketMatch) {
    // No real result yet — show user's bracket picks for knockout
    if (bracketMatch.winner) {
      const winnerId = bracketMatch.winner.id;
      homeIsWinner = !!bracketMatch.homeTeam?.id && bracketMatch.homeTeam.id === winnerId;
      awayIsWinner = !!bracketMatch.awayTeam?.id && bracketMatch.awayTeam.id === winnerId;
    }
    if (bracketMatch.homeTeam && bracketMatch.homeTeam.id !== '__TBD__') {
      const t = bracketMatch.homeTeam;
      homeLabel = `${match.homeLabel} · ${t.name}`;
      homeTeamId = t.id;
    }
    if (bracketMatch.awayTeam && bracketMatch.awayTeam.id !== '__TBD__') {
      const t = bracketMatch.awayTeam;
      awayLabel = `${match.awayLabel} · ${t.name}`;
      awayTeamId = t.id;
    }
  }

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden',
      isCompleted
        ? 'border-white/[0.12] bg-white/[0.03]'
        : 'border-white/[0.08] bg-white/[0.02]',
    )}>
      {/* Top strip */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.015]">
        {/* Date */}
        <span className="text-[10px] text-white/30 uppercase tracking-widest whitespace-nowrap">
          {formatDate(match.dateISO)} · M{match.matchNum}
        </span>

        {/* Center: time or status */}
        {isCompleted ? (
          <StatusBadge status={fixture.status} />
        ) : (
          <span className="text-[10px] font-semibold text-[#c9a84c]/70 whitespace-nowrap">
            {match.timeEST}
          </span>
        )}

        {/* Venue — right-aligned */}
        <span className="flex items-center gap-1.5 text-[10px] text-white/30 truncate max-w-[160px] text-right">
          <Flag flagCode={hostCountryCode} alt={match.country} size={16} />
          <span className="truncate">{match.city}</span>
        </span>
      </div>

      {/* Home team */}
      <TeamRow
        teamId={homeTeamId}
        label={match.round === 'GS' ? match.homeLabel : homeLabel}
        goals={homeGoals}
        rankPos={homeRankPos}
        isWinner={homeIsWinner}
        showPickCheck={!isCompleted && homeIsWinner && !!bracketMatch?.winner}
        isCompleted={isCompleted}
      />

      {/* Hairline divider */}
      <div className="mx-3 h-px bg-white/[0.05]" />

      {/* Away team */}
      <TeamRow
        teamId={awayTeamId}
        label={match.round === 'GS' ? match.awayLabel : awayLabel}
        goals={awayGoals}
        rankPos={awayRankPos}
        isWinner={awayIsWinner}
        showPickCheck={!isCompleted && awayIsWinner && !!bracketMatch?.winner}
        isCompleted={isCompleted}
      />
    </div>
  );
}

function formatDate(iso: string): string {
  const [, month, day] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}`;
}
