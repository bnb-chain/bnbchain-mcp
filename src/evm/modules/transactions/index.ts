import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTransactionResources } from "./resources";
import { registerTransactionTools } from "./tools";
import { registerTransactionPrompts } from "./prompts";

export function registerTransactions(server: McpServer) {
  registerTransactionResources(server);
  registerTransactionTools(server);
  registerTransactionPrompts(server);
}
