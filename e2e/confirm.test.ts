import { describe, expect, it } from "bun:test"

import { getClientWithConfirmFlow, parseText } from "./util"

describe("Confirm transfer flow (preview then confirm)", async () => {
  const client = await getClientWithConfirmFlow()
  const privateKey = process.env.PRIVATE_KEY as string
  const network = "bsc-testnet"
  const toAddress = "0x0000000000000000000000000000000000000001"
  const amount = "0.0001"

  it("transfer_native_token returns preview and confirmToken when skipConfirmation is false", async () => {
    const res = await client.callTool({
      name: "transfer_native_token",
      arguments: {
        toAddress,
        amount,
        network,
        privateKey,
        skipConfirmation: false
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      preview?: { toAddress: string; amount: string; network: string }
      confirmToken?: string
      message?: string
    }>(text)
    expect(obj.preview).toBeDefined()
    expect(obj.preview?.toAddress).toBe(toAddress)
    expect(obj.preview?.amount).toBe(amount)
    expect(obj.confirmToken).toBeDefined()
    expect(typeof obj.confirmToken).toBe("string")
    expect((obj.confirmToken as string).length).toBeGreaterThan(0)
  })

  it("confirm_transfer executes with valid token and returns txHash", async () => {
    const previewRes = await client.callTool({
      name: "transfer_native_token",
      arguments: {
        toAddress,
        amount,
        network,
        privateKey,
        skipConfirmation: false
      }
    })
    const previewText = previewRes.content?.[0]?.text
    const previewObj = parseText<{ confirmToken?: string }>(previewText)
    const token = previewObj.confirmToken
    expect(token).toBeDefined()

    const confirmRes = await client.callTool({
      name: "confirm_transfer",
      arguments: {
        confirmToken: token,
        privateKey
      }
    })
    const confirmText = confirmRes.content?.[0]?.text
    const confirmObj = parseText<{
      success?: boolean
      txHash?: string
      toAddress?: string
    }>(confirmText)
    expect(confirmObj.success).toBe(true)
    expect(confirmObj.txHash).toStartWith("0x")
    expect(confirmObj.toAddress).toBe(toAddress)
  })

  it("confirm_transfer with invalid token returns error", async () => {
    const res = await client.callTool({
      name: "confirm_transfer",
      arguments: {
        confirmToken: "invalid-token-12345",
        privateKey
      }
    })
    const text = res.content?.[0]?.text ?? ""
    expect(text.toLowerCase()).toContain("error")
    expect(text.toLowerCase()).toContain("invalid")
  })
})
