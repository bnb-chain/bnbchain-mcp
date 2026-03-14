import {
  type Address,
  type EstimateGasParameters,
  type Hash,
  type TransactionReceipt
} from "viem"

import { getPublicClient } from "./clients.js"

/**
 * Get a transaction by hash for a specific network
 */
export async function getTransaction(hash: Hash, network = "bsc-testnet") {
  const client = getPublicClient(network)
  return await client.getTransaction({ hash })
}

/**
 * Get a transaction receipt by hash for a specific network
 */
export async function getTransactionReceipt(
  hash: Hash,
  network = "bsc-testnet"
): Promise<TransactionReceipt> {
  const client = getPublicClient(network)
  return await client.getTransactionReceipt({ hash })
}

/**
 * Get the transaction count for an address for a specific network
 */
export async function getTransactionCount(
  address: Address,
  network = "bsc-testnet"
): Promise<number> {
  const client = getPublicClient(network)
  const count = await client.getTransactionCount({ address })
  return Number(count)
}

/**
 * Estimate gas for a transaction for a specific network
 */
export async function estimateGas(
  params: EstimateGasParameters,
  network = "bsc-testnet"
): Promise<bigint> {
  const client = getPublicClient(network)
  return await client.estimateGas(params)
}

/**
 * Get the chain ID for a specific network
 */
export async function getChainId(network = "bsc-testnet"): Promise<number> {
  const client = getPublicClient(network)
  const chainId = await client.getChainId()
  return Number(chainId)
}
