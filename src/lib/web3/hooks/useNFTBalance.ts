'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import {
  NFT_ABI,
  FUTBOL_CONTRACT,
  MEEBIT_CONTRACT,
  type GatingContract,
} from '../nftContract';

/**
 * Read the `balanceOf` of a specific ERC-721 contract for the connected wallet.
 * Parameterized so both Meebits Futbol and Meebits (original) gating can share
 * the same logic.
 */
export function useNFTBalance(contract: GatingContract) {
  const { address, isConnected } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: contract.address,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: mainnet.id,
    query: {
      enabled: Boolean(isConnected && address),
      retry: 1,
    },
  });

  const balance = data ? Number(data) : 0;

  return {
    balance,
    isLoading: isConnected && isLoading && !error,
    error: error?.message,
    address,
    isConnected,
  };
}

/** Convenience hook: connected wallet's Meebits Futbol balance. */
export function useFutbolBalance() {
  return useNFTBalance(FUTBOL_CONTRACT);
}

/** Convenience hook: connected wallet's Meebits (original) balance. */
export function useMeebitBalance() {
  return useNFTBalance(MEEBIT_CONTRACT);
}
