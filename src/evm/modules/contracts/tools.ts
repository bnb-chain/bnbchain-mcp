import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Address, Hex } from "viem"
import { z } from "zod"

import {
  defaultNetworkParam,
  requiredNetworkParam
} from "@/evm/modules/common/types.js"
import type { WriteContractInput } from "@/evm/services/contracts.js"
import * as services from "@/evm/services/index.js"
import { mcpToolRes } from "@/utils/helper"
import { createPendingIntent } from "@/utils/pendingTransferStore.js"
import {
  isSkipTransferConfirmation,
  skipConfirmationParam
} from "@/utils/transferConfirmation.js"

export function registerContractTools(server: McpServer) {
  // Check if address is contract
  server.tool(
    "is_contract",
    "Check if an address is a smart contract or an externally owned account (EOA)",
    {
      address: z.string().describe("The wallet or contract address to check"),
      network: defaultNetworkParam
    },
    async ({ address, network = "bsc" }) => {
      try {
        const isContract = await services.isContract(
          address as Address,
          network
        )

        return mcpToolRes.success({
          address,
          network,
          isContract,
          type: isContract ? "Contract" : "EOA"
        })
      } catch (error) {
        return mcpToolRes.error(error, "checking contract status")
      }
    }
  )

  const DEFAULT_MAX_RESPONSE_BYTES = 4096

  // Read contract data
  server.tool(
    "read_contract",
    "Read data from a smart contract by calling a view/pure function. Response is truncated if it exceeds maxResponseSize bytes.",
    {
      contractAddress: z
        .string()
        .describe("The address of the smart contract to interact with"),
      abi: z
        .array(z.record(z.unknown()))
        .describe("The ABI of the smart contract function, as a JSON array"),
      functionName: z
        .string()
        .describe("The name of the function to call on the contract"),
      args: z
        .array(
          z.union([
            z.string(),
            z.number(),
            z.boolean(),
            z.null(),
            z.array(z.unknown()),
            z.record(z.unknown())
          ])
        )
        .optional()
        .describe("The arguments to pass to the function"),
      network: defaultNetworkParam,
      maxResponseSize: z
        .number()
        .min(256)
        .max(1024 * 1024)
        .optional()
        .default(DEFAULT_MAX_RESPONSE_BYTES)
        .describe(
          "Max response size in bytes (default 4096). Larger responses are truncated with truncated: true."
        )
    },
    async ({
      contractAddress,
      abi,
      functionName,
      args = [],
      network,
      maxResponseSize
    }) => {
      try {
        const parsedAbi = typeof abi === "string" ? JSON.parse(abi) : abi

        const params = {
          address: contractAddress as Address,
          abi: parsedAbi,
          functionName,
          args
        }

        const result = await services.readContract(params, network)

        const jsonStr = JSON.stringify(
          result,
          (_, v) => (typeof v === "bigint" ? v.toString() : v),
          2
        )
        const byteLength = Buffer.byteLength(jsonStr, "utf8")
        if (byteLength <= maxResponseSize) {
          return mcpToolRes.success(result)
        }
        const truncated = jsonStr.slice(0, maxResponseSize)
        return mcpToolRes.success({
          value: truncated,
          truncated: true,
          originalByteSize: byteLength,
          message:
            "Response exceeded maxResponseSize and was truncated. Increase maxResponseSize or query a smaller range."
        })
      } catch (error) {
        return mcpToolRes.error(error, "reading contract")
      }
    }
  )

  // Write to contract
  server.tool(
    "write_contract",
    "Write data to a smart contract by calling a state-changing function. By default returns a preview and confirmToken—call confirm_transfer with the token to execute. Set skipConfirmation=true or BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION=true to execute immediately.",
    {
      contractAddress: z
        .string()
        .describe("The address of the smart contract to interact with"),
      abi: z
        .array(z.record(z.unknown()))
        .describe("The ABI of the smart contract function, as a JSON array"),
      functionName: z
        .string()
        .describe("The name of the function to call on the contract"),
      args: z
        .array(
          z.union([
            z.string(),
            z.number(),
            z.boolean(),
            z.null(),
            z.array(z.unknown()),
            z.record(z.unknown())
          ])
        )
        .describe("The arguments to pass to the function"),
      privateKey: z
        .string()
        .describe(
          "Private key of the sending account. Used only for transaction signing."
        )
        .default(process.env.PRIVATE_KEY as string),
      network: requiredNetworkParam,
      skipConfirmation: skipConfirmationParam
    },
    async ({
      contractAddress,
      abi,
      functionName,
      args,
      privateKey,
      network,
      skipConfirmation
    }) => {
      try {
        const parsedAbi = typeof abi === "string" ? JSON.parse(abi) : abi

        if (skipConfirmation || isSkipTransferConfirmation()) {
          const contractParams: WriteContractInput = {
            address: contractAddress as Address,
            abi: parsedAbi,
            functionName,
            args
          }
          const txHash = await services.writeContract(
            privateKey as Hex,
            contractParams,
            network
          )
          return mcpToolRes.success({
            contractAddress,
            functionName,
            args,
            transactionHash: txHash,
            message: "Contract write transaction sent successfully"
          })
        }

        const { token: confirmToken, expiresAt } = createPendingIntent({
          type: "write_contract",
          params: { contractAddress, abi: parsedAbi, functionName, args },
          network
        })
        return mcpToolRes.success({
          preview: { contractAddress, functionName, args, network },
          confirmToken,
          expiresAt,
          message:
            "Call confirm_transfer with this confirmToken and your privateKey to execute the contract write."
        })
      } catch (error) {
        return mcpToolRes.error(error, "writing to contract")
      }
    }
  )
}
