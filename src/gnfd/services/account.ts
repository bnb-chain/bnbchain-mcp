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
  {
    privateKey,
    address
  }: {
    privateKey?: Hex
    address?: string
  }
) => {
  const client = getClient(network)
  const account = await client.account.getAccountBalance({
    address: address || getAddressFromPrivateKey(privateKey as Hex),
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

export const getPaymentAccounts = async (
  network: "testnet" | "mainnet",
  {
    address,
    privateKey
  }: {
    address?: string
    privateKey?: Hex
  }
) => {
  const client = getClient(network)
  return (
    (
      await client.payment.getPaymentAccountsByOwner({
        owner: address || getAddressFromPrivateKey(privateKey as Hex)
      })
    ).paymentAccounts || []
  )
}

export const getAllAccountBalances = async (
  network: "testnet" | "mainnet",
  {
    address,
    privateKey,
    primaryAccountsLimit = 20
  }: {
    address?: string
    privateKey?: Hex
    primaryAccountsLimit?: number
  }
) => {
  const ownerAddress = address || getAddressFromPrivateKey(privateKey as Hex)
  const ownerAccountBalance = await getAccountBalance(network, {
    address: ownerAddress
  })
  const paymentAccounts = await getPaymentAccounts(network, {
    privateKey
  })
  const paWithBalances = await Promise.all(
    paymentAccounts.slice(0, primaryAccountsLimit).map(async (it) => {
      return {
        address: it,
        balance: (
          await getAccountBalance(network, {
            address: it
          })
        ).balance
      }
    })
  )

  Logger.debug(JSON.stringify(paymentAccounts))
  return {
    owner: {
      address: ownerAddress,
      balance: ownerAccountBalance.balance
    },
    paymentAccounts: paWithBalances
  }
}
