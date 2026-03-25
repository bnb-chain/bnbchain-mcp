import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerRiskScannerPrompts } from "./prompts.js"
import { registerRiskScannerTools } from "./tools.js"

export function registerRiskScanner(server: McpServer) {
  registerRiskScannerPrompts(server)
  registerRiskScannerTools(server)
}
