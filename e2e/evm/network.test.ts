import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("EVM Network Test", async () => {
  const client = await getClient()

  it("get_supported_networks schema is OpenAI-compatible (has properties field)", async () => {
    const { tools } = await client.listTools()
    const tool = tools.find((t) => t.name === "get_supported_networks")
    expect(tool).toBeDefined()
    // OpenAI-compatible validators require object schemas to have a properties field
    expect(tool?.inputSchema).toHaveProperty("properties")
  })

  it("get chain info for BSC", async () => {
    const res = await client.callTool({
      name: "get_chain_info",
      arguments: {
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      chainId: number
    }>(text)
    expect(obj.chainId).toBe(56) // BSC mainnet chain ID
  })

  it("get supported networks", async () => {
    const res = await client.callTool({
      name: "get_supported_networks",
      arguments: {}
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      supportedNetworks: string[]
    }>(text)
    expect(obj.supportedNetworks).toContain("bsc")
    expect(obj.supportedNetworks).toContain("bsc-testnet")
    expect(obj.supportedNetworks).toContain("opbnb")
    expect(obj.supportedNetworks).toContain("opbnb-testnet")
  })
})
