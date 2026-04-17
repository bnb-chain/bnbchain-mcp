import type {
  Abi,
  Address,
  GetLogsParameters,
  Hash,
  Hex,
  Log,
  ReadContractParameters
} from "viem"

import { getPublicClient, getWalletClient } from "./clients.js"
import { resolveAddress } from "./ens.js"

export async function readContract(
  params: ReadContractParameters,
  network = "ethereum"
) {
  const client = getPublicClient(network)
  return await client.readContract(params)
}

export type WriteContractInput = {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
}

export async function writeContract(
  privateKey: Hex,
  params: WriteContractInput,
  network = "ethereum"
): Promise<Hash> {
  const client = getWalletClient(privateKey, network)
  return await client.writeContract({
    ...params,
    account: client.account,
    chain: client.chain
  })
}

export async function getLogs(
  params: GetLogsParameters,
  network = "ethereum"
): Promise<Log[]> {
  const client = getPublicClient(network)
  return await client.getLogs(params)
}

export async function isContract(
  addressOrEns: string,
  network = "ethereum"
): Promise<boolean> {
  const address = await resolveAddress(addressOrEns, network)
  const client = getPublicClient(network)
  const code = await client.getCode({ address })
  return code !== undefined && code !== "0x"
}
