// ─── Alchemy NFT API utility ─────────────────────────────────────────────────
// Fetches the specific token IDs held by a wallet for the Meebits Futbol contract.
// Uses the Alchemy NFT API v3 (getNFTsForOwner).

import { NFT_CONTRACT_ADDRESS } from './nftContract';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '';
const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

/**
 * Fetch all token IDs of the Meebits Futbol collection held by a wallet.
 * Returns an array of token ID strings.
 *
 * NOTE: This calls the Alchemy API from the client side using the public key.
 * For production, consider proxying through an API route to protect the key.
 */
export async function getOwnedTokenIds(walletAddress: string): Promise<string[]> {
  if (!ALCHEMY_API_KEY) {
    console.warn('[Alchemy] No API key configured — falling back to empty token list');
    return [];
  }

  const contractFilter = NFT_CONTRACT_ADDRESS.toLowerCase();
  const url = new URL(`${ALCHEMY_BASE_URL}/getNFTsForOwner`);
  url.searchParams.set('owner', walletAddress);
  url.searchParams.set('contractAddresses[]', contractFilter);
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
