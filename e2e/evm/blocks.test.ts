import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("EVM Blocks Test", async () => {
  const client = await getClient()

  it("get latest block", async () => {
    const res = await client.callTool({
      name: "get_latest_block",
      arguments: {}
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      hash: string
    }>(text)
    expect(obj.hash).toStartWith("0x")
  })

  it("get block by hash", async () => {
    const res = await client.callTool({
      name: "get_block_by_hash",
      arguments: {
        blockHash:
          "0x5443cc9cf2820982843ac91095827561f31f595e75932c9f87c6fe610b95243c",
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      withdrawalsRoot: string
    }>(text)
    expect(obj.withdrawalsRoot).toStartWith("0x")
  })
})
