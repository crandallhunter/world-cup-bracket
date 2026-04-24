// ─── Alchemy NFT API utility ─────────────────────────────────────────────────
// Fetches the specific token IDs a wallet holds for a given ERC-721 contract.
// Used at submission time to know which tokens to lock against the
// submission record (for both Meebits Futbol and Meebits).
//
// Uses Alchemy NFT API v3 (getNFTsForOwner).
//
// NOTE: Called client-side with NEXT_PUBLIC_ALCHEMY_API_KEY, which exposes
// the key to the browser bundle. Proxying through an API route is on the
// pre-launch checklist.

import {
  FUTBOL_CONTRACT,
  MEEBIT_CONTRACT,
  type GatingContract,
} from './nftContract';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '';
const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

/**
 * Fetch all token IDs a wallet holds for the given contract.
 * Returns an empty array on error or missing API key — the caller decides
 * whether to fall back to the Open tier or surface the failure.
 */
export async function getOwnedTokenIds(
  walletAddress: string,
  contract: GatingContract,
): Promise<string[]> {
  if (!ALCHEMY_API_KEY) {
    console.warn('[Alchemy] No API key configured — falling back to empty token list');
    return [];
  }

  const url = new URL(`${ALCHEMY_BASE_URL}/getNFTsForOwner`);
  url.searchParams.set('owner', walletAddress);
  url.searchParams.set('contractAddresses[]', contract.address.toLowerCase());
  url.searchParams.set('withMetadata', 'false');
  url.searchParams.set('pageSize', '100');

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('[Alchemy] API error:', res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const ownedNfts: { tokenId: string }[] = data.ownedNfts ?? [];
    return ownedNfts.map((nft) => nft.tokenId);
  } catch (err) {
    console.error('[Alchemy] Fetch failed:', err);
    return [];
  }
}

/** Fetch a wallet's token IDs across all gating contracts, keyed by collection. */
export async function getAllOwnedTokenIds(
  walletAddress: string,
): Promise<{ futbolTokenIds: string[]; meebitTokenIds: string[] }> {
  const [futbolTokenIds, meebitTokenIds] = await Promise.all([
    getOwnedTokenIds(walletAddress, FUTBOL_CONTRACT),
    getOwnedTokenIds(walletAddress, MEEBIT_CONTRACT),
  ]);
  return { futbolTokenIds, meebitTokenIds };
}
