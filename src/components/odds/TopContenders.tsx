'use client';

import { useEffect, useState } from 'react';
import { useOddsContext } from '@/context/OddsContext';
import { ALL_TEAMS, getFlagEmoji } from '@/lib/tournament/teams';

export function TopContenders() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { odds, isLive } = useOddsContext();

  const top5 = [...ALL_TEAMS]
    .filter((t) => !t.isPlayoffWinner && (odds[t.id]?.probability ?? 0) > 0)
    .sort((a, b) => (odds[b.id]?.probability ?? 0) - (odds[a.id]?.probability ?? 0))
    .slice(0, 5);

  // Max probability for relative bar scaling
  const maxProb = top5[0] ? (odds[top5[0].id]?.probability ?? 0) : 1;

  return (
    <section className="px-6 sm:px-10 lg:px-16 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/8 bg-white/[0.02] overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-8 sm:px-12 pt-10 pb-8 border-b border-white/6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
              <span className="text-white/30 text-xs uppercase tracking-[0.2em]">Tournament Favorites</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: mounted && isLive ? '#22c55e' : '#6366f1' }}
              />
              <span className="text-[10px] text-white/25 uppercase tracking-widest">
                {mounted && isLive ? 'Live · Polymarket' : 'Polymarket'}
              </span>
            </div>
          </div>

          {/* Contenders list */}
          <div className="px-8 sm:px-12 py-8 space-y-5">
            {mounted && top5.length > 0 ? top5.map((team, i) => {
              const prob = odds[team.id]?.probability ?? 0;
              const pct = odds[team.id]?.displayPct ?? '—';
              const barWidth = maxProb > 0 ? (prob / maxProb) * 100 : 0;

              return (
                <div key={team.id} className="flex items-center gap-5">
                  {/* Rank */}
                  <span className="text-[11px] font-black text-white/15 w-4 shrink-0 tabular-nums text-right">
                    {i + 1}
                  </span>

                  {/* Flag */}
                  <span className="text-2xl leading-none w-8 text-center shrink-0">
                    {getFlagEmoji(team.flagCode)}
                  </span>

                  {/* Name */}
                  <span className="text-sm font-semibold text-white/80 w-28 shrink-0 truncate">
                    {team.name}
                  </span>

                  {/* Bar */}
                  <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${barWidth}%`,
                        background: i === 0
                          ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                          : i === 1
                          ? 'linear-gradient(90deg, #4f46e5, #6366f1)'
                          : 'rgba(99,102,241,0.45)',
                      }}
                    />
                  </div>

                  {/* Percentage */}
                  <span
                    className="text-sm font-bold tabular-nums shrink-0 w-10 text-right"
                    style={{
                      color: i === 0 ? '#818cf8' : i < 3 ? '#6366f1' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {pct}
                  </span>
                </div>
              );
            }) : (
              // Skeleton
              Array(5).fill(null).map((_, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className="w-4 h-3 bg-white/5 rounded" />
                  <div className="w-8 h-6 bg-white/5 rounded" />
                  <div className="w-28 h-3 bg-white/5 rounded" />
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full" />
                  <div className="w-10 h-3 bg-white/5 rounded" />
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="px-8 sm:px-12 pb-8">
            <p className="text-[11px] text-white/20">
              Win probability from Polymarket prediction markets · updates every 5 min
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
