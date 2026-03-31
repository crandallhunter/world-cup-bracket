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
  const { knockoutBracket, submitBracket } = useBracketStore();

  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;

  function handleSubmit() {
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 space-y-5">
        {phase === 'confirm' ? (
          <>
            <div className="text-center space-y-2">
              <div className="text-4xl">🏆</div>
              <h2 className="text-xl font-bold">Submit Your Bracket</h2>
              {champion && (
                <p className="text-text-secondary text-sm">
                  You&apos;re picking{' '}
                  <span className="text-text-primary font-semibold">
                    {getFlagEmoji(champion.flagCode)} {champion.name}
                  </span>{' '}
                  to win the 2026 World Cup.
                </p>
              )}
              <p className="text-text-muted text-xs">This action cannot be undone.</p>
            </div>

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
                Confirm Submission
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
