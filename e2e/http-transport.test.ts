import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { spawn, type ChildProcess } from "child_process"

describe("HTTP Transport Test", async () => {
  let serverProcess: ChildProcess
  let client: Client
  let transport: StreamableHTTPClientTransport

  beforeAll(async () => {
    // Start the server with HTTP transport
    serverProcess = spawn(process.execPath, ["dist/index.js", "--http"], {
      env: {
        ...process.env,
        PORT: "3002",
        LOG_LEVEL: "ERROR"
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Create client and connect
    client = new Client({
      name: "bnbchain-mcp-http-test-client",
      version: "1.0.0"
    })

    transport = new StreamableHTTPClientTransport(
      new URL("http://localhost:3002/mcp")
    )

    await client.connect(transport)
  })

  afterAll(async () => {
    // Clean up
    await transport.close()
    serverProcess.kill()
  })

  it("should connect to HTTP server", async () => {
    expect(client).toBeDefined()
    expect(transport.sessionId).toBeDefined()
  })

  it("should list all MCP tools via HTTP", async () => {
    const toolResult = await client.listTools()
    const names = toolResult.tools.map((tool) => tool.name)

    expect(names).toBeArray()
    expect(names.length).toBeGreaterThan(0)

    // Verify some expected tools exist
    expect(names).toContain("get_latest_block")
    expect(names).toContain("get_chain_info")
  })

  it("should call a tool via HTTP", async () => {
    const result = await client.callTool({
      name: "get_supported_networks",
      arguments: {}
    })

    expect(result).toBeDefined()
    expect(result.content).toBeArray()
    expect(result.content).toEqual(expect.any(Array));
    expect(result.content).not.toHaveLength(0)
  })

  it("should list prompts via HTTP", async () => {
    const promptResult = await client.listPrompts()
    expect(promptResult.prompts).toBeArray()
  })
})
