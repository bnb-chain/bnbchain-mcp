import { type Address, getAddress } from "viem"
import { normalize } from "viem/ens"

import { getPublicClient } from "./clients.js"

/**
 * Resolves an ENS name to an Ethereum address or validates and returns the EIP-55 checksummed address.
 * Rejects addresses that fail EIP-55 checksum validation (e.g. typos, phishing-style mixed case).
 * @param addressOrEns An Ethereum address or ENS name
 * @param network The network to use for ENS resolution (defaults to Ethereum mainnet)
 * @returns The resolved or validated Ethereum address (EIP-55 checksummed)
 */
export async function resolveAddress(
  addressOrEns: string,
  network = "ethereum"
): Promise<Address> {
  if (/^0x[a-fA-F0-9]{40}$/.test(addressOrEns)) {
    try {
      return getAddress(addressOrEns)
    } catch {
      throw new Error(
        `Invalid address checksum (EIP-55). Please verify the address and resubmit. Got: ${addressOrEns.slice(0, 10)}...`
      )
    }
  }

  // If it looks like an ENS name (contains a dot), try to resolve it
  if (addressOrEns.includes(".")) {
    try {
      // Normalize the ENS name first
      const normalizedEns = normalize(addressOrEns)

      // Get the public client for the network
      const publicClient = getPublicClient(network)

      // Resolve the ENS name to an address
      const address = await publicClient.getEnsAddress({
        name: normalizedEns
      })

      if (!address) {
        throw new Error(
          `ENS name ${addressOrEns} could not be resolved to an address`
        )
      }

      return address
    } catch (error: unknown) {
      throw new Error(
        `Failed to resolve ENS name ${addressOrEns}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  // If it's neither a valid address nor an ENS name, throw an error
  throw new Error(`Invalid address or ENS name: ${addressOrEns}`)
}
