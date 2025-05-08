import "reflect-metadata"

import { expect, setDefaultTimeout, test } from "bun:test"
import dotenv from "dotenv"
import type { Hex } from "viem"

import { generateString } from "../util"
import {
  createBucket,
  deleteBucket,
  getBucketInfo,
  listBuckets
} from "./bucket"

dotenv.config()

setDefaultTimeout(50000)
const bucketName = "mcp-test-" + generateString(5)

test("create bucket", async () => {
  const res = await createBucket("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex,
    bucketName
  })
  expect(res.status).toBe("success")
})

test("get bucket info", async () => {
  const res = await getBucketInfo("testnet", bucketName)
  expect(res.status).toBe("success")
})

test("list buckets", async () => {
  const res = await listBuckets("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex
  })
  expect(res.status).toBe("success")
})

test("delete bucket", async () => {
  const res = await deleteBucket("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex,
    bucketName
  })
  expect(res.status).toBe("success")
})
