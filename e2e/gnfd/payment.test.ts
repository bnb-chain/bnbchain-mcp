import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

const _getPaymentAccountAddress = async () => {
  const client = await getClient()

  const paymentAccountsRes = await client.callTool({
    name: "gnfd_get_payment_accounts",
    arguments: {
      network: "testnet"
    }
  })
  const paymentAccount = parseText<string[]>(
    paymentAccountsRes.content?.[0]?.text
  )
  const paymentAccountAddress = paymentAccount[0]
  return paymentAccountAddress
}

const _createPaymentAccount = async () => {
  const client = await getClient()
  const res = await client.callTool({
    name: "gnfd_create_payment_account",
    arguments: {
      network: "testnet"
    }
  })
  const text = res.content?.[0]?.text
  const obj = parseText<{
    status: string
  }>(text)

  return obj.status
}

const _getPaymentAccountInfo = async () => {
  const client = await getClient()
  const paymentAccountAddress = await _getPaymentAccountAddress()
  const res = await client.callTool({
    name: "gnfd_get_payment_account_info",
    arguments: {
      network: "testnet",
      paymentAddress: paymentAccountAddress
    }
  })
  const text = res.content?.[0]?.text
  const obj = parseText<{
    status: string
    data: {
      refundable: boolean
    }
  }>(text)

  return obj
}

describe("Greenfield Payment Test", async () => {
  const client = await getClient()
  let paymentAccountAddress = await _getPaymentAccountAddress()
  if (!paymentAccountAddress) {
    await _createPaymentAccount()
    paymentAccountAddress = await _getPaymentAccountAddress()
  }

  it("get payment accounts", async () => {
    const res = await client.callTool({
      name: "gnfd_get_payment_accounts",
      arguments: {
        network: "testnet"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<string[]>(text)
    expect(obj.length).toBeGreaterThan(0)
  })

  it("deposit to payment account", async () => {
    const res = await client.callTool({
      name: "gnfd_deposit_to_payment",
      arguments: {
        network: "testnet",
        to: paymentAccountAddress, // Example address
        amount: "0.01"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    expect(obj.status).toBe("success")
  })

  it("get payment account info", async () => {
    const obj = await _getPaymentAccountInfo()

    expect(obj.status).toBe("success")
  })

  it("withdraw from payment account", async () => {
    const accountInfo = await _getPaymentAccountInfo()
    const res = await client.callTool({
      name: "gnfd_withdraw_from_payment",
      arguments: {
        network: "testnet",
        from: paymentAccountAddress, // Example address
        amount: "0.01"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    expect(obj.status).toBe(accountInfo.data.refundable ? "success" : "error")
  })

  //   it("disable refund for payment account", async () => {
  //     const res = await client.callTool({
  //       name: "gnfd_disable_refund",
  //       arguments: {
  //         network: "testnet",
  //         address: paymentAccountAddress
  //       }
  //     })
  //     const text = res.content?.[0]?.text
  //     const obj = parseText<{
  //       status: string
  //     }>(text)
  //     expect(obj.status).toBe("success")
  //   })

  //   it("get payment account related buckets", async () => {
  //     const res = await client.callTool({
  //       name: "gnfd_get_payment_account_related_buckets",
  //       arguments: {
  //         network: "testnet",
  //         paymentAddress: paymentAccountAddress
  //       }
  //     })
  //     const text = res.content?.[0]?.text
  //     const obj = parseText<{
  //       status: string
  //       data: any
  //     }>(text)

  //     console.log("payment account related buckets", obj.data)
  //     expect(obj.status).toBe("success")
  //   })
})
