// ─── Gating NFT contracts ────────────────────────────────────────────────────
// Two contracts gate division tiers:
//   - Meebits Futbol (ERC-721A) gates Bronze (1+) and Silver (3+).
//   - Meebits (the original collection) gates Gold (1+).
//
// Division tier resolution is in src/lib/divisions.ts (getDivisionForHoldings).

export interface GatingContract {
  /** Display name, used in UI copy and telemetry. */
  name: string;
  /** Lowercased checksum-insensitive on-chain address. */
  address: `0x${string}`;
  /** Short key used as a discriminator in API payloads and the DB. */
  key: 'futbol' | 'meebit';
}

/** Meebits Futbol (ERC-721A). Bronze and Silver gating. */
export const FUTBOL_CONTRACT: GatingContract = {
  name: 'Meebits Futbol',
  address:
    (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
    '0x8fBb231840BeDF8a49080Ac3001B9c97BF35f4E9',
  key: 'futbol',
};

/** Meebits (original collection). Gold gating. */
export const MEEBIT_CONTRACT: GatingContract = {
  name: 'Meebits',
  address:
    (process.env.NEXT_PUBLIC_MEEBIT_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
    '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7',
  key: 'meebit',
};

/** All gating contracts, iteration order doesn't matter. */
export const GATING_CONTRACTS = [FUTBOL_CONTRACT, MEEBIT_CONTRACT] as const;

/** Minimal ERC-721 ABI — only balanceOf is needed for gating checks. */
export const NFT_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
