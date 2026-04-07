'use client';

import { useAccount } from 'wagmi';
import { useNFTBalance } from './useNFTBalance';
import { getDivisionForCount } from '@/lib/divisions';
import type { Division } from '@/lib/divisions';

/**
 * Returns the user's division based on their connected wallet and NFT balance.
 * If not connected, returns null (they may use email for Open tier instead).
 */
export function useUserDivision(): {
  division: Division | null;
  nftCount: number;
  isConnected: boolean;
  isLoading: boolean;
  address: string | undefined;
} {
  const { isConnected, address } = useAccount();
  const { balance, isLoading } = useNFTBalance();

  if (!isConnected) {
    return { division: null, nftCount: 0, isConnected: false, isLoading: false, address: undefined };
  }

  const division = getDivisionForCount(balance);

  return {
    division,
    nftCount: balance,
    isConnected: true,
    isLoading,
    address,
  };
}
