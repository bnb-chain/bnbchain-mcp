import "reflect-metadata"

import { unlinkSync } from "fs"
import path from "path"
import { expect, setDefaultTimeout, test } from "bun:test"
import dotenv from "dotenv"
import type { Hex } from "viem"

import { generateString } from "../util"
import { createBucket, deleteBucket } from "./bucket"
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

// Create bucket first for object tests
test("setup: create bucket", async () => {
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

test("get object info", async () => {
  const res = await getObjectInfo("testnet", {
    bucketName,
    objectName
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

// Cleanup: delete bucket after object tests
test("cleanup: delete bucket", async () => {
  const res = await deleteBucket("testnet", {
    privateKey: process.env.PRIVATE_KEY as Hex,
    bucketName
  })
  expect(res.status).toBe("success")
})
