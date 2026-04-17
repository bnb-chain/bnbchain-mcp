import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { getRpcUrl, getSupportedNetworks } from "@/evm/chains.js"
import * as services from "@/evm/services/index.js"
import { mcpToolRes } from "@/utils/helper"
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

        return mcpToolRes.success({
          network,
          chainId,
          blockNumber: blockNumber.toString(),
          rpcUrl
        })
      } catch (error) {
        return mcpToolRes.error(error, "fetching chain info")
      }
    }
  )

  // One throwaway field that satisfies isZodRawShape (checked by the SDK before registering
  // the tool's param schema); z.never().optional() means callers never need to pass it.
  server.tool(
    "get_supported_networks",
    "Get list of supported networks",
    { _: z.never().optional() },
    async () => {
      try {
        const networks = getSupportedNetworks()
        return mcpToolRes.success({
          supportedNetworks: networks
        })
      } catch (error) {
        return mcpToolRes.error(error, "fetching supported networks")
      }
    }
  )
}
