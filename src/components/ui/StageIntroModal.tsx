'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface StageIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: string;
  title: string;
  description: string;
  steps: string[];
  ctaLabel?: string;
}

export function StageIntroModal({
  isOpen,
  onClose,
  icon,
  title,
  description,
  steps,
  ctaLabel = "Let's go",
}: StageIntroModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 bg-[#0d0d0d] border border-white/10 rounded-2xl max-w-md w-full p-7 shadow-2xl"
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          >
            {/* Icon */}
            <div className="text-4xl mb-4">{icon}</div>

            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>

            {/* Description */}
            <p className="text-sm text-white/50 mb-5 leading-relaxed">{description}</p>

            {/* Steps */}
            <ul className="space-y-2.5 mb-7">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/70 leading-snug">{step}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={onClose}
            >
              {ctaLabel}
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
