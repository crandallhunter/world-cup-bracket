'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// Alchemy RPC for reliable mainnet reads (NFT balance + token ID lookups)
const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const mainnetTransport = ALCHEMY_KEY
  ? http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
  : http('https://cloudflare-eth.com');

export const wagmiConfig = getDefaultConfig({
  appName: 'Meebits Futbol Bracket Challenge',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  chains: [mainnet],
  transports: {
    [mainnet.id]: mainnetTransport,
  },
  ssr: true,
});
