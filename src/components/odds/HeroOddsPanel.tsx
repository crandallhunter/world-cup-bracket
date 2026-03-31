'use client';

import { useEffect, useState } from 'react';
import { useOddsContext } from '@/context/OddsContext';
import { ALL_TEAMS, getFlagEmoji } from '@/lib/tournament/teams';

export function HeroOddsPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { odds, isLive } = useOddsContext();

  const top8 = [...ALL_TEAMS]
    .filter((t) => !t.isPlayoffWinner && odds[t.id]?.probability > 0)
    .sort((a, b) => (odds[b.id]?.probability ?? 0) - (odds[a.id]?.probability ?? 0))
    .slice(0, 8);

  return (
    <div className="hidden lg:flex flex-col border border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.2em]">
          Tournament Favorites
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: mounted && isLive ? '#22c55e' : '#6366f1' }}
          />
          <span className="text-[10px] text-white/25 uppercase tracking-widest">Polymarket</span>
        </div>
      </div>

      {/* Team rows */}
      <div className="divide-y divide-white/[0.04]">
        {mounted && top8.length > 0 ? top8.map((team, i) => {
          const prob = odds[team.id]?.probability ?? 0;
          const pct = odds[team.id]?.displayPct ?? '—';
          const isTop = i < 3;

          return (
            <div key={team.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.025] transition-colors">
              <span className="text-[11px] font-black text-white/15 w-4 shrink-0 tabular-nums text-right">{i + 1}</span>
              <span className="text-xl leading-none w-7 text-center shrink-0">{getFlagEmoji(team.flagCode)}</span>
              <span className="text-sm text-white/70 flex-1">{team.name}</span>
              <span
                className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-md shrink-0"
                style={{
                  color: isTop ? '#6366f1' : prob >= 0.05 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)',
                  background: isTop ? 'rgba(99,102,241,0.12)' : 'transparent',
                }}
              >
                {pct}
              </span>
            </div>
          );
        }) : (
          // Skeleton while loading
          Array(8).fill(null).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-4 h-3 bg-white/5 rounded" />
              <div className="w-7 h-5 bg-white/5 rounded" />
              <div className="flex-1 h-3 bg-white/5 rounded" />
              <div className="w-8 h-4 bg-white/5 rounded" />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/6 mt-auto">
        <p className="text-[10px] text-white/20">Win probability · updates every 5 min</p>
      </div>
    </div>
  );
}
