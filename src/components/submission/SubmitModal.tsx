'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ShareCard } from './ShareCard';
import { useBracketStore } from '@/store/bracketStore';
import { getFlagEmoji } from '@/lib/tournament/teams';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const [phase, setPhase] = useState<'confirm' | 'success'>('confirm');
  const [error, setError] = useState<string | null>(null);
  const { knockoutBracket, finalScore, setFinalScore, submitBracket } = useBracketStore();

  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;
  const finalMatch = knockoutBracket.find((m) => m.round === 'F');
  const homeTeam = finalMatch?.homeTeam;
  const awayTeam = finalMatch?.awayTeam;

  const [home, setHome] = useState(finalScore?.home ?? 0);
  const [away, setAway] = useState(finalScore?.away ?? 0);

  function handleSubmit() {
    setFinalScore({ home, away });
    const result = submitBracket();
    if (result.success) {
      setPhase('success');
    } else {
      setError(result.error ?? 'Submission failed');
    }
  }

  function handleClose() {
    setPhase('confirm');
    setError(null);
    onClose();
  }

  const champName = champion
    ? champion.isPlayoffWinner
      ? champion.placeholderLabel
      : champion.name
    : null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 space-y-5">
        {phase === 'confirm' ? (
          <>
            {/* Champion summary */}
            {champion && champName && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/5">
                <span className="text-4xl leading-none">{getFlagEmoji(champion.flagCode)}</span>
                <div>
                  <p className="text-[10px] font-semibold text-[#c9a84c]/60 uppercase tracking-widest mb-0.5">
                    Your Champion
                  </p>
                  <p className="text-xl font-black text-white">{champName}</p>
                </div>
              </div>
            )}

            {/* Optional score prediction */}
            {homeTeam && awayTeam && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                    Final Score Prediction
                  </p>
                  <span className="text-[10px] text-white/20 border border-white/10 rounded-full px-2 py-0.5">
                    Optional tiebreaker
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  {/* Home */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xl leading-none">{getFlagEmoji(homeTeam.flagCode)}</span>
                    <span className="text-[10px] text-white/30 max-w-[72px] text-center truncate">
                      {homeTeam.isPlayoffWinner ? homeTeam.placeholderLabel : homeTeam.name}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={home}
                      onChange={(e) => setHome(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 h-14 text-center text-2xl font-black bg-white/6 border border-white/12 rounded-xl text-white focus:outline-none focus:border-white/35 transition-colors"
                    />
                  </div>

                  <span className="text-white/20 text-xl">—</span>

                  {/* Away */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xl leading-none">{getFlagEmoji(awayTeam.flagCode)}</span>
                    <span className="text-[10px] text-white/30 max-w-[72px] text-center truncate">
                      {awayTeam.isPlayoffWinner ? awayTeam.placeholderLabel : awayTeam.name}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={away}
                      onChange={(e) => setAway(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 h-14 text-center text-2xl font-black bg-white/6 border border-white/12 rounded-xl text-white focus:outline-none focus:border-white/35 transition-colors"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-white/20 text-center">
                  Used to break ties on the leaderboard if multiple brackets pick the same champion
                </p>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" size="md" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" className="flex-1" onClick={handleSubmit}>
                Submit Bracket →
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
              <h2 className="text-xl font-bold">Bracket Submitted!</h2>
              <p className="text-text-secondary text-sm">
                Your bracket has been saved. Share it with the world!
              </p>
            </div>

            <ShareCard champion={champion} />

            <Button variant="ghost" size="sm" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
