import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerWalletPrompts } from "./prompts"
import { registerWalletTools } from "./tools"

export function registerWallet(server: McpServer) {
  registerWalletTools(server)
  registerWalletPrompts(server)
}
