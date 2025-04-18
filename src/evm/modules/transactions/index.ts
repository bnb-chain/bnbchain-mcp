import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerTransactionPrompts } from "./prompts"
import { registerTransactionResources } from "./resources"
import { registerTransactionTools } from "./tools"

export function registerTransactions(server: McpServer) {
  registerTransactionResources(server)
  registerTransactionTools(server)
  registerTransactionPrompts(server)
}
