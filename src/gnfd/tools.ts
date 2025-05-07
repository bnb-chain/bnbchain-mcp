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
    .optional()
    .default("created-by-bnbchain-mcp")
    .describe(
      "The bucket name to use. If not provided, will use default 'created-by-bnbchain-mcp'"
    )

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
      bucketName: bucketNameParam
    },
    async ({ network, privateKey, bucketName }) => {
      try {
        const result = await services.createBucket(network, {
          privateKey: privateKey as Hex,
          bucketName
        })
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
    async ({
      network,
      privateKey,
      filePath,
      bucketName = "created-by-bnbchain-mcp"
    }) => {
      try {
        // Ensure absolute path is used
        const absoluteFilePath = path.isAbsolute(filePath)
          ? filePath
          : path.resolve(process.cwd(), filePath)

        const result = await services.createFile(network, {
          privateKey: privateKey as Hex,
          filePath: absoluteFilePath,
          bucketName
        })
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
        const result = await services.createFolder(network, {
          privateKey: privateKey as Hex,
          folderName,
          bucketName
        })
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "creating folder")
      }
    }
  )

  // 7. List buckets
  server.tool(
    "gnfd_list_buckets",
    "List all buckets owned by the account",
    {
      network: networkParam,
      address: z
        .string()
        .optional()
        .describe("The address of the account to list buckets for"),
      privateKey: privateKeyParam
    },
    async ({ network, address, privateKey }) => {
      try {
        const result = await services.listBuckets(network, {
          privateKey: privateKey as Hex,
          address: address as string
        })
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "listing buckets")
      }
    }
  )

  // 8. List objects
  server.tool(
    "gnfd_list_objects",
    "List all objects in a bucket",
    {
      network: networkParam,
      bucketName: bucketNameParam
    },
    async ({ network, bucketName }) => {
      try {
        const result = await services.listObjects(network, bucketName)
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "listing objects")
      }
    }
  )

  // 9. Delete object
  server.tool(
    "gnfd_delete_object",
    "Delete an object from a bucket",
    {
      network: networkParam,
      privateKey: privateKeyParam,
      bucketName: bucketNameParam,
      objectName: z.string().describe("The name of the object to delete")
    },
    async ({ network, privateKey, bucketName, objectName }) => {
      try {
        const result = await services.deleteObject(network, {
          privateKey: privateKey as Hex,
          bucketName,
          objectName
        })
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "deleting object")
      }
    }
  )

  // 10. Delete bucket
  server.tool(
    "gnfd_delete_bucket",
    "Delete a bucket",
    {
      network: networkParam,
      privateKey: privateKeyParam,
      bucketName: bucketNameParam
    },
    async ({ network, privateKey, bucketName }) => {
      try {
        const result = await services.deleteBucket(network, {
          privateKey: privateKey as Hex,
          bucketName
        })
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "deleting bucket")
      }
    }
  )

  // 11. Get bucket info
  server.tool(
    "gnfd_get_bucket_info",
    "Get detailed information about a bucket",
    {
      network: networkParam,
      bucketName: bucketNameParam
    },
    async ({ network, bucketName }) => {
      try {
        const result = await services.getBucketInfo(network, bucketName)
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "getting bucket info")
      }
    }
  )

  // 12. Get object info
  server.tool(
    "gnfd_get_object_info",
    "Get detailed information about an object in a bucket",
    {
      network: networkParam,
      bucketName: bucketNameParam,
      objectName: z.string().describe("The name of the object to get info for")
    },
    async ({ network, bucketName, objectName }) => {
      try {
        const result = await services.getObjectInfo(network, {
          bucketName,
          objectName
        })
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "getting object info")
      }
    }
  )
  // 13. Download object
  server.tool(
    "gnfd_download_object",
    "Download an object from a bucket",
    {
      network: networkParam,
      bucketName: bucketNameParam,
      objectName: z.string().describe("The name of the object to download"),
      targetPath: z
        .string()
        .optional()
        .describe("The path to save the downloaded object"),
      privateKey: privateKeyParam
    },
    async ({ network, bucketName, objectName, targetPath, privateKey }) => {
      try {
        const result = await services.downloadObject(network, {
          bucketName,
          objectName,
          targetPath,
          privateKey: privateKey as Hex
        })
        return formatResponse(result)
      } catch (error) {
        return handleError(error, "downloading object")
      }
    }
  )
}
