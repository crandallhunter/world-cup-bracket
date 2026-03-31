'use client';

import { useEffect, useState } from 'react';
import { useOddsContext } from '@/context/OddsContext';
import { ALL_TEAMS, getFlagEmoji } from '@/lib/tournament/teams';

export function TeamOddsGrid() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { odds, isLive, isLoading, volume } = useOddsContext();

  const formattedVolume = volume
    ? `$${(parseFloat(volume) / 1_000_000).toFixed(0)}M`
    : null;

  if (!mounted) return <section className="px-6 sm:px-10 lg:px-16 py-20" />;

  // Sort: teams with odds descending, then no-odds teams, placeholders last
  const sorted = [...ALL_TEAMS].sort((a, b) => {
    const aOdds = odds[a.id]?.probability ?? -1;
    const bOdds = odds[b.id]?.probability ?? -1;
    if (a.isPlayoffWinner && !b.isPlayoffWinner) return 1;
    if (!a.isPlayoffWinner && b.isPlayoffWinner) return -1;
    return bOdds - aOdds;
  });

  return (
    <section className="px-6 sm:px-10 lg:px-16 py-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          <span className="text-white/30 text-xs uppercase tracking-[0.2em]">Win Probability</span>
        </div>
        <div className="flex items-center gap-3">
          {formattedVolume && (
            <span className="text-[10px] text-white/20 tabular-nums">
              {formattedVolume} vol.
            </span>
          )}
          {isLoading ? (
            <span className="text-[10px] text-white/20 uppercase tracking-widest">Updating…</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isLive ? '#22c55e' : '#6366f1' }}
              />
              <span className="text-[10px] text-white/25 uppercase tracking-widest">
                {isLive ? 'Live · Polymarket' : 'Polymarket'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/6 rounded-2xl overflow-hidden border border-white/6">
        {sorted.map((team, i) => {
          const teamOdds = odds[team.id];
          const pct = teamOdds?.displayPct ?? null;
          const prob = teamOdds?.probability ?? 0;
          const isTop3 = i < 3 && pct !== null;
          const isPlaceholder = team.isPlayoffWinner;

          return (
            <div
              key={team.id}
              className="flex items-center gap-3 px-4 py-3 bg-black hover:bg-white/[0.025] transition-colors"
            >
              {/* Rank */}
              <span className="text-[11px] font-black text-white/15 w-5 shrink-0 tabular-nums text-right">
                {isPlaceholder ? '—' : i + 1}
              </span>

              {/* Flag */}
              <span className="text-xl leading-none w-7 text-center shrink-0">
                {getFlagEmoji(team.flagCode)}
              </span>

              {/* Name */}
              <span className={`text-sm flex-1 truncate ${isPlaceholder ? 'text-white/25 italic' : 'text-white/70'}`}>
                {isPlaceholder ? team.placeholderLabel : team.name}
              </span>

              {/* Odds badge */}
              {pct ? (
                <span
                  className="text-xs font-bold tabular-nums shrink-0 px-2 py-0.5 rounded-md"
                  style={{
                    color: isTop3 ? '#6366f1' : prob >= 0.05 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                    background: isTop3 ? 'rgba(99,102,241,0.12)' : 'transparent',
                  }}
                >
                  {pct}
                </span>
              ) : (
                <span className="text-[11px] text-white/15 shrink-0 w-8 text-right">—</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-white/20 text-right">
        Odds reflect market win probability · updates every 5 min
      </p>
    </section>
  );
}
