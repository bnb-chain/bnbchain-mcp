import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Address } from "viem"
import { z } from "zod"

import * as services from "@/evm/services/index.js"
import { safeStringify } from "@/utils/helper"
import { defaultNetworkParam } from "../common/types"

export function registerNftTools(server: McpServer) {
  // Get NFT (ERC721) information
  server.tool(
    "get_nft_info",
    "Get detailed information about a specific NFT (ERC721 token), including collection name, symbol, token URI, and current owner if available.",
    {
      tokenAddress: z
        .string()
        .describe(
          "The contract address of the NFT collection (e.g., '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' for Bored Ape Yacht Club)"
        ),
      tokenId: z
        .string()
        .describe("The ID of the specific NFT token to query (e.g., '1234')"),
      network: defaultNetworkParam
    },
    async ({ tokenAddress, tokenId, network }) => {
      try {
        const nftInfo = await services.getERC721TokenMetadata(
          tokenAddress as Address,
          BigInt(tokenId),
          network
        )

        // Check ownership separately
        let owner = null
        try {
          // This may fail if tokenId doesn't exist
          owner = await services.getPublicClient(network).readContract({
            address: tokenAddress as Address,
            abi: [
              {
                inputs: [{ type: "uint256" }],
                name: "ownerOf",
                outputs: [{ type: "address" }],
                stateMutability: "view",
                type: "function"
              }
            ],
            functionName: "ownerOf",
            args: [BigInt(tokenId)]
          })
        } catch (e) {
          // Ownership info not available
        }

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  contract: tokenAddress,
                  tokenId,
                  network,
                  ...nftInfo,
                  owner: owner || "Unknown"
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
              text: `Error fetching NFT info: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )

  // Check NFT ownership
  server.tool(
    "check_nft_ownership",
    "Check if an address owns a specific NFT",
    {
      tokenAddress: z
        .string()
        .describe(
          "The contract address or ENS name of the NFT collection (e.g., '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' for BAYC or 'boredapeyachtclub.eth')"
        ),
      tokenId: z.string().describe("The ID of the NFT to check (e.g., '1234')"),
      ownerAddress: z
        .string()
        .describe(
          "The wallet address or ENS name to check ownership against (e.g., '0x1234...' or 'vitalik.eth')"
        ),
      network: defaultNetworkParam
    },
    async ({ tokenAddress, tokenId, ownerAddress, network }) => {
      try {
        const isOwner = await services.isNFTOwner(
          tokenAddress,
          ownerAddress,
          BigInt(tokenId),
          network
        )

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  tokenAddress,
                  tokenId,
                  ownerAddress,
                  network,
                  isOwner,
                  result: isOwner
                    ? "Address owns this NFT"
                    : "Address does not own this NFT"
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
              text: `Error checking NFT ownership: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )

  // Add tool for getting ERC1155 token URI
  server.tool(
    "get_erc1155_token_uri",
    "Get the metadata URI for an ERC1155 token (multi-token standard used for both fungible and non-fungible tokens). The URI typically points to JSON metadata about the token.",
    {
      tokenAddress: z
        .string()
        .describe(
          "The contract address of the ERC1155 token collection (e.g., '0x76BE3b62873462d2142405439777e971754E8E77')"
        ),
      tokenId: z
        .string()
        .describe(
          "The ID of the specific token to query metadata for (e.g., '1234')"
        ),
      network: defaultNetworkParam
    },
    async ({ tokenAddress, tokenId, network }) => {
      try {
        const uri = await services.getERC1155TokenURI(
          tokenAddress as Address,
          BigInt(tokenId),
          network
        )

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  contract: tokenAddress,
                  tokenId,
                  network,
                  uri
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
              text: `Error fetching ERC1155 token URI: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )

  // Add tool for getting ERC721 NFT balance
  server.tool(
    "get_nft_balance",
    "Get the total number of NFTs owned by an address from a specific collection. This returns the count of NFTs, not individual token IDs.",
    {
      tokenAddress: z
        .string()
        .describe(
          "The contract address of the NFT collection (e.g., '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' for Bored Ape Yacht Club)"
        ),
      ownerAddress: z
        .string()
        .describe(
          "The wallet address to check the NFT balance for (e.g., '0x1234...')"
        ),
      network: defaultNetworkParam
    },
    async ({ tokenAddress, ownerAddress, network }) => {
      try {
        const balance = await services.getERC721Balance(
          tokenAddress as Address,
          ownerAddress as Address,
          network
        )

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  collection: tokenAddress,
                  owner: ownerAddress,
                  network,
                  balance: balance.toString()
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
              text: `Error fetching NFT balance: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )

  // Add tool for getting ERC1155 token balance
  server.tool(
    "get_erc1155_balance",
    "Get the balance of a specific ERC1155 token ID owned by an address. ERC1155 allows multiple tokens of the same ID, so the balance can be greater than 1.",
    {
      tokenAddress: z
        .string()
        .describe(
          "The contract address of the ERC1155 token collection (e.g., '0x76BE3b62873462d2142405439777e971754E8E77')"
        ),
      tokenId: z
        .string()
        .describe(
          "The ID of the specific token to check the balance for (e.g., '1234')"
        ),
      ownerAddress: z
        .string()
        .describe(
          "The wallet address to check the token balance for (e.g., '0x1234...')"
        ),
      network: defaultNetworkParam
    },
    async ({ tokenAddress, tokenId, ownerAddress, network }) => {
      try {
        const balance = await services.getERC1155Balance(
          tokenAddress as Address,
          ownerAddress as Address,
          BigInt(tokenId),
          network
        )

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  contract: tokenAddress,
                  tokenId,
                  owner: ownerAddress,
                  network,
                  balance: balance.toString()
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
              text: `Error fetching ERC1155 token balance: ${
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
