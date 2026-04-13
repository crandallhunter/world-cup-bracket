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
  const { groupStandings, markAllGroupsComplete, goToStep } = useBracketStore();
  const allDone = Object.values(groupStandings).every((s) => s.isComplete);

  function handleConfirmAll() {
    markAllGroupsComplete();
    goToStep('THIRD_PLACE');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40 uppercase tracking-widest font-medium">Group Stage</span>
        <span className="text-white/50 text-[11px]">Drag to reorder teams in each group</span>
      </div>

      {/* Group grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {GROUP_LABELS.map((label) => (
          <motion.div key={label} variants={cardVariants}>
            <GroupCard
              group={label}
              standing={groupStandings[label]}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="flex justify-center pt-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button variant="primary" size="lg" onClick={handleConfirmAll}>
          {allDone ? 'Continue to 3rd Place →' : 'Confirm All Groups & Continue →'}
        </Button>
      </motion.div>
    </div>
  );
}
