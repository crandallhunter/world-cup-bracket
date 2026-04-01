'use client';

import { useEffect, useState } from 'react';
import { useOddsContext } from '@/context/OddsContext';
import { ALL_TEAMS, getFlagEmoji } from '@/lib/tournament/teams';

export function TopContenders() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { odds, isLive, volume } = useOddsContext();

  const formattedVolume = volume
    ? (() => {
        const n = parseFloat(volume);
        if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
        if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
        if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
        return `$${Math.round(n)}`;
      })()
    : null;

  const top3 = [...ALL_TEAMS]
    .filter((t) => !t.isPlayoffWinner && (odds[t.id]?.probability ?? 0) > 0)
    .sort((a, b) => (odds[b.id]?.probability ?? 0) - (odds[a.id]?.probability ?? 0))
    .slice(0, 3);

  return (
    <section className="px-6 sm:px-10 lg:px-16 pt-8 pb-4">
      <div className="max-w-7xl mx-auto">

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-8">
          {mounted && isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
          <span className="text-[11px] text-white/25 uppercase tracking-widest">
            {mounted && formattedVolume ? `${formattedVolume} vol · ` : ''}Live · Polymarket
          </span>
        </div>

        {/* Top 3 — hero cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {mounted && top3.length > 0 ? top3.map((team, i) => {
            const prob = odds[team.id]?.probability ?? 0;
            const pct = odds[team.id]?.displayPct ?? '—';
            const isFirst = i === 0;

            return (
              <div
                key={team.id}
                className="relative rounded-2xl border overflow-hidden p-8 flex flex-col"
                style={{
                  borderColor: isFirst ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)',
                  background: isFirst
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 100%)'
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                {/* Rank badge */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-[11px] font-black uppercase tracking-[0.2em]"
                    style={{ color: isFirst ? '#6366f1' : 'rgba(255,255,255,0.2)' }}
                  >
                    #{i + 1}
                  </span>
                  {isFirst && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#6366f1]/30 text-[#6366f1]/70 uppercase tracking-widest">
                      Favorite
                    </span>
                  )}
                </div>

                {/* Flag */}
                <span className="text-5xl mb-4 leading-none">
                  {getFlagEmoji(team.flagCode)}
                </span>

                {/* Team name */}
                <span className="text-base font-semibold text-white/60 mb-2">{team.name}</span>

                {/* Big percentage */}
                <span
                  className="text-[clamp(3rem,6vw,4.5rem)] font-black leading-none tracking-tight"
                  style={{ color: isFirst ? '#818cf8' : 'rgba(255,255,255,0.7)' }}
                >
                  {pct}
                </span>


                {/* Subtle glow for #1 */}
                {isFirst && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 30% 80%, rgba(99,102,241,0.08) 0%, transparent 60%)',
                    }}
                  />
                )}
              </div>
            );
          }) : (
            // Skeleton
            Array(3).fill(null).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-white/[0.02] p-8 animate-pulse">
                <div className="h-3 w-8 bg-white/8 rounded mb-6" />
                <div className="h-10 w-10 bg-white/8 rounded mb-4" />
                <div className="h-3 w-20 bg-white/8 rounded mb-2" />
                <div className="h-14 w-24 bg-white/8 rounded" />
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
