'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBracketStore } from '@/store/bracketStore';
import { useIdentityStore } from '@/store/identityStore';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { getMatchesByRound } from '@/lib/tournament/r32Seeding';
import { getOwnedTokenIds } from '@/lib/web3/alchemy';
import { getFlagEmoji } from '@/lib/tournament/teams';
import { BracketMatch } from './BracketMatch';
import { Button } from '@/components/ui/Button';
import { SubmitModal } from '@/components/submission/SubmitModal';
import { Spinner } from '@/components/ui/Spinner';
import type { KnockoutMatch } from '@/types/tournament';
import type { DivisionId } from '@/lib/divisions';

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

// ─── Champion Modal ──────────────────────────────────────────────────────────

function ChampionModal({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: (divisionId: DivisionId) => void }) {
  const { knockoutBracket, groupStandings, selectedThirdPlace, finalScore, setFinalScore } = useBracketStore();
  const { identity } = useIdentityStore();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;
  const finalMatch = knockoutBracket.find((m) => m.round === 'F');
  const homeTeam = finalMatch?.homeTeam;
  const awayTeam = finalMatch?.awayTeam;

  const [home, setHome] = useState(finalScore?.home ?? 0);
  const [away, setAway] = useState(finalScore?.away ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Email input for users who haven't set identity yet
  const [emailInput, setEmailInput] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);

  if (!champion || champion.id === '__TBD__') return null;

  const champName = champion.isPlayoffWinner ? champion.placeholderLabel : champion.name;

  // Determine if user can submit
  const hasWalletIdentity = identity?.type === 'wallet' || isConnected;
  const hasEmailIdentity = identity?.type === 'email';
  const canSubmit = hasWalletIdentity || hasEmailIdentity || showEmailField;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    setFinalScore({ home, away });

    try {
      let identityType: 'wallet' | 'email';
      let identifier: string;
      let tokenIds: string[] = [];

      if (hasWalletIdentity && address) {
        identityType = 'wallet';
        identifier = address;
        // Fetch token IDs from Alchemy
        try {
          tokenIds = await getOwnedTokenIds(address);
        } catch {
          // If Alchemy fails, submit with 0 tokens (Open tier)
          tokenIds = [];
        }
      } else if (hasEmailIdentity && identity?.type === 'email') {
        identityType = 'email';
        identifier = identity.email;
      } else if (showEmailField) {
        const trimmed = emailInput.trim().toLowerCase();
        if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
          setError('Please enter a valid email address.');
          setSubmitting(false);
          return;
        }
        identityType = 'email';
        identifier = trimmed;
      } else {
        setError('Please connect a wallet or enter an email to submit.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityType,
          identifier,
          tokenIds,
          groupStandings: Object.values(groupStandings),
          qualifiedThirdPlace: selectedThirdPlace,
          knockoutPicks: knockoutBracket,
          champion,
          finalScore: { home, away },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Submission failed. Please try again.');
        setSubmitting(false);
        return;
      }

      onClose();
      onSubmitted(data.divisionId as DivisionId);
    } catch (err) {
      console.error('[Submit] Error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

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
        className="relative z-10 max-w-sm w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#c9a84c]/30 bg-black p-8 text-center space-y-5">
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

          {/* Score prediction */}
          {homeTeam && awayTeam && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 }}
              className="relative space-y-3"
            >
              <div className="border-t border-white/8 pt-4 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">
                    Predict the Final Score
                  </p>
                  <span className="text-[9px] text-white/20 border border-white/10 rounded-full px-2 py-0.5">
                    tiebreaker
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-center gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xl">{getFlagEmoji(homeTeam.flagCode)}</span>
                  <span className="text-[10px] text-white/30 max-w-[72px] text-center truncate">
                    {homeTeam.isPlayoffWinner ? homeTeam.placeholderLabel : homeTeam.name}
                  </span>
                  <input
                    type="number" min={0} max={20} value={home}
                    onChange={(e) => setHome(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 h-14 text-center text-2xl font-black bg-white/6 border border-white/12 rounded-xl text-white focus:outline-none focus:border-white/35 transition-colors"
                  />
                </div>
                <span className="text-white/20 text-xl mb-3.5">—</span>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-xl">{getFlagEmoji(awayTeam.flagCode)}</span>
                  <span className="text-[10px] text-white/30 max-w-[72px] text-center truncate">
                    {awayTeam.isPlayoffWinner ? awayTeam.placeholderLabel : awayTeam.name}
                  </span>
                  <input
                    type="number" min={0} max={20} value={away}
                    onChange={(e) => setAway(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-14 h-14 text-center text-2xl font-black bg-white/6 border border-white/12 rounded-xl text-white focus:outline-none focus:border-white/35 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Identity section — show if no identity set yet */}
          {!hasWalletIdentity && !hasEmailIdentity && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative space-y-3 border-t border-white/8 pt-4"
            >
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">
                How do you want to submit?
              </p>
              <button
                onClick={() => openConnectModal?.()}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/20 text-amber-200 font-semibold text-sm hover:from-amber-500/30 hover:to-yellow-500/30 transition-all"
              >
                🔗 Connect Wallet
              </button>
              {!showEmailField ? (
                <button
                  onClick={() => setShowEmailField(true)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 text-white/60 text-sm hover:bg-white/[0.08] transition-all"
                >
                  ✉️ Submit with Email (Free Division)
                </button>
              ) : (
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                />
              )}
            </motion.div>
          )}

          {error && (
            <p className="relative text-sm text-red-400">{error}</p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48 }}
            className="relative space-y-3"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting || (!canSubmit)}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Submitting...
                </span>
              ) : (
                'Submit My Bracket →'
              )}
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

// ─── Champion Badge ──────────────────────────────────────────────────────────

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
      title="Click to review & submit"
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

// ─── Bracket View ────────────────────────────────────────────────────────────

export function BracketView() {
  const { knockoutBracket, goToStep } = useBracketStore();
  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;
  const hasChampion = Boolean(champion && champion.id !== '__TBD__');

  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedDivision, setSubmittedDivision] = useState<DivisionId | null>(null);
  const prevHasChampion = useRef(false);

  // Refs for auto-scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const roundRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevCompletedRounds = useRef<Set<string>>(new Set());

  const setRoundRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) roundRefs.current.set(id, el);
    else roundRefs.current.delete(id);
  }, []);

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

    for (const { id } of ROUNDS) {
      if (nowCompleted.has(id) && !prevCompletedRounds.current.has(id)) {
        const currentIdx = ROUNDS.findIndex((r) => r.id === id);
        const nextRound = ROUNDS[currentIdx + 1];
        if (nextRound) {
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

  // Auto-show modal when Final is picked
  useEffect(() => {
    if (hasChampion && !prevHasChampion.current) {
      setShowModal(true);
    }
    prevHasChampion.current = hasChampion;
  }, [hasChampion]);

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

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          % = tournament win probability
        </p>
        <p className="text-[10px] text-white/20 uppercase tracking-widest">
          via Polymarket
        </p>
      </div>

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
                <div className="relative text-center pb-1.5 border-b border-white/6">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300"
                    style={{ color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)' }}
                  >
                    {label}
                  </span>
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
        <Button variant="primary" size="md" disabled={!hasChampion} onClick={() => setShowModal(true)}>
          Submit Bracket →
        </Button>
      </div>

      <AnimatePresence>
        {showModal && (
          <ChampionModal
            onClose={() => setShowModal(false)}
            onSubmitted={(divisionId) => {
              setSubmittedDivision(divisionId);
              setShowSuccess(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Success modal — shown after submission completes */}
      <SubmitModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        divisionId={submittedDivision}
      />
    </div>
  );
}
