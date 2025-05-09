import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("EVM Tokens Test", async () => {
  const client = await getClient()

  // BUSD contract on BSC
  const BUSD_ADDRESS = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
  // Binance Hot Wallet
  const BINANCE_HOT_WALLET = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3"

  it("get ERC20 token info", async () => {
    const res = await client.callTool({
      name: "get_erc20_token_info",
      arguments: {
        tokenAddress: BUSD_ADDRESS,
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      name: string
    }>(text)
    expect(obj.name).toBe("BUSD Token")
  })

  it("get native token balance", async () => {
    const res = await client.callTool({
      name: "get_native_balance",
      arguments: {
        address: BINANCE_HOT_WALLET,
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      raw: string
    }>(text)
    expect(BigInt(obj.raw)).toBeTypeOf("bigint")
  })

  it("get ERC20 token balance", async () => {
    const res = await client.callTool({
      name: "get_erc20_balance",
      arguments: {
        tokenAddress: BUSD_ADDRESS,
        address: BINANCE_HOT_WALLET,
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      raw: string
    }>(text)
    expect(BigInt(obj.raw)).toBeTypeOf("bigint")
  })

  // it("create ERC20 token", async () => {
  //   const res = await client.callTool({
  //     name: "create_erc20_token",
  //     arguments: {
  //       name: "Test USDT Token",
  //       symbol: "vUSDT",
  //       network: "bsc-testnet",
  //       privateKey: process.env.PRIVATE_KEY as string,
  //       totalSupply: "1000000000" // 1 billion
  //     }
  //   })
  //   const text = res.content?.[0]?.text
  //   const obj = parseText<{
  //     hash: string
  //   }>(text)
  //   expect(obj.hash).toStartWith("0x")
  // })
})
