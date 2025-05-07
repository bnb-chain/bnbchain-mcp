import { readFileSync } from "fs"
import { NodeAdapterReedSolomon } from "@bnb-chain/reed-solomon/node.adapter"
import { expect, setDefaultTimeout, test } from "bun:test"
import dotenv from "dotenv"
import type { Hex } from "viem"

import { deleteBucket, listBuckets } from "./bucket"
import { deleteObject, listObjects } from "./object"

dotenv.config()

setDefaultTimeout(50000)

test("test checksum", async () => {
  const fileBuffer = readFileSync(__filename)
  const rs = new NodeAdapterReedSolomon()
  const expectCheckSums = await rs.encodeInSubWorker(
    Uint8Array.from(fileBuffer)
  )
  expect(expectCheckSums[0]).not.toEqual(
    "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="
  )
})

test("list buckets", async () => {
  const res = await listBuckets("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex
  })
  expect(res.status).toBe("success")
})

test("delete bucket", async () => {
  const bucketsRes = await listBuckets("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex
  })
  const res = await deleteBucket(
    "testnet",
    process.env.PRIVATE_KEY as Hex,
    bucketsRes.data?.buckets[0]?.bucketName || ""
  )
  expect(res.status).toBe("success")
})

test("delete object", async () => {
  const objectsRes = await listObjects("testnet", "created-by-bnbchain-mcp")
  const res = await deleteObject(
    "testnet",
    process.env.PRIVATE_KEY as Hex,
    "created-by-bnbchain-mcp",
    objectsRes.data?.objects[0]?.objectName || ""
  )
  expect(res.status).toBe("success")
})
