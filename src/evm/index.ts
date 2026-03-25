import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerAgents } from "./modules/agents/index.js"
import { registerBlocks } from "./modules/blocks/index.js"
import { registerContracts } from "./modules/contracts/index.js"
import { registerNetwork } from "./modules/network/index.js"
import { registerNFT } from "./modules/nft/index.js"
import { registerRiskScanner } from "./modules/risk-scanner/index.js"
import { registerTokens } from "./modules/tokens/index.js"
import { registerTransactions } from "./modules/transactions/index.js"
import { registerWallet } from "./modules/wallet/index.js"

export function registerEVM(server: McpServer) {
  registerAgents(server)
  registerBlocks(server)
  registerContracts(server)
  registerNetwork(server)
  registerTokens(server)
  registerTransactions(server)
  registerWallet(server)
  registerNFT(server)
  registerRiskScanner(server)
}
