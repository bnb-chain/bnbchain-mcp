import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import dotenv from "dotenv"

dotenv.config()

export class MCPClient {
  private mcp: Client

  constructor() {
    this.mcp = new Client({
      name: "bnbchain-mcp-test-client",
      version: "1.0.0"
    })
  }

  async connect() {
    try {
      const transport = new StdioClientTransport({
        command: process.env.NODE as string,
        args: ["dist/index.js"],
        env: {
          PRIVATE_KEY: process.env.PRIVATE_KEY || "",
          LOGLEVEL: "debug"
        }
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

export const parseText = <T>(text: string): T => {
  try {
    return JSON.parse(text) as T
  } catch (e) {
    return text as T
  }
}
