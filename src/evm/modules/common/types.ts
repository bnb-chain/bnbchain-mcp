import { z } from "zod"

export const defaultNetworkParam = z
  .string()
  .describe(
    "Network name (e.g. 'bsc', 'bsc-testnet', 'opbnb', 'opbnb-testnet', 'ethereum', 'base', etc.) or chain ID. Supports others main popular networks. Defaults to BSC testnet."
  )
  .default("bsc-testnet")

export const requiredNetworkParam = z
  .string()
  .describe(
    "Network name (e.g. 'bsc', 'bsc-testnet', 'opbnb', 'opbnb-testnet', 'ethereum', 'base', etc.) or chain ID. Required for all write operations (transfers, deploys, contract writes, etc.); must be explicitly provided—no default."
  )

export const networkSchema = z
  .string()
  .describe(
    "Network name (e.g. 'bsc', 'bsc-testnet', 'opbnb', 'opbnb-testnet', 'ethereum', 'base', etc.) or chain ID. Supports others main popular networks. Defaults to BSC testnet."
  )
  .optional()

export const privateKeyParam = z
  .string()
  .describe(
    "Private key in hex format (with or without 0x prefix). Prefer setting PRIVATE_KEY in the MCP server environment; do not pass the private key in tool parameters when avoidable, as it may be stored in conversation or request logs. This value is used only for signing and is not stored by the server."
  )
  .default(process.env.PRIVATE_KEY as string)

/** Positive decimal string for amounts (e.g. '0.1', '100'). Rejects empty, negative, zero, and non-numeric. */
export const positiveAmountParam = z
  .string()
  .regex(
    /^\d+(\.\d+)?$/,
    "Amount must be a positive number (e.g. '0.1' or '100')"
  )
  .refine((v) => Number(v) > 0, "Amount must be greater than zero")
