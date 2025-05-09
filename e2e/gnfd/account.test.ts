import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("Greenfield Account Test", async () => {
  const client = await getClient()

  it("get account balance", async () => {
    const res = await client.callTool({
      name: "gnfd_get_account_balance",
      arguments: {
        network: "mainnet"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      balance: {
        amount: string
        denom: string
      }
    }>(text)
    expect(BigInt(obj.balance.amount)).toBeTypeOf("bigint")
  })

  it("get all storage providers", async () => {
    const res = await client.callTool({
      name: "gnfd_get_all_sps",
      arguments: {
        network: "mainnet"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<
      {
        endpoint: string
      }[]
    >(text)
    expect(obj[0].endpoint).toStartWith("https://")
  })
})
