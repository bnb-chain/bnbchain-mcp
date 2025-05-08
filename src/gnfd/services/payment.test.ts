import "reflect-metadata"

import { expect, setDefaultTimeout, test } from "bun:test"
import dotenv from "dotenv"
import type { Hex } from "viem"

import logger from "@/utils/logger"
import {
  getAccount,
  getAllAccountBalances,
  getPaymentAccounts
} from "./account"
import { getClient } from "./client"
import {
  depositToPaymentAccount,
  disableRefundForPaymentAccount,
  withdrawFromPaymentAccount
} from "./payment"

dotenv.config()

setDefaultTimeout(50000)

// test("create payment account", async () => {
//   const paymentAccount = await createPaymentAccount(
//     "testnet",
//     process.env.PRIVATE_KEY as Hex
//   )
//   expect(paymentAccount.status).toBe("success")
// })

// test("deposit to payment account", async () => {
//   const paymentAccounts = await getPaymentAccounts("testnet", {
//     privateKey: process.env.PRIVATE_KEY as Hex
//   })
//   const res = await depositToPaymentAccount("testnet", {
//     to: paymentAccounts[0] as string,
//     amount: "0.01",
//     privateKey: process.env.PRIVATE_KEY as Hex
//   })
//   logger.debug(JSON.stringify(res))
//   expect(res.status).toBe("success")
// })

test("get payment accounts", async () => {
  const paymentAccounts = await getPaymentAccounts("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex
  })
  logger.debug(JSON.stringify(paymentAccounts))
  expect(paymentAccounts).toBeArray()
})

// test("get owner and payment accounts", async () => {
//   const res = await getAllAccountBalances("testnet", {
//     privateKey: process.env.PRIVATE_KEY as Hex
//   })
//   logger.debug(JSON.stringify(res))
//   expect(res.owner.balance).toBeObject()
// })

// test("withdraw from payment account", async () => {
//   const paymentAccounts = await getPaymentAccounts("testnet", {
//     privateKey: process.env.PRIVATE_KEY as Hex
//   })
//   const res = await withdrawFromPaymentAccount("testnet", {
//     from: paymentAccounts[0] as string,
//     amount: "0.01",
//     privateKey: process.env.PRIVATE_KEY as Hex
//   })
//   logger.debug(JSON.stringify(res))
//   expect(res.status).toBe("success")
// })

// test("disable refund for payment account", async () => {
//   const paymentAccounts = await getPaymentAccounts("testnet", {
//     privateKey: process.env.PRIVATE_KEY as Hex
//   })
//   const lastPaymentAccount = paymentAccounts[paymentAccounts.length - 1]
//   const res = await disableRefundForPaymentAccount("testnet", {
//     address: lastPaymentAccount as string,
//     privateKey: process.env.PRIVATE_KEY as Hex
//   })
//   logger.debug(JSON.stringify(res))
//   expect(res.status).toBe("success")
// })
