import { z } from "zod"

/**
 * When true, all transfer/payment tools execute immediately (no preview step).
 * Set BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION=true to skip confirmation for automation.
 */
export function isSkipTransferConfirmation(): boolean {
  return process.env.BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION === "true"
}

/**
 * Tool parameter: when true, execute immediately and skip the preview/confirmation step.
 * Shared by EVM and Greenfield transfer/payment tools.
 */
export const skipConfirmationParam = z
  .boolean()
  .optional()
  .default(false)
  .describe(
    "If true, execute immediately and skip the preview/confirmation step. Set to true for scripts or when the caller has already confirmed."
  )
