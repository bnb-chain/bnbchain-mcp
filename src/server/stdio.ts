import "dotenv/config"

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import Logger from "@/utils/logger"
import { startServer } from "./base"

// Start the server
export const startStdioServer = async () => {
  try {
    const server = startServer()
    const transport = new StdioServerTransport()
    Logger.info("BNBChain MCP Server running on stdio mode")

    await server.connect(transport)
    return server
  } catch (error) {
    Logger.error("Error starting BNBChain MCP Stdio server:", error)
    process.exit(1)
  }
}
