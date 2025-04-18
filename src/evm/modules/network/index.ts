import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNetworkPrompts } from "./prompts.js";
import { registerNetworkResources } from "./resources.js";
import { registerNetworkTools } from "./tools.js";

export function registerNetwork(server: McpServer) {
  registerNetworkPrompts(server);
  registerNetworkResources(server);
  registerNetworkTools(server);
} 