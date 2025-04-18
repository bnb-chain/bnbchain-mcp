import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js"

import { getRpcUrl, getSupportedNetworks } from "@/evm/chains.js"
import * as services from "@/evm/services/index.js"

export function registerNetworkResources(server: McpServer) {
  // Get EVM info for a specific network
  server.resource(
    "chain_info_by_network",
    new ResourceTemplate("evm://{network}/chain", { list: undefined }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const chainId = await services.getChainId(network)
        const blockNumber = await services.getBlockNumber(network)
        const rpcUrl = getRpcUrl(network)

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  network,
                  chainId,
                  blockNumber: blockNumber.toString(),
                  rpcUrl
                },
                null,
                2
              )
            }
          ]
        }
      } catch (error) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `Error fetching chain info: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Default chain info (BSC mainnet)
  server.resource("bnb_chain_info", "evm://chain", async (uri) => {
    try {
      const network = "bsc"
      const chainId = await services.getChainId(network)
      const blockNumber = await services.getBlockNumber(network)
      const rpcUrl = getRpcUrl(network)

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(
              {
                network,
                chainId,
                blockNumber: blockNumber.toString(),
                rpcUrl
              },
              null,
              2
            )
          }
        ]
      }
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching chain info: ${
              error instanceof Error ? error.message : String(error)
            }`
          }
        ]
      }
    }
  })

  // Get supported networks
  server.resource("supported_networks", "evm://networks", async (uri) => {
    try {
      const networks = getSupportedNetworks()

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(
              {
                supportedNetworks: networks
              },
              null,
              2
            )
          }
        ]
      }
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error fetching supported networks: ${
              error instanceof Error ? error.message : String(error)
            }`
          }
        ]
      }
    }
  })
}
