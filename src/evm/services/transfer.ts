import {
  type Address,
  type Hash,
  type Hex,
  getContract,
  parseEther,
  parseUnits
} from "viem"

import { ERC20_ABI } from "./abi/erc20.js"
import { ERC721_ABI } from "./abi/erc721.js"
import { ERC1155_ABI } from "./abi/erc1155.js"
import { getPublicClient, getWalletClient } from "./clients.js"
import { resolveAddress } from "./ens.js"
import { validatePositiveAmount } from "./utils.js"

export async function transferETH(
  privateKey: string | Hex,
  toAddressOrEns: string,
  amount: string, // in ether
  network = "ethereum"
): Promise<Hash> {
  validatePositiveAmount(amount, "Transfer amount")

  const toAddress = await resolveAddress(toAddressOrEns, network)

  const formattedKey =
    typeof privateKey === "string" && !privateKey.startsWith("0x")
      ? (`0x${privateKey}` as Hex)
      : (privateKey as Hex)

  const client = getWalletClient(formattedKey, network)
  const amountWei = parseEther(amount)

  const publicClient = getPublicClient(network)
  const balance = await publicClient.getBalance({
    address: client.account.address
  })
  if (balance < amountWei) {
    throw new Error(
      `Insufficient balance. Current: ${balance.toString()} wei; required: ${amountWei.toString()} wei (${amount} native token). Consider gas fees.`
    )
  }

  return client.sendTransaction({
    to: toAddress,
    value: amountWei,
    account: client.account,
    chain: client.chain
  })
}

export async function transferERC20(
  tokenAddressOrEns: string,
  toAddressOrEns: string,
  amount: string,
  privateKey: string | `0x${string}`,
  network = "ethereum"
): Promise<{
  txHash: Hash
  amount: {
    raw: bigint
    formatted: string
  }
  token: {
    symbol: string
    decimals: number
  }
}> {
  const tokenAddress = (await resolveAddress(
    tokenAddressOrEns,
    network
  )) as Address
  const toAddress = (await resolveAddress(toAddressOrEns, network)) as Address

  validatePositiveAmount(amount, "Transfer amount")

  const formattedKey =
    typeof privateKey === "string" && !privateKey.startsWith("0x")
      ? (`0x${privateKey}` as `0x${string}`)
      : (privateKey as `0x${string}`)

  const publicClient = getPublicClient(network)
  const contract = getContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    client: publicClient
  })

  const decimals = (await contract.read.decimals()) as number
  const symbol = (await contract.read.symbol()) as string

  const rawAmount = parseUnits(amount, decimals)

  const walletClient = getWalletClient(formattedKey, network)
  const balance = await contract.read.balanceOf([walletClient.account.address])
  if (balance < rawAmount) {
    throw new Error(
      `Insufficient token balance. Have: ${balance.toString()} (raw); required: ${rawAmount.toString()} (${amount} ${symbol}).`
    )
  }

  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [toAddress, rawAmount],
    account: walletClient.account,
    chain: walletClient.chain
  })

  return {
    txHash: hash,
    amount: {
      raw: rawAmount,
      formatted: amount
    },
    token: {
      symbol,
      decimals
    }
  }
}

export async function approveERC20(
  tokenAddressOrEns: string,
  spenderAddressOrEns: string,
  amount: string,
  privateKey: string | `0x${string}`,
  network = "ethereum"
): Promise<{
  txHash: Hash
  amount: {
    raw: bigint
    formatted: string
  }
  token: {
    symbol: string
    decimals: number
  }
}> {
  const tokenAddress = (await resolveAddress(
    tokenAddressOrEns,
    network
  )) as Address
  const spenderAddress = (await resolveAddress(
    spenderAddressOrEns,
    network
  )) as Address

  validatePositiveAmount(amount, "Approval amount")

  const formattedKey =
    typeof privateKey === "string" && !privateKey.startsWith("0x")
      ? (`0x${privateKey}` as `0x${string}`)
      : (privateKey as `0x${string}`)

  const publicClient = getPublicClient(network)
  const contract = getContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    client: publicClient
  })

  const decimals = (await contract.read.decimals()) as number
  const symbol = (await contract.read.symbol()) as string

  const rawAmount = parseUnits(amount, decimals)

  const walletClient = getWalletClient(formattedKey, network)

  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [spenderAddress, rawAmount],
    account: walletClient.account,
    chain: walletClient.chain
  })

  return {
    txHash: hash,
    amount: {
      raw: rawAmount,
      formatted: amount
    },
    token: {
      symbol,
      decimals
    }
  }
}

export async function transferERC721(
  tokenAddressOrEns: string,
  toAddressOrEns: string,
  tokenId: bigint,
  privateKey: string | `0x${string}`,
  network = "ethereum"
): Promise<{
  txHash: Hash
  tokenId: string
  token: {
    name: string
    symbol: string
  }
}> {
  const tokenAddress = (await resolveAddress(
    tokenAddressOrEns,
    network
  )) as Address
  const toAddress = (await resolveAddress(toAddressOrEns, network)) as Address

  const formattedKey =
    typeof privateKey === "string" && !privateKey.startsWith("0x")
      ? (`0x${privateKey}` as `0x${string}`)
      : (privateKey as `0x${string}`)

  const publicClient = getPublicClient(network)
  const contract = getContract({
    address: tokenAddress,
    abi: ERC721_ABI,
    client: publicClient
  })

  const name = (await contract.read.name()) as string
  const symbol = (await contract.read.symbol()) as string

  const walletClient = getWalletClient(formattedKey, network)

  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC721_ABI,
    functionName: "transferFrom",
    args: [walletClient.account.address, toAddress, tokenId],
    account: walletClient.account,
    chain: walletClient.chain
  })

  return {
    txHash: hash,
    tokenId: tokenId.toString(),
    token: {
      name,
      symbol
    }
  }
}

export async function transferERC1155(
  tokenAddressOrEns: string,
  toAddressOrEns: string,
  tokenId: bigint,
  amount: string,
  privateKey: string | `0x${string}`,
  network = "ethereum"
): Promise<{
  txHash: Hash
  tokenId: string
  amount: string
}> {
  const tokenAddress = (await resolveAddress(
    tokenAddressOrEns,
    network
  )) as Address
  const toAddress = (await resolveAddress(toAddressOrEns, network)) as Address

  const formattedKey =
    typeof privateKey === "string" && !privateKey.startsWith("0x")
      ? (`0x${privateKey}` as `0x${string}`)
      : (privateKey as `0x${string}`)

  const walletClient = getWalletClient(formattedKey, network)

  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC1155_ABI,
    functionName: "safeTransferFrom",
    args: [
      walletClient.account.address,
      toAddress,
      tokenId,
      BigInt(amount),
      "0x" as `0x${string}`
    ],
    account: walletClient.account,
    chain: walletClient.chain
  })

  return {
    txHash: hash,
    tokenId: tokenId.toString(),
    amount
  }
}
