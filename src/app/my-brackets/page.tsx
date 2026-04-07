'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useIdentityStore } from '@/store/identityStore';
import { useUserDivision } from '@/lib/web3/hooks/useUserDivision';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { getFlagEmoji } from '@/lib/tournament/teams';
import { getDivisionById } from '@/lib/divisions';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import type { DivisionId } from '@/lib/divisions';

interface ServerSubmission {
  id: string;
  divisionId: DivisionId;
  submittedAt: number;
  champion?: { name: string; flagCode: string };
}

export default function MyBracketsPage() {
  const [mounted, setMounted] = useState(false);
  const [submission, setSubmission] = useState<ServerSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  const { identity } = useIdentityStore();
  const { address, isConnected } = useAccount();
  const { division } = useUserDivision();

  useEffect(() => setMounted(true), []);

  // Fetch submission from API
  useEffect(() => {
    if (!mounted) return;

    const identifier = isConnected && address
      ? address
      : identity?.type === 'email'
      ? identity.email
      : null;

    if (!identifier) {
      setLoading(false);
      return;
    }

    fetch(`/api/submit?identifier=${encodeURIComponent(identifier)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exists) {
          setSubmission({
            id: data.submissionId ?? 'local',
            divisionId: data.divisionId,
            submittedAt: data.submittedAt,
            champion: data.champion,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mounted, isConnected, address, identity]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8 text-accent" />
      </div>
    );
  }

  const hasIdentity = isConnected || identity?.type === 'email';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bracket</h1>
          <p className="text-text-secondary text-sm mt-1">
            {submission ? '1 bracket submitted' : 'No brackets submitted'}
          </p>
        </div>
        {!submission && (
          <Link
            href="/bracket"
            className="px-4 py-2 rounded-lg bg-white hover:bg-white/85 text-black text-sm font-medium transition-colors"
          >
            + Build Bracket
          </Link>
        )}
      </div>

      {/* Current division */}
      {hasIdentity && division && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.02]">
          <DivisionBadge division={division} size="md" />
          <span className="text-sm text-white/40">
            Your current division based on NFT holdings
          </span>
        </div>
      )}

      {!hasIdentity ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center border border-white/8 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl">🔗</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Connect to view your brackets</h3>
            <p className="text-text-secondary text-sm max-w-xs">
              Connect your wallet or go to the bracket builder to set up your identity.
            </p>
          </div>
          <Link
            href="/bracket"
            className="px-6 py-2.5 rounded-lg bg-white hover:bg-white/85 text-black font-medium transition-colors"
          >
            Build Your Bracket
          </Link>
        </div>
      ) : !submission ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center border border-white/8 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl">📋</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No brackets yet</h3>
            <p className="text-text-secondary text-sm">Build your first bracket to get started.</p>
          </div>
          <Link
            href="/bracket"
            className="px-6 py-2.5 rounded-lg bg-white hover:bg-white/85 text-black font-medium transition-colors"
          >
            Build Your Bracket
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/[0.02]">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white/40 shrink-0">
              1
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">My Bracket</span>
                {submission.divisionId && (
                  <DivisionBadge
                    division={getDivisionById(submission.divisionId)}
                    size="sm"
                  />
                )}
              </div>
              <div className="text-xs text-white/30">
                {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            {submission.champion && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/5">
                <span className="text-lg">{getFlagEmoji(submission.champion.flagCode)}</span>
                <div>
                  <div className="text-xs text-[#c9a84c] font-medium">Champion</div>
                  <div className="text-sm font-semibold text-white">{submission.champion.name}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
