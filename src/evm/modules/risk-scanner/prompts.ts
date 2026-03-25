import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { networkSchema } from "../common/types.js"

export function registerRiskScannerPrompts(server: McpServer) {
  // Contract risk assessment guidance
  server.prompt(
    "assess_contract_risk",
    "Get a security risk assessment for a smart contract on BNB Chain",
    {
      contractAddress: z
        .string()
        .describe("The contract address to assess"),
      context: z
        .string()
        .optional()
        .describe(
          "Additional context about the contract (e.g. 'token', 'DEX', 'staking')"
        ),
      network: networkSchema
    },
    ({ contractAddress, context, network = "bsc" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: context
              ? `I need a security risk assessment for the smart contract at ${contractAddress} on the ${network} network. This contract is described as: ${context}.\n\nPlease use the scan_contract_risk tool to analyze this contract. After getting the results, explain each finding in detail, what the practical implications are, and whether it is safe to interact with this contract. Focus on rug-pull indicators, ownership risks, and fee manipulation.`
              : `I need a security risk assessment for the smart contract at ${contractAddress} on the ${network} network.\n\nPlease use the scan_contract_risk tool to analyze this contract. After getting the results, explain each finding in detail, what the practical implications are, and whether it is safe to interact with this contract. Focus on rug-pull indicators, ownership risks, and fee manipulation.`
          }
        }
      ]
    })
  )
}
