import { describe, expect, it } from "bun:test"

import { getChain, getRpcUrl, resolveChainId } from "@/evm/chains.js"

describe("EVM chain resolution", () => {
  it("resolves supported decimal chain ID strings", () => {
    expect(resolveChainId("56")).toBe(56)
    expect(resolveChainId("97")).toBe(97)
    expect(getChain("56").id).toBe(56)
    expect(getRpcUrl("97")).toBe(
      "https://data-seed-prebsc-1-s1.binance.org:8545"
    )
  })

  it("rejects malformed and unsupported chain ID strings", () => {
    expect(() => resolveChainId("56abc")).toThrow("Unsupported network")
    expect(() => resolveChainId("999")).toThrow("Unsupported network")
  })

  it("rejects unsupported numeric IDs instead of falling back to Ethereum", () => {
    expect(() => getChain(999)).toThrow("Unsupported chain ID: 999")
    expect(() => getRpcUrl(999)).toThrow("Unsupported chain ID: 999")
  })
})
