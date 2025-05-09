import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("EVM Transactions Test", async () => {
  const client = await getClient()

  // A known transaction hash on BSC
  const TX_HASH =
    "0x5a40bbbe542e105089350635c44e18585a8a1ea861f41a11831ee504e5bc3250"

  it("get transaction details", async () => {
    const res = await client.callTool({
      name: "get_transaction",
      arguments: {
        txHash: TX_HASH,
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      blockHash: string
    }>(text)
    expect(obj.blockHash).toStartWith("0x")
  })

  // it("get transaction receipt", async () => {
  //   const res = await client.callTool({
  //     name: "get_transaction_receipt",
  //     arguments: {
  //       txHash: TX_HASH,
  //       network: "bsc"
  //     }
  //   })
  //   const text = res.content?.[0]?.text
  //   const obj = parseText<{
  //     blockHash: string
  //   }>(text)
  //   expect(obj.blockHash).toStartWith("0x")
  // })

  it("estimate gas", async () => {
    const res = await client.callTool({
      name: "estimate_gas",
      arguments: {
        to: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
        value: "0.1",
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      estimatedGas: string
    }>(text)
    expect(BigInt(obj.estimatedGas)).toBeTypeOf("bigint")
  })
})
