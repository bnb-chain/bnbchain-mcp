import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { defaultNetworkParam } from "@/evm/modules/common/types.js"
import { scanContractRisk } from "@/evm/services/risk-scanner.js"
import { mcpToolRes } from "@/utils/helper"

export function registerRiskScannerTools(server: McpServer) {
  // Smart Contract Risk Scanner
  server.tool(
    "scan_contract_risk",
    "Analyze a smart contract for common vulnerability patterns, rug-pull indicators, and security risks. Returns a risk assessment with severity ratings.",
    {
      contractAddress: z
        .string()
        .describe(
          "The smart contract address to scan for risks (e.g. a token or DeFi contract)"
        ),
      network: defaultNetworkParam
    },
    async ({ contractAddress, network = "bsc" }) => {
      try {
        const assessment = await scanContractRisk(contractAddress, network)

        return mcpToolRes.success(assessment)
      } catch (error) {
        return mcpToolRes.error(error, "scanning contract risk")
      }
    }
  )
}
