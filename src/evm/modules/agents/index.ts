import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerAgentsPrompts } from "./prompts"
import { registerAgentsTools } from "./tools"

export function registerAgents(server: McpServer) {
  registerAgentsTools(server)
  registerAgentsPrompts(server)
}
