import { Hex, parseEther } from "viem"

import { ApiResponse, response } from "../util"
import { getAccount } from "./account"
import { getClient } from "./client"
import { executeTransaction } from "./common"

/**
 * Creates a payment account for the specified address
 * @param privateKey The private key for signing the transaction
 * @returns Transaction hash
 */
export const createPaymentAccount = async (
  network: "testnet" | "mainnet",
  privateKey: Hex
): Promise<ApiResponse<{ txHash: string }>> => {
  try {
    const client = getClient(network)
    const account = await getAccount(network, privateKey)
    const createPaymentAccountTx = await client.account.createPaymentAccount({
      creator: account.address
    })

    const tx = await executeTransaction<{ txHash: string }>(
      createPaymentAccountTx,
      account,
      privateKey,
      "Create payment account",
      account.address
    )

    return tx
  } catch (error: any) {
    return response.fail(`Failed to create payment account: ${error.message}`)
  }
}

/**
 * Deposits funds into a payment account
 * @param to The payment account address to deposit to
 * @param amount The amount to deposit (in BNB)
 * @param privateKey The private key for signing the transaction
 * @returns Transaction hash
 */
export const depositToPaymentAccount = async (
  network: "testnet" | "mainnet",
  {
    to,
    amount,
    privateKey
  }: {
    to: string
    amount: string
    privateKey: Hex
  }
): Promise<ApiResponse<void>> => {
  try {
    const client = getClient(network)
    const account = await getAccount(network, privateKey)
    const depositTx = await client.payment.deposit({
      creator: account.address,
      to,
      amount: parseEther(amount).toString()
    })

    const tx = await executeTransaction<void>(
      depositTx,
      account,
      privateKey,
      "Deposit funds",
      `Deposit ${amount} BNB to ${to}`
    )

    return tx
  } catch (error: any) {
    return response.fail(`Failed to deposit funds: ${error.message}`)
  }
}

/**
 * Withdraws funds from a payment account
 * @param from The payment account to withdraw from
 * @param amount The amount to withdraw (in BNB)
 * @param privateKey The private key for signing the transaction
 * @returns Transaction hash
 */
export const withdrawFromPaymentAccount = async (
  network: "testnet" | "mainnet",
  {
    from,
    amount,
    privateKey
  }: {
    from: string
    amount: string
    privateKey: Hex
  }
): Promise<ApiResponse<void>> => {
  try {
    const client = getClient(network)
    const account = await getAccount(network, privateKey)
    const withdrawTx = await client.payment.withdraw({
      creator: account.address,
      from,
      amount: parseEther(amount).toString()
    })

    const tx = await executeTransaction<void>(
      withdrawTx,
      account,
      privateKey,
      "Withdraw funds",
      `Withdraw ${amount} BNB from ${from}`
    )

    return tx
  } catch (error: any) {
    return response.fail(`Failed to withdraw funds: ${error.message}`)
  }
}

/**
 * Disables refund for a payment account
 * @warning ⚠️ CAUTION: This action is IRREVERSIBLE. Once disabled, ALL transfers to this payment account will become NON-REFUNDABLE.
 * @param address The payment account address to disable refund for
 * @param privateKey The private key for signing the transaction
 * @returns Transaction hash
 */
export const disableRefundForPaymentAccount = async (
  network: "testnet" | "mainnet",
  {
    address,
    privateKey
  }: {
    address: string
    privateKey: Hex
  }
): Promise<ApiResponse<void>> => {
  try {
    const client = getClient(network)
    const account = await getAccount(network, privateKey)
    const disableRefundTx = await client.payment.disableRefund({
      owner: account.address,
      addr: address
    })

    const tx = await executeTransaction<void>(
      disableRefundTx,
      account,
      privateKey,
      "Disable refund",
      `Disable refund for ${address}`
    )

    return tx
  } catch (error: any) {
    return response.fail(`Failed to disable refund: ${error.message}`)
  }
}
