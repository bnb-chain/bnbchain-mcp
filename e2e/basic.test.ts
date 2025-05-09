import { describe, expect, it } from "bun:test"

import { getClient } from "./util"

describe("Basic Test", async () => {
  const client = await getClient()

  it("list all mcp tools", async () => {
    const toolResult = await client.listTools()
    const names = toolResult.tools.map((tool) => tool.name)
    console.log("all MCP tools: ", names)

    expect(names).toBeArray()
  })
})
