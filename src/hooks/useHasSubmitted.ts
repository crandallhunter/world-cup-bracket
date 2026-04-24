'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useIdentityStore } from '@/store/identityStore';

/**
 * Has this user already submitted a bracket?
 *
 * Reads the identifier from whichever identity is active — connected wallet
 * takes precedence, then email from the identity store — and queries the
 * submit API. The request is cached under a stable key (`['submission', id]`)
 * by TanStack Query, so every component that calls this hook shares one
 * in-flight fetch and one cache entry instead of fanning out.
 *
 * Returns `{ hasSubmitted: false }` in explore mode (no identity chosen)
 * and during initial load before the identity hydrates.
 */
export function useHasSubmitted(): {
  hasSubmitted: boolean;
  submissionId: string | undefined;
  isLoading: boolean;
  /** The identifier used to check (lowercased wallet address or email), or null. */
  identifier: string | null;
} {
  const { address, isConnected } = useAccount();
  const { identity } = useIdentityStore();

  const identifier =
    isConnected && address
      ? address.toLowerCase()
      : identity?.type === 'email'
        ? identity.email.toLowerCase()
        : null;

  const { data, isLoading } = useQuery({
    queryKey: ['submission', identifier],
    enabled: Boolean(identifier),
    queryFn: async () => {
      if (!identifier) return { exists: false };
      const res = await fetch(`/api/submit?identifier=${encodeURIComponent(identifier)}`);
      if (!res.ok) return { exists: false };
      return (await res.json()) as { exists: boolean; submissionId?: string };
    },
    // Submissions are rare events — 30 s is plenty. Re-fetches happen on
    // window focus / reconnect (React Query defaults), which covers the
    // "user just submitted" case without the rest of the app needing to
    // manually invalidate.
    staleTime: 30_000,
  });

  return {
    hasSubmitted: Boolean(data?.exists),
    submissionId: data?.submissionId,
    isLoading: Boolean(identifier) && isLoading,
    identifier,
  };
}
