import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import dotenv from "dotenv"

dotenv.config()

const defaultEnv = {
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  LOGLEVEL: process.env.LOGLEVEL || "debug",
  BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION: "true"
}

export class MCPClient {
  private mcp: Client

  constructor() {
    this.mcp = new Client({
      name: "bnbchain-mcp-test-client",
      version: "1.0.0"
    })
  }

  async connect(envOverrides: Record<string, string> = {}) {
    try {
      const env = { ...defaultEnv, ...envOverrides }
      const transport = new StdioClientTransport({
        command: process.env.NODE || "node",
        args: ["dist/index.js"],
        env
      })
      await this.mcp.connect(transport)
      return this.mcp
    } catch (e) {
      console.error("Failed to connect to MCP server: ", e)
      throw e
    }
  }
}

let client: Client

export const getClient = async () => {
  if (!client) {
    const mcp = new MCPClient()
    client = await mcp.connect()
  }
  return client
}

/** Use for tests that need the preview/confirm flow (skip confirmation disabled). */
export const getClientWithConfirmFlow = async (): Promise<Client> => {
  const mcp = new MCPClient()
  return mcp.connect({ BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION: "false" })
}

export const parseText = <T>(text: string): T => {
  try {
    return JSON.parse(text) as T
  } catch (e) {
    return text as T
  }
}
