'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBracketStore } from '@/store/bracketStore';
import { SCHEDULE } from '@/data/schedule';
import type { ScheduleRound } from '@/data/schedule';
import type { GroupLabel } from '@/types/tournament';
import { cn } from '@/lib/utils/cn';
import { MatchCard } from './MatchCard';

const GROUP_LABELS: GroupLabel[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

interface StageConfig {
  id: ScheduleRound;
  label: string;
  shortLabel: string;
}

const STAGES: StageConfig[] = [
  { id: 'GS',  label: 'Group Stage',   shortLabel: 'GS'    },
  { id: 'R32', label: 'Round of 32',   shortLabel: 'R32'   },
  { id: 'R16', label: 'Round of 16',   shortLabel: 'R16'   },
  { id: 'QF',  label: 'Quarterfinals', shortLabel: 'QF'    },
  { id: 'SF',  label: 'Semifinals',    shortLabel: 'SF'    },
  { id: '3P',  label: '3rd Place',     shortLabel: '3rd'   },
  { id: 'F',   label: 'Final',         shortLabel: 'Final' },
];

function matchCountForRound(round: ScheduleRound): number {
  return SCHEDULE.filter((m) => m.round === round).length;
}

export function ScheduleView() {
  const [activeStage, setActiveStage] = useState<ScheduleRound>('GS');
  const [activeGroup, setActiveGroup] = useState<GroupLabel>('A');

  const { groupStandings, knockoutBracket } = useBracketStore();

  // Build userGroupRankings for groups that are complete
  const userGroupRankings = (() => {
    const result = {} as Record<GroupLabel, [string, string, string, string]>;
    for (const g of GROUP_LABELS) {
      const standing = groupStandings[g];
      if (standing?.isComplete && standing.rankings) {
        result[g] = standing.rankings.map((t) => t.id) as [string, string, string, string];
      }
    }
    return result;
  })();

  // Filter matches for current view
  const visibleMatches = SCHEDULE.filter((m) => {
    if (m.round !== activeStage) return false;
    if (activeStage === 'GS' && m.group !== activeGroup) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Stage tabs */}
      <div className="relative flex items-center gap-0.5 overflow-x-auto pb-0.5">
        {STAGES.map((stage) => {
          const isActive = activeStage === stage.id;
          const count = matchCountForRound(stage.id);
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                isActive ? 'text-white' : 'text-white/35 hover:text-white/60',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="schedule-stage-dot"
                  className="absolute inset-0 rounded-lg bg-white/[0.07]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{stage.label}</span>
              <span className={cn(
                'relative text-[10px] font-normal',
                isActive ? 'text-white/40' : 'text-white/20',
              )}>
                · {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Group sub-tabs (Group Stage only) */}
      {activeStage === 'GS' && (
        <div className="flex items-center gap-1 flex-wrap">
          {GROUP_LABELS.map((g) => {
            const isActive = activeGroup === g;
            return (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={cn(
                  'relative px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors',
                  isActive
                    ? 'bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/30'
                    : 'bg-white/[0.04] text-white/35 border border-white/[0.07] hover:text-white/60 hover:bg-white/[0.07]',
                )}
              >
                {g}
              </button>
            );
          })}
        </div>
      )}

      {/* Match list */}
      <div className="space-y-3">
        {visibleMatches.length === 0 ? (
          <div className="text-center py-12 text-white/25 text-sm">No matches found.</div>
        ) : (
          visibleMatches.map((match) => {
            const bracketMatch = match.bracketMatchId
              ? knockoutBracket.find((km) => km.matchId === match.bracketMatchId)
              : undefined;

            return (
              <MatchCard
                key={match.matchNum}
                match={match}
                userGroupRankings={Object.keys(userGroupRankings).length > 0 ? userGroupRankings : undefined}
                bracketMatch={bracketMatch}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
