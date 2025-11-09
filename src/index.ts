#!/usr/bin/env node
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp"

import { startHTTPServer } from "./server/http"
import { startSSEServer } from "./server/sse"
import { startStdioServer } from "./server/stdio"
import logger from "./utils/logger"

const args = process.argv.slice(2)
const httpMode = args.includes("--http") || args.includes("-h")
const sseMode = args.includes("--sse") || args.includes("-s")

async function main() {
  let server: McpServer | undefined
  if (httpMode) {
    server = await startHTTPServer() // Streamable HTTP only
  } else if (sseMode) {
    server = await startSSEServer() // SSE (deprecated)
  } else {
    server = await startStdioServer()
  }

  if (!server) {
    logger.error("Failed to start server")
    process.exit(1)
  }

  const handleShutdown = async () => {
    await server.close()
    process.exit(0)
  }
  // Handle process termination
  process.on("SIGINT", handleShutdown)
  process.on("SIGTERM", handleShutdown)
}

main()
