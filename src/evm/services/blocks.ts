import { type Block, type Hash } from "viem"

import { getPublicClient } from "./clients.js"

/**
 * Get the current block number for a specific network
 */
export async function getBlockNumber(network = "bsc-testnet"): Promise<bigint> {
  const client = getPublicClient(network)
  return await client.getBlockNumber()
}

/**
 * Get a block by number for a specific network
 */
export async function getBlockByNumber(
  blockNumber: number,
  network = "bsc-testnet"
): Promise<Block> {
  const client = getPublicClient(network)
  return await client.getBlock({ blockNumber: BigInt(blockNumber) })
}

/**
 * Get a block by hash for a specific network
 */
export async function getBlockByHash(
  blockHash: Hash,
  network = "bsc-testnet"
): Promise<Block> {
  const client = getPublicClient(network)
  return await client.getBlock({ blockHash })
}

/**
 * Get the latest block for a specific network
 */
export async function getLatestBlock(network = "bsc-testnet"): Promise<Block> {
  const client = getPublicClient(network)
  return await client.getBlock()
}
