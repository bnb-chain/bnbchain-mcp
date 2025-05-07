import "reflect-metadata"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp"

import { registerGnfdTools } from "./tools"

export const registerGnfd = (server: McpServer) => {
  registerGnfdTools(server)
}
