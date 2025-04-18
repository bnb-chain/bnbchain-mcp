import {
  McpServer,
  ResourceTemplate
} from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Address } from "viem"

import * as services from "@/evm/services/index.js"

export function registerTokenResources(server: McpServer) {
  // Add ERC20 token info resource
  server.resource(
    "erc20_token_details",
    new ResourceTemplate("evm://{network}/token/{tokenAddress}", {
      list: undefined
    }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const tokenAddress = params.tokenAddress as Address

        const tokenInfo = await services.getERC20TokenInfo(
          tokenAddress,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  address: tokenAddress,
                  network,
                  ...tokenInfo
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
              text: `Error fetching ERC20 token info: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Add ERC20 token balance resource
  server.resource(
    "erc20_token_address_balance",
    new ResourceTemplate(
      "evm://{network}/token/{tokenAddress}/balanceOf/{address}",
      { list: undefined }
    ),
    async (uri, params) => {
      try {
        const network = params.network as string
        const tokenAddress = params.tokenAddress as Address
        const address = params.address as Address

        const balance = await services.getERC20Balance(
          tokenAddress,
          address,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  tokenAddress,
                  owner: address,
                  network,
                  raw: balance.raw.toString(),
                  formatted: balance.formatted,
                  symbol: balance.token.symbol,
                  decimals: balance.token.decimals
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
              text: `Error fetching ERC20 token balance: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Add NFT (ERC721) token info resource
  server.resource(
    "erc721_nft_token_details",
    new ResourceTemplate("evm://{network}/nft/{tokenAddress}/{tokenId}", {
      list: undefined
    }),
    async (uri, params) => {
      try {
        const network = params.network as string
        const tokenAddress = params.tokenAddress as Address
        const tokenId = BigInt(params.tokenId as string)

        const nftInfo = await services.getERC721TokenMetadata(
          tokenAddress,
          tokenId,
          network
        )

        // Get owner separately
        let owner = "Unknown"
        try {
          const isOwner = await services.isNFTOwner(
            tokenAddress,
            params.address as Address,
            tokenId,
            network
          )
          if (isOwner) {
            owner = params.address as string
          }
        } catch (e) {
          // Owner info not available
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  contract: tokenAddress,
                  tokenId: tokenId.toString(),
                  network,
                  ...nftInfo,
                  owner
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
              text: `Error fetching NFT info: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Add NFT ownership check resource
  server.resource(
    "erc721_nft_ownership_check",
    new ResourceTemplate(
      "evm://{network}/nft/{tokenAddress}/{tokenId}/isOwnedBy/{address}",
      { list: undefined }
    ),
    async (uri, params) => {
      try {
        const network = params.network as string
        const tokenAddress = params.tokenAddress as Address
        const tokenId = BigInt(params.tokenId as string)
        const address = params.address as Address

        const isOwner = await services.isNFTOwner(
          tokenAddress,
          address,
          tokenId,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  contract: tokenAddress,
                  tokenId: tokenId.toString(),
                  owner: address,
                  network,
                  isOwner
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
              text: `Error checking NFT ownership: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Add ERC1155 token URI resource
  server.resource(
    "erc1155_token_metadata_uri",
    new ResourceTemplate(
      "evm://{network}/erc1155/{tokenAddress}/{tokenId}/uri",
      { list: undefined }
    ),
    async (uri, params) => {
      try {
        const network = params.network as string
        const tokenAddress = params.tokenAddress as Address
        const tokenId = BigInt(params.tokenId as string)

        const tokenURI = await services.getERC1155TokenURI(
          tokenAddress,
          tokenId,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  contract: tokenAddress,
                  tokenId: tokenId.toString(),
                  network,
                  uri: tokenURI
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
              text: `Error fetching ERC1155 token URI: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )

  // Add ERC1155 token balance resource
  server.resource(
    "erc1155_token_address_balance",
    new ResourceTemplate(
      "evm://{network}/erc1155/{tokenAddress}/{tokenId}/balanceOf/{address}",
      { list: undefined }
    ),
    async (uri, params) => {
      try {
        const network = params.network as string
        const tokenAddress = params.tokenAddress as Address
        const tokenId = BigInt(params.tokenId as string)
        const address = params.address as Address

        const balance = await services.getERC1155Balance(
          tokenAddress,
          address,
          tokenId,
          network
        )

        return {
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  contract: tokenAddress,
                  tokenId: tokenId.toString(),
                  owner: address,
                  network,
                  balance: balance.toString()
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
              text: `Error fetching ERC1155 token balance: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ]
        }
      }
    }
  )
}
