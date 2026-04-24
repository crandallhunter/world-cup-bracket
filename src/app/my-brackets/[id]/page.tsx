'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flag } from '@/components/ui/Flag';
import { getDivisionById } from '@/lib/divisions';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { Spinner } from '@/components/ui/Spinner';
import { getMatchesByRound } from '@/lib/tournament/r32Seeding';
import type { KnockoutMatch, GroupStanding, Team, FinalScore } from '@/types/tournament';
import type { DivisionId } from '@/lib/divisions';

interface SubmissionData {
  id: string;
  divisionId: DivisionId;
  submittedAt: number;
  groupStandings: GroupStanding[];
  qualifiedThirdPlace: Team[];
  knockoutPicks: KnockoutMatch[];
  champion?: Team;
  finalScore?: FinalScore;
}

const ROUND_LABELS: Record<string, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinals',
  SF: 'Semifinals',
  F: 'Final',
};
const ROUND_ORDER = ['R32', 'R16', 'QF', 'SF', 'F'];

// Hoisted out of ReadOnlyMatch: React complains when a component is
// defined inside another render function because every parent render
// creates a fresh component identity, breaking reconciliation.
function ReadOnlyTeamRow({
  team,
  isWinner,
}: {
  team: Team | undefined;
  isWinner: boolean;
}) {
  if (!team) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <span className="text-sm w-5 text-center text-white/25">—</span>
        <span className="text-xs text-white/30 italic">TBD</span>
      </div>
    );
  }
  const name = team.isPlayoffWinner ? team.placeholderLabel : team.name;
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded ${isWinner ? 'bg-white/8' : ''}`}>
      <Flag flagCode={team.flagCode} alt={team.name} size={16} />
      <span className={`text-xs truncate max-w-[80px] ${isWinner ? 'text-white font-semibold' : 'text-white/45'}`}>
        {name}
      </span>
      {isWinner && <span className="ml-auto text-[10px] text-white/40">✓</span>}
    </div>
  );
}

function ReadOnlyMatch({ match }: { match: KnockoutMatch }) {
  const home = match.homeTeam;
  const away = match.awayTeam;

  return (
    <div className="border border-white/8 rounded-lg overflow-hidden bg-surface-2 min-w-[120px]">
      <ReadOnlyTeamRow team={home} isWinner={match.winner?.id === home?.id} />
      <div className="h-px bg-white/6" />
      <ReadOnlyTeamRow team={away} isWinner={match.winner?.id === away?.id} />
    </div>
  );
}

function KnockoutSection({ picks }: { picks: KnockoutMatch[] }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="flex gap-4 min-w-max">
        {ROUND_ORDER.map((round) => {
          // Use the FIFA-aware order helper instead of a naïve position sort.
          // R32 uses non-sequential pairings into R16 (e.g. pos 3 + pos 6 →
          // R16_M1), so we have to reorder R32 visually so each adjacent pair
          // sits next to the R16 match it feeds. R16/QF/SF/F use sequential
          // pairing, which position order already matches — the helper
          // returns them in that order.
          const matches = getMatchesByRound(picks, round as KnockoutMatch['round']);
          if (!matches.length) return null;
          return (
            <div key={round} className="flex flex-col gap-2">
              <div className="text-[11px] font-semibold text-white/40 uppercase tracking-widest text-center pb-1.5 border-b border-white/6">
                {ROUND_LABELS[round]}
              </div>
              <div className="flex flex-col justify-around gap-2 flex-1">
                {matches.map((match) => (
                  <ReadOnlyMatch key={match.matchId} match={match} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupsSection({ standings }: { standings: GroupStanding[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {standings
        .slice()
        .sort((a, b) => a.group.localeCompare(b.group))
        .map((gs) => {
          const isOpen = expanded === gs.group;
          return (
            <div key={gs.group} className="border border-white/8 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/4 transition-colors"
                onClick={() => setExpanded(isOpen ? null : gs.group)}
              >
                <span className="text-xs font-bold text-white/40 w-6">Grp {gs.group}</span>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {gs.rankings.slice(0, 2).map((t) => (
                    <div key={t.id} className="flex items-center gap-1 bg-white/6 rounded px-1.5 py-0.5">
                      <Flag flagCode={t.flagCode} alt={t.name} size={16} />
                      <span className="text-xs text-white/60 hidden sm:block">{t.name}</span>
                    </div>
                  ))}
                  <span className="text-white/30 text-xs">+2 more</span>
                </div>
                <span className="text-white/30 text-sm">{isOpen ? '↑' : '↓'}</span>
              </button>
              {isOpen && (
                <div className="border-t border-white/6 px-4 py-3 space-y-1.5 bg-black/20">
                  {gs.rankings.map((t, pos) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-4 ${pos < 2 ? 'text-white/60' : 'text-white/30'}`}>
                        {pos + 1}
                      </span>
                      <Flag flagCode={t.flagCode} alt={t.name} size={20} />
                      <span className={`text-sm ${pos < 2 ? 'text-white/80' : 'text-white/40'}`}>
                        {t.isPlayoffWinner ? t.placeholderLabel : t.name}
                      </span>
                      {pos < 2 && (
                        <span className="ml-auto text-[10px] text-white/40 uppercase tracking-wide">Advance</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

function ThirdPlaceSection({ teams }: { teams: Team[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {teams.map((t) => (
        <div key={t.id} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/8 bg-surface-2">
          <Flag flagCode={t.flagCode} alt={t.name} size={20} />
          <span className="text-xs text-white/70 truncate">
            {t.isPlayoffWinner ? t.placeholderLabel : t.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BracketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [bracket, setBracket] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !id) return;

    fetch(`/api/submit?id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exists && data.submission) {
          setBracket(data.submission);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted, id]);

  if (!mounted || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="w-8 h-8 text-accent" />
    </div>
  );

  if (!bracket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-4xl">🤷</div>
        <h2 className="text-xl font-bold">Bracket not found</h2>
        <Link href="/my-brackets" className="text-sm text-white/50 hover:text-white underline">
          Back to My Bracket
        </Link>
      </div>
    );
  }

  const champion = bracket.champion;
  const champName = champion
    ? champion.isPlayoffWinner
      ? champion.placeholderLabel
      : champion.name
    : null;

  const submittedDate = new Date(bracket.submittedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const finalMatch = bracket.knockoutPicks.find((m) => m.round === 'F');
  const division = getDivisionById(bracket.divisionId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      <div className="flex items-center gap-4">
        <Link href="/my-brackets" className="text-white/40 hover:text-white/70 transition-colors text-sm flex items-center gap-1">
          ← My Bracket
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50">My Bracket</span>
          {division && <DivisionBadge division={division} size="sm" />}
          <span className="text-xs text-white/35 ml-1">{submittedDate}</span>
        </div>
      </div>

      {champion && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[#c9a84c]/25 bg-black p-8 text-center space-y-3"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 65%)' }}
          />
          <p className="relative text-[10px] font-semibold text-[#c9a84c]/60 uppercase tracking-[0.3em]">
            2026 World Cup Champion Pick
          </p>
          <div className="relative flex justify-center">
            <Flag flagCode={champion.flagCode} alt={champion.name} size={80} className="rounded-md" />
          </div>
          <h1 className="relative text-4xl font-black text-white tracking-tight">{champName}</h1>

          {bracket.finalScore && finalMatch?.homeTeam && finalMatch?.awayTeam && (
            <div className="relative mt-4 pt-4 border-t border-white/8">
              <p className="text-[11px] text-white/40 uppercase tracking-widest mb-3">Predicted Final Score</p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Flag flagCode={finalMatch.homeTeam.flagCode} alt={finalMatch.homeTeam.name} size={24} />
                  <span className="text-xs text-white/40">
                    {finalMatch.homeTeam.isPlayoffWinner ? finalMatch.homeTeam.placeholderLabel : finalMatch.homeTeam.name}
                  </span>
                  <span className="text-3xl font-black text-white">{bracket.finalScore.home}</span>
                </div>
                <span className="text-white/30 text-xl mb-4">—</span>
                <div className="flex flex-col items-center gap-1">
                  <Flag flagCode={finalMatch.awayTeam.flagCode} alt={finalMatch.awayTeam.name} size={24} />
                  <span className="text-xs text-white/40">
                    {finalMatch.awayTeam.isPlayoffWinner ? finalMatch.awayTeam.placeholderLabel : finalMatch.awayTeam.name}
                  </span>
                  <span className="text-3xl font-black text-white">{bracket.finalScore.away}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Knockout Bracket</h2>
        <KnockoutSection picks={bracket.knockoutPicks} />
      </section>

      {bracket.qualifiedThirdPlace?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">
            3rd-Place Qualifiers ({bracket.qualifiedThirdPlace.length})
          </h2>
          <ThirdPlaceSection teams={bracket.qualifiedThirdPlace} />
        </section>
      )}

      {bracket.groupStandings?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Group Standings</h2>
          <GroupsSection standings={bracket.groupStandings} />
        </section>
      )}
    </div>
  );
}
