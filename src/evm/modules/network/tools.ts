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

  // Get supported networks
  // The SDK's tool() overloads accept ZodRawShape (plain objects), not ZodObject.
  // Passing {} as ZodRawShape fails at runtime because isZodRawShape({}) returns false
  // for empty objects — the SDK misidentifies it as ToolAnnotations.
  // The 3-arg overload (name, description, handler) registers no schema at all.
  // .update({ paramsSchema: {} }) is the documented public API on RegisteredTool and
  // is the only way to emit { type: "object", properties: {} } for zero-arg tools.
  const getSupportedNetworksTool = server.tool(
    "get_supported_networks",
    "Get list of supported networks",
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
  getSupportedNetworksTool.update({ paramsSchema: {} })
}
