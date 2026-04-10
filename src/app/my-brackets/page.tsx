'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useIdentityStore } from '@/store/identityStore';
import { useUserDivision } from '@/lib/web3/hooks/useUserDivision';
import { DivisionBadge } from '@/components/divisions/DivisionBadge';
import { Flag } from '@/components/ui/Flag';
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

export default function MyBracketPage() {
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
      <div>
        <h1 className="text-2xl font-bold">My Bracket</h1>
      </div>

      {!hasIdentity ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center border border-white/8 rounded-2xl bg-white/[0.02]">
          <div className="text-4xl">🔗</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Connect to view your bracket</h3>
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
          <div className="text-4xl">⚽</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">You haven't submitted a bracket yet</h3>
            <p className="text-text-secondary text-sm max-w-xs">
              Build your bracket, pick your champion, and compete in the{' '}
              {division ? (
                <span className={`font-semibold bg-gradient-to-r ${division.color} bg-clip-text text-transparent`}>
                  {division.name}
                </span>
              ) : (
                'Free'
              )}{' '}
              division.
            </p>
          </div>
          {division && (
            <DivisionBadge division={division} size="md" />
          )}
          <Link
            href="/bracket"
            className="px-6 py-2.5 rounded-lg bg-white hover:bg-white/85 text-black font-medium transition-colors"
          >
            Build Your Bracket
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Submitted bracket card */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
            {/* Champion hero */}
            {submission.champion && (
              <div className="relative p-6 text-center border-b border-white/6">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.1) 0%, transparent 65%)' }}
                />
                <p className="relative text-[9px] font-semibold text-[#c9a84c]/50 uppercase tracking-[0.3em] mb-2">
                  Your Champion Pick
                </p>
                <div className="relative flex justify-center mb-2">
                  <Flag
                    flagCode={submission.champion.flagCode}
                    alt={submission.champion.name}
                    size={64}
                    className="rounded-md"
                  />
                </div>
                <h2 className="relative text-xl font-black text-white">
                  {submission.champion.name}
                </h2>
              </div>
            )}

            {/* Details */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {submission.divisionId && (
                  <DivisionBadge
                    division={getDivisionById(submission.divisionId)}
                    size="md"
                  />
                )}
                <div className="text-xs text-white/30">
                  Submitted{' '}
                  {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <Link
                href={`/my-brackets/${submission.id}`}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                View Full Bracket →
              </Link>
            </div>
          </div>

          {/* Bracket submitted confirmation */}
          <div className="text-center py-3">
            <p className="text-xs text-white/25">
              Your bracket is locked in. Good luck! 🍀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
