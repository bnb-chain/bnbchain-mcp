import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Address, Hex } from "viem"
import { z } from "zod"

import { defaultNetworkParam } from "@/evm/modules/common/types.js"
import * as services from "@/evm/services/index.js"
import { safeStringify } from "@/utils/helper"

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

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  address,
                  network,
                  isContract,
                  type: isContract ? "Contract" : "EOA"
                },
                2
              )
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error checking contract status: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )

  // Read contract data
  server.tool(
    "read_contract",
    "Read data from a smart contract by calling a view/pure function",
    {
      contractAddress: z
        .string()
        .describe("The address of the smart contract to interact with"),
      abi: z
        .array(z.any())
        .describe("The ABI of the smart contract function, as a JSON array"),
      functionName: z
        .string()
        .describe("The name of the function to call on the contract"),
      args: z
        .array(z.any())
        .optional()
        .describe("The arguments to pass to the function"),
      network: defaultNetworkParam
    },
    async ({ contractAddress, abi, functionName, args = [], network }) => {
      try {
        // Parse ABI if it's a string
        const parsedAbi = typeof abi === "string" ? JSON.parse(abi) : abi

        const params = {
          address: contractAddress as Address,
          abi: parsedAbi,
          functionName,
          args
        }

        const result = await services.readContract(params, network)

        return {
          content: [
            {
              type: "text",
              text: services.helpers.formatJson(result)
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error reading contract: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )

  // Write to contract
  server.tool(
    "write_contract",
    "Write data to a smart contract by calling a state-changing function",
    {
      contractAddress: z
        .string()
        .describe("The address of the smart contract to interact with"),
      abi: z
        .array(z.any())
        .describe("The ABI of the smart contract function, as a JSON array"),
      functionName: z
        .string()
        .describe("The name of the function to call on the contract"),
      args: z.array(z.any()).describe("The arguments to pass to the function"),
      privateKey: z
        .string()
        .describe(
          "Private key of the sending account. Used only for transaction signing."
        )
        .default(process.env.PRIVATE_KEY as string),
      network: defaultNetworkParam
    },
    async ({
      contractAddress,
      abi,
      functionName,
      args,
      privateKey,
      network = "bsc"
    }) => {
      try {
        // Parse ABI if it's a string
        const parsedAbi = typeof abi === "string" ? JSON.parse(abi) : abi

        const contractParams: Record<string, any> = {
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

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  contractAddress,
                  functionName,
                  args,
                  transactionHash: txHash,
                  message: "Contract write transaction sent successfully"
                },
                2
              )
            }
          ]
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error writing to contract: ${
                error instanceof Error ? error.message : String(error)
              }`
            }
          ],
          isError: true
        }
      }
    }
  )
}
