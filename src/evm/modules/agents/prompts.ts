import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { networkSchema } from "../common/types.js"

export function registerAgentsPrompts(server: McpServer) {
  server.prompt(
    "how_to_register_mcp_as_erc8004_agent",
    "Get step-by-step guidance on registering an MCP server as an ERC-8004 agent (on-chain identity, AgentURI metadata, and MCP endpoint in services).",
    {
      mcpEndpoint: z
        .string()
        .optional()
        .describe(
          "Optional: your MCP server URL (e.g. https://mcp.example.com/sse) to include in the suggested AgentURI services."
        ),
      network: networkSchema
    },
    ({ mcpEndpoint, network = "bsc" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I want to register my MCP server as an ERC-8004 agent on ${network}.${mcpEndpoint ? ` My MCP endpoint is: ${mcpEndpoint}.` : ""} Explain: (1) How to prepare the AgentURI JSON (type, name, description, image, and services with MCP endpoint per https://best-practices.8004scan.io/docs/01-agent-metadata-standard.html). (2) How to host or encode it (e.g. IPFS, data URI, or HTTPS). (3) How to call register_erc8004_agent with that URI. (4) Optionally how to set agentWallet for payments.`
          }
        }
      ]
    })
  )
}
