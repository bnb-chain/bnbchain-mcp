import type { Block, Hash } from "viem"

import { getPublicClient } from "./clients.js"

/** Default max transaction hashes to return in a block response. */
const DEFAULT_MAX_TX_HASHES = 100

export type BlockSummary = {
  number: bigint
  hash: Hash
  timestamp: bigint
  gasUsed: bigint
  gasLimit: bigint
  transactionCount: number
  transactionHashes?: Hash[]
  hasMoreTransactions?: boolean
}

/**
 * Get the current block number for a specific network
 */
export async function getBlockNumber(network = "ethereum"): Promise<bigint> {
  const client = getPublicClient(network)
  return await client.getBlockNumber()
}

/**
 * Get a block by number. Returns metadata and optionally transaction hashes (not full tx objects).
 */
export async function getBlockByNumber(
  blockNumber: number,
  network = "ethereum",
  options: {
    includeTransactionHashes?: boolean
    maxTransactionHashes?: number
  } = {}
): Promise<BlockSummary> {
  const {
    includeTransactionHashes = true,
    maxTransactionHashes = DEFAULT_MAX_TX_HASHES
  } = options
  const client = getPublicClient(network)
  const block = await client.getBlock({
    blockNumber: BigInt(blockNumber),
    includeTransactions: false
  })
  return blockToSummary(block, includeTransactionHashes, maxTransactionHashes)
}

/**
 * Get a block by hash. Returns metadata and optionally transaction hashes (not full tx objects).
 */
export async function getBlockByHash(
  blockHash: Hash,
  network = "ethereum",
  options: {
    includeTransactionHashes?: boolean
    maxTransactionHashes?: number
  } = {}
): Promise<BlockSummary> {
  const {
    includeTransactionHashes = true,
    maxTransactionHashes = DEFAULT_MAX_TX_HASHES
  } = options
  const client = getPublicClient(network)
  const block = await client.getBlock({
    blockHash,
    includeTransactions: false
  })
  return blockToSummary(block, includeTransactionHashes, maxTransactionHashes)
}

/**
 * Get the latest block. Returns metadata and optionally transaction hashes (not full tx objects).
 */
export async function getLatestBlock(
  network = "ethereum",
  options: {
    includeTransactionHashes?: boolean
    maxTransactionHashes?: number
  } = {}
): Promise<BlockSummary> {
  const {
    includeTransactionHashes = true,
    maxTransactionHashes = DEFAULT_MAX_TX_HASHES
  } = options
  const client = getPublicClient(network)
  const block = await client.getBlock({
    includeTransactions: false
  })
  return blockToSummary(block, includeTransactionHashes, maxTransactionHashes)
}

function blockToSummary(
  block: Block,
  includeHashes: boolean,
  maxHashes: number
): BlockSummary {
  if (block.number === null || block.hash === null) {
    throw new Error("Pending blocks are not supported")
  }
  const txList = block.transactions
  const hashes =
    includeHashes && Array.isArray(txList)
      ? (txList as Hash[]).slice(0, maxHashes)
      : undefined
  const count = Array.isArray(txList) ? txList.length : 0
  return {
    number: block.number,
    hash: block.hash,
    timestamp: block.timestamp,
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    transactionCount: count,
    ...(hashes !== undefined && {
      transactionHashes: hashes,
      hasMoreTransactions: count > maxHashes
    })
  }
}
