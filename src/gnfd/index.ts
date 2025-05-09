import "reflect-metadata"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp"

import { registerGnfdTools } from "./tools/index"

export const registerGnfd = (server: McpServer) => {
  registerGnfdTools(server)
}
