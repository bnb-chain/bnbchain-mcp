import type { Hex } from "viem"
import { z } from "zod"

// Get default private key from environment variables, use sample key if not set
export const DEFAULT_PRIVATE_KEY = process.env.PRIVATE_KEY || ""

// Common parameters
export const networkParam = z
  .enum(["testnet", "mainnet"])
  .optional()
  .default("testnet")
  .describe("Network name (e.g. 'testnet', 'mainnet'). Defaults to testnet.")

export const privateKeyParam = z
  .string()
  .optional()
  .default(DEFAULT_PRIVATE_KEY)
  .describe(
    "Private key in hex format. Prefer PRIVATE_KEY in the MCP server environment; do not pass in tool parameters when avoidable, as it may be stored in logs or conversation history."
  )

export const bucketNameParam = z
  .string()
  .optional()
  .default("created-by-bnbchain-mcp")
  .describe(
    "The bucket name to use. If not provided, will use default 'created-by-bnbchain-mcp'"
  )

/** Positive decimal string for BNB/token amounts (e.g. '0.1', '100'). */
export const positiveAmountParam = z
  .string()
  .regex(/^\d+(\.\d+)?$/, "Amount must be a positive number (e.g. '0.1' or '100')")
  .refine((v) => Number(v) > 0, "Amount must be greater than zero")
