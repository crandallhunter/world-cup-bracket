'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'World Cup Bracket Challenge 2026',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon],
  ssr: true,
});
