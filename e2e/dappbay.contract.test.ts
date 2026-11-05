import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { createServer } from "node:http"
import type { AddressInfo, Socket } from "node:net"
import { registerDappbayTools } from "@/dappbay/tools"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

describe("DappBay HTTP contract", () => {
  const previousBase = process.env.DAPPBAY_API_BASE
  const requests: {
    path: string
    query: Record<string, string>
    tool?: string
  }[] = []
  const sockets = new Set<Socket>()
  let mode: "ok" | "429" | "400" | "500" | "slow-body" = "ok"
  const api = createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost")
    requests.push({
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      tool: req.headers["x-mcp-tool"] as string
    })
    if (mode === "slow-body") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.write('{"data":')
      return
    }
    res.setHeader("Content-Type", "application/json")
    if (mode !== "ok") {
      res.statusCode = Number(mode)
      res.end(JSON.stringify({ message: "Fixture failure" }))
      return
    }
    res.end(
      JSON.stringify({
        data: [],
        meta: {
          source: "DappBay",
          pagination: { page: 2, page_size: 5, total_count: 12, has_more: true }
        }
      })
    )
  })
  const server = new McpServer({
    name: "dappbay-contract-fixture",
    version: "1"
  })
  const client = new Client({ name: "contract-test", version: "1" })
  api.on("connection", (socket) => {
    sockets.add(socket)
    socket.once("close", () => sockets.delete(socket))
  })

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      api.once("error", reject)
      api.listen(0, "127.0.0.1", resolve)
    })
    process.env.DAPPBAY_API_BASE = `http://127.0.0.1:${(api.address() as AddressInfo).port}/api/v1`
    registerDappbayTools(server)
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair()
    await server.connect(serverTransport)
    await client.connect(clientTransport)
  })

  afterAll(async () => {
    await client.close()
    await server.close()
    for (const socket of sockets) socket.destroy()
    await new Promise<void>((resolve) => api.close(() => resolve()))
    if (previousBase === undefined)
      Reflect.deleteProperty(process.env, "DAPPBAY_API_BASE")
    else process.env.DAPPBAY_API_BASE = previousBase
  })

  const text = (result: Awaited<ReturnType<Client["callTool"]>>) =>
    (result.content as { text: string }[])[0]?.text || ""

  it("forwards the search page and preserves response pagination", async () => {
    mode = "ok"
    const result = await client.callTool({
      name: "search_dapps",
      arguments: { q: "beefy-finance", page: 2, pageSize: 5 }
    })
    expect(requests.at(-1)).toEqual({
      path: "/api/v1/agent/dapps/search",
      query: { q: "beefy-finance", page: "2", pageSize: "5" },
      tool: "search_dapps"
    })
    expect(JSON.parse(text(result)).meta.pagination.page).toBe(2)
  })

  it.each(["resolve_dapp", "get_dapp", "search_dapps", "top_dapps"])(
    "marks %s upstream failures as MCP errors",
    async (name) => {
      mode = "429"
      const args =
        name === "resolve_dapp"
          ? { url: "example.com" }
          : name === "get_dapp"
            ? { idOrUniqName: "example" }
            : name === "top_dapps"
              ? { metric: "users" }
              : {}
      const result = await client.callTool({ name, arguments: args })
      expect(text(result)).toContain("rate limit")
      expect(result.isError).toBe(true)
    }
  )

  it.each(["400", "500"] as const)(
    "preserves upstream %s failures",
    async (status) => {
      mode = status
      const result = await client.callTool({
        name: "get_dapp",
        arguments: { idOrUniqName: "example" }
      })
      expect(result.isError).toBe(true)
      expect(text(result)).toContain(`${status}: Fixture failure`)
    }
  )

  it("rejects invalid paging and oversized IDs without sending HTTP", async () => {
    const count = requests.length
    for (const [name, args] of [
      ["search_dapps", { page: 51 }],
      ["get_dapp", { idOrUniqName: "x".repeat(256) }]
    ] as const) {
      await expect(
        client.callTool({ name, arguments: args })
      ).rejects.toMatchObject({ code: -32602 })
    }
    expect(requests.length).toBe(count)
  })

  it("times out a response body even after successful response headers", async () => {
    mode = "slow-body"
    const start = Date.now()
    const result = await client.callTool(
      { name: "search_dapps", arguments: {} },
      undefined,
      { timeout: 9500 }
    )
    expect(result.isError).toBe(true)
    expect(text(result)).toContain("timed out after 8s")
    expect(Date.now() - start).toBeLessThan(9300)
  }, 12000)
})
