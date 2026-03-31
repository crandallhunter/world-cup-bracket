// Placeholder NFT contract — replace with real address before launch
export const NFT_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`) ??
  '0x0000000000000000000000000000000000000000';

export const NFT_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
