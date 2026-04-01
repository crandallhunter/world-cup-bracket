'use client';

import { useEffect, useState } from 'react';
import { useOddsContext } from '@/context/OddsContext';
import { GROUPS, GROUP_LABELS, getFlagEmoji } from '@/lib/tournament/teams';

export function GroupOddsGrid() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { odds } = useOddsContext();

  // Max probability across ALL teams (for relative bar scaling)
  const globalMax = Math.max(
    ...GROUP_LABELS.flatMap((g) =>
      GROUPS[g].map((t) => odds[t.id]?.probability ?? 0)
    ),
    0.01
  );

  return (
    <section className="px-6 sm:px-10 lg:px-16 pb-24">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
          <span className="text-white/30 text-xs uppercase tracking-[0.2em]">World Cup Groups · Win Probability</span>
        </div>

        {/* 12-group grid: 4 cols desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {GROUP_LABELS.map((groupLabel) => {
            const teams = [...GROUPS[groupLabel]].sort(
              (a, b) => (odds[b.id]?.probability ?? 0) - (odds[a.id]?.probability ?? 0)
            );

            return (
              <div
                key={groupLabel}
                className="rounded-2xl border border-white/6 bg-white/[0.02] overflow-hidden"
              >
                {/* Group header */}
                <div className="px-4 py-3 border-b border-white/6 flex items-center justify-between">
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
                    Group {groupLabel}
                  </span>
                </div>

                {/* Teams */}
                <div className="p-3 space-y-1">
                  {teams.map((team, i) => {
                    const prob = mounted ? (odds[team.id]?.probability ?? 0) : 0;
                    const pct = mounted ? (odds[team.id]?.displayPct ?? (team.isPlayoffWinner ? '—' : '0%')) : '—';
                    const barWidth = globalMax > 0 ? (prob / globalMax) * 100 : 0;
                    const isTop = i === 0 && prob > 0;

                    return (
                      <div
                        key={team.id}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-white/[0.03]"
                      >
                        {/* Flag */}
                        <span className="text-lg leading-none w-6 text-center shrink-0">
                          {getFlagEmoji(team.flagCode)}
                        </span>

                        {/* Name + bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className="text-xs font-semibold truncate"
                              style={{ color: isTop ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)' }}
                            >
                              {team.name}
                            </span>
                            <span
                              className="text-xs font-bold tabular-nums shrink-0"
                              style={{ color: isTop ? '#818cf8' : 'rgba(255,255,255,0.3)' }}
                            >
                              {pct}
                            </span>
                          </div>
                          <div className="h-0.5 bg-white/6 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: mounted ? `${barWidth}%` : '0%',
                                background: isTop
                                  ? 'linear-gradient(90deg, #6366f1, #818cf8)'
                                  : 'rgba(255,255,255,0.12)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-[11px] text-white/20 mt-6">
          Win probability sourced from Polymarket prediction markets · updates every 5 min
        </p>
      </div>
    </section>
  );
}
