import { randomUUID } from "crypto"
import { unlinkSync } from "fs"
import path from "path"
import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("Greenfield Storage Test", async () => {
  const client = await getClient()
  const TEST_BUCKET_NAME = "created-by-mcp-test-" + randomUUID()
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
    const text = res.content?.[0]?.text
    const obj = parseText<{
      data: {
        bucketName: string
      }
    }>(text)
    expect(obj.data.bucketName).toBe(TEST_BUCKET_NAME)
  })

  it("list buckets", async () => {
    const res = await client.callTool({
      name: "gnfd_list_buckets",
      arguments: {
        network: "testnet"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    expect(obj.status).toBe("success")
  })

  it("get bucket full info", async () => {
    const res = await client.callTool({
      name: "gnfd_get_bucket_full_info",
      arguments: {
        network: "testnet"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)

    expect(obj.status).toBe("success")
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
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    expect(obj.status).toBe("success")
  })

  it("list objects", async () => {
    const res = await client.callTool({
      name: "gnfd_list_objects",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    expect(obj.status).toBe("success")
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
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    // remove the file after test
    unlinkSync(path.resolve(process.cwd(), objectName))
    expect(obj.status).toBe("success")
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
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    expect(obj.status).toBe("success")
  })

  it("delete bucket", async () => {
    const res = await client.callTool({
      name: "gnfd_delete_bucket",
      arguments: {
        network: "testnet",
        bucketName: TEST_BUCKET_NAME
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      status: string
    }>(text)
    expect(obj.status).toBe("success")
  })
})
