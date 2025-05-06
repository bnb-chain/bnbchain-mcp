import { readFileSync } from "fs"
import { NodeAdapterReedSolomon } from "@bnb-chain/reed-solomon/node.adapter"
import { setDefaultTimeout, test } from "bun:test"
import dotenv from "dotenv"
import type { Hex } from "viem"

import { createFile } from "./storage"

dotenv.config()

setDefaultTimeout(50000)

const main = async () => {
  const fileBuffer = readFileSync(__filename)
  const rs = new NodeAdapterReedSolomon()
  const expectCheckSums = await rs.encodeInWorker(
    __filename,
    Uint8Array.from(fileBuffer)
  )
  console.log(expectCheckSums)
}

main()

test("test", async () => {
  const res = await createFile(
    "testnet",
    process.env.PRIVATE_KEY as Hex,
    __filename
  )
  console.log(res)
})
