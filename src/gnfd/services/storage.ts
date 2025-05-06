import "reflect-metadata"

import { readFileSync, statSync } from "fs"
import path from "path"
import {
  bytesFromBase64,
  Long,
  RedundancyType,
  VisibilityType
} from "@bnb-chain/greenfield-js-sdk"
import { NodeAdapterReedSolomon } from "@bnb-chain/reed-solomon/node.adapter"
import mimeTypes from "mime-types"
import type { Hex } from "viem"

import Logger from "@/utils/logger"
import { generateString } from "../util"
import { getAccount } from "./account"
import { getClient } from "./client"
import { selectSp } from "./sp"

/**
 * Create a file object
 */
const createFileObject = (filePath: string) => {
  const stats = statSync(filePath)
  const fileSize = stats.size
  const extname = path.extname(filePath)
  const fileType = mimeTypes.lookup(extname) || "application/octet-stream"

  return {
    name: path.basename(filePath),
    type: fileType,
    size: fileSize,
    content: readFileSync(filePath)
  }
}

/**
 * Create a bucket in Greenfield
 */
export const createBucket = async (
  network: "testnet" | "mainnet",
  privateKey: Hex,
  bucketName?: string
) => {
  const client = getClient(network)
  const account = await getAccount(network, privateKey)

  const _bucketName = bucketName || "created-by-bnbchain-mcp"

  try {
    // Try to check if the bucket already exists
    try {
      await client.bucket.headBucket(_bucketName)
      // If no error is thrown, the bucket exists
      Logger.debug(`Bucket ${_bucketName} already exists`)
      return { status: "success", bucketName: _bucketName }
    } catch (error) {
      // Bucket doesn't exist, proceed to create
      Logger.debug(`Bucket ${_bucketName} does not exist, creating...`)
    }

    const spInfo = await selectSp(network)

    Logger.debug(`Creating bucket: ${_bucketName}, creator: ${account.address}`)
    const createBucketTx = await client.bucket.createBucket({
      bucketName: _bucketName,
      creator: account.address,
      visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      chargedReadQuota: Long.fromString("0"),
      paymentAddress: account.address,
      primarySpAddress: spInfo.primarySpAddress
    })

    const createBucketTxSimulateInfo = await createBucketTx.simulate({
      denom: "BNB"
    })

    const createBucketTxRes = await createBucketTx.broadcast({
      denom: "BNB",
      gasLimit: Number(createBucketTxSimulateInfo?.gasLimit),
      gasPrice: createBucketTxSimulateInfo?.gasPrice || "5000000000",
      payer: account.address,
      granter: "",
      privateKey: privateKey
    })

    if (createBucketTxRes.code === 0) {
      return { status: "success", bucketName: _bucketName }
    } else {
      return {
        status: "error",
        message: `Create bucket failed: ${JSON.stringify(createBucketTxRes)}`
      }
    }
  } catch (error) {
    return {
      status: "error",
      message: `Create bucket failed: ${error}`
    }
  }
}

/**
 * Create a file in Greenfield
 */
