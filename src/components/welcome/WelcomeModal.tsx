'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { DIVISIONS } from '@/lib/divisions';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { useUserDivision } from '@/lib/web3/hooks/useUserDivision';
import { Button } from '@/components/ui/Button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: (identity?: { type: 'email'; email: string } | { type: 'wallet' } | { type: 'explore' }) => void;
}

type WelcomePhase = 'main' | 'email' | 'connected';

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [phase, setPhase] = useState<WelcomePhase>('main');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const { division, nftCount, isLoading } = useUserDivision();

  // If wallet just connected, switch to connected phase
  useEffect(() => {
    if (isConnected && phase === 'main') {
      setPhase('connected');
    }
  }, [isConnected, phase]);

  function handleEmailSubmit() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    onClose({ type: 'email', email: trimmed });
  }

  function handleConnectClick() {
    openConnectModal?.();
  }

  function handleConnectedContinue() {
    onClose({ type: 'wallet' });
  }

  function handleExplore() {
    onClose({ type: 'explore' });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 bg-[#0d0d0d] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {phase === 'main' && (
                <MainPhase
                  key="main"
                  onConnect={handleConnectClick}
                  onEmail={() => setPhase('email')}
                  onExplore={handleExplore}
                />
              )}
              {phase === 'email' && (
                <EmailPhase
                  key="email"
                  email={email}
                  error={emailError}
                  onEmailChange={(v) => { setEmail(v); setEmailError(''); }}
                  onSubmit={handleEmailSubmit}
                  onBack={() => setPhase('main')}
                />
              )}
              {phase === 'connected' && (
                <ConnectedPhase
                  key="connected"
                  division={division}
                  nftCount={nftCount}
                  isLoading={isLoading}
                  onContinue={handleConnectedContinue}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main phase ──────────────────────────────────────────────────────────────

function MainPhase({
  onConnect,
  onEmail,
  onExplore,
}: {
  onConnect: () => void;
  onEmail: () => void;
  onExplore: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="p-7"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🏆</div>
        <h2 className="text-xl font-bold text-white mb-1">Bracket Challenge 2026</h2>
        <p className="text-sm text-white/40">
          Build your bracket. Pick your champion. Compete for prizes.
        </p>
      </div>

      {/* Division tiers */}
      <div className="space-y-1 mb-6">
        <div className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-2 px-1">
          Divisions & Prizes
        </div>
        {DIVISIONS.map((div) => (
          <div
            key={div.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{div.icon}</span>
              <div>
                <span className={`text-sm font-semibold bg-gradient-to-r ${div.color} bg-clip-text text-transparent`}>
                  {div.name}
                </span>
                <span className="text-[11px] text-white/30 ml-2">
                  {div.id === 'open' ? 'Free' : `${div.minNFTs}+ NFTs`}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-white/20 font-mono">
              {div.prize}
            </span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="space-y-2.5">
        <button
          onClick={onConnect}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/20 text-amber-200 font-semibold text-sm hover:from-amber-500/30 hover:to-yellow-500/30 transition-all"
        >
          <span>🔗</span>
          Connect Wallet & Verify Holdings
        </button>

        <button
          onClick={onEmail}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8 text-white/70 font-medium text-sm hover:bg-white/[0.08] transition-all"
        >
          <span>✉️</span>
          Play with Email — Free Division
        </button>
      </div>

      {/* Explore link */}
      <div className="mt-4 text-center">
        <button
          onClick={onExplore}
          className="text-xs text-white/25 hover:text-white/50 transition-colors"
        >
          Just exploring for now — connect later to submit →
        </button>
      </div>
    </motion.div>
  );
}

// ─── Email phase ─────────────────────────────────────────────────────────────

function EmailPhase({
  email,
  error,
  onEmailChange,
  onSubmit,
  onBack,
}: {
  email: string;
  error: string;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="p-7"
    >
      <button
        onClick={onBack}
        className="text-xs text-white/30 hover:text-white/60 transition-colors mb-4"
      >
        ← Back
      </button>

      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🌍</div>
        <h2 className="text-lg font-bold text-white mb-1">Join the Free Division</h2>
        <p className="text-sm text-white/40">
          Enter your email to participate in the free community division. One bracket per email.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
          />
          {error && (
            <p className="text-red-400 text-xs mt-1.5 px-1">{error}</p>
          )}
        </div>

        <Button variant="primary" size="lg" className="w-full" onClick={onSubmit}>
          Continue to Bracket Builder
        </Button>
      </div>

      <p className="text-[11px] text-white/20 text-center mt-4 leading-relaxed">
        Your email is only used to identify your bracket submission. We won't spam you.
      </p>
    </motion.div>
  );
}

// ─── Connected phase ─────────────────────────────────────────────────────────

function ConnectedPhase({
  division,
  nftCount,
  isLoading,
  onContinue,
}: {
  division: ReturnType<typeof useUserDivision>['division'];
  nftCount: number;
  isLoading: boolean;
  onContinue: () => void;
}) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-7 text-center"
      >
        <div className="text-4xl mb-3 animate-pulse">🔍</div>
        <p className="text-sm text-white/50">Checking your NFT holdings...</p>
      </motion.div>
    );
  }

  const isNFTHolder = nftCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="p-7"
    >
      <div className="text-center mb-6">
        <motion.div
          className="text-5xl mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
        >
          {isNFTHolder ? division?.icon : '🌍'}
        </motion.div>

        {isNFTHolder ? (
          <>
            <h2 className="text-lg font-bold text-white mb-1">
              Welcome to the{' '}
              <span className={`bg-gradient-to-r ${division?.color} bg-clip-text text-transparent`}>
                {division?.name}
              </span>{' '}
              Division
            </h2>
            <p className="text-sm text-white/40 mb-3">
              {nftCount} Meebits Futbol NFT{nftCount !== 1 ? 's' : ''} detected
            </p>
            {division && (
              <div className="flex justify-center">
                <DivisionBadge division={division} size="lg" />
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-white mb-1">
              Welcome to the{' '}
              <span className="text-white/60">Free</span>{' '}
              Division
            </h2>
            <p className="text-sm text-white/40">
              No Meebits Futbol NFTs found — you can still build and submit your bracket in the Free division!
            </p>
          </>
        )}
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onContinue}>
        Build My Bracket →
      </Button>
    </motion.div>
  );
}
