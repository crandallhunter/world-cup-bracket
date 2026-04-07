import type { DivisionId } from '@/lib/divisions';

export interface NFTGateState {
  isConnected: boolean;
  walletAddress?: string;
  nftBalance: number;
  ownedTokenIds: string[];
  divisionId: DivisionId;
  isLoading: boolean;
  error?: string;
}

/** Identity for submission — either a connected wallet or an email address */
export type UserIdentity =
  | { type: 'wallet'; address: string; tokenIds: string[]; divisionId: DivisionId }
  | { type: 'email'; email: string; divisionId: 'open' };
