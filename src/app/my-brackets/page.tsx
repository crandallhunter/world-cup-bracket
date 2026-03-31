'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useBracketStore } from '@/store/bracketStore';
import { useNFTBalance } from '@/lib/web3/hooks/useNFTBalance';
import { WalletButton } from '@/components/wallet/WalletButton';
import { getFlagEmoji } from '@/lib/tournament/teams';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

const DEV_ADDRESS = process.env.NODE_ENV === 'development' ? '0xdevtest' : null;

export default function MyBracketsPage() {
  const { address: walletAddress, isConnected } = useAccount();
  const address = DEV_ADDRESS ?? walletAddress ?? undefined;
  const { balance: nftBalance, isLoading: nftLoading } = useNFTBalance();
  const isDev = process.env.NODE_ENV === 'development';
  const balance = isDev ? Math.max(nftBalance, 2) : nftBalance;
  const isLoading = isDev ? false : nftLoading;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { submittedBrackets, loadSubmissionsForAddress } = useBracketStore();

  useEffect(() => {
    if (address) {
      loadSubmissionsForAddress(address);
    }
  }, [address, loadSubmissionsForAddress]);

  if (!mounted) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner className="w-8 h-8 text-accent" />
    </div>
  );

  if (!isConnected && !DEV_ADDRESS) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="text-4xl">🔒</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Connect Your Wallet</h2>
          <p className="text-text-secondary text-sm">Connect to view your submitted brackets.</p>
        </div>
        <WalletButton />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8 text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Brackets</h1>
          <p className="text-text-secondary text-sm mt-1">
            {submittedBrackets.length} of {balance} bracket{balance !== 1 ? 's' : ''} submitted
          </p>
        </div>
        {submittedBrackets.length < balance && (
          <Link
            href="/bracket"
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            + New Bracket
          </Link>
        )}
      </div>

      {submittedBrackets.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center border border-border rounded-2xl bg-surface-2">
          <div className="text-4xl">📋</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No brackets yet</h3>
            <p className="text-text-secondary text-sm">
              {balance > 0
                ? `You have ${balance} bracket submission${balance !== 1 ? 's' : ''} available.`
                : 'You need an NFT to submit brackets.'}
            </p>
          </div>
          {balance > 0 && (
            <Link
              href="/bracket"
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
            >
              Build Your Bracket
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {submittedBrackets.map((bracket, idx) => {
            const champion = bracket.champion;
            const submittedDate = new Date(bracket.submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Link
                key={bracket.id}
                href={`/my-brackets/${bracket.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 hover:border-white/15 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-3 border border-border flex items-center justify-center text-sm font-bold text-text-muted shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Bracket #{idx + 1}</div>
                  <div className="text-xs text-text-muted">{submittedDate}</div>
                </div>
                {champion && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold/20 bg-gold/5">
                    <span className="text-lg">{getFlagEmoji(champion.flagCode)}</span>
                    <div>
                      <div className="text-xs text-gold font-medium">Champion Pick</div>
                      <div className="text-sm font-semibold text-text-primary">{champion.name}</div>
                    </div>
                  </div>
                )}
                <span className="text-white/20 group-hover:text-white/50 transition-colors text-lg shrink-0">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
