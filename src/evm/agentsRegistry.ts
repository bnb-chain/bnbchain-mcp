/**
 * ERC-8004 registry addresses per chain.
 * Source: https://github.com/erc-8004/erc-8004-contracts
 * Only chains with official 8004 deployments are supported.
 */
export const ERC8004_IDENTITY_MAINNET =
  "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const
export const ERC8004_IDENTITY_TESTNET =
  "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const
export const ERC8004_REPUTATION_MAINNET =
  "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as const
export const ERC8004_REPUTATION_TESTNET =
  "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const

/** Chain IDs that have ERC-8004 Identity Registry deployed (mainnets). */
const MAINNET_CHAIN_IDS = [1, 56, 137, 42161, 8453] as const

/** Chain IDs that have ERC-8004 Identity Registry deployed (testnets). */
const TESTNET_CHAIN_IDS = [11155111, 97, 80002, 421614, 84532] as const

const MAINNET_SET = new Set<number>(MAINNET_CHAIN_IDS)
const TESTNET_SET = new Set<number>(TESTNET_CHAIN_IDS)

export interface ERC8004RegistryAddresses {
  identityRegistry: `0x${string}`
  reputationRegistry: `0x${string}`
}

/**
 * Get ERC-8004 registry addresses for a chain ID.
 * @throws if the chain does not have ERC-8004 deployed
 */
export function getERC8004Registries(
  chainId: number
): ERC8004RegistryAddresses {
  if (MAINNET_SET.has(chainId)) {
    return {
      identityRegistry: ERC8004_IDENTITY_MAINNET as `0x${string}`,
      reputationRegistry: ERC8004_REPUTATION_MAINNET as `0x${string}`
    }
  }
  if (TESTNET_SET.has(chainId)) {
    return {
      identityRegistry: ERC8004_IDENTITY_TESTNET as `0x${string}`,
      reputationRegistry: ERC8004_REPUTATION_TESTNET as `0x${string}`
    }
  }
  throw new Error(
    `ERC-8004 is not deployed on chain ID ${chainId}. Supported: BSC (56), BSC Testnet (97), Ethereum, Base, Polygon, Arbitrum, and other chains listed at https://github.com/erc-8004/erc-8004-contracts`
  )
}

/** Check if a chain ID supports ERC-8004. */
export function isERC8004SupportedChain(chainId: number): boolean {
  return MAINNET_SET.has(chainId) || TESTNET_SET.has(chainId)
}
