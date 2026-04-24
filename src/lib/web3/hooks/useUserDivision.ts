'use client';

import { useAccount } from 'wagmi';
import { useFutbolBalance, useMeebitBalance } from './useNFTBalance';
import {
  useDelegatedFutbolBalance,
  useDelegatedMeebitBalance,
} from './useDelegatedBalance';
import { getDivisionForHoldings } from '@/lib/divisions';
import type { Division, NFTHoldings } from '@/lib/divisions';
import type { DelegatedVault } from './useDelegatedBalance';

/**
 * Compute the connected wallet's division using holdings across BOTH gating
 * collections, including delegate.xyz-delegated NFTs:
 *   - Meebits Futbol (direct + delegated) → Bronze / Silver
 *   - Meebits (direct + delegated)        → Gold
 *
 * Returns per-collection breakdowns so the UI can show "X Meebits Futbol +
 * Y Meebits" rather than a single meaningless total.
 */
export function useUserDivision(): {
  division: Division | null;
  /** Total direct + delegated across both collections — used for "X NFTs held" headline copy. */
  nftCount: number;
  holdings: NFTHoldings;
  futbol: { direct: number; delegated: number; vaults: DelegatedVault[] };
  meebit: { direct: number; delegated: number; vaults: DelegatedVault[] };
  /** @deprecated Use `holdings.futbolCount`. Kept for UI that hasn't been refactored yet. */
  directBalance: number;
  /** @deprecated Use per-collection delegated counts. */
  delegatedBalance: number;
  /** @deprecated Use per-collection vaults. */
  delegatedVaults: DelegatedVault[];
  isConnected: boolean;
  isLoading: boolean;
  address: string | undefined;
} {
  const { isConnected, address } = useAccount();

  const { balance: futbolDirect, isLoading: isFutbolLoading } = useFutbolBalance();
  const { balance: meebitDirect, isLoading: isMeebitLoading } = useMeebitBalance();

  const {
    delegatedBalance: futbolDelegated,
    vaults: futbolVaults,
    isLoading: isFutbolDelegateLoading,
  } = useDelegatedFutbolBalance();
  const {
    delegatedBalance: meebitDelegated,
    vaults: meebitVaults,
    isLoading: isMeebitDelegateLoading,
  } = useDelegatedMeebitBalance();

  if (!isConnected) {
    return {
      division: null,
      nftCount: 0,
      holdings: { futbolCount: 0, meebitCount: 0 },
      futbol: { direct: 0, delegated: 0, vaults: [] },
      meebit: { direct: 0, delegated: 0, vaults: [] },
      directBalance: 0,
      delegatedBalance: 0,
      delegatedVaults: [],
      isConnected: false,
      isLoading: false,
      address: undefined,
    };
  }

  const holdings: NFTHoldings = {
    futbolCount: futbolDirect + futbolDelegated,
    meebitCount: meebitDirect + meebitDelegated,
  };

  const division = getDivisionForHoldings(holdings);

  return {
    division,
    nftCount: holdings.futbolCount + holdings.meebitCount,
    holdings,
    futbol: { direct: futbolDirect, delegated: futbolDelegated, vaults: futbolVaults },
    meebit: { direct: meebitDirect, delegated: meebitDelegated, vaults: meebitVaults },
    directBalance: holdings.futbolCount, // deprecated — keep for old callers
    delegatedBalance: futbolDelegated + meebitDelegated,
    delegatedVaults: [...futbolVaults, ...meebitVaults],
    isConnected: true,
    isLoading:
      isFutbolLoading ||
      isMeebitLoading ||
      isFutbolDelegateLoading ||
      isMeebitDelegateLoading,
    address,
  };
}
