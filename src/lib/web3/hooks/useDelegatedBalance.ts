'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import {
  DELEGATE_REGISTRY_ADDRESS,
  DELEGATE_REGISTRY_ABI,
  DelegationType,
} from '../delegateRegistry';
import {
  NFT_ABI,
  FUTBOL_CONTRACT,
  MEEBIT_CONTRACT,
  type GatingContract,
} from '../nftContract';

/** Vault wallet that delegated to the connected hot wallet. */
export interface DelegatedVault {
  /** Vault (cold) wallet address. */
  address: `0x${string}`;
  /** NFT balance this vault contributes. */
  balance: number;
}

/**
 * Look up incoming delegate.xyz v2 delegations for the connected wallet,
 * keep the ones that cover the supplied gating contract (ALL, CONTRACT, or
 * ERC721 delegation types), then read `balanceOf` on each vault to sum the
 * delegated NFT count.
 *
 * Parameterized so we can call it once per gating contract (Meebits Futbol
 * and Meebits). The hook handles the two contracts completely independently
 * — delegations that name only one contract don't leak into the other.
 */
export function useDelegatedBalance(contract: GatingContract) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: mainnet.id });
  const [delegatedBalance, setDelegatedBalance] = useState(0);
  const [vaults, setVaults] = useState<DelegatedVault[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Fetch all incoming delegations for the connected wallet.
  const { data: delegations, isLoading: isDelegationsLoading } = useReadContract({
    address: DELEGATE_REGISTRY_ADDRESS,
    abi: DELEGATE_REGISTRY_ABI,
    functionName: 'getIncomingDelegations',
    args: address ? [address] : undefined,
    chainId: mainnet.id,
    query: {
      enabled: Boolean(isConnected && address),
      retry: 1,
      // Delegations change infrequently — refresh every 2 minutes.
      staleTime: 2 * 60 * 1000,
    },
  });

  // Step 2: Filter delegations for ones that cover `contract`, then read
  // balanceOf on each vault.
  useEffect(() => {
    if (!delegations || !publicClient || !address) {
      setDelegatedBalance(0);
      setVaults([]);
      return;
    }

    const contractAddress = contract.address.toLowerCase();
    const relevantVaults = new Set<`0x${string}`>();

    for (const d of delegations) {
      const type = Number(d.type_);
      if (type === DelegationType.ALL) {
        relevantVaults.add(d.from);
      } else if (
        (type === DelegationType.CONTRACT || type === DelegationType.ERC721) &&
        d.contract_.toLowerCase() === contractAddress
      ) {
        relevantVaults.add(d.from);
      }
    }

    if (relevantVaults.size === 0) {
      setDelegatedBalance(0);
      setVaults([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const vaultAddresses = Array.from(relevantVaults);

    Promise.all(
      vaultAddresses.map(async (vault): Promise<DelegatedVault> => {
        try {
          const balance = await publicClient.readContract({
            address: contract.address,
            abi: NFT_ABI,
            functionName: 'balanceOf',
            args: [vault],
          });
          return { address: vault, balance: Number(balance) };
        } catch {
          return { address: vault, balance: 0 };
        }
      }),
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
  }, [delegations, publicClient, address, contract.address]);

  return {
    delegatedBalance,
    vaults,
    isLoading: (isConnected && isDelegationsLoading) || isLoading,
  };
}

/** Convenience: delegated balance of Meebits Futbol. */
export function useDelegatedFutbolBalance() {
  return useDelegatedBalance(FUTBOL_CONTRACT);
}

/** Convenience: delegated balance of Meebits (original). */
export function useDelegatedMeebitBalance() {
  return useDelegatedBalance(MEEBIT_CONTRACT);
}
