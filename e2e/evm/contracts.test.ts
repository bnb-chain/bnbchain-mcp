import { describe, expect, it } from "bun:test"

import { getClient, parseText } from "../util"

describe("EVM Contracts Test", async () => {
  const client = await getClient()

  // WBNB contract on BSC
  const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"

  it("check if address is contract", async () => {
    const res = await client.callTool({
      name: "is_contract",
      arguments: {
        address: WBNB_ADDRESS,
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<{
      isContract: boolean
    }>(text)
    expect(obj.isContract).toBe(true)
  })

  it("read contract name", async () => {
    const res = await client.callTool({
      name: "read_contract",
      arguments: {
        contractAddress: WBNB_ADDRESS,
        abi: [
          {
            constant: true,
            inputs: [],
            name: "name",
            outputs: [{ name: "", type: "string" }],
            payable: false,
            stateMutability: "view",
            type: "function"
          }
        ],
        functionName: "name",
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const obj = parseText<string>(text)
    expect(obj).toBe("Wrapped BNB")
  })

  it("read contract totalSupply", async () => {
    const res = await client.callTool({
      name: "read_contract",
      arguments: {
        contractAddress: WBNB_ADDRESS,
        abi: [
          {
            constant: true,
            inputs: [],
            name: "totalSupply",
            outputs: [{ name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function"
          }
        ],
        functionName: "totalSupply",
        network: "bsc"
      }
    })
    const text = res.content?.[0]?.text
    const totalSupply = parseText<bigint>(text)
    expect(BigInt(totalSupply)).toBeTypeOf("bigint")
  })
})
