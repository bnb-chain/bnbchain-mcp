import {
  http,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type Transport,
  type WalletClient,
  createPublicClient,
  createWalletClient
} from "viem"
import { type PrivateKeyAccount, privateKeyToAccount } from "viem/accounts"

import { getChain, getRpcUrl } from "../chains.js"

// Cache for clients to avoid recreating them for each request
const clientCache = new Map<string, PublicClient>()

/**
 * Get a public client for a specific network
 */
export function getPublicClient(network = "ethereum"): PublicClient {
  const cacheKey = String(network)

  // Return cached client if available
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey) as PublicClient
  }

  // Create a new client
  const chain = getChain(network)
  const rpcUrl = getRpcUrl(network)

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl)
  })

  // Cache the client
  clientCache.set(cacheKey, client)

  return client
}

/**
 * Create a wallet client for a specific network and private key
 */
export function getWalletClient(
  privateKey: Hex,
  network = "ethereum"
): WalletClient<Transport, Chain, PrivateKeyAccount> {
  const chain = getChain(network)
  const rpcUrl = getRpcUrl(network)
  const account = privateKeyToAccount(privateKey)

  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl)
  }) as WalletClient<Transport, Chain, PrivateKeyAccount>
}

/**
 * Get an Ethereum address from a private key
 * @param privateKey The private key in hex format (with or without 0x prefix)
 * @returns The Ethereum address derived from the private key
 */
export function getAddressFromPrivateKey(privateKey: Hex): Address {
  const account = privateKeyToAccount(privateKey)
  return account.address
}
