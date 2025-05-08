import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import * as services from "@/evm/services/index.js"
import { safeStringify } from "@/utils/helper"

export function registerWalletTools(server: McpServer) {
  // Get address from private key
  server.tool(
    "get_address_from_private_key",
    "Get the EVM address derived from a private key",
    {
      privateKey: z
        .string()
        .describe(
          "Private key in hex format (with or without 0x prefix). SECURITY: This is used only for address derivation and is not stored."
        )
        .default(process.env.PRIVATE_KEY as string)
    },
    async ({ privateKey }) => {
      try {
        // Ensure the private key has 0x prefix
        const formattedKey = privateKey.startsWith("0x")
          ? (privateKey as services.Hex)
          : (`0x${privateKey}` as services.Hex)

        const address = services.getAddressFromPrivateKey(formattedKey)

        return {
          content: [
            {
              type: "text",
              text: safeStringify(
                {
                  address,
                  privateKey: "0x" + privateKey.replace(/^0x/, "")
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
              text: `Error deriving address from private key: ${
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
