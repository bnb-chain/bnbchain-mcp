import { readFileSync } from "node:fs"
import path from "node:path"

const DEFAULT_API_BASE = "https://dappbay.bnbchain.org/api/v1"
const TIMEOUT_MS = 8000

const getPackageVersion = (): string => {
  // dist/index.js -> ../package.json; src/dappbay/client.ts -> ../../package.json
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const pkg = JSON.parse(
        readFileSync(path.join(__dirname, rel), "utf8")
      ) as { name?: string; version?: string }
      if (pkg.name === "@bnb-chain/mcp" && pkg.version) {
        return pkg.version
      }
    } catch {
      // try next candidate
    }
  }
  return "unknown"
}

const USER_AGENT = `bnbchain-mcp/${getPackageVersion()}`

export const getDappbayApiBase = () =>
  (process.env.DAPPBAY_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, "")

export type DappbayQuery = Record<string, string | number | undefined>

/**
 * GET a DappBay agent endpoint. `tool` and `client` are sent as headers so
 * DappBay can tell MCP traffic apart from its website traffic.
 */
export async function dappbayGet<T>(
  pathname: string,
  query: DappbayQuery,
  meta: { tool: string; client: string }
): Promise<T> {
  const url = new URL(`${getDappbayApiBase()}${pathname}`)
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        "X-MCP-Tool": meta.tool,
        // Client names are arbitrary MCP strings; this header is only a log label.
        "X-MCP-Client":
          meta.client.replace(/[^\x20-\x7e]/g, "").trim().slice(0, 64) || "unknown"
      },
      signal: controller.signal
    })
    // Keep the deadline active until the entire response body has arrived.
    const text = await res.text()
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error(
          "DappBay API rate limit reached. Wait a minute before retrying."
        )
      }
      let message = text
      try {
        const body = JSON.parse(text) as { message?: string | string[] }
        if (body.message) {
          message = Array.isArray(body.message)
            ? body.message.join("; ")
            : body.message
        }
      } catch {
        // keep raw text
      }
      throw new Error(`DappBay API returned ${res.status}: ${message}`)
    }
    return JSON.parse(text) as T
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`DappBay API timed out after ${TIMEOUT_MS / 1000}s`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}
