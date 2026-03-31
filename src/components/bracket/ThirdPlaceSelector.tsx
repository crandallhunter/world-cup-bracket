'use client';

import { motion } from 'framer-motion';
import { useBracketStore } from '@/store/bracketStore';
import { getAllThirdPlaceTeams } from '@/lib/tournament/thirdPlace';
import { getFlagEmoji } from '@/lib/tournament/teams';
import { OddsBadge } from '@/components/odds/OddsBadge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { ThirdPlaceTeam } from '@/lib/tournament/thirdPlace';

export function ThirdPlaceSelector() {
  const { groupStandings, selectedThirdPlace, setSelectedThirdPlace, goToStep, rebuildKnockoutBracket } =
    useBracketStore();

  const allThirds = getAllThirdPlaceTeams(groupStandings);

  function toggleTeam(team: ThirdPlaceTeam) {
    const isSelected = selectedThirdPlace.some((t) => t.id === team.id);
    if (isSelected) {
      setSelectedThirdPlace(selectedThirdPlace.filter((t) => t.id !== team.id));
    } else if (selectedThirdPlace.length < 8) {
      setSelectedThirdPlace([...selectedThirdPlace, team]);
    }
  }

  function handleContinue() {
    rebuildKnockoutBracket();
    goToStep('KNOCKOUT');
  }

  const selectedCount = selectedThirdPlace.length;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-white">Best 3rd-Place Teams</h2>
          <span className="text-sm tabular-nums text-white/40">
            {selectedCount}<span className="text-white/20">/8</span>
          </span>
        </div>
        <div className="h-px bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/30"
            animate={{ width: `${(selectedCount / 8) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {allThirds.map((team) => {
          const isSelected = selectedThirdPlace.some((t) => t.id === team.id);
          const isDisabled = !isSelected && selectedCount >= 8;

          return (
            <motion.button
              key={team.id}
              layout
              onClick={() => toggleTeam(team)}
              disabled={isDisabled}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-left transition-all',
                'disabled:opacity-25 disabled:cursor-not-allowed',
                isSelected
                  ? 'border-white/25 bg-white/8 text-white'
                  : 'border-white/6 bg-surface-2 hover:border-white/12 text-white/50 hover:text-white/80'
              )}
            >
              <span className="text-xl leading-none">{getFlagEmoji(team.flagCode)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {team.isPlayoffWinner ? team.placeholderLabel : team.name}
                </div>
                <div className="text-xs text-white/25">Group {team.sourceGroup}</div>
              </div>
              {!team.isPlayoffWinner && <OddsBadge teamId={team.id} />}
              {isSelected && <span className="text-white/50 text-sm shrink-0">✓</span>}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3 justify-between pt-1">
        <Button variant="ghost" size="md" onClick={() => goToStep('GROUPS')}>
          ← Back
        </Button>
        <Button variant="primary" size="md" disabled={selectedCount !== 8} onClick={handleContinue}>
          Build Bracket →
        </Button>
      </div>
    </div>
  );
}
