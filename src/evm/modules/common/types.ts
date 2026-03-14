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
    "Private key in hex format (with or without 0x prefix). SECURITY: This is used only for address derivation and is not stored. The private key will not be logged or displayed in chat history."
  )
  .default(process.env.PRIVATE_KEY ?? "")
