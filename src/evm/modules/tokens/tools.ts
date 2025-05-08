import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Address } from "viem"
import { z } from "zod"

import * as services from "@/evm/services/index.js"
import { safeStringify } from "@/utils/helper"
import { defaultNetworkParam } from "../common/types"

export function registerTokenTools(server: McpServer) {
  // Get ERC20 token info
  server.tool(
    "get_erc20_token_info",
    "Get ERC20 token information",
    {
      tokenAddress: z.string().describe("The ERC20 token contract address"),
      network: defaultNetworkParam
    },
    async ({ network, tokenAddress }) => {
      try {
        const tokenInfo = await services.getERC20TokenInfo(
          tokenAddress as Address,
          network
        )

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  address: tokenAddress,
                  network,
                  ...tokenInfo
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
              text: `Error fetching ERC20 token info: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        }
      }
    }
  )

  // Get native token balance
  server.tool(
    "get_native_balance",
    "Get native token balance for an address",
    {
      address: z.string().describe("The address to check balance for"),
      network: defaultNetworkParam
    },
    async ({ network, address }) => {
      try {
        const balance = await services.getETHBalance(
          address as services.Address,
          network
        )

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  network,
                  address,
                  balance: {
                    wei: balance.wei.toString(),
                    ether: balance.ether
                  }
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
              text: `Error fetching native token balance: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        }
      }
    }
  )

  // Get ERC20 token balance
  server.tool(
    "get_erc20_balance",
    "Get ERC20 token balance for an address",
    {
      tokenAddress: z.string().describe("The ERC20 token contract address"),
      address: z.string().describe("The address to check balance for"),
      network: defaultNetworkParam
    },
    async ({ network, tokenAddress, address }) => {
      try {
        const balance = await services.getERC20Balance(
          tokenAddress as Address,
          address as Address,
          network
        )

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  tokenAddress,
                  owner: address,
                  network,
                  raw: balance.raw.toString(),
                  formatted: balance.formatted,
                  symbol: balance.token.symbol,
                  decimals: balance.token.decimals
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
              text: `Error fetching ERC20 token balance: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        }
      }
    }
  )
}
