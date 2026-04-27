// ─── ENS reverse-resolution helper ───────────────────────────────────────────
// Server-side only. Resolves an Ethereum address to its primary ENS name
// (the one set in the ENS reverse registrar) so the leaderboard can show
// "vitalik.eth" instead of "0xd8da...6045".
//
// Used at submission time: if a wallet user doesn't pick a username, we
// run this with a 2 s timeout and persist the result on the submission
// row. We DON'T resolve at every leaderboard render — that's an N-call
// fan-out that turns a fast page into a multi-second wait.

import { createPublicClient, http, type Address } from 'viem';
import { mainnet } from 'viem/chains';

const ENS_TIMEOUT_MS = 2000;

// Public RPC. For production-grade reliability we'd want a paid endpoint
// (Alchemy / Infura) — but ENS reverse resolution is a happy-path nicety,
// not a critical path. If it fails or times out, the user just doesn't
// get an ensName on their submission.
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race<T | null>([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Resolve a wallet's primary ENS name. Returns `null` on no record,
 * timeout, or any error. Never throws.
 */
export async function resolveEnsName(address: string): Promise<string | null> {
  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return null;
  }
  try {
    const name = await withTimeout(
      client.getEnsName({ address: address as Address }),
      ENS_TIMEOUT_MS,
    );
    return name ?? null;
  } catch {
    return null;
  }
}
