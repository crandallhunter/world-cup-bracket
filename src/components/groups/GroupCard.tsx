'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GroupLabel, GroupStanding, Team } from '@/types/tournament';
import { useBracketStore } from '@/store/bracketStore';
import { TeamRow } from './TeamRow';
import { cn } from '@/lib/utils/cn';

interface GroupCardProps {
  group: GroupLabel;
  standing: GroupStanding;
}

export function GroupCard({ group, standing }: GroupCardProps) {
  const [localRankings, setLocalRankings] = useState<[Team, Team, Team, Team]>(standing.rankings);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const { setGroupRanking } = useBracketStore();

  function moveTeam(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    const next = [...localRankings] as [Team, Team, Team, Team];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    setLocalRankings(next);
    setGroupRanking(group, next);
  }

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border transition-colors',
        standing.isComplete
          ? 'border-white/10 bg-surface-2'
          : 'border-white/6 bg-surface-1'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Group</span>
          <span className="text-base font-black text-white">{group}</span>
        </div>
      </div>

      {/* Teams — drag to reorder */}
      <div className="p-1.5 space-y-0.5">
        {localRankings.map((team, idx) => (
          <div
            key={team.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragIdx !== null && dragIdx !== idx) moveTeam(dragIdx, idx);
              setDragIdx(idx);
            }}
            onDragEnd={() => setDragIdx(null)}
            className="select-none cursor-grab active:cursor-grabbing"
          >
            <TeamRow team={team} position={idx + 1} />
          </div>
        ))}
      </div>

    </motion.div>
  );
}
