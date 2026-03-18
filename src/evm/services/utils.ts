import { formatEther, parseEther } from "viem"

/** Matches a positive decimal string (e.g. "0.1", "100"). */
const POSITIVE_DECIMAL_REGEX = /^\d+(\.\d+)?$/

/**
 * Validates that a string is a positive decimal amount. Throws with a clear error if not.
 * Use before parseEther/parseUnits to avoid unexpected behavior or stack traces.
 */
export function validatePositiveAmount(
  amount: string,
  label = "Amount"
): void {
  if (typeof amount !== "string" || amount.trim() === "") {
    throw new Error(`${label} must be a non-empty string`)
  }
  if (!POSITIVE_DECIMAL_REGEX.test(amount.trim())) {
    throw new Error(
      `${label} must be a positive number (e.g. "0.1" or "100"). Got: ${amount.slice(0, 50)}`
    )
  }
  const n = Number(amount)
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`${label} must be greater than zero. Got: ${amount}`)
  }
}

/**
 * Utility functions for formatting and parsing values
 */
export const utils = {
  // Convert ether to wei
  parseEther,

  // Convert wei to ether
  formatEther,

  // Format a bigint to a string
  formatBigInt: (value: bigint): string => value.toString(),

  // Format an object to JSON with bigint handling
  formatJson: (obj: unknown): string =>
    JSON.stringify(
      obj,
      (_, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    ),

  // Format a number with commas
  formatNumber: (value: number | string): string => {
    return Number(value).toLocaleString()
  },

  // Convert a hex string to a number
  hexToNumber: (hex: string): number => {
    return parseInt(hex, 16)
  },

  // Convert a number to a hex string
  numberToHex: (num: number): string => {
    return "0x" + num.toString(16)
  }
}
