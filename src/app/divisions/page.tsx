'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DIVISIONS, requirementText } from '@/lib/divisions';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { useUserDivision } from '@/lib/web3/hooks/useUserDivision';
import { cn } from '@/lib/utils/cn';
import type { DivisionId } from '@/lib/divisions';
import Link from 'next/link';

interface DivisionWithCount {
  id: DivisionId;
  participantCount: number;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
};

/** Per-collection breakdown shown under "Your Division". */
function formatHoldings(
  futbol: { direct: number; delegated: number },
  meebit: { direct: number; delegated: number },
): string {
  const parts: string[] = [];
  const futbolTotal = futbol.direct + futbol.delegated;
  const meebitTotal = meebit.direct + meebit.delegated;

  if (meebitTotal > 0) {
    parts.push(`${meebitTotal} Meebit${meebitTotal !== 1 ? 's' : ''}`);
  }
  if (futbolTotal > 0) {
    parts.push(`${futbolTotal} Meebits Futbol`);
  }
  if (parts.length === 0) return 'No gating NFTs held';

  const delegatedTotal = futbol.delegated + meebit.delegated;
  const base = parts.join(' + ');
  return delegatedTotal > 0 ? `${base} (${delegatedTotal} via delegate.xyz)` : base;
}

export default function DivisionsPage() {
  const [counts, setCounts] = useState<Record<DivisionId, number>>({
    gold: 0, silver: 0, bronze: 0, open: 0,
  });
  const [totalParticipants, setTotalParticipants] = useState(0);
  const { division: userDivision, futbol, meebit, isConnected } = useUserDivision();

  useEffect(() => {
    fetch('/api/divisions')
      .then((res) => res.json())
      .then((data) => {
        if (data.divisions) {
          const c: Record<string, number> = {};
          data.divisions.forEach((d: DivisionWithCount) => {
            c[d.id] = d.participantCount;
          });
          setCounts(c as Record<DivisionId, number>);
        }
        if (data.totalParticipants != null) {
          setTotalParticipants(data.totalParticipants);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Divisions</h1>
        <p className="text-white/50 text-sm">
          Compete for prizes based on your NFT holdings. Gold is reserved for
          Meebit holders; Silver and Bronze are tiered by your Meebits Futbol
          count; everyone else plays in the Free division.
        </p>
      </div>

      {/* User's current division */}
      {isConnected && userDivision && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/10 bg-white/[0.03]"
        >
          <div className="flex items-center gap-3">
            <DivisionBadge division={userDivision} size="lg" />
            <div>
              <p className="text-sm font-medium text-white">Your Division</p>
              <p className="text-xs text-white/45">
                {formatHoldings(futbol, meebit)}
              </p>
            </div>
          </div>
          <Link
            href="/bracket"
            className="px-4 py-2 rounded-lg bg-white hover:bg-white/85 text-black text-sm font-semibold transition-colors"
          >
            Build Bracket
          </Link>
        </motion.div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-white/40">
        <span className="tabular-nums">{totalParticipants} total participant{totalParticipants !== 1 ? 's' : ''}</span>
        <span className="h-3 w-px bg-white/10" />
        <span>{DIVISIONS.length} divisions</span>
      </div>

      {/* Division cards */}
      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {DIVISIONS.map((div) => {
          const isUserDivision = userDivision?.id === div.id;
          const count = counts[div.id] ?? 0;

          return (
            <motion.div
              key={div.id}
              variants={cardVariants}
              className={cn(
                'relative overflow-hidden rounded-xl border p-5 transition-colors',
                isUserDivision
                  ? 'border-white/15 bg-white/[0.04]'
                  : 'border-white/6 bg-white/[0.02]'
              )}
            >
              {/* Subtle gradient background */}
              <div
                className={cn(
                  'absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-r',
                  div.bgGradient
                )}
              />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{div.icon}</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        'text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent',
                        div.color
                      )}>
                        {div.name}
                      </h3>
                      {isUserDivision && (
                        <span className="text-[10px] uppercase tracking-widest text-white/45 border border-white/10 rounded-full px-2 py-0.5">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">
                      {requirementText(div.requirement)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="text-sm font-mono text-white/50">
                    {div.prize}
                  </div>
                  <div className="text-[11px] text-white/35">
                    {count} participant{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA */}
      {!isConnected && (
        <div className="text-center pt-4">
          <p className="text-sm text-white/50 mb-4">
            Connect your wallet to see which division you qualify for.
          </p>
          <Link
            href="/bracket"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/20 text-amber-200 font-semibold text-sm hover:from-amber-500/30 hover:to-yellow-500/30 transition-all"
          >
            Get Started →
          </Link>
        </div>
      )}
    </div>
  );
}
