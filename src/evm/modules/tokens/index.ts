import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerTokenPrompts } from "./prompts"
import { registerTokenResources } from "./resources"

export function registerTokens(server: McpServer) {
  registerTokenResources(server)
  registerTokenPrompts(server)
}
