import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("EVM NFT Test", async () => {
  const client = await getClient()

  // Binance Account Bound Token (BABT) on BSC
  const NFT_ADDRESS = "0x2b09d47d550061f995a3b5c6f0fd58005215d7c8"
  const TOKEN_ID = "1"

  // erc1155 on BSC
  const ERC1155_ADDRESS = "0x06f352C604D36b703E04671827493c43F598dC1e"
  const ERC1155_TOKEN_ID = "1"

  describe("ERC721 Tests", () => {
    it("get NFT info", async () => {
      const res = await client.callTool({
        name: "get_nft_info",
        arguments: {
          tokenAddress: NFT_ADDRESS,
          tokenId: TOKEN_ID,
          network: "bsc"
        }
      })
      const text = res.content?.[0]?.text
      const obj = parseText<{
        symbol: string
      }>(text)
      expect(obj.symbol).toEqual("BABT")
    })
  })

  describe("ERC1155 Tests", () => {
    it("get ERC1155 token URI", async () => {
      const res = await client.callTool({
        name: "get_erc1155_token_metadata",
        arguments: {
          tokenAddress: ERC1155_ADDRESS,
          tokenId: ERC1155_TOKEN_ID,
          network: "bsc"
        }
      })
      const text = res.content?.[0]?.text
      const obj = parseText<{
        tokenURI: string
      }>(text)
      expect(obj.tokenURI).toContain("://")
    })
  })
})
