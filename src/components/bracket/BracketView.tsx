'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBracketStore } from '@/store/bracketStore';
import { getMatchesByRound } from '@/lib/tournament/r32Seeding';
import { getFlagEmoji } from '@/lib/tournament/teams';
import { BracketMatch } from './BracketMatch';
import { Button } from '@/components/ui/Button';
import { SubmitModal } from '@/components/submission/SubmitModal';
import type { KnockoutMatch } from '@/types/tournament';

const ROUNDS: { id: KnockoutMatch['round']; label: string }[] = [
  { id: 'R32', label: 'Round of 32' },
  { id: 'R16', label: 'Round of 16' },
  { id: 'QF', label: 'Quarterfinals' },
  { id: 'SF', label: 'Semifinals' },
  { id: 'F', label: 'Final' },
];

function isRoundComplete(matches: KnockoutMatch[]): boolean {
  return matches.length > 0 && matches.every((m) => m.winner && m.winner.id !== '__TBD__');
}

function ChampionModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const { knockoutBracket } = useBracketStore();
  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;

  if (!champion || champion.id === '__TBD__') return null;

  const champName = champion.isPlayoffWinner ? champion.placeholderLabel : champion.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: 'spring' as const, stiffness: 240, damping: 22 }}
        className="relative z-10 max-w-sm w-full"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#c9a84c]/30 bg-black p-8 text-center space-y-6">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.15) 0%, transparent 65%)' }}
          />
          <p className="relative text-[10px] font-semibold text-[#c9a84c]/70 uppercase tracking-[0.3em]">
            Your 2026 World Cup Champion
          </p>
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 260, damping: 18, delay: 0.08 }}
            className="relative text-[96px] leading-none"
          >
            {getFlagEmoji(champion.flagCode)}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="relative text-4xl font-black text-white tracking-tight"
          >
            {champName}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38 }}
            className="relative space-y-3"
          >
            <Button variant="primary" size="lg" className="w-full" onClick={() => { onClose(); onSubmit(); }}>
              Submit My Bracket →
            </Button>
            <button
              className="text-xs text-white/25 hover:text-white/50 transition-colors"
              onClick={onClose}
            >
              Keep editing
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ChampionBadge({ onReopen }: { onReopen: () => void }) {
  const { knockoutBracket } = useBracketStore();
  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;

  if (!champion || champion.id === '__TBD__') return null;

  const champName = champion.isPlayoffWinner ? champion.placeholderLabel : champion.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/5 self-start cursor-pointer hover:bg-[#c9a84c]/8 transition-colors"
      onClick={onReopen}
      title="Click to review champion"
    >
      <span className="text-lg leading-none">{getFlagEmoji(champion.flagCode)}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold text-[#c9a84c]/60 uppercase tracking-widest leading-none mb-0.5">
          Your Champion
        </p>
        <p className="text-sm font-bold text-white truncate">{champName}</p>
      </div>
    </motion.div>
  );
}

export function BracketView() {
  const { knockoutBracket, goToStep } = useBracketStore();
  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;
  const hasChampion = Boolean(champion && champion.id !== '__TBD__');

  const [showModal, setShowModal] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const prevHasChampion = useRef(false);

  // Refs for auto-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const roundRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevCompletedRounds = useRef<Set<string>>(new Set());

  const setRoundRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) roundRefs.current.set(id, el);
    else roundRefs.current.delete(id);
  }, []);

  // Build per-round match data
  const roundMatches = ROUNDS.map(({ id }) => ({
    id,
    matches: getMatchesByRound(knockoutBracket, id),
  }));

  // Auto-scroll when a round becomes complete
  useEffect(() => {
    const nowCompleted = new Set<string>();
    roundMatches.forEach(({ id, matches }) => {
      if (isRoundComplete(matches)) nowCompleted.add(id);
    });

    // Find rounds that just completed this render
    for (const { id } of ROUNDS) {
      if (nowCompleted.has(id) && !prevCompletedRounds.current.has(id)) {
        // Find the next round
        const currentIdx = ROUNDS.findIndex((r) => r.id === id);
        const nextRound = ROUNDS[currentIdx + 1];
        if (nextRound) {
          // Small delay so the last pick animates first
          setTimeout(() => {
            const nextEl = roundRefs.current.get(nextRound.id);
            const container = scrollContainerRef.current;
            if (nextEl && container) {
              const containerLeft = container.getBoundingClientRect().left;
              const elLeft = nextEl.getBoundingClientRect().left;
              const scrollLeft = container.scrollLeft + (elLeft - containerLeft) - 24;
              container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
          }, 400);
        }
      }
    }

    prevCompletedRounds.current = nowCompleted;
  }, [knockoutBracket]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-show champion modal when Final is picked
  useEffect(() => {
    if (hasChampion && !prevHasChampion.current) {
      setShowModal(true);
    }
    prevHasChampion.current = hasChampion;
  }, [hasChampion]);

  // Determine active round (first incomplete round that has at least one match available)
  const activeRoundId = (() => {
    for (const { id, matches } of roundMatches) {
      if (!isRoundComplete(matches)) return id;
    }
    return 'F';
  })();

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {hasChampion && !showModal && (
          <ChampionBadge onReopen={() => setShowModal(true)} />
        )}
      </AnimatePresence>

      {/* Bracket header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          % = tournament win probability
        </p>
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          via Polymarket
        </p>
      </div>

      {/* Scrollable bracket */}
      <div ref={scrollContainerRef} className="overflow-x-auto pb-3 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {roundMatches.map(({ id, matches }) => {
            const label = ROUNDS.find((r) => r.id === id)!.label;
            const complete = isRoundComplete(matches);
            const isActive = id === activeRoundId;

            return (
              <div
                key={id}
                ref={setRoundRef(id)}
                className="flex flex-col gap-2 transition-opacity duration-500"
                style={{ opacity: complete && !isActive ? 0.45 : 1 }}
              >
                {/* Round header */}
                <div className="relative text-center pb-1.5 border-b border-white/6">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300"
                    style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}
                  >
                    {label}
                  </span>
                  {/* Active round indicator dot */}
                  {isActive && (
                    <motion.span
                      layoutId="active-round-dot"
                      className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#6366f1]"
                    />
                  )}
                  {complete && (
                    <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </div>

                <div className="flex flex-col justify-around gap-2 flex-1">
                  {matches.map((match) => (
                    <BracketMatch
                      key={match.matchId}
                      match={match}
                      compact={id === 'R32' || id === 'R16'}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 justify-between pt-1">
        <Button variant="ghost" onClick={() => goToStep('THIRD_PLACE')}>
          ← 3rd Place Picks
        </Button>
        <Button variant="primary" size="md" disabled={!hasChampion} onClick={() => setSubmitOpen(true)}>
          Submit Bracket →
        </Button>
      </div>

      <AnimatePresence>
        {showModal && (
          <ChampionModal
            onClose={() => setShowModal(false)}
            onSubmit={() => setSubmitOpen(true)}
          />
        )}
      </AnimatePresence>

      <SubmitModal isOpen={submitOpen} onClose={() => setSubmitOpen(false)} />
    </div>
  );
}
