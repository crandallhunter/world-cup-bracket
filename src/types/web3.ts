export interface NFTGateState {
  isConnected: boolean;
  walletAddress?: string;
  nftBalance: number;
  remainingSubmissions: number; // nftBalance - existingSubmissions.length
  isLoading: boolean;
  error?: string;
}
