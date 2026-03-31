'use client';

import { motion } from 'framer-motion';
import { useBracketStore } from '@/store/bracketStore';
import { GROUP_LABELS } from '@/lib/tournament/teams';
import { GroupCard } from './GroupCard';
import { Button } from '@/components/ui/Button';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
};

export function GroupStage() {
  const { groupStandings, currentGroupIndex, goToStep } = useBracketStore();
  const completedCount = Object.values(groupStandings).filter((s) => s.isComplete).length;
  const allDone = completedCount === 12;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/30 uppercase tracking-widest font-medium">Group Stage</span>
          <span className="text-white/50 tabular-nums">{completedCount} / 12 confirmed</span>
        </div>
        <div className="h-px bg-white/8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/30 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / 12) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Group grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {GROUP_LABELS.map((label, idx) => (
          <motion.div key={label} variants={cardVariants}>
            <GroupCard
              group={label}
              standing={groupStandings[label]}
              isActive={idx === currentGroupIndex}
            />
          </motion.div>
        ))}
      </motion.div>

      {allDone && (
        <motion.div
          className="flex justify-center pt-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="primary" size="lg" onClick={() => goToStep('THIRD_PLACE')}>
            Continue to 3rd Place Picks →
          </Button>
        </motion.div>
      )}
    </div>
  );
}
