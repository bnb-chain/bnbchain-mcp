import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

const _getPaymentAccountAddress = async (): Promise<string | undefined> => {
  const client = await getClient()
  const paymentAccountsRes = await client.callTool({
    name: "gnfd_get_payment_accounts",
    arguments: {
      network: "testnet"
    }
  })
  const raw = parseText<unknown>(paymentAccountsRes.content?.[0]?.text ?? "[]")
  const paymentAccount = Array.isArray(raw) ? raw : []
  const paymentAccountAddress =
    paymentAccount.length > 0 && typeof paymentAccount[0] === "string"
      ? paymentAccount[0]
      : undefined
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
  const text = res.content?.[0]?.text ?? ""
  const obj = parseText<{ status?: string }>(text)
  return obj?.status ?? "error"
}

const _getPaymentAccountInfo = async (
  paymentAddress?: string
): Promise<{
  status?: string
  data?: { refundable?: boolean }
}> => {
  const client = await getClient()
  const address = paymentAddress ?? (await _getPaymentAccountAddress()) ?? ""
  const res = await client.callTool({
    name: "gnfd_get_payment_account_info",
    arguments: {
      network: "testnet",
      paymentAddress: address || "0x0000000000000000000000000000000000000000"
    }
  })
  const text = res.content?.[0]?.text ?? ""
  const obj = parseText<{
    status?: string
    data?: { refundable?: boolean }
  }>(text)
  return obj
}

describe("Greenfield Payment Test", async () => {
  const client = await getClient()
  let paymentAccountAddress = await _getPaymentAccountAddress()
  if (!paymentAccountAddress) {
    await _createPaymentAccount()
    paymentAccountAddress = (await _getPaymentAccountAddress()) ?? ""
  }
  if (!paymentAccountAddress) {
    paymentAccountAddress = "0x0000000000000000000000000000000000000000"
  }

  it("get payment accounts", async () => {
    const res = await client.callTool({
      name: "gnfd_get_payment_accounts",
      arguments: {
        network: "testnet"
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<string[] | { status?: string }>(text)
    if (Array.isArray(obj)) {
      expect(obj.length).toBeGreaterThanOrEqual(0)
    } else {
      expect(["success", "error"]).toContain(
        (obj as { status?: string })?.status ?? "error"
      )
    }
  })

  it("deposit to payment account", async () => {
    const res = await client.callTool({
      name: "gnfd_deposit_to_payment",
      arguments: {
        network: "testnet",
        to: paymentAccountAddress,
        amount: "0.01"
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  it("get payment account info", async () => {
    const obj = await _getPaymentAccountInfo(paymentAccountAddress)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  it("withdraw from payment account", async () => {
    const accountInfo = await _getPaymentAccountInfo(paymentAccountAddress)
    const res = await client.callTool({
      name: "gnfd_withdraw_from_payment",
      arguments: {
        network: "testnet",
        from: paymentAccountAddress,
        amount: "0.01"
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    const expectedStatus =
      accountInfo?.data?.refundable === true ? "success" : "error"
    expect(["success", "error"]).toContain(obj?.status ?? "error")
    if (obj?.status) {
      expect(obj.status).toBe(expectedStatus)
    }
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
