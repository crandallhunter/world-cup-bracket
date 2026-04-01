'use client';

import { useState, useEffect, useRef } from 'react';
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

function ChampionModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const { knockoutBracket } = useBracketStore();
  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;

  if (!champion || champion.id === '__TBD__') return null;

  const champName = champion.isPlayoffWinner ? champion.placeholderLabel : champion.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: 'spring' as const, stiffness: 240, damping: 22 }}
        className="relative z-10 max-w-sm w-full"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#c9a84c]/30 bg-black p-8 text-center space-y-6">
          {/* Gold radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.15) 0%, transparent 65%)' }}
          />

          {/* Label */}
          <p className="relative text-[10px] font-semibold text-[#c9a84c]/70 uppercase tracking-[0.3em]">
            Your 2026 World Cup Champion
          </p>

          {/* Big flag */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 260, damping: 18, delay: 0.08 }}
            className="relative text-[96px] leading-none"
          >
            {getFlagEmoji(champion.flagCode)}
          </motion.div>

          {/* Country name */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="relative text-4xl font-black text-white tracking-tight"
          >
            {champName}
          </motion.h2>

          {/* CTAs */}
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

  // Auto-show modal when champion is first picked
  useEffect(() => {
    if (hasChampion && !prevHasChampion.current) {
      setShowModal(true);
    }
    prevHasChampion.current = hasChampion;
  }, [hasChampion]);

  return (
    <div className="space-y-4">
      {/* Champion badge (shown after modal is dismissed) */}
      <AnimatePresence>
        {hasChampion && !showModal && (
          <ChampionBadge onReopen={() => setShowModal(true)} />
        )}
      </AnimatePresence>

      {/* Bracket header with Polymarket note */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          % = tournament win probability
        </p>
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          via Polymarket
        </p>
      </div>

      {/* Scrollable bracket */}
      <div className="overflow-x-auto pb-3 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {ROUNDS.map(({ id, label }) => {
            const matches = getMatchesByRound(knockoutBracket, id);
            return (
              <div key={id} className="flex flex-col gap-2">
                <div className="text-[10px] font-semibold text-white/25 uppercase tracking-widest text-center pb-1.5 border-b border-white/6">
                  {label}
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

      {/* Champion modal overlay */}
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
