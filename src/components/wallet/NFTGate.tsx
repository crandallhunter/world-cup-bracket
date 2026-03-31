'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useNFTBalance } from '@/lib/web3/hooks/useNFTBalance';
import { WalletButton } from './WalletButton';
import { Spinner } from '@/components/ui/Spinner';

interface NFTGateProps {
  children: React.ReactNode;
}

const DEV_BYPASS = process.env.NODE_ENV === 'development';

export function NFTGate({ children }: NFTGateProps) {
  const { isConnected, balance, isLoading } = useNFTBalance();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="w-8 h-8 text-accent" />
    </div>
  );

  if (DEV_BYPASS) return <>{children}</>;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 text-center">
        <div className="space-y-3">
          <div className="text-5xl">⚽</div>
          <h2 className="text-2xl font-bold text-text-primary">Connect Your Wallet</h2>
          <p className="text-text-secondary max-w-sm">
            Connect your wallet to check if you hold the required NFT and submit your bracket.
          </p>
        </div>
        <WalletButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="w-8 h-8 text-accent" />
        <p className="text-text-secondary text-sm">Checking NFT balance...</p>
      </div>
    );
  }

  if (balance === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 text-center">
        <div className="space-y-6 max-w-sm">
          <div className="mx-auto w-36 h-36 relative">
            <Image
              src="/meebits-futbol.png"
              alt="Meebits Futbol"
              fill
              className="object-contain"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-text-primary">Want to join in on the fun?</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              For each Meebits Futbol Avatar you hold you can submit 1 bracket to the contest.
            </p>
          </div>
        </div>
        <WalletButton />
      </div>
    );
  }

  return <>{children}</>;
}
