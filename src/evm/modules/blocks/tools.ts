import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Hash } from "viem"
import { z } from "zod"

import * as services from "@/evm/services/index.js"
import { mcpToolRes } from "@/utils/helper"
import { defaultNetworkParam } from "../common/types"

const blockOptionsSchema = {
  includeTransactionHashes: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "If true, include transaction hashes (not full tx data). Set false for metadata only."
    ),
  maxTransactionHashes: z
    .number()
    .min(1)
    .max(500)
    .optional()
    .default(100)
    .describe(
      "Max transaction hashes to return when includeTransactionHashes is true"
    )
}

function blockSummaryToJson(summary: services.BlockSummary) {
  return {
    ...summary,
    number: summary.number.toString(),
    timestamp: summary.timestamp.toString(),
    gasUsed: summary.gasUsed.toString(),
    gasLimit: summary.gasLimit.toString()
  }
}

export function registerBlockTools(server: McpServer) {
  server.tool(
    "get_block_by_hash",
    "Get block metadata by hash. Returns number, hash, timestamp, gasUsed, transaction count, and optionally transaction hashes (not full tx data).",
    {
      blockHash: z.string().describe("The block hash to look up"),
      network: defaultNetworkParam,
      ...blockOptionsSchema
    },
    async ({
      network,
      blockHash,
      includeTransactionHashes,
      maxTransactionHashes
    }) => {
      try {
        const block = await services.getBlockByHash(
          blockHash as Hash,
          network,
          {
            includeTransactionHashes,
            maxTransactionHashes
          }
        )
        return mcpToolRes.success(blockSummaryToJson(block))
      } catch (error) {
        return mcpToolRes.error(error, "fetching block by hash")
      }
    }
  )

  server.tool(
    "get_block_by_number",
    "Get block metadata by number. Returns number, hash, timestamp, gasUsed, transaction count, and optionally transaction hashes (not full tx data).",
    {
      blockNumber: z.string().describe("The block number to look up"),
      network: defaultNetworkParam,
      ...blockOptionsSchema
    },
    async ({
      network,
      blockNumber,
      includeTransactionHashes,
      maxTransactionHashes
    }) => {
      try {
        const block = await services.getBlockByNumber(
          Number.parseInt(blockNumber),
          network,
          { includeTransactionHashes, maxTransactionHashes }
        )
        return mcpToolRes.success(blockSummaryToJson(block))
      } catch (error) {
        return mcpToolRes.error(error, "fetching block by number")
      }
    }
  )

  server.tool(
    "get_latest_block",
    "Get the latest block metadata. Returns number, hash, timestamp, gasUsed, transaction count, and optionally transaction hashes (not full tx data).",
    {
      network: defaultNetworkParam,
      ...blockOptionsSchema
    },
    async ({ network, includeTransactionHashes, maxTransactionHashes }) => {
      try {
        const block = await services.getLatestBlock(network, {
          includeTransactionHashes,
          maxTransactionHashes
        })
        return mcpToolRes.success(blockSummaryToJson(block))
      } catch (error) {
        return mcpToolRes.error(error, "fetching latest block")
      }
    }
  )
}
