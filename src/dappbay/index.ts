import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerDappbayTools } from "./tools.js"

export function registerDappbay(server: McpServer) {
  registerDappbayTools(server)
}
