import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerWaletPrompts } from "./prompts"
import { registerWalletResources } from "./resources"
import { registerWalletTools } from "./tools"

export function registerWallet(server: McpServer) {
  registerWalletResources(server)
  registerWalletTools(server)
  registerWaletPrompts(server)
}
