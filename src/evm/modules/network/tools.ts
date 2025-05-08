import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { normalize } from "viem/ens"
import { z } from "zod"

import { getRpcUrl, getSupportedNetworks } from "@/evm/chains.js"
import * as services from "@/evm/services/index.js"
import { safeStringify } from "@/utils/helper"
import { defaultNetworkParam } from "../common/types.js"

export function registerNetworkTools(server: McpServer) {
  // Get EVM info for a specific network
  server.tool(
    "get_chain_info",
    "Get chain information for a specific network",
    {
      network: defaultNetworkParam
    },
    async ({ network }) => {
      try {
        const chainId = await services.getChainId(network)
        const blockNumber = await services.getBlockNumber(network)
        const rpcUrl = getRpcUrl(network)

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  network,
                  chainId,
                  blockNumber: blockNumber.toString(),
                  rpcUrl
                },
                2
              )
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching chain info: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        }
      }
    }
  )

  // Get supported networks
  server.tool(
    "get_supported_networks",
    "Get list of supported networks",
    {},
    async () => {
      try {
        const networks = getSupportedNetworks()

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  supportedNetworks: networks
                },
                2
              )
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching supported networks: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        }
      }
    }
  )

  // Resolve ENS name to address
  server.tool(
    "resolve_ens",
    "Resolve an ENS name to an EVM address (not supported on BSC)",
    {
      ensName: z.string().describe("ENS name to resolve (e.g., 'vitalik.eth')"),
      network: defaultNetworkParam.default("eth")
    },
    async ({ ensName, network }) => {
      try {
        // Validate that the input is an ENS name
        if (!ensName.includes(".")) {
          return {
            content: [
              {
                type: "text",
                text: `Error: Input "${ensName}" is not a valid ENS name. ENS names must contain a dot (e.g., 'name.eth').`
              }
            ],
            isError: true
          }
        }

        // Normalize the ENS name
        const normalizedEns = normalize(ensName)

        // Resolve the ENS name to an address
        const address = await services.resolveAddress(ensName, network)

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  ensName: ensName,
                  normalizedName: normalizedEns,
                  resolvedAddress: address,
                  network
                },
                2
              )
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error resolving ENS name: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )
}
