import { describe, expect, it } from "bun:test"

import { MCPClient, getClient, parseText } from "./util"

const DAPPBAY_TOOLS = ["resolve_dapp", "get_dapp", "search_dapps", "top_dapps"]

type AgentResponse<T> = {
  data: T
  meta: {
    source: string
    coverage: string
    empty: boolean
    result_count: number
    metrics_as_of: string | null
    note?: string
    submit_url?: string
  }
}

type DappSummary = {
  id: number
  uniq_name: string
  website: string | null
  profile_updated_at: string | null
}

type ResolveResult = {
  status: "listed" | "red_alarm" | "not_in_listed_records" | "not_listed"
  queried_domain: string | null
  dapp?: DappSummary
}

describe("DappBay tools", async () => {
  const client = await getClient()

  it("registers all DappBay tools with object schemas", async () => {
    const { tools } = await client.listTools()
    for (const name of DAPPBAY_TOOLS) {
      const tool = tools.find((t) => t.name === name)
      expect(tool).toBeDefined()
      expect(tool?.inputSchema).toHaveProperty("properties")
    }
  })
})

// Live calls need a reachable DappBay API, e.g.
// DAPPBAY_E2E=1 DAPPBAY_API_BASE=http://localhost:3011/api/v1 bun run e2e
describe.skipIf(!process.env.DAPPBAY_E2E)(
  "DappBay tools (live API)",
  async () => {
    // The shared client passes the server an explicit env, so forward the API base.
    const client = await new MCPClient().connect(
      process.env.DAPPBAY_API_BASE
        ? { DAPPBAY_API_BASE: process.env.DAPPBAY_API_BASE }
        : {}
    )

    const callJson = async <T>(name: string, args: Record<string, unknown>) => {
      const res = await client.callTool({ name, arguments: args })
      const text = (res.content as { text: string }[])[0]?.text ?? ""
      return { text, json: parseText<AgentResponse<T>>(text) }
    }

    it("search_dapps returns source and coverage without contracts", async () => {
      const { text, json } = await callJson<DappSummary[]>("search_dapps", {
        pageSize: 3
      })
      expect(json.meta.source).toContain("DappBay")
      expect(json.meta.coverage).toContain("not exhaustive")
      expect(Array.isArray(json.data)).toBe(true)
      expect(text).not.toMatch(/contract/i)
    })

    it("top_dapps returns metrics_as_of", async () => {
      const { json } = await callJson<DappSummary[]>("top_dapps", {
        metric: "users",
        pageSize: 2
      })
      expect(json.data.length).toBeGreaterThan(0)
      expect(json.meta).toHaveProperty("metrics_as_of")
    })

    it("get_dapp and resolve_dapp agree on a listed dApp", async () => {
      const { json: top } = await callJson<DappSummary[]>("top_dapps", {
        metric: "users",
        pageSize: 5
      })
      const dapp = top.data.find((x) => x.website)
      expect(dapp).toBeDefined()

      const { json: detail } = await callJson<DappSummary>("get_dapp", {
        idOrUniqName: dapp?.uniq_name
      })
      expect(detail.data.uniq_name).toBe(dapp?.uniq_name ?? "")

      const { json: resolved } = await callJson<ResolveResult>("resolve_dapp", {
        url: dapp?.website
      })
      expect(["listed", "red_alarm"]).toContain(resolved.data.status)
    })

    it("resolve_dapp reports not_listed with a note and submit url", async () => {
      const { json } = await callJson<ResolveResult>("resolve_dapp", {
        url: "https://definitely-not-a-listed-dapp-zz.xyz/claim?id=1"
      })
      expect(json.data.status).toBe("not_listed")
      expect(json.meta.empty).toBe(true)
      expect(json.meta.note).toContain("not exhaustive")
      expect(json.meta.submit_url).toContain("submit-dapp")
    })

    it("resolve_dapp rejects contract addresses", async () => {
      const { text } = await callJson("resolve_dapp", {
        url: "0x10ED43C718714eb63d5aA57B78B54704E256024E"
      })
      expect(text).toContain("Contract address lookup is not supported")
    })
  }
)
