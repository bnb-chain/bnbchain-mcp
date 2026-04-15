import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerConfirmTools } from "./tools.js"

export function registerConfirm(server: McpServer) {
  registerConfirmTools(server)
}
