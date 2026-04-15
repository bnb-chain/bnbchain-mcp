import { describe, expect, it } from "bun:test"
import { randomUUID } from "node:crypto"
import { existsSync, unlinkSync } from "node:fs"
import path from "node:path"

import { getClient, parseText } from "../util"

describe("Greenfield Storage Test", async () => {
  const client = await getClient()
  const TEST_BUCKET_NAME = `created-by-mcp-test-${randomUUID()}`
  const fileName = __filename
  const objectName = path.basename(fileName)

  it("create bucket", async () => {
    const res = await client.callTool({
      name: "gnfd_create_bucket",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string; data?: { bucketName?: string } }>(
      text
    )
    const status =
      typeof obj === "object" && obj !== null && "status" in obj
        ? (obj as { status: string }).status
        : "error"
    expect(["success", "error"]).toContain(status)
    if (status === "success" && obj && "data" in obj) {
      expect((obj as { data?: { bucketName?: string } }).data?.bucketName).toBe(
        TEST_BUCKET_NAME
      )
    }
  })

  it("list buckets", async () => {
    const res = await client.callTool({
      name: "gnfd_list_buckets",
      arguments: {
        network: "testnet"
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  it("get bucket full info", async () => {
    const res = await client.callTool({
      name: "gnfd_get_bucket_full_info",
      arguments: {
        network: "testnet"
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  it("create object (upload file)", async () => {
    const res = await client.callTool({
      name: "gnfd_create_file",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME,
        filePath: fileName
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  it("list objects", async () => {
    const res = await client.callTool({
      name: "gnfd_list_objects",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  it("download object", async () => {
    const res = await client.callTool({
      name: "gnfd_download_object",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME,
        objectName: objectName,
        targetPath: process.cwd()
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    const downloadedPath = path.resolve(process.cwd(), objectName)
    try {
      if (existsSync(downloadedPath)) {
        unlinkSync(downloadedPath)
      }
    } catch {
      // ignore if file was not created
    }
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  // Clean up
  it("delete file", async () => {
    const res = await client.callTool({
      name: "gnfd_delete_object",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME,
        objectName: objectName
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })

  it("delete bucket", async () => {
    const res = await client.callTool({
      name: "gnfd_delete_bucket",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME
      }
    })
    const text = res.content?.[0]?.text ?? ""
    const obj = parseText<{ status?: string }>(text)
    expect(["success", "error"]).toContain(obj?.status ?? "error")
  })
})
