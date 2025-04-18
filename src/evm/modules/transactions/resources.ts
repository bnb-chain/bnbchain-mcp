import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Hash } from "viem"

import * as services from "@/evm/services/index.js"

export function registerTransactionResources(server: McpServer) {
  // Get transaction by hash for a specific network
  server.resource(
    "evm_transaction_details",
    new ResourceTemplate("evm://{network}/tx/{txHash}", { list: undefined }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const txHash = params.txHash as string
        const tx = await services.getTransaction(txHash as Hash, network)

        return {
          contents: [
            {
              uri: uri.href,
              text: services.helpers.formatJson(tx)
            }
          ]
        }
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching transaction: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Default transaction by hash (Ethereum mainnet)
  server.resource(
    "default_transaction_by_hash",
    new ResourceTemplate("evm://tx/{txHash}", { list: undefined }),
    async (uri, params) => {
      try {
        const network = "bsc"
        const txHash = params.txHash as string
        const tx = await services.getTransaction(txHash as Hash, network)

        return {
          contents: [
            {
              uri: uri.href,
              text: services.helpers.formatJson(tx)
            }
          ]
        }
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching transaction: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )
}
