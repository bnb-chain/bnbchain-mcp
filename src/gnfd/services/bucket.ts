import { Long, VisibilityType } from "@bnb-chain/greenfield-js-sdk"
import { BucketInfo } from "@bnb-chain/greenfield-js-sdk/dist/esm/types/sp/Common"
import type { Hex } from "viem"

import Logger from "@/utils/logger"
import { ApiResponse, response } from "../util"
import { getAccount } from "./account"
import { getClient } from "./client"
import { executeTransaction } from "./common"
import { selectSp } from "./sp"

// Define bucket response type
interface BucketData {
  bucketName: string
}

export const getBucketInfo = async (
  network: "testnet" | "mainnet",
  bucketName: string
): Promise<ApiResponse<BucketInfo>> => {
  try {
    const client = getClient(network)
    const res = await client.bucket.headBucket(bucketName)
    return response.success(res.bucketInfo as {} as BucketInfo)
  } catch (error) {
    Logger.error(`Get bucket info operation failed: ${error}`)
    return response.fail(`Get bucket info operation failed: ${error}`)
  }
}

/**
 * Create a bucket in Greenfield
 */
export const createBucket = async (
  network: "testnet" | "mainnet",
  {
    privateKey,
    bucketName
  }: {
    privateKey: Hex
    bucketName?: string
  }
): Promise<ApiResponse<BucketData>> => {
  const client = getClient(network)
  const account = await getAccount(network, privateKey)

  const _bucketName = bucketName || "created-by-bnbchain-mcp"

  try {
    // Try to check if the bucket already exists
    try {
      await client.bucket.headBucket(_bucketName)
      // If no error is thrown, the bucket exists
      Logger.debug(`Bucket ${_bucketName} already exists`)
      return response.success({ bucketName: _bucketName })
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
      return response.success({ bucketName: _bucketName })
    } else {
      return response.fail(
        `Create bucket failed: ${JSON.stringify(createBucketTxRes)}`
      )
    }
  } catch (error) {
    return response.fail(`Create bucket failed: ${error}`)
  }
}

/**
 * Delete a bucket in Greenfield
 */
export const deleteBucket = async (
  network: "testnet" | "mainnet",
  {
    privateKey,
    bucketName
  }: {
    privateKey: Hex
    bucketName: string
  }
): Promise<ApiResponse<void>> => {
  try {
    const client = getClient(network)
    const account = await getAccount(network, privateKey)

    // Check if bucket exists first
    try {
      await client.bucket.headBucket(bucketName)
    } catch (error) {
      Logger.error(`Bucket ${bucketName} does not exist`)
      return response.fail(`Bucket ${bucketName} does not exist`)
    }

    // Create delete transaction
    const tx = await client.bucket.deleteBucket({
      bucketName,
      operator: account.address
    })

    const txResult = await executeTransaction<void>(
      tx,
      account,
      privateKey,
      "Delete bucket",
      bucketName
    )

    // Simply return the transaction result
    return txResult
  } catch (error) {
    Logger.error(`Delete bucket operation failed: ${error}`)
    return response.fail(`Delete bucket operation failed: ${error}`)
  }
}

/**
 * List buckets for an account in Greenfield
 * @param network Greenfield network (testnet or mainnet)
 * @param address User address to list buckets for
 * @param privateKey Private key of the account (optional if address is provided)
 * @returns List of buckets
 */
export const listBuckets = async (
  network: "testnet" | "mainnet",
  {
    address,
    privateKey
  }: {
    address?: string
    privateKey?: Hex
  }
): Promise<
  ApiResponse<{ buckets: Array<{ bucketName: string; createAt: number }> }>
> => {
  try {
    const client = getClient(network)
    if (!address && !privateKey) {
      return response.fail("Either address or privateKey must be provided")
    }
    const _address = privateKey
      ? (await getAccount(network, privateKey)).address
      : (address as string)

    const sp = await selectSp(network)
    // Request list of buckets owned by the account
    const bucketListResponse = await client.bucket.listBuckets({
      address: _address,
      endpoint: sp.endpoint
    })

    if (bucketListResponse.code !== 0) {
      return response.fail(
        `Failed to list buckets: ${JSON.stringify(bucketListResponse)}`
      )
    }
    // Get detailed info for each bucket
    const bucketsWithInfo = (bucketListResponse.body || []).map((it) => ({
      bucketName: it.BucketInfo.BucketName,
      createAt: it.BucketInfo.CreateAt
    }))

    return response.success({ buckets: bucketsWithInfo })
  } catch (error) {
    Logger.error(`List buckets operation failed: ${error}`)
    return response.fail(`List buckets operation failed: ${error}`)
  }
}
