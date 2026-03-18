import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { Hex } from "viem"
import { z } from "zod"

import * as services from "@/evm/services/index.js"
import { mcpToolRes } from "@/utils/helper"
import { createPendingIntent } from "@/utils/pendingTransferStore.js"
import {
  isSkipTransferConfirmation,
  skipConfirmationParam
} from "@/utils/transferConfirmation.js"
import {
  positiveAmountParam,
  privateKeyParam,
  requiredNetworkParam
} from "../common/types"

export function registerWalletTools(server: McpServer) {
  // Get address from private key
  server.tool(
    "get_address_from_private_key",
    "Get the EVM address derived from a private key",
    {
      privateKey: privateKeyParam
    },
    async ({ privateKey }) => {
      try {
        // Ensure the private key has 0x prefix
        const formattedKey = privateKey.startsWith("0x")
          ? (privateKey as Hex)
          : (`0x${privateKey}` as Hex)

        const address = services.getAddressFromPrivateKey(formattedKey)

        return mcpToolRes.success({
          address
        })
      } catch (error) {
        return mcpToolRes.error(error, "deriving address from private key")
      }
    }
  )

  // Transfer native token
  server.tool(
    "transfer_native_token",
    "Transfer native tokens (BNB, ETH, MATIC, etc.) to an address. By default returns a preview and confirmToken—call confirm_transfer with the token to execute. Set skipConfirmation=true or BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION=true to execute immediately.",
    {
      privateKey: privateKeyParam,
      toAddress: z
        .string()
        .describe(
          "The recipient address or ENS name (e.g., '0x1234...' or 'vitalik.eth')"
        ),
      amount: positiveAmountParam.describe(
        "Amount to send in BNB (or the native token of the network), e.g. '0.1'"
      ),
      network: requiredNetworkParam,
      skipConfirmation: skipConfirmationParam
    },
    async ({ privateKey, toAddress, amount, network, skipConfirmation }) => {
      try {
        if (skipConfirmation || isSkipTransferConfirmation()) {
          const hash = await services.transferETH(
            privateKey,
            toAddress,
            amount,
            network
          )
          return mcpToolRes.success({
            success: true,
            txHash: hash,
            toAddress,
            amount,
            network
          })
        }
        const { token: confirmToken, expiresAt } = createPendingIntent({
          type: "transfer_native_token",
          params: { toAddress, amount },
          network
        })
        return mcpToolRes.success({
          preview: { toAddress, amount, network },
          confirmToken,
          expiresAt,
          message:
            "Call confirm_transfer with this confirmToken and your privateKey to execute the transfer."
        })
      } catch (error) {
        return mcpToolRes.error(error, "transferring native token")
      }
    }
  )

  // Approve ERC20 token spending
  server.tool(
    "approve_token_spending",
    "Approve another address (e.g. a DeFi protocol or exchange) to spend your ERC20 tokens. Use the exact amount needed. WARNING: Large or unlimited approvals increase risk. By default returns a preview—call confirm_transfer to execute. Set skipConfirmation=true or BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION=true to execute immediately.",
    {
      privateKey: privateKeyParam,
      tokenAddress: z
        .string()
        .describe(
          "The contract address of the ERC20 token to approve for spending (e.g., '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' for USDC on Ethereum)"
        ),
      spenderAddress: z
        .string()
        .describe(
          "The contract address being approved to spend your tokens (e.g., a DEX or lending protocol)"
        ),
      amount: positiveAmountParam.describe(
        "Exact amount of tokens to approve, in token units (e.g. '100'). Use only the amount needed; avoid very large values."
      ),
      network: requiredNetworkParam,
      skipConfirmation: skipConfirmationParam
    },
    async ({
      privateKey,
      tokenAddress,
      spenderAddress,
      amount,
      network,
      skipConfirmation
    }) => {
      try {
        if (skipConfirmation || isSkipTransferConfirmation()) {
          const result = await services.approveERC20(
            tokenAddress,
            spenderAddress,
            amount,
            privateKey,
            network
          )
          return mcpToolRes.success({
            success: true,
            approvalDetails: {
              token: tokenAddress,
              spender: spenderAddress,
              amount: result.amount.formatted,
              symbol: result.token.symbol
            },
            txHash: result.txHash,
            network
          })
        }
        const { token: confirmToken, expiresAt } = createPendingIntent({
          type: "approve_token_spending",
          params: { tokenAddress, spenderAddress, amount },
          network
        })
        return mcpToolRes.success({
          preview: { tokenAddress, spenderAddress, amount, network },
          confirmToken,
          expiresAt,
          message:
            "Call confirm_transfer with this confirmToken and your privateKey to execute the approval."
        })
      } catch (error) {
        return mcpToolRes.error(error, "approving token spending")
      }
    }
  )

  // Transfer ERC20 tokens
  server.tool(
    "transfer_erc20",
    "Transfer ERC20 tokens to an address. By default returns a preview and confirmToken—call confirm_transfer to execute. Set skipConfirmation=true or BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION=true to execute immediately.",
    {
      privateKey: privateKeyParam,
      tokenAddress: z
        .string()
        .describe(
          "The contract address or ENS name of the ERC20 token to transfer (e.g., '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' for USDC or 'uniswap.eth')"
        ),
      toAddress: z
        .string()
        .describe(
          "The recipient address or ENS name that will receive the tokens (e.g., '0x1234...' or 'vitalik.eth')"
        ),
      amount: positiveAmountParam.describe(
        "Amount of tokens to send (e.g. '100'). Adjusted for the token's decimals."
      ),
      network: requiredNetworkParam,
      skipConfirmation: skipConfirmationParam
    },
    async ({
      privateKey,
      tokenAddress,
      toAddress,
      amount,
      network,
      skipConfirmation
    }) => {
      try {
        if (skipConfirmation || isSkipTransferConfirmation()) {
          const result = await services.transferERC20(
            tokenAddress,
            toAddress,
            amount,
            privateKey,
            network
          )
          return mcpToolRes.success({
            success: true,
            txHash: result.txHash,
            tokenAddress,
            toAddress,
            amount: result.amount.formatted,
            symbol: result.token.symbol,
            network
          })
        }
        const { token: confirmToken, expiresAt } = createPendingIntent({
          type: "transfer_erc20",
          params: { tokenAddress, toAddress, amount },
          network
        })
        return mcpToolRes.success({
          preview: { tokenAddress, toAddress, amount, network },
          confirmToken,
          expiresAt,
          message:
            "Call confirm_transfer with this confirmToken and your privateKey to execute the transfer."
        })
      } catch (error) {
        return mcpToolRes.error(error, "transferring tokens")
      }
    }
  )
}
