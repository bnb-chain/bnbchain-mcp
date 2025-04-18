import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerWalletResources } from "./resources";
import { registerWalletTools } from "./tools";
import { registerWaletPrompts } from "./prompts";

export function registerWallet(server: McpServer) {
  registerWalletResources(server);
  registerWalletTools(server);
  registerWaletPrompts(server);
}
