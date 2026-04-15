import { describe, expect, it } from "bun:test"

import { getClient } from "./util"

describe("Basic Test", async () => {
  const client = await getClient()

  it("list all mcp tools", async () => {
    const toolResult = await client.listTools()
    const names = toolResult.tools.map((tool) => tool.name)
    expect(Array.isArray(names)).toBe(true)
    expect(names.length).toBeGreaterThan(0)
    expect(names).toContain("transfer_native_token")
    expect(names).toContain("confirm_transfer")
  })
})
