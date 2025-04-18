import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTokenResources } from "./resources";
import { registerTokenPrompts } from "./prompts";

export function registerTokens(server: McpServer) {
  registerTokenResources(server);
  registerTokenPrompts(server);
}
