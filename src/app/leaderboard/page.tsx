'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useIdentityStore } from '@/store/identityStore';
import { DIVISIONS, getDivisionById } from '@/lib/divisions';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { POINTS_PER_ROUND, MAX_POINTS } from '@/lib/scoring';
import { Flag } from '@/components/ui/Flag';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import type { DivisionId } from '@/lib/divisions';
import type { ScoreBreakdown } from '@/lib/scoring';

interface LeaderboardEntry {
  submissionId: string;
  identifier: string;
  divisionId: DivisionId;
  score: ScoreBreakdown;
  tiebreaker: number | null;
  champion?: { name: string; flagCode: string; id: string };
  updatedAt: number;
}

type TabId = 'all' | DivisionId;

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'Overall' },
  ...DIVISIONS.map((d) => ({ id: d.id as TabId, label: d.name })),
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<TabId>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { address, isConnected } = useAccount();
  const { identity } = useIdentityStore();

  const userIdentifier = isConnected && address
    ? address.toLowerCase()
    : identity?.type === 'email'
    ? identity.email.toLowerCase()
    : null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    setLoading(true);

    const params = tab === 'all' ? '' : `?division=${tab}`;
    fetch(`/api/leaderboard${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.leaderboard ?? []);
        setLastUpdated(data.lastUpdated);
        setTotalParticipants(data.totalParticipants);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted, tab]);

  const hasScores = entries.some((e) => e.score.total > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-white/50 mt-1">
          {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
          {lastUpdated && (
            <span>
              {' '}· Last updated{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </p>
      </div>

      {/* Scoring legend */}
      <div className="flex flex-wrap gap-2 text-[11px] text-white/40">
        {Object.entries(POINTS_PER_ROUND).map(([round, pts]) => (
          <span key={round} className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
            {round === 'CHAMPION' ? 'Champion' : round}: {pts} pts
          </span>
        ))}
        <span className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
          Max: {MAX_POINTS}
        </span>
      </div>

      {/* Division tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0',
              tab === t.id
                ? 'bg-white/10 text-white'
                : 'text-white/45 hover:text-white/70 hover:bg-white/5'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-8 h-8 text-accent" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center border border-white/8 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl">🏆</div>
          <h3 className="text-lg font-semibold">No entries yet</h3>
          <p className="text-sm text-white/50 max-w-xs">
            {tab === 'all'
              ? 'Brackets will appear here once people start submitting.'
              : `No brackets submitted in the ${TABS.find((t) => t.id === tab)?.label} division yet.`}
          </p>
        </div>
      ) : !hasScores ? (
        /* Entries exist but tournament hasn't started scoring */
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-8 text-center border border-white/8 rounded-2xl bg-white/[0.02]">
            <div className="text-3xl">⏳</div>
            <p className="text-sm text-white/50">
              Scores will update daily at 10 AM EST once the tournament begins.
            </p>
          </div>

          {/* Show participants list without scores */}
          <div className="border border-white/8 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_auto] gap-2 px-4 py-2.5 text-[11px] text-white/35 uppercase tracking-widest border-b border-white/6">
              <span>#</span>
              <span>Player</span>
              <span>Champion</span>
            </div>
            {entries.map((entry, i) => {
              const isUser = userIdentifier === entry.identifier.toLowerCase();
              return (
                <motion.div
                  key={entry.submissionId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    'grid grid-cols-[3rem_1fr_auto] gap-2 px-4 py-3 items-center border-b border-white/[0.04] last:border-0',
                    isUser && 'bg-[#6366f1]/8'
                  )}
                >
                  <span className="text-sm font-bold text-white/40">{i + 1}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <DivisionBadge division={getDivisionById(entry.divisionId)} size="sm" showLabel={false} />
                    <span className="text-sm text-white/70 truncate font-mono">
                      {entry.identifier.includes('@')
                        ? entry.identifier.split('@')[0] + '@...'
                        : `${entry.identifier.slice(0, 6)}...${entry.identifier.slice(-4)}`}
                    </span>
                    {isUser && (
                      <span className="text-[10px] text-[#6366f1] font-semibold uppercase tracking-wide">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {entry.champion && (
                      <>
                        <Flag flagCode={entry.champion.flagCode} alt={entry.champion.name} size={20} />
                        <span className="text-xs text-white/40 hidden sm:block">{entry.champion.name}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Full scored leaderboard */
        <div className="border border-white/8 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem_4rem_4rem_4.5rem] gap-1 px-4 py-2.5 text-[11px] text-white/35 uppercase tracking-widest border-b border-white/6 overflow-x-auto">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">R32</span>
            <span className="text-right">R16</span>
            <span className="text-right">QF</span>
            <span className="text-right">SF</span>
            <span className="text-right">F</span>
            <span className="text-right">Champ</span>
            <span className="text-right">Total</span>
          </div>
          <div className="overflow-x-auto">
            {entries.map((entry, i) => {
              const isUser = userIdentifier === entry.identifier.toLowerCase();
              const isTop3 = i < 3;
              return (
                <motion.div
                  key={entry.submissionId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    'grid grid-cols-[3rem_1fr_4rem_4rem_4rem_4rem_4rem_4rem_4.5rem] gap-1 px-4 py-3 items-center border-b border-white/[0.04] last:border-0',
                    isUser && 'bg-[#6366f1]/8',
                    isTop3 && !isUser && 'bg-white/[0.02]'
                  )}
                >
                  <span className={cn(
                    'text-sm font-bold',
                    i === 0 ? 'text-[#c9a84c]' : i === 1 ? 'text-white/50' : i === 2 ? 'text-orange-400/70' : 'text-white/35'
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <DivisionBadge division={getDivisionById(entry.divisionId)} size="sm" showLabel={false} />
                    <span className="text-sm text-white/70 truncate font-mono">
                      {entry.identifier.includes('@')
                        ? entry.identifier.split('@')[0] + '@...'
                        : `${entry.identifier.slice(0, 6)}...${entry.identifier.slice(-4)}`}
                    </span>
                    {isUser && (
                      <span className="text-[10px] text-[#6366f1] font-semibold uppercase tracking-wide">You</span>
                    )}
                    {entry.champion && (
                      <span className="ml-auto hidden sm:block" title={entry.champion.name}>
                        <Flag flagCode={entry.champion.flagCode} alt={entry.champion.name} size={16} />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/40 text-right tabular-nums">{entry.score.r32}</span>
                  <span className="text-xs text-white/40 text-right tabular-nums">{entry.score.r16}</span>
                  <span className="text-xs text-white/40 text-right tabular-nums">{entry.score.qf}</span>
                  <span className="text-xs text-white/40 text-right tabular-nums">{entry.score.sf}</span>
                  <span className="text-xs text-white/40 text-right tabular-nums">{entry.score.final}</span>
                  <span className="text-xs text-white/40 text-right tabular-nums">{entry.score.champion}</span>
                  <span className={cn(
                    'text-sm font-bold text-right tabular-nums',
                    isTop3 ? 'text-white' : 'text-white/60'
                  )}>
                    {entry.score.total}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
