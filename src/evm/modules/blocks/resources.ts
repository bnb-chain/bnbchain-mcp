import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Hash } from "viem"

import * as services from "@/evm/services/index.js"

export function registerBlockResources(server: McpServer) {
  // Get block by hash for a specific network
  server.resource(
    "block_by_hash",
    new ResourceTemplate("evm://{network}/block/hash/{blockHash}", {
      list: undefined
    }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const blockHash = params.blockHash as string
        const block = await services.getBlockByHash(blockHash as Hash, network)

        return {
          contents: [
            {
              uri: uri.href,
              text: services.helpers.formatJson(block)
            }
          ]
        }
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching block with hash: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Get block by number for a specific network
  server.resource(
    "evm_block_by_number",
    new ResourceTemplate("evm://{network}/block/{blockNumber}", {
      list: undefined
    }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const blockNumber = params.blockNumber as string
        const block = await services.getBlockByNumber(
          parseInt(blockNumber),
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: services.helpers.formatJson(block)
            }
          ]
        }
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching block: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Get latest block for a specific network
  server.resource(
    "evm_latest_block",
    new ResourceTemplate("evm://{network}/block/latest", { list: undefined }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const block = await services.getLatestBlock(network)

        return {
          contents: [
            {
              uri: uri.href,
              text: services.helpers.formatJson(block)
            }
          ]
        }
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching latest block: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Default latest block (Ethereum mainnet)
  server.resource("default_latest_block", "evm://block/latest", async (uri) => {
    try {
      const network = "bsc"
      const block = await services.getLatestBlock(network)

      return {
        contents: [
          {
            uri: uri.href,
            text: services.helpers.formatJson(block)
          }
        ]
      }
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching latest block: ${
              error instanceof Error ? error.message : String(error)
            }`
          }
        ]
      }
    }
  })
}
