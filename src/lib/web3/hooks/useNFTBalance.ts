'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { NFT_ABI, NFT_CONTRACT_ADDRESS } from '../nftContract';

export function useNFTBalance() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
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
