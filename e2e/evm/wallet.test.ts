import { describe, expect, it } from "bun:test"
import { privateKeyToAccount } from "viem/accounts"

import { getClient, parseText } from "../util"

const TEST_PRIVATE_KEY = process.env.PRIVATE_KEY as string
const ADDRESS = privateKeyToAccount(TEST_PRIVATE_KEY as `0x${string}`).address

describe("Wallet Test", async () => {
  const client = await getClient()

  const RECIPIENT = ADDRESS
  const vUSDT_ADDRESS = "0x3121384A8087198326339253AED958b38D07c003"
  const NETWORK = "bsc-testnet"

  it("get address from private key", async () => {
    const res = await client.callTool({
      name: "get_address_from_private_key",
      arguments: {
        privateKey: TEST_PRIVATE_KEY
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      address: string
    }>(text)
    expect(obj.address).toBe(ADDRESS)
  })

  it("transfer native token", async () => {
    const res = await client.callTool({
      name: "transfer_native_token",
      arguments: {
        toAddress: RECIPIENT,
        amount: "0.001",
        network: NETWORK,
        privateKey: TEST_PRIVATE_KEY
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      txHash: string
    }>(text)
    expect(obj.txHash).toStartWith("0x")
  })

  it("approve token spending", async () => {
    const res = await client.callTool({
      name: "approve_token_spending",
      arguments: {
        tokenAddress: vUSDT_ADDRESS,
        spenderAddress: RECIPIENT,
        amount: "1000",
        network: NETWORK,
        privateKey: TEST_PRIVATE_KEY
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      txHash: string
    }>(text)
    expect(obj.txHash).toStartWith("0x")
  })

  it("transfer ERC20 token", async () => {
    const res = await client.callTool({
      name: "transfer_erc20",
      arguments: {
        tokenAddress: vUSDT_ADDRESS,
        toAddress: RECIPIENT,
        amount: "1",
        network: NETWORK,
        privateKey: TEST_PRIVATE_KEY
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      txHash: string
    }>(text)
    expect(obj.txHash).toStartWith("0x")
  })
})
