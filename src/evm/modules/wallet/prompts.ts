import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { networkSchema } from "../common/types.js"

export function registerWalletPrompts(server: McpServer) {
  // Address analysis prompt
  server.prompt(
    "analyze_address",
    "Analyze an EVM address",
    {
      address: z.string().describe("Ethereum address to analyze"),
      network: networkSchema
    },
    ({ address, network = "bsc-testnet" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please analyze the address ${address} on the ${network} network. Provide information about its balance, transaction count, and any other relevant information you can find.`
          }
        }
      ]
    })
  )
}
