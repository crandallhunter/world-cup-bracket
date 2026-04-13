// ─── Delegate.xyz v2 Registry ────────────────────────────────────────────────
// On-chain delegation registry that lets a cold/vault wallet delegate authority
// to a hot wallet. We read incoming delegations for the connected wallet, then
// filter for ones covering our NFT contract (ALL or CONTRACT type).
//
// Registry: 0x00000000000000447e69651d841bD8D104Bed493 (same on all EVM chains)
// Docs: https://docs.delegate.xyz

/** Delegate.xyz v2 registry — deployed at the same address on every EVM chain. */
export const DELEGATE_REGISTRY_ADDRESS =
  '0x00000000000000447e69651d841bD8D104Bed493' as const;

/**
 * Minimal ABI for the two view functions we need:
 * - getIncomingDelegations(to) → Delegation[]
 *   Returns every delegation where `to` is the delegate (hot wallet).
 *
 * - checkDelegateForContract(to, from, contract, rights) → bool
 *   Returns true if `to` is delegated by `from` for a specific contract.
 */
export const DELEGATE_REGISTRY_ABI = [
  {
    name: 'getIncomingDelegations',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [
      {
        name: 'delegations_',
        type: 'tuple[]',
        components: [
          { name: 'type_', type: 'uint8' },
          { name: 'to', type: 'address' },
          { name: 'from', type: 'address' },
          { name: 'rights', type: 'bytes32' },
          { name: 'contract_', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

/** Delegation type enum from the registry contract. */
export enum DelegationType {
  NONE = 0,
  ALL = 1,
  CONTRACT = 2,
  ERC721 = 3,
  ERC20 = 4,
  ERC1155 = 5,
}
