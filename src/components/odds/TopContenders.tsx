'use client';

import { useEffect, useState } from 'react';
import { useOddsContext } from '@/context/OddsContext';
import { ALL_TEAMS, getFlagEmoji } from '@/lib/tournament/teams';

export function TopContenders() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { odds, isLive, volume } = useOddsContext();

  const ranked = [...ALL_TEAMS]
    .filter((t) => !t.isPlayoffWinner && (odds[t.id]?.probability ?? 0) > 0)
    .sort((a, b) => (odds[b.id]?.probability ?? 0) - (odds[a.id]?.probability ?? 0))
    .slice(0, 5);

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3, 5);

  return (
    <section className="px-6 sm:px-10 lg:px-16 py-20">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
            <span className="text-white/30 text-xs uppercase tracking-[0.2em]">Tournament Favorites</span>
          </div>
          <div className="flex items-center gap-2">
            {mounted && isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
            <span className="text-[10px] text-white/25 uppercase tracking-widest">
              {mounted && volume ? `${volume} vol · ` : ''}Live · Polymarket
            </span>
          </div>
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

                {/* Thin bar at bottom */}
                <div className="mt-auto pt-6">
                  <div className="h-0.5 w-full bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${prob * 100}%`,
                        background: isFirst ? '#6366f1' : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  </div>
                </div>

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

        {/* #4 & #5 — slim strip */}
        {mounted && rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rest.map((team, i) => {
              const pct = odds[team.id]?.displayPct ?? '—';
              const prob = odds[team.id]?.probability ?? 0;
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-4 px-6 py-4 rounded-xl border border-white/6 bg-white/[0.02]"
                >
                  <span className="text-[11px] font-black text-white/20 w-4 shrink-0">#{i + 4}</span>
                  <span className="text-2xl leading-none">{getFlagEmoji(team.flagCode)}</span>
                  <span className="text-sm font-semibold text-white/50 flex-1">{team.name}</span>
                  <div className="w-20 h-1 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/20"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-black text-white/50 tabular-nums w-14 text-right">{pct}</span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
