'use client';

import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ShareCard } from './ShareCard';
import { useBracketStore } from '@/store/bracketStore';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitModal({ isOpen, onClose }: SubmitModalProps) {
  const { knockoutBracket } = useBracketStore();
  const champion = knockoutBracket.find((m) => m.round === 'F')?.winner;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
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

          <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
            Close
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
