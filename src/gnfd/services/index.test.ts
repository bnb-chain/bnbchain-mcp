import "reflect-metadata"

import { readFileSync, unlinkSync } from "fs"
import path from "path"
import { NodeAdapterReedSolomon } from "@bnb-chain/reed-solomon/node.adapter"
import { expect, setDefaultTimeout, test } from "bun:test"
import dotenv from "dotenv"
import type { Hex } from "viem"

import { generateString, getMimeType } from "../util"
import {
  createBucket,
  deleteBucket,
  getBucketInfo,
  listBuckets
} from "./bucket"
import {
  createFile,
  deleteObject,
  downloadObject,
  getObjectInfo,
  listObjects
} from "./object"

dotenv.config()

setDefaultTimeout(50000)
const bucketName = "mcp-test-" + generateString(5)
const fileName = __filename
const objectName = path.basename(fileName)

test("test get mime type", async () => {
  expect(getMimeType(__filename)).toBe("application/javascript")
  expect(getMimeType("dist/test.pdf")).toBe("application/pdf")
})

test("test checksum", async () => {
  const fileBuffer = readFileSync(fileName)
  const rs = new NodeAdapterReedSolomon()
  const expectCheckSums = await rs.encodeInSubWorker(
    Uint8Array.from(fileBuffer)
  )
  expect(expectCheckSums[0]).not.toEqual(
    "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU="
  )
})

test("create bucket", async () => {
  const res = await createBucket("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex,
    bucketName
  })
  expect(res.status).toBe("success")
})

test("create object", async () => {
  const res = await createFile("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex,
    filePath: fileName,
    bucketName
  })
  expect(res.status).toBe("success")
})

test("get bucket info", async () => {
  const res = await getBucketInfo("testnet", bucketName)
  expect(res.status).toBe("success")
})

test("get object info", async () => {
  const res = await getObjectInfo("testnet", {
    bucketName,
    objectName
  })
  expect(res.status).toBe("success")
})

test("list buckets", async () => {
  const res = await listBuckets("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex
  })
  expect(res.status).toBe("success")
})

test("list objects", async () => {
  const res = await listObjects("testnet", bucketName)
  expect(res.status).toBe("success")
})

test("download object", async () => {
  const res = await downloadObject("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex,
    bucketName,
    objectName,
    targetPath: process.cwd()
  })
  // remove the file after test
  unlinkSync(path.resolve(process.cwd(), objectName))
  expect(res.status).toBe("success")
})

test("delete object", async () => {
  const res = await deleteObject("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex,
    bucketName,
    objectName
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
