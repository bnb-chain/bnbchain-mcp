import type { Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import { getClient } from "./client"

export const getAddressFromPrivateKey = (privateKey: Hex) => {
  const account = privateKeyToAccount(privateKey)

  return account.address
}

export const getAccount = async (
  network: "testnet" | "mainnet",
  privateKey: Hex
) => {
  const client = getClient(network)
  const account = await client.account.getAccount(
    getAddressFromPrivateKey(privateKey)
  )
  return account
}

export const getAccountBalance = async (
  network: "testnet" | "mainnet",
  privateKey: Hex
) => {
  const client = getClient(network)
  const account = await client.account.getAccountBalance({
    address: getAddressFromPrivateKey(privateKey),
    denom: "BNB"
  })
  return account
}

export const getModuleAccounts = async (network: "testnet" | "mainnet") => {
  const client = getClient(network)
  return await client.account.getModuleAccounts()
}
