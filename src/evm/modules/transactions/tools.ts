import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Address, Hash } from "viem";
import * as services from "@/evm/services/index.js";

export function registerTransactionTools(server: McpServer) {
  // Get transaction by hash
  server.tool(
    "get_transaction",
    "Get detailed information about a specific transaction by its hash. Includes sender, recipient, value, data, and more.",
    {
      txHash: z
        .string()
        .describe("The transaction hash to look up (e.g., '0x1234...')"),
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'ethereum', 'optimism', 'arbitrum', 'base', 'polygon') or chain ID. Defaults to Ethereum mainnet."
        ),
    },
    async ({ txHash, network = "ethereum" }) => {
      try {
        const tx = await services.getTransaction(txHash as Hash, network);

        return {
          content: [
            {
              type: "text",
              text: services.helpers.formatJson(tx),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transaction ${txHash}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get transaction receipt
  server.tool(
    "get_transaction_receipt",
    "Get a transaction receipt by its hash",
    {
      txHash: z.string().describe("The transaction hash to look up"),
      network: z
        .string()
        .optional()
        .describe("Network name or chain ID. Defaults to Ethereum mainnet."),
    },
    async ({ txHash, network = "ethereum" }) => {
      try {
        const receipt = await services.getTransactionReceipt(
          txHash as Hash,
          network
        );

        return {
          content: [
            {
              type: "text",
              text: services.helpers.formatJson(receipt),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transaction receipt ${txHash}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Estimate gas
  server.tool(
    "estimate_gas",
    "Estimate the gas cost for a transaction",
    {
      to: z.string().describe("The recipient address"),
      value: z
        .string()
        .optional()
        .describe("The amount of ETH to send in ether (e.g., '0.1')"),
      data: z
        .string()
        .optional()
        .describe("The transaction data as a hex string"),
      network: z
        .string()
        .optional()
        .describe("Network name or chain ID. Defaults to Ethereum mainnet."),
    },
    async ({ to, value, data, network = "ethereum" }) => {
      try {
        const params: any = { to: to as Address };

        if (value) {
          params.value = services.helpers.parseEther(value);
        }

        if (data) {
          params.data = data as `0x${string}`;
        }

        const gas = await services.estimateGas(params, network);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  network,
                  estimatedGas: gas.toString(),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error estimating gas: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // TRANSFER TOOLS

  // Transfer ETH
  server.tool(
    "transfer_eth",
    "Transfer native tokens (ETH, MATIC, etc.) to an address",
    {
      privateKey: z
        .string()
        .describe(
          "Private key of the sender account in hex format (with or without 0x prefix). SECURITY: This is used only for transaction signing and is not stored."
        ),
      to: z
        .string()
        .describe(
          "The recipient address or ENS name (e.g., '0x1234...' or 'vitalik.eth')"
        ),
      amount: z
        .string()
        .describe(
          "Amount to send in ETH (or the native token of the network), as a string (e.g., '0.1')"
        ),
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'ethereum', 'optimism', 'arbitrum', 'base', etc.) or chain ID. Supports all EVM-compatible networks. Defaults to Ethereum mainnet."
        ),
    },
    async ({ privateKey, to, amount, network = "ethereum" }) => {
      try {
        const txHash = await services.transferETH(
          privateKey,
          to,
          amount,
          network
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash,
                  to,
                  amount,
                  network,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transferring ETH: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Transfer ERC20
  server.tool(
    "transfer_erc20",
    "Transfer ERC20 tokens to another address",
    {
      privateKey: z
        .string()
        .describe(
          "Private key of the sending account (this is used for signing and is never stored)"
        ),
      tokenAddress: z
        .string()
        .describe("The address of the ERC20 token contract"),
      toAddress: z.string().describe("The recipient address"),
      amount: z
        .string()
        .describe(
          "The amount of tokens to send (in token units, e.g., '10' for 10 tokens)"
        ),
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'ethereum', 'optimism', 'arbitrum', 'base', etc.) or chain ID. Supports all EVM-compatible networks. Defaults to Ethereum mainnet."
        ),
    },
    async ({
      privateKey,
      tokenAddress,
      toAddress,
      amount,
      network = "ethereum",
    }) => {
      try {
        // Get the formattedKey with 0x prefix
        const formattedKey = privateKey.startsWith("0x")
          ? (privateKey as `0x${string}`)
          : (`0x${privateKey}` as `0x${string}`);

        const result = await services.transferERC20(
          tokenAddress as Address,
          toAddress as Address,
          amount,
          formattedKey,
          network
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: result.txHash,
                  network,
                  tokenAddress,
                  recipient: toAddress,
                  amount: result.amount.formatted,
                  symbol: result.token.symbol,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transferring ERC20 tokens: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Approve ERC20 token spending
  server.tool(
    "approve_token_spending",
    "Approve another address (like a DeFi protocol or exchange) to spend your ERC20 tokens. This is often required before interacting with DeFi protocols.",
    {
      privateKey: z
        .string()
        .describe(
          "Private key of the token owner account in hex format (with or without 0x prefix). SECURITY: This is used only for transaction signing and is not stored."
        ),
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
      amount: z
        .string()
        .describe(
          "The amount of tokens to approve in token units, not wei (e.g., '1000' to approve spending 1000 tokens). Use a very large number for unlimited approval."
        ),
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'ethereum', 'optimism', 'arbitrum', 'base', 'polygon') or chain ID. Defaults to Ethereum mainnet."
        ),
    },
    async ({
      privateKey,
      tokenAddress,
      spenderAddress,
      amount,
      network = "ethereum",
    }) => {
      try {
        // Get the formattedKey with 0x prefix
        const formattedKey = privateKey.startsWith("0x")
          ? (privateKey as `0x${string}`)
          : (`0x${privateKey}` as `0x${string}`);

        const result = await services.approveERC20(
          tokenAddress as Address,
          spenderAddress as Address,
          amount,
          formattedKey,
          network
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: result.txHash,
                  network,
                  tokenAddress,
                  spender: spenderAddress,
                  amount: result.amount.formatted,
                  symbol: result.token.symbol,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error approving token spending: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Transfer NFT (ERC721)
  server.tool(
    "transfer_nft",
    "Transfer an NFT (ERC721 token) from one address to another. Requires the private key of the current owner for signing the transaction.",
    {
      privateKey: z
        .string()
        .describe(
          "Private key of the NFT owner account in hex format (with or without 0x prefix). SECURITY: This is used only for transaction signing and is not stored."
        ),
      tokenAddress: z
        .string()
        .describe(
          "The contract address of the NFT collection (e.g., '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' for Bored Ape Yacht Club)"
        ),
      tokenId: z
        .string()
        .describe("The ID of the specific NFT to transfer (e.g., '1234')"),
      toAddress: z
        .string()
        .describe("The recipient wallet address that will receive the NFT"),
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'ethereum', 'optimism', 'arbitrum', 'base', 'polygon') or chain ID. Most NFTs are on Ethereum mainnet, which is the default."
        ),
    },
    async ({
      privateKey,
      tokenAddress,
      tokenId,
      toAddress,
      network = "ethereum",
    }) => {
      try {
        // Get the formattedKey with 0x prefix
        const formattedKey = privateKey.startsWith("0x")
          ? (privateKey as `0x${string}`)
          : (`0x${privateKey}` as `0x${string}`);

        const result = await services.transferERC721(
          tokenAddress as Address,
          toAddress as Address,
          BigInt(tokenId),
          formattedKey,
          network
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: result.txHash,
                  network,
                  collection: tokenAddress,
                  tokenId: result.tokenId,
                  recipient: toAddress,
                  name: result.token.name,
                  symbol: result.token.symbol,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transferring NFT: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Transfer ERC1155 token
  server.tool(
    "transfer_erc1155",
    "Transfer ERC1155 tokens to another address. ERC1155 is a multi-token standard that can represent both fungible and non-fungible tokens in a single contract.",
    {
      privateKey: z
        .string()
        .describe(
          "Private key of the token owner account in hex format (with or without 0x prefix). SECURITY: This is used only for transaction signing and is not stored."
        ),
      tokenAddress: z
        .string()
        .describe(
          "The contract address of the ERC1155 token collection (e.g., '0x76BE3b62873462d2142405439777e971754E8E77')"
        ),
      tokenId: z
        .string()
        .describe("The ID of the specific token to transfer (e.g., '1234')"),
      amount: z
        .string()
        .describe(
          "The quantity of tokens to send (e.g., '1' for a single NFT or '10' for 10 fungible tokens)"
        ),
      toAddress: z
        .string()
        .describe("The recipient wallet address that will receive the tokens"),
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'ethereum', 'optimism', 'arbitrum', 'base', 'polygon') or chain ID. ERC1155 tokens exist across many networks. Defaults to Ethereum mainnet."
        ),
    },
    async ({
      privateKey,
      tokenAddress,
      tokenId,
      amount,
      toAddress,
      network = "ethereum",
    }) => {
      try {
        // Get the formattedKey with 0x prefix
        const formattedKey = privateKey.startsWith("0x")
          ? (privateKey as `0x${string}`)
          : (`0x${privateKey}` as `0x${string}`);

        const result = await services.transferERC1155(
          tokenAddress as Address,
          toAddress as Address,
          BigInt(tokenId),
          amount,
          formattedKey,
          network
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: result.txHash,
                  network,
                  contract: tokenAddress,
                  tokenId: result.tokenId,
                  amount: result.amount,
                  recipient: toAddress,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transferring ERC1155 tokens: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Transfer ERC20 tokens
  server.tool(
    "transfer_token",
    "Transfer ERC20 tokens to an address",
    {
      privateKey: z
        .string()
        .describe(
          "Private key of the sender account in hex format (with or without 0x prefix). SECURITY: This is used only for transaction signing and is not stored."
        ),
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
      amount: z
        .string()
        .describe(
          "Amount of tokens to send as a string (e.g., '100' for 100 tokens). This will be adjusted for the token's decimals."
        ),
      network: z
        .string()
        .optional()
        .describe(
          "Network name (e.g., 'ethereum', 'optimism', 'arbitrum', 'base', etc.) or chain ID. Supports all EVM-compatible networks. Defaults to Ethereum mainnet."
        ),
    },
    async ({
      privateKey,
      tokenAddress,
      toAddress,
      amount,
      network = "ethereum",
    }) => {
      try {
        const result = await services.transferERC20(
          tokenAddress,
          toAddress,
          amount,
          privateKey,
          network
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  txHash: result.txHash,
                  tokenAddress,
                  toAddress,
                  amount: result.amount.formatted,
                  symbol: result.token.symbol,
                  network,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error transferring tokens: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
