import path from "path"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Hex } from "viem"
import { z } from "zod"

import * as services from "@/gnfd/services"
import { helpers } from "@/gnfd/util"

// Get default private key from environment variables, use sample key if not set
const DEFAULT_PRIVATE_KEY = process.env.PRIVATE_KEY || ""

/**
 * Register all Greenfield-related tools
 */
export function registerGnfdTools(server: McpServer) {
  // Common parameters
  const networkParam = z
    .enum(["testnet", "mainnet"])
    .optional()
    .default("testnet")
    .describe("Network name (e.g. 'testnet', 'mainnet'). Defaults to testnet.")

  const privateKeyParam = z
    .string()
    .optional()
    .default(DEFAULT_PRIVATE_KEY)
    .describe(
      "Private key of the account in hex format. SECURITY: This is used only for transaction signing."
    )

  const bucketNameParam = z
    .string()
    .default("created-by-bnbchain-mcp")
    .optional()
    .describe(`Optional bucket name.  Default is 'created-by-bnbchain-mcp'`)

  // Unified error handling
  const handleError = (error: unknown, operation: string) => {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error ${operation}: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    }
  }

  // Unified response formatting
  const formatResponse = (data: unknown) => {
    return {
      content: [
        {
          type: "text" as const,
          text: helpers.formatJson(data)
        }
      ]
    }
  }

  // 1. Get account balance
  server.tool(
    "gnfd_get_account_balance",
    "Get the account balance for a Greenfield address",
    {
      network: networkParam,
      privateKey: privateKeyParam
    },
    async ({ network, privateKey }) => {
      try {
        const balance = await services.getAccountBalance(
          network,
          privateKey as Hex
        )
        return formatResponse(balance)
      } catch (error) {
        return handleError(error, "fetching account balance")
      }
    }
  )

  // 2. Get module accounts list
  server.tool(
    "gnfd_get_module_accounts",
    "Get a list of all module accounts and their information in Greenfield",
    {
      network: networkParam
    },
    async ({ network }) => {
      try {
        const moduleAccounts = await services.getModuleAccounts(network)
        return formatResponse(moduleAccounts)
      } catch (error) {
        return handleError(error, "fetching module accounts")
      }
    }
  )

  // 3. Get all storage providers
  server.tool(
    "gnfd_get_all_sps",
    "Get a list of all storage providers in the Greenfield network",
    {
      network: networkParam
    },
    async ({ network }) => {
      try {
        const sps = await services.getAllSps(network)
        return formatResponse(sps)
      } catch (error) {
        return handleError(error, "fetching storage providers")
      }
    }
  )

  // 4. Create bucket
  server.tool(
    "gnfd_create_bucket",
    "Create a new bucket in Greenfield storage",
    {
      network: networkParam,
      privateKey: privateKeyParam,
      bucketName: z.string().describe("A new bucket name")
    },
    async ({ network, privateKey, bucketName }) => {
      try {
        const result = await services.createBucket(
          network,
          privateKey as Hex,
          bucketName
        )
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "creating bucket")
      }
    }
  )

  // 5. Create file
  server.tool(
    "gnfd_create_file",
    "Upload a file to a Greenfield bucket",
    {
      network: networkParam,
      privateKey: privateKeyParam,
      filePath: z
        .string()
        .describe(
          "Absolute path to the file to upload. The file must exist on the machine."
        ),
      bucketName: bucketNameParam
    },
    async ({ network, privateKey, filePath, bucketName }) => {
      try {
        // Ensure absolute path is used
        const absoluteFilePath = path.isAbsolute(filePath)
          ? filePath
          : path.resolve(process.cwd(), filePath)

        const result = await services.createFile(
          network,
          privateKey as Hex,
          absoluteFilePath,
          bucketName
        )
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "creating file")
      }
    }
  )

  // 6. Create folder
  server.tool(
    "gnfd_create_folder",
    "Create a folder in a Greenfield bucket",
    {
      network: networkParam,
      privateKey: privateKeyParam,
      folderName: z
        .string()
        .optional()
        .default("created-by-bnbchain-mcp")
        .describe("Optional folder name. Default is 'created-by-bnbchain-mcp'"),
      bucketName: bucketNameParam
    },
    async ({ network, privateKey, folderName, bucketName }) => {
      try {
        const result = await services.createFolder(
          network,
          privateKey as Hex,
          folderName,
          bucketName
        )
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "creating folder")
      }
    }
  )
}
