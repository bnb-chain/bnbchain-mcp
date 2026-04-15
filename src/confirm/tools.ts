import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Abi, Address } from "viem"
import { z } from "zod"

import { privateKeyParam } from "@/evm/modules/common/types.js"
import type { WriteContractInput } from "@/evm/services/contracts.js"
import * as evmServices from "@/evm/services/index.js"
import { normalizePrivateKey } from "@/evm/services/utils.js"
import * as gnfdServices from "@/gnfd/services/index.js"
import { mcpToolRes } from "@/utils/helper"
import { getAndConsumeIntent } from "@/utils/pendingTransferStore.js"

export function registerConfirmTools(server: McpServer) {
  server.tool(
    "confirm_transfer",
    "Execute a pending transfer or payment that was returned as a preview. Pass the confirmToken from the preview response and your privateKey. The token expires after 5 minutes.",
    {
      confirmToken: z
        .string()
        .describe(
          "The confirmToken returned by a transfer/payment tool when skipConfirmation was false (e.g. from transfer_native_token preview)."
        ),
      privateKey: privateKeyParam
    },
    async ({ confirmToken, privateKey }) => {
      try {
        const intent = getAndConsumeIntent(confirmToken)
        if (!intent) {
          return mcpToolRes.error(
            new Error(
              "Invalid or expired confirmation token. Request a new preview."
            ),
            "confirm_transfer"
          )
        }

        const key = normalizePrivateKey(privateKey)
        const params = intent.params as Record<string, string>
        const network = intent.network

        const req = (k: string): string => {
          const v = params[k]
          if (v === undefined || v === null)
            throw new Error(`Missing param: ${k}`)
          return String(v)
        }

        switch (intent.type) {
          case "transfer_native_token": {
            const hash = await evmServices.transferETH(
              key,
              req("toAddress"),
              req("amount"),
              network
            )
            return mcpToolRes.success({
              success: true,
              txHash: hash,
              toAddress: req("toAddress"),
              amount: req("amount"),
              network
            })
          }
          case "transfer_erc20": {
            const result = await evmServices.transferERC20(
              req("tokenAddress"),
              req("toAddress"),
              req("amount"),
              key,
              network
            )
            return mcpToolRes.success({
              success: true,
              txHash: result.txHash,
              tokenAddress: req("tokenAddress"),
              toAddress: req("toAddress"),
              amount: result.amount.formatted,
              symbol: result.token.symbol,
              network
            })
          }
          case "approve_token_spending": {
            const result = await evmServices.approveERC20(
              req("tokenAddress"),
              req("spenderAddress"),
              req("amount"),
              key,
              network
            )
            return mcpToolRes.success({
              success: true,
              approvalDetails: {
                token: req("tokenAddress"),
                spender: req("spenderAddress"),
                amount: result.amount.formatted,
                symbol: result.token.symbol
              },
              txHash: result.txHash,
              network
            })
          }
          case "transfer_nft": {
            const result = await evmServices.transferERC721(
              req("tokenAddress"),
              req("toAddress"),
              BigInt(req("tokenId")),
              key,
              network
            )
            return mcpToolRes.success({
              success: true,
              txHash: result.txHash,
              network,
              contract: req("tokenAddress"),
              tokenId: result.tokenId,
              recipient: req("toAddress"),
              name: result.token.name,
              symbol: result.token.symbol
            })
          }
          case "transfer_erc1155": {
            const result = await evmServices.transferERC1155(
              req("tokenAddress"),
              req("toAddress"),
              BigInt(req("tokenId")),
              req("amount"),
              key,
              network
            )
            return mcpToolRes.success({
              success: true,
              txHash: result.txHash,
              network,
              contract: req("tokenAddress"),
              tokenId: result.tokenId,
              amount: result.amount,
              recipient: req("toAddress")
            })
          }
          case "gnfd_deposit_to_payment": {
            const gnfdNetwork = network as "testnet" | "mainnet"
            const result = await gnfdServices.depositToPaymentAccount(
              gnfdNetwork,
              { to: req("to"), amount: req("amount"), privateKey: key }
            )
            if (result.status !== "success") {
              return mcpToolRes.error(
                new Error(result.message ?? "Deposit failed"),
                "confirm_transfer"
              )
            }
            return mcpToolRes.success({
              success: true,
              message: "Deposit completed",
              network: gnfdNetwork,
              to: req("to"),
              amount: req("amount")
            })
          }
          case "gnfd_withdraw_from_payment": {
            const gnfdNetwork = network as "testnet" | "mainnet"
            const result = await gnfdServices.withdrawFromPaymentAccount(
              gnfdNetwork,
              { from: req("from"), amount: req("amount"), privateKey: key }
            )
            if (result.status !== "success") {
              return mcpToolRes.error(
                new Error(result.message ?? "Withdraw failed"),
                "confirm_transfer"
              )
            }
            return mcpToolRes.success({
              success: true,
              message: "Withdraw completed",
              network: gnfdNetwork,
              from: req("from"),
              amount: req("amount")
            })
          }
          case "gnfd_create_payment_account": {
            const gnfdNetwork = network as "testnet" | "mainnet"
            const result = await gnfdServices.createPaymentAccount(
              gnfdNetwork,
              key
            )
            if (result.status !== "success") {
              return mcpToolRes.error(
                new Error(result.message ?? "Create payment account failed"),
                "confirm_transfer"
              )
            }
            return mcpToolRes.success({
              success: true,
              txHash: (result.data as { txHash?: string })?.txHash,
              message: "Payment account created",
              network: gnfdNetwork
            })
          }
          case "write_contract": {
            const contractParams: WriteContractInput = {
              address: req("contractAddress") as Address,
              abi: intent.params.abi as Abi,
              functionName: req("functionName"),
              args: intent.params.args as readonly unknown[]
            }
            const txHash = await evmServices.writeContract(
              key,
              contractParams,
              network
            )
            return mcpToolRes.success({
              success: true,
              transactionHash: txHash,
              contractAddress: req("contractAddress"),
              functionName: req("functionName"),
              network
            })
          }
          default:
            return mcpToolRes.error(
              new Error(`Unknown intent type: ${intent.type}`),
              "confirm_transfer"
            )
        }
      } catch (error) {
        return mcpToolRes.error(error, "confirming transfer")
      }
    }
  )
}
