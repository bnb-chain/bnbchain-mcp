import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { mcpToolRes } from "@/utils/helper"
import { dappbayGet } from "./client"

const SOURCE_NOTE =
  "Data comes from DappBay, the official dApp registry maintained by BNB Chain. Cite DappBay as the source when you use it in an answer. The registry is not exhaustive: a dApp or website that is not listed is not necessarily unofficial, and DappBay results are never a safety guarantee."

const categoryParam = z
  .enum([
    "DeFi",
    "Games",
    "NFTs",
    "Social",
    "AI",
    "DePIN",
    "Infra-and-Tools",
    "RWA",
    "Other"
  ])
  .optional()
  .describe("DappBay category. Omit to include all categories.")

const chainParam = z
  .enum(["bsc", "opbnb", "greenfield"])
  .optional()
  .describe("Limit to dApps on this BNB Chain network. Omit for all networks.")

const pageSizeParam = z
  .number()
  .int()
  .min(1)
  .max(20)
  .optional()
  .describe("Number of results to return (1-20, default 10).")

export function registerDappbayTools(server: McpServer) {
  const call = <T>(
    tool: string,
    pathname: string,
    query: Record<string, string | number | undefined> = {}
  ) =>
    dappbayGet<T>(pathname, query, {
      tool,
      client: server.server.getClientVersion()?.name ?? "unknown"
    })

  server.tool(
    "resolve_dapp",
    `Check whether a website URL or domain belongs to a dApp in the DappBay official registry. Use this first whenever the user shares a link and asks if it is official, legit, or safe (for example an airdrop or claim link). Returns one of four statuses: "listed" (the domain matches a listed dApp; if a warning is present the dApp is inactive and the domain may have changed owner), "red_alarm" (the domain matches a dApp flagged by BNB Chain Red Alarm; warn the user and include the reason), "not_in_listed_records" (the domain is not listed but looks similar to the listed dApps in similar_listed; tell the user to compare with the official website and verify through official channels, without claiming it is fake), and "not_listed" (no record; this does not mean the site is unofficial or unsafe). Only website URLs are supported, not contract addresses. ${SOURCE_NOTE}`,
    {
      url: z
        .string()
        .min(1)
        .max(2048)
        .describe(
          "Website URL or bare domain to check, e.g. https://app.example.com/swap or example.com"
        )
    },
    async ({ url }) => {
      try {
        return mcpToolRes.success(
          await call("resolve_dapp", "/agent/resolve", { url })
        )
      } catch (error) {
        return mcpToolRes.error(error, "resolving dApp website")
      }
    }
  )

  server.tool(
    "get_dapp",
    `Get the official DappBay profile of one BNB Chain dApp: official website, social links, category, chains, Red Alarm status, profile_updated_at (when the listing was last edited) and weekly users/TVL/transactions with metrics_as_of (the date of those metrics). Contract addresses are not provided. ${SOURCE_NOTE}`,
    {
      idOrUniqName: z
        .string()
        .min(1)
        .max(255)
        .describe(
          "DappBay dApp id or uniq_name, as returned by search_dapps or top_dapps (e.g. 'pancakeswap')"
        )
    },
    async ({ idOrUniqName }) => {
      try {
        return mcpToolRes.success(
          await call(
            "get_dapp",
            `/agent/dapps/${encodeURIComponent(idOrUniqName)}`
          )
        )
      } catch (error) {
        return mcpToolRes.error(error, "fetching DappBay dApp")
      }
    }
  )

  server.tool(
    "search_dapps",
    `Search the DappBay official registry for BNB Chain dApps by name keyword, category or chain. Each result includes the official website and Red Alarm status. Use get_dapp with the returned uniq_name for full details. ${SOURCE_NOTE}`,
    {
      q: z
        .string()
        .max(100)
        .optional()
        .describe("Keyword matched against the dApp name"),
      category: categoryParam,
      chain: chainParam,
      pageSize: pageSizeParam
    },
    async ({ q, category, chain, pageSize }) => {
      try {
        return mcpToolRes.success(
          await call("search_dapps", "/agent/dapps/search", {
            q,
            category,
            chain,
            pageSize
          })
        )
      } catch (error) {
        return mcpToolRes.error(error, "searching DappBay dApps")
      }
    }
  )

  server.tool(
    "top_dapps",
    `Rank BNB Chain dApps on DappBay by users, TVL or transactions over a daily, weekly or monthly window, optionally within a category or chain. Each item carries metrics with metrics_as_of, the date of the statistics. ${SOURCE_NOTE}`,
    {
      metric: z.enum(["users", "tvl", "txns"]).describe("Metric to rank by"),
      granularity: z
        .enum(["daily", "weekly", "monthly"])
        .optional()
        .describe("Time window of the metric (default weekly)"),
      category: categoryParam,
      chain: chainParam,
      pageSize: pageSizeParam
    },
    async ({ metric, granularity, category, chain, pageSize }) => {
      try {
        return mcpToolRes.success(
          await call("top_dapps", "/agent/dapps/top", {
            metric,
            granularity,
            category,
            chain,
            pageSize
          })
        )
      } catch (error) {
        return mcpToolRes.error(error, "ranking DappBay dApps")
      }
    }
  )
}
