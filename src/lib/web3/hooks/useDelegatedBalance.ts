'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import {
  DELEGATE_REGISTRY_ADDRESS,
  DELEGATE_REGISTRY_ABI,
  DelegationType,
} from '../delegateRegistry';
import { NFT_ABI, NFT_CONTRACT_ADDRESS } from '../nftContract';

/** Vault wallet that delegated to the connected hot wallet. */
export interface DelegatedVault {
  /** Vault (cold) wallet address. */
  address: `0x${string}`;
  /** Number of Meebit Futbol NFTs the vault holds. */
  balance: number;
}

/**
 * Looks up all delegate.xyz v2 incoming delegations for the connected
 * wallet, filters for ones covering the Meebit Futbol contract (ALL or
 * CONTRACT delegation types), then reads `balanceOf` on each vault to
 * count how many NFTs they hold.
 *
 * Returns the total delegated balance (sum across all vaults) plus the
 * individual vault details for transparency in the UI.
 */
export function useDelegatedBalance() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const [delegatedBalance, setDelegatedBalance] = useState(0);
  const [vaults, setVaults] = useState<DelegatedVault[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Fetch all incoming delegations for the connected wallet
  const { data: delegations, isLoading: isDelegationsLoading } = useReadContract({
    address: DELEGATE_REGISTRY_ADDRESS,
    abi: DELEGATE_REGISTRY_ABI,
    functionName: 'getIncomingDelegations',
    args: address ? [address] : undefined,
    chainId: mainnet.id,
    query: {
      enabled: Boolean(isConnected && address),
      retry: 1,
      // Refresh every 2 minutes — delegations change infrequently
      staleTime: 2 * 60 * 1000,
    },
  });

  // Step 2: Filter for delegations covering our NFT contract, then
  // read balanceOf on each vault wallet.
  useEffect(() => {
    if (!delegations || !publicClient || !address) {
      setDelegatedBalance(0);
      setVaults([]);
      return;
    }

    const nftAddress = NFT_CONTRACT_ADDRESS.toLowerCase();

    // Filter: keep ALL delegations and CONTRACT delegations for our NFT
    const relevantVaults = new Set<`0x${string}`>();
    for (const d of delegations) {
      const type = Number(d.type_);
      if (type === DelegationType.ALL) {
        relevantVaults.add(d.from);
      } else if (
        type === DelegationType.CONTRACT &&
        d.contract_.toLowerCase() === nftAddress
      ) {
        relevantVaults.add(d.from);
      } else if (
        type === DelegationType.ERC721 &&
        d.contract_.toLowerCase() === nftAddress
      ) {
        // ERC721-level delegation also qualifies (specific token)
        relevantVaults.add(d.from);
      }
    }

    if (relevantVaults.size === 0) {
      setDelegatedBalance(0);
      setVaults([]);
      return;
    }

    // Read balanceOf for each vault in parallel
    let cancelled = false;
    setIsLoading(true);

    const vaultAddresses = Array.from(relevantVaults);

    Promise.all(
      vaultAddresses.map(async (vault): Promise<DelegatedVault> => {
        try {
          const balance = await publicClient.readContract({
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_ABI,
            functionName: 'balanceOf',
            args: [vault],
          });
          return { address: vault, balance: Number(balance) };
        } catch {
          return { address: vault, balance: 0 };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const withBalance = results.filter((v) => v.balance > 0);
      const total = withBalance.reduce((sum, v) => sum + v.balance, 0);
      setVaults(withBalance);
      setDelegatedBalance(total);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [delegations, publicClient, address]);

  return {
    /** Total NFTs across all delegating vaults. */
    delegatedBalance,
    /** Individual vault details. */
    vaults,
    /** True while fetching delegations or vault balances. */
    isLoading: (isConnected && isDelegationsLoading) || isLoading,
  };
}
