'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GroupStage } from '@/components/groups/GroupStage';
import { ThirdPlaceSelector } from '@/components/bracket/ThirdPlaceSelector';
import { BracketView } from '@/components/bracket/BracketView';
import { StageIntroModal } from '@/components/ui/StageIntroModal';
import { Button } from '@/components/ui/Button';
import { useBracketStore } from '@/store/bracketStore';
import { cn } from '@/lib/utils/cn';
import type { BracketStep } from '@/types/tournament';

const STEPS: { id: BracketStep; label: string }[] = [
  { id: 'GROUPS', label: 'Groups' },
  { id: 'THIRD_PLACE', label: '3rd Place' },
  { id: 'KNOCKOUT', label: 'Bracket' },
];

const STAGE_INTROS: Record<string, {
  icon: string;
  title: string;
  description: string;
  steps: string[];
  ctaLabel: string;
}> = {
  GROUPS: {
    icon: '🗂️',
    title: 'Stage 1 — Group Standings',
    description: 'The 2026 World Cup has 12 groups of 4 teams each. You need to predict the finishing order in every group.',
    steps: [
      'Drag and drop the teams within each group to rank them 1st through 4th.',
      'The % next to each team is their estimated tournament win probability from prediction markets.',
      'Top 2 from each group advance automatically. The best 8 third-place teams are picked in the next stage.',
      'Hit "Confirm Group X" when you\'re happy with a group, then move on to the next.',
    ],
    ctaLabel: 'Start Picking Groups',
  },
  THIRD_PLACE: {
    icon: '🥉',
    title: 'Stage 2 — Best 3rd-Place Teams',
    description: "In the 2026 format, 8 of the 12 third-place finishers also advance. You pick which 8 you think will make it.",
    steps: [
      'You\'ll see all 12 third-place teams from your group picks.',
      'Select exactly 8 teams — these are the ones you predict will have the best records among all third-place finishers.',
      'Your picks determine which side of the Round of 32 bracket those teams land on.',
    ],
    ctaLabel: 'Pick 8 Third-Place Teams',
  },
  KNOCKOUT: {
    icon: '⚔️',
    title: 'Stage 3 — Knockout Bracket',
    description: 'The bracket is now populated based on your group picks. Pick match winners all the way to the Final.',
    steps: [
      'Click a team in any match to advance them to the next round.',
      'Work left to right: Round of 32 → Round of 16 → Quarters → Semis → Final.',
      'You must pick a champion before you can submit.',
      'You can scroll horizontally to see the full bracket.',
    ],
    ctaLabel: 'Build My Bracket',
  },
};

const SEEN_KEY = 'wcb_seen_intros';

function getSeenIntros(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markIntroSeen(step: string) {
  if (typeof window === 'undefined') return;
  const seen = getSeenIntros();
  seen.add(step);
  sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

function clearSeenIntros() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SEEN_KEY);
}

const stepIndex = (step: BracketStep) => STEPS.findIndex((s) => s.id === step);

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

export default function BracketPage() {
  const { currentStep, goToStep, resetBracket } = useBracketStore();
  const [prevStepIdx, setPrevStepIdx] = useState(0);
  const [introStep, setIntroStep] = useState<string | null>(null);

  const currentIdx = stepIndex(currentStep);
  const direction = currentIdx - prevStepIdx;

  useEffect(() => {
    if (currentStep in STAGE_INTROS) {
      const seen = getSeenIntros();
      seen.delete(currentStep);
      sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
      setIntroStep(currentStep);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentStep in STAGE_INTROS) {
      const seen = getSeenIntros();
      if (!seen.has(currentStep)) {
        setIntroStep(currentStep);
      }
    }
  }, [currentStep]);

  function closeIntro() {
    if (introStep) markIntroSeen(introStep);
    setIntroStep(null);
  }

  function navigateTo(step: BracketStep) {
    setPrevStepIdx(currentIdx);
    goToStep(step);
  }

  const intro = introStep ? STAGE_INTROS[introStep] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {currentStep !== 'SUBMITTED' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigateTo(s.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  currentStep === s.id
                    ? 'bg-white/8 text-white'
                    : idx < currentIdx
                    ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    : 'text-white/20 cursor-not-allowed'
                )}
                disabled={idx > currentIdx}
              >
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border',
                    currentStep === s.id
                      ? 'border-white/40 bg-white/10 text-white'
                      : idx < currentIdx
                      ? 'border-white/20 bg-white/5 text-white/50'
                      : 'border-white/10 text-white/20'
                  )}
                >
                  {idx < currentIdx ? '✓' : idx + 1}
                </span>
                {s.label}
              </button>
              {idx < STEPS.length - 1 && (
                <div className={cn('h-px w-8 bg-white/8', idx < currentIdx && 'bg-white/15')} />
              )}
            </div>
          ))}

          <button
            className="ml-auto text-xs text-white/25 hover:text-white/50 transition-colors shrink-0 flex items-center gap-1"
            onClick={() => setIntroStep(currentStep)}
          >
            <span>?</span> How does this work
          </button>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {currentStep === 'GROUPS' && <GroupStage />}
          {currentStep === 'THIRD_PLACE' && <ThirdPlaceSelector />}
          {currentStep === 'KNOCKOUT' && <BracketView />}
          {currentStep === 'SUBMITTED' && (
            <div className="text-center py-16 space-y-4">
              <div className="text-5xl">🎉</div>
              <h2 className="text-2xl font-bold">Bracket Submitted!</h2>
              <p className="text-white/50">Check your submissions in My Brackets.</p>
              <Button variant="primary" onClick={() => { clearSeenIntros(); navigateTo('GROUPS'); }}>
                Build Another Bracket
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {intro && (
        <StageIntroModal
          isOpen={Boolean(introStep)}
          onClose={closeIntro}
          icon={intro.icon}
          title={intro.title}
          description={intro.description}
          steps={intro.steps}
          ctaLabel={intro.ctaLabel}
        />
      )}
    </div>
  );
}