export const createFile = async (
  network: "testnet" | "mainnet",
  privateKey: Hex,
  filePath: string,
  bucketName?: string
) => {
  try {
    // Ensure the file exists
    const objectName = path.basename(filePath)
    const fileObj = createFileObject(filePath)
    const rs = new NodeAdapterReedSolomon()
    const expectCheckSums = await rs.encodeInWorker(
      filePath,
      Uint8Array.from(fileObj.content)
    )

    Logger.debug(
      `File info: ${filePath}, size: ${fileObj.size} bytes, type: ${fileObj.type}, expectCheckSums: ${expectCheckSums}`
    )

    // Get or create bucket
    const bucketNameRes = await createBucket(network, privateKey, bucketName)
    if (bucketNameRes.status === "error") {
      return { status: "error", message: bucketNameRes.message }
    }
    const _bucketName = bucketNameRes.bucketName as string

    Logger.debug(`Using bucket: ${_bucketName}, for object: ${objectName}`)

    // Get client and account
    const client = getClient(network)
    const account = await getAccount(network, privateKey)

    const createObjectTx = await client.object.createObject({
      bucketName: _bucketName,
      objectName: objectName,
      creator: account.address,
      visibility: VisibilityType.VISIBILITY_TYPE_PRIVATE,
      contentType: fileObj.type as string,
      redundancyType: RedundancyType.REDUNDANCY_EC_TYPE,
      payloadSize: Long.fromInt(fileObj.content.byteLength),
      expectChecksums: expectCheckSums.map((x) => bytesFromBase64(x))
    })

    Logger.debug(`Created object transaction for file: ${objectName}`)

    // Simulate transaction to get gas estimation
    const createObjectTxSimulateInfo = await createObjectTx.simulate({
      denom: "BNB"
    })

    // Broadcast the create object transaction
    const createObjectTxRes = await createObjectTx.broadcast({
      denom: "BNB",
      gasLimit: Number(createObjectTxSimulateInfo?.gasLimit),
      gasPrice: createObjectTxSimulateInfo?.gasPrice || "5000000000",
      payer: account.address,
      granter: "",
      privateKey: privateKey
    })

    Logger.debug(`Object transaction broadcast result: ${createObjectTxRes}`)

    if (createObjectTxRes.code !== 0) {
      return {
        status: "error",
        message: `Failed to create object: ${createObjectTxRes.code}`
      }
    }

    // Upload file content
    const uploadRes = await client.object.uploadObject(
      {
        bucketName: _bucketName,
        objectName: objectName,
        body: fileObj,
        txnHash: createObjectTxRes.transactionHash
      },
      {
        type: "ECDSA",
        privateKey: privateKey
      }
    )

    Logger.debug(`Upload result: ${uploadRes}`)

    if (uploadRes.code === 0) {
      return { status: "success", bucketName: _bucketName, objectName }
    } else {
      return {
        status: "error",
        message: `Create file failed: ${JSON.stringify(uploadRes)}`
      }
    }
  } catch (error) {
    Logger.error(`Create file failed: ${error}`)
    return {
      status: "error",
      message: `Create file failed: ${error}`
    }
  }
}

/**
 * Create a folder in Greenfield
 */
export const createFolder = async (
  network: "testnet" | "mainnet",
  privateKey: Hex,
  folderName?: string,
  bucketName?: string
) => {
  try {
    const client = getClient(network)
    const account = await getAccount(network, privateKey)

    // Get or create bucket
    const bucketNameRes = await createBucket(network, privateKey, bucketName)
    if (bucketNameRes.status === "error") {
      return { status: "error", message: bucketNameRes.message }
    }
    const _bucketName = bucketNameRes.bucketName as string

    // Ensure folder name ends with a slash
    const _folderName = folderName || generateString(10)
    const formattedFolderName = _folderName.endsWith("/")
      ? _folderName
      : `${_folderName}/`

    Logger.debug(
      `Creating folder: ${formattedFolderName} in bucket: ${_bucketName}`
    )

    // Create folder transaction
    const createFolderTx = await client.object.createFolder({
      bucketName: _bucketName,
      objectName: formattedFolderName,
      creator: account.address,
      redundancyType: RedundancyType.REDUNDANCY_EC_TYPE,
      visibility: VisibilityType.VISIBILITY_TYPE_PRIVATE
    })

    // Simulate transaction to get gas estimation
    const simulateInfo = await createFolderTx.simulate({
      denom: "BNB"
    })

    // Broadcast create folder transaction
    const res = await createFolderTx.broadcast({
      denom: "BNB",
      gasLimit: Number(simulateInfo?.gasLimit),
      gasPrice: simulateInfo?.gasPrice || "5000000000",
      payer: account.address,
      granter: "",
      privateKey: privateKey
    })

    Logger.debug(`Folder creation result: code=${res.code}`)

    if (res.code === 0) {
      return {
        status: "success",
        folderName: formattedFolderName,
        bucketName: _bucketName
      }
    } else {
      return {
        status: "error",
        message: `Create folder failed: ${JSON.stringify(res)}`
      }
    }
  } catch (error) {
    Logger.error(`Create folder failed: ${error}`)
    return {
      status: "error",
      message: `Create folder failed: ${error}`
    }
  }
}
