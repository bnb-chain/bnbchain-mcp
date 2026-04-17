import { type Hex, formatEther, parseEther } from "viem"

/**
 * Normalize a private key to a 0x-prefixed hex string expected by viem.
 * Accepts keys with or without the 0x prefix.
 */
export function normalizePrivateKey(privateKey: string | Hex): Hex {
  return typeof privateKey === "string" && !privateKey.startsWith("0x")
    ? (`0x${privateKey}` as Hex)
    : (privateKey as Hex)
}

/** Matches a positive decimal string (e.g. "0.1", "100"). */
const POSITIVE_DECIMAL_REGEX = /^\d+(\.\d+)?$/

/**
 * Validates that a string is a positive decimal amount. Throws with a clear error if not.
 * Use before parseEther/parseUnits to avoid unexpected behavior or stack traces.
 */
export function validatePositiveAmount(amount: string, label = "Amount"): void {
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
  parseEther,
  formatEther,

  formatBigInt: (value: bigint): string => value.toString(),

  formatJson: (obj: unknown): string =>
    JSON.stringify(
      obj,
      (_, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    ),

  formatNumber: (value: number | string): string => {
    return Number(value).toLocaleString()
  },

  hexToNumber: (hex: string): number => {
    return Number.parseInt(hex, 16)
  },

  numberToHex: (num: number): string => {
    return `0x${num.toString(16)}`
  }
}
