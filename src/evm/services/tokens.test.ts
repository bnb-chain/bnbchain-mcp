import { test } from "bun:test"

import { getERC20TokenInfo } from "./tokens"

test("get ERC20 token info", async () => {
  const tokenInfo = await getERC20TokenInfo(
    "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    "bsc"
  )
  console.log(tokenInfo)
})
