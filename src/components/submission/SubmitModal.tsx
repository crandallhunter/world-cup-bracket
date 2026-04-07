'use client';

import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ShareCard } from './ShareCard';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { getDivisionById } from '@/lib/divisions';
import { useBracketStore } from '@/store/bracketStore';
import type { DivisionId } from '@/lib/divisions';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisionId?: DivisionId | null;
}

export function SubmitModal({ isOpen, onClose, divisionId }: SubmitModalProps) {
  const { knockoutBracket } = useBracketStore();
  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;
  const division = divisionId ? getDivisionById(divisionId) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
              className="text-5xl"
            >
              🎉
            </motion.div>
            <h2 className="text-xl font-bold">Bracket Submitted!</h2>

            {division && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <DivisionBadge division={division} size="lg" />
              </motion.div>
            )}

            <p className="text-text-secondary text-sm">
              {division
                ? `You're competing in the ${division.name} division. Share your bracket!`
                : 'Your bracket has been saved. Share it with the world!'}
            </p>
          </div>

          <ShareCard champion={champion} />

          <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
            Close
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
