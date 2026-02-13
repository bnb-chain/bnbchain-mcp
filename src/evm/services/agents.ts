import { decodeEventLog, type Hex } from "viem"

import { resolveChainId } from "../chains.js"
import { getERC8004Registries } from "../agentsRegistry.js"
import { getPublicClient, getWalletClient } from "./clients.js"
import { readContract, writeContract } from "./contracts.js"
import { IDENTITY_REGISTRY_ABI } from "./abi/identityRegistry.js"

function formatPrivateKey(privateKey: string | Hex): Hex {
  return typeof privateKey === "string" && !privateKey.startsWith("0x")
    ? (`0x${privateKey}` as Hex)
    : (privateKey as Hex)
}

/**
 * Register an agent on the ERC-8004 Identity Registry.
 * @returns agentId and transaction hash
 */
export async function registerAgent(
  privateKey: string | Hex,
  agentURI: string,
  network: string | number = "bsc"
): Promise<{ agentId: bigint; txHash: string }> {
  const key = formatPrivateKey(privateKey)
  const chainId = resolveChainId(network)
  const { identityRegistry } = getERC8004Registries(chainId)

  const txHash = await writeContract(
    key,
    {
      address: identityRegistry,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "register",
      args: [agentURI]
    },
    network
  )

  const publicClient = getPublicClient(network)
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

  let agentId: bigint | null = null
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: IDENTITY_REGISTRY_ABI,
        data: log.data,
        topics: log.topics
      })
      if (decoded.eventName === "Registered") {
        agentId = (decoded.args as { agentId: bigint }).agentId
        break
      }
    } catch {
      // not our event, skip
    }
  }
  if (agentId == null) {
    throw new Error("Registered event not found in transaction receipt")
  }

  return { agentId, txHash }
}

/**
 * Update the agent URI for an existing ERC-8004 agent.
 */
export async function setAgentURI(
  privateKey: string | Hex,
  agentId: bigint | number,
  newURI: string,
  network: string | number = "bsc"
): Promise<{ txHash: string }> {
  const key = formatPrivateKey(privateKey)
  const chainId = resolveChainId(network)
  const { identityRegistry } = getERC8004Registries(chainId)

  const txHash = await writeContract(
    key,
    {
      address: identityRegistry,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "setAgentURI",
      args: [BigInt(agentId), newURI]
    },
    network
  )

  return { txHash }
}

/**
 * Get agent info from the ERC-8004 Identity Registry (owner and tokenURI).
 */
export async function getAgent(
  agentId: bigint | number,
  network: string | number = "bsc"
): Promise<{ owner: string; tokenURI: string }> {
  const chainId = resolveChainId(network)
  const { identityRegistry } = getERC8004Registries(chainId)

  const [owner, tokenURI] = await Promise.all([
    readContract(
      {
        address: identityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: "ownerOf",
        args: [BigInt(agentId)]
      },
      network
    ),
    readContract(
      {
        address: identityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: "tokenURI",
        args: [BigInt(agentId)]
      },
      network
    )
  ])

  return { owner: owner as string, tokenURI: tokenURI as string }
}

/**
 * Get the verified agent wallet for an ERC-8004 agent (for payments).
 */
export async function getAgentWallet(
  agentId: bigint | number,
  network: string | number = "bsc"
): Promise<string> {
  const chainId = resolveChainId(network)
  const { identityRegistry } = getERC8004Registries(chainId)

  const wallet = await readContract(
    {
      address: identityRegistry,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "getAgentWallet",
      args: [BigInt(agentId)]
    },
    network
  )

  return wallet as string
}
