import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBlockPrompts } from "./prompts.js";
import { registerBlockResources } from "./resources.js";

export function registerBlocks(server: McpServer) {
  registerBlockPrompts(server);
  registerBlockResources(server);
}
