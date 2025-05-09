import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("EVM ENS Test", async () => {
  const client = await getClient()

  // it("resolve ETH ENS name", async () => {
  //   const res = await client.callTool({
  //     name: "resolve_ens",
  //     arguments: {
  //       ensName: "vitalik.eth",
  //       network: "eth" // only for eth mainnet
  //     }
  //   })
  //   const text = res.content?.[0]?.text
  //   const obj = parseText<{
  //     resolvedAddress: string
  //   }>(text)
  //   expect(obj.resolvedAddress).toStartWith("0x")
  // })
})
