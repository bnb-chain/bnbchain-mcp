import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js"

import * as services from "@/evm/services/index.js"

export function registerWalletResources(server: McpServer) {
  // Get ETH balance for a specific network
  server.resource(
    "evm_address_native_balance",
    new ResourceTemplate("evm://{network}/address/{address}/balance", {
      list: undefined
    }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const address = params.address as string
        const balance = await services.getETHBalance(
          address as services.Address,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  network,
                  address,
                  balance: {
                    wei: balance.wei.toString(),
                    ether: balance.ether
                  }
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
              text: `Error fetching ETH balance: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Default BNB balance (BSC mainnet)
  server.resource(
    "default_bnb_balance",
    new ResourceTemplate("evm://address/{address}/bnb-balance", {
      list: undefined
    }),
    async (uri, params) => {
      try {
        const network = "bsc"
        const address = params.address as string
        const balance = await services.getETHBalance(
          address as services.Address,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  network,
                  address,
                  balance: {
                    wei: balance.wei.toString(),
                    ether: balance.ether
                  }
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
              text: `Error fetching ETH balance: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Get ERC20 balance for a specific network
  server.resource(
    "erc20_balance",
    new ResourceTemplate(
      "evm://{network}/address/{address}/token/{tokenAddress}/balance",
      { list: undefined }
    ),
    async (uri, params) => {
      try {
        const network = params.network as string
        const address = params.address as string
        const tokenAddress = params.tokenAddress as string

        const balance = await services.getERC20Balance(
          tokenAddress as services.Address,
          address as services.Address,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  network,
                  address,
                  tokenAddress,
                  balance: {
                    raw: balance.raw.toString(),
                    formatted: balance.formatted,
                    decimals: balance.token.decimals
                  }
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
              text: `Error fetching ERC20 balance: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Default ERC20 balance (Ethereum mainnet)
  server.resource(
    "default_erc20_balance",
    new ResourceTemplate(
      "evm://address/{address}/token/{tokenAddress}/balance",
      { list: undefined }
    ),
    async (uri, params) => {
      try {
        const network = "bsc"
        const address = params.address as string
        const tokenAddress = params.tokenAddress as string

        const balance = await services.getERC20Balance(
          tokenAddress as services.Address,
          address as services.Address,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  network,
                  address,
                  tokenAddress,
                  balance: {
                    raw: balance.raw.toString(),
                    formatted: balance.formatted,
                    decimals: balance.token.decimals
                  }
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
              text: `Error fetching ERC20 balance: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )
}
