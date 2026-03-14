import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import * as services from "@/evm/services/index.js"
import { mcpToolRes } from "@/utils/helper"
import { defaultNetworkParam, privateKeyParam, requiredNetworkParam } from "../common/types.js"

export function registerAgentsTools(server: McpServer) {
  server.tool(
    "register_erc8004_agent",
    "Register an agent on the ERC-8004 Identity Registry. Mints an on-chain agent identity (NFT) and returns the agent ID. Use BSC or BSC Testnet; the agentURI should point to a JSON metadata file (AgentURI format) with name, description, image, and services (e.g. MCP endpoint).",
    {
      privateKey: privateKeyParam,
      agentURI: z
        .string()
        .describe(
          "URI of the agent metadata (e.g. ipfs://..., https://..., or data:application/json,...). Should follow ERC-8004 registration format with type, name, description, image, and services."
        ),
      network: requiredNetworkParam
    },
    async ({ privateKey, agentURI, network }) => {
      try {
        const result = await services.registerAgent(
          privateKey,
          agentURI,
          network
        )
        return mcpToolRes.success({
          agentId: result.agentId.toString(),
          txHash: result.txHash,
          network
        })
      } catch (error) {
        return mcpToolRes.error(error, "registering ERC-8004 agent")
      }
    }
  )

  server.tool(
    "set_erc8004_agent_uri",
    "Update the metadata URI for an existing ERC-8004 agent. Caller must be the owner of the agent NFT.",
    {
      privateKey: privateKeyParam,
      agentId: z
        .union([z.string(), z.number()])
        .describe("The ERC-8004 agent ID (token ID from the Identity Registry)"),
      newURI: z
        .string()
        .describe("New URI for the agent metadata (AgentURI format)"),
      network: requiredNetworkParam
    },
    async ({ privateKey, agentId, newURI, network }) => {
      try {
        const id = BigInt(agentId)
        const result = await services.setAgentURI(
          privateKey,
          id,
          newURI,
          network
        )
        return mcpToolRes.success({
          success: true,
          txHash: result.txHash,
          agentId: agentId.toString(),
          network
        })
      } catch (error) {
        return mcpToolRes.error(error, "setting ERC-8004 agent URI")
      }
    }
  )

  server.tool(
    "get_erc8004_agent",
    "Get agent info from the ERC-8004 Identity Registry: owner address and tokenURI (metadata URI).",
    {
      agentId: z
        .union([z.string(), z.number()])
        .describe("The ERC-8004 agent ID (token ID)"),
      network: defaultNetworkParam
    },
    async ({ agentId, network }) => {
      try {
        const id = BigInt(agentId)
        const result = await services.getAgent(id, network)
        return mcpToolRes.success({
          agentId: agentId.toString(),
          owner: result.owner,
          tokenURI: result.tokenURI,
          network
        })
      } catch (error) {
        return mcpToolRes.error(error, "getting ERC-8004 agent")
      }
    }
  )

  server.tool(
    "get_erc8004_agent_wallet",
    "Get the verified payment wallet address for an ERC-8004 agent (for x402 / agent payments). Set on-chain via setAgentWallet; defaults to owner on registration.",
    {
      agentId: z
        .union([z.string(), z.number()])
        .describe("The ERC-8004 agent ID (token ID)"),
      network: defaultNetworkParam
    },
    async ({ agentId, network }) => {
      try {
        const id = BigInt(agentId)
        const wallet = await services.getAgentWallet(id, network)
        return mcpToolRes.success({
          agentId: agentId.toString(),
          agentWallet: wallet,
          network
        })
      } catch (error) {
        return mcpToolRes.error(error, "getting ERC-8004 agent wallet")
      }
    }
  )
}
