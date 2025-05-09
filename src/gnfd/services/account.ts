import type { Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"

import Logger from "@/utils/logger"
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
  try {
    const client = getClient(network)
    const moduleAccounts = await client.account.getModuleAccounts()

    Logger.debug("moduleAccounts: ", moduleAccounts)
    return moduleAccounts
  } catch (error) {
    Logger.error("Error fetching module accounts: ", error)
    throw error
  }
}
