'use client';

import { useAccount } from 'wagmi';
import { useNFTBalance } from './useNFTBalance';
import { useDelegatedBalance } from './useDelegatedBalance';
import { getDivisionForCount } from '@/lib/divisions';
import type { Division } from '@/lib/divisions';
import type { DelegatedVault } from './useDelegatedBalance';

/**
 * Returns the user's division based on their connected wallet's NFT
 * balance **plus** any NFTs held by vault wallets that delegated to
 * them via delegate.xyz.
 *
 * Division tier is driven by the total eligible count (direct + delegated).
 * If not connected, returns null (they may use email for Open tier instead).
 */
export function useUserDivision(): {
  division: Division | null;
  nftCount: number;
  directBalance: number;
  delegatedBalance: number;
  delegatedVaults: DelegatedVault[];
  isConnected: boolean;
  isLoading: boolean;
  address: string | undefined;
} {
  const { isConnected, address } = useAccount();
  const { balance: directBalance, isLoading: isDirectLoading } = useNFTBalance();
  const {
    delegatedBalance,
    vaults: delegatedVaults,
    isLoading: isDelegateLoading,
  } = useDelegatedBalance();

  if (!isConnected) {
    return {
      division: null,
      nftCount: 0,
      directBalance: 0,
      delegatedBalance: 0,
      delegatedVaults: [],
      isConnected: false,
      isLoading: false,
      address: undefined,
    };
  }

  const totalBalance = directBalance + delegatedBalance;
  const division = getDivisionForCount(totalBalance);

  return {
    division,
    nftCount: totalBalance,
    directBalance,
    delegatedBalance,
    delegatedVaults,
    isConnected: true,
    isLoading: isDirectLoading || isDelegateLoading,
    address,
  };
}
