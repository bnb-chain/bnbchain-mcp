# BNBChain MCP (Model Context Protocol)

A powerful toolkit for interacting with BNB Chain and other EVM-compatible networks through natural language processing and AI assistance.

<a href="https://glama.ai/mcp/servers/@bnb-chain/bnbchain-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@bnb-chain/bnbchain-mcp/badge" alt="bnbchain-mcp MCP server" />
</a>

## Description

BNBChain MCP is a Model Context Protocol implementation that enables seamless interaction with blockchain networks through AI-powered interfaces. It provides a comprehensive set of tools and resources for blockchain development, smart contract interaction, and network management.

## Core Modules

The project is organized into several core modules:

- **Blocks**: Query and manage blockchain blocks
- **Contracts**: Interact with smart contracts
- **Network**: Network information and management
- **NFT**: NFT (ERC721/ERC1155) operations
- **Tokens**: Token (ERC20) operations
- **Transactions**: Transaction management
- **Wallet**: Wallet operations and management
- **Common**: Shared utilities and types
- **Greenfield**: Support file management operations on Greenfield network including, uploading, downloading, and managing files and buckets
- Additional features coming soon (Greenfield, Swap, Bridge, etc.)
- **Agents (ERC-8004)**: Register and resolve on-chain AI agent identities (ERC-8004 Trustless Agents) on BSC and BSC Testnet

## Important Notes

**We do not recommend deploying this MCP Server on the public internet.** (1) The SSE endpoint has **no authentication**—anyone who can reach it can use the server. (2) There is **no centralized service** that custodies private keys or funds; keys and signing are the responsibility of the client. If you still need to deploy it publicly, add an **authentication layer** in front (e.g. API keys, JWT, or a reverse proxy with auth), or deploy a **keyless version** that only exposes read-only or non-sensitive tools.

**Credentials:** Prefer setting `PRIVATE_KEY` in the MCP server environment. Do not pass the private key in tool parameters when avoidable, as it may be stored in conversation history, client logs, or request logs and lead to exposure.

## Transfer and payment confirmation

Transfer and payment tools (e.g. `transfer_native_token`, `transfer_erc20`, `approve_token_spending`, `transfer_nft`, `transfer_erc1155`, `gnfd_deposit_to_payment`, `gnfd_withdraw_from_payment`, `gnfd_create_payment_account`) use a **preview-then-confirm** flow by default so that no funds move until the user explicitly confirms.

- **Default behavior:** Calling a transfer or payment tool returns a **preview** (recipient, amount, network, etc.) and a short-lived **confirmToken**. No transaction is sent. To execute, call the **`confirm_transfer`** tool with that `confirmToken` and your `privateKey`. The token expires after 5 minutes.
- **Skipping confirmation (per call):** Pass **`skipConfirmation: true`** in the tool arguments when the caller has already confirmed or when running in an automated script. The tool will then execute immediately and return the transaction result.
- **Skipping confirmation (server-wide):** Set the environment variable **`BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION=true`** so that all transfer/payment tools execute immediately without returning a preview. Use this for headless or scripted environments where you do not need a confirmation step.

Example flow with confirmation:

1. Call `transfer_native_token` with `toAddress`, `amount`, `network` (and optionally `privateKey`). Do **not** set `skipConfirmation`.
2. The server returns `{ preview: { toAddress, amount, network }, confirmToken: "...", message: "..." }`.
3. Review the preview, then call `confirm_transfer` with `confirmToken` and `privateKey` to execute the transfer.

## Integration with Cursor

To connect to the MCP server from Cursor:

1. Open Cursor and go to Settings (gear icon in the top right)
2. Click on "MCP" in the left sidebar
3. Click "Add new global MCP server"
4. Enter the following details:

Default mode

```json
{
  "mcpServers": {
    "bnbchain-mcp": {
      "command": "npx",
      "args": ["-y", "@bnb-chain/mcp@latest"],
      "env": {
        "PRIVATE_KEY": "your_private_key_here. (optional)",
        "BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION": "false"
      }
    }
  }
}
```

- **PRIVATE_KEY**: Optional. Prefer setting here instead of passing in tool parameters.
- **BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION**: Optional. Set to `"true"` to make all transfer/payment tools execute immediately (no preview step). Default `"false"` uses the preview-then-confirm flow.

SSE mode

```json
{
  "mcpServers": {
    "bnbchain-mcp": {
      "command": "npx",
      "args": ["-y", "@bnb-chain/mcp@latest", "--sse"],
      "env": {
        "PRIVATE_KEY": "your_private_key_here. (optional)",
        "BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION": "false"
      }
    }
  }
}
```

## Integration with Claude Desktop

To connect to the MCP server from Claude Desktop:

1. Open Claude Desktop and go to Settings
2. Click on "Developer" in the left sidebar
3. Click the "Edit Config" Button
4. Add the following configuration to the `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "bnbchain-mcp": {
      "command": "npx",
      "args": ["-y", "@bnb-chain/mcp@latest"],
      "env": {
        "PRIVATE_KEY": "your_private_key_here",
        "BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION": "false"
      }
    }
  }
}
```

Optional env: `BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION=true` to execute transfers immediately without preview/confirm.

5. Save the file and restart Claude Desktop

Once connected, you can use all the MCP prompts and tools directly in your Claude Desktop conversations. For example:

- "Analyze this address: 0x123..."
- "Explain the EVM concept of gas"
- "Check the latest block on BSC"

## Integration with Other Clients

If you want to integrate BNBChain MCP into your own client, please check out the [examples](./examples) directory for more detailed information and reference implementations.

The examples demonstrate:

- How to set up the MCP client
- Authentication and configuration
- Making API calls to interact with blockchain networks
- Handling responses and errors
- Best practices for integration

## Local Development

### Prerequisites

- [bun](http://bun.sh/) v1.2.10 or higher
- [Node.js](https://nodejs.org/en/download) v17 or higher

### Quick Start

1. Clone the repository:

```bash
git clone https://github.com/bnb-chain/bnbchain-mcp.git
cd bnbchain-mcp
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

- `PRIVATE_KEY`: Your wallet private key (required for transaction operations)
- `LOG_LEVEL`: Set logging level (DEBUG, INFO, WARN, ERROR)
- `PORT`: Server port number (default: 3001)

3. Install dependencies and start development server:

```bash
# Install project dependencies
bun install

# Start the development server
bun dev:sse
```

### Testing with MCP Clients

Configure the local server in your MCP clients using this template:

```json
{
  "mcpServers": {
    "bnbchain-mcp": {
      "url": "http://localhost:3001/sse",
      "env": {
        "PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}
```

### Testing with Web UI

We use [`@modelcontextprotocol/inspector`](https://github.com/modelcontextprotocol/inspector) for testing. Launch the test UI:

```bash
bun run test
```

### Available Scripts

- `bun dev:sse`: Start development server with hot reload
- `bun build`: Build the project
- `bun test`: Run test suite

## Available Prompts and Tools

### Prompts

| Name                   | Description                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| analyze_block          | Analyze a block and provide detailed information about its contents |
| analyze_transaction    | Analyze a specific transaction                                      |
| analyze_address        | Analyze an EVM address                                              |
| interact_with_contract | Get guidance on interacting with a smart contract                   |
| explain_evm_concept    | Get an explanation of an EVM concept                                |
| compare_networks       | Compare different EVM-compatible networks                           |
| analyze_token                         | Analyze an ERC20 or NFT token                                       |
| how_to_register_mcp_as_erc8004_agent  | Get guidance on registering an MCP server as an ERC-8004 agent       |

### Tools

| Name                         | Description                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| get_block_by_hash            | Get a block by hash                                                          |
| get_block_by_number          | Get a block by number                                                        |
| get_latest_block             | Get the latest block                                                         |
| get_transaction              | Get detailed information about a specific transaction by its hash            |
| get_transaction_receipt      | Get a transaction receipt by its hash                                        |
| estimate_gas                 | Estimate the gas cost for a transaction                                      |
| transfer_native_token        | Transfer native tokens (BNB, ETH, MATIC, etc.) to an address                 |
| approve_token_spending       | Approve another address to spend your ERC20 tokens                           |
| transfer_nft                 | Transfer an NFT (ERC721 token) from one address to another                   |
| transfer_erc1155             | Transfer ERC1155 tokens to another address                                   |
| transfer_erc20               | Transfer ERC20 tokens to an address                                          |
| get_address_from_private_key | Get the EVM address derived from a private key                               |
| get_chain_info               | Get chain information for a specific network                                 |
| get_supported_networks       | Get list of supported networks                                               |
| resolve_ens                  | Resolve an ENS name to an EVM address                                        |
| is_contract                  | Check if an address is a smart contract or an externally owned account (EOA) |
| read_contract                | Read data from a smart contract by calling a view/pure function              |
| write_contract               | Write data to a smart contract by calling a state-changing function          |
| get_erc20_token_info         | Get ERC20 token information                                                  |
| get_native_balance           | Get native token balance for an address                                      |
| get_erc20_balance            | Get ERC20 token balance for an address                                       |
| get_nft_info                 | Get detailed information about a specific NFT                                |
| check_nft_ownership          | Check if an address owns a specific NFT                                      |
| get_erc1155_token_metadata   | Get the metadata for an ERC1155 token                                        |
| get_nft_balance              | Get the total number of NFTs owned by an address from a specific collection  |
| get_erc1155_balance          | Get the balance of a specific ERC1155 token ID owned by an address           |

### ERC-8004 Agent tools

Register and resolve AI agents on the [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) Identity Registry (Trustless Agents). Supported networks: BSC (56), BSC Testnet (97), Ethereum, Base, Polygon, and their testnets where the [official registry](https://github.com/erc-8004/erc-8004-contracts) is deployed. The `agentURI` should point to a JSON metadata file following the [Agent Metadata Profile](https://best-practices.8004scan.io/docs/01-agent-metadata-standard.html) (name, description, image, and `services` such as MCP endpoint).

| Name                    | Description                                                                 |
| ----------------------- | --------------------------------------------------------------------------- |
| register_erc8004_agent  | Register an agent on the ERC-8004 Identity Registry; returns agent ID    |
| set_erc8004_agent_uri   | Update the metadata URI for an existing ERC-8004 agent (owner only)        |
| get_erc8004_agent       | Get agent info (owner and tokenURI) from the Identity Registry              |
| get_erc8004_agent_wallet| Get the verified payment wallet for an agent (for x402 / payments)           |

### Greenfield tools

| Name                          | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| gnfd_get_bucket_info          | Get detailed information about a specific bucket    |
| gnfd_list_buckets             | List all buckets owned by an address                |
| gnfd_create_bucket            | Create a new bucket                                 |
| gnfd_delete_bucket            | Delete a bucket                                     |
| gnfd_get_object_info          | Get detailed information about a specific object    |
| gnfd_list_objects             | List all objects in a bucket                        |
| gnfd_upload_object            | Upload an object to a bucket                        |
| gnfd_download_object          | Download an object from a bucket                    |
| gnfd_delete_object            | Delete an object from a bucket                      |
| gnfd_create_folder            | Create a folder in a bucket                         |
| gnfd_get_account_balance      | Get the balance for an account                      |
| gnfd_deposit_to_payment       | Deposit funds into a payment account                |
| gnfd_withdraw_from_payment    | Withdraw funds from a payment account               |
| gnfd_disable_refund           | Disable refund for a payment account (IRREVERSIBLE) |
| gnfd_get_payment_accounts     | List all payment accounts owned by an address       |
| gnfd_get_payment_account_info | Get detailed information about a payment account    |
| gnfd_create_payment           | Create a new payment account                        |
| gnfd_get_payment_balance      | Get payment account balance                         |

## Supported Networks

Supports BSC, opBNB, Greenfield, Ethereum, and other major EVM-compatible networks. For more details, see [`src/evm/chains.ts`](src/evm/chains.ts).

**ERC-8004 agent registration** is available on chains where the official registry is deployed: BSC (56), BSC Testnet (97), Ethereum (1), Sepolia (11155111), Base (8453), Base Sepolia (84532), Polygon (137), Polygon Amoy (80002), Arbitrum (42161), Arbitrum Sepolia (421614). Private key is used only to sign the registration or update transaction and is not stored or logged.

## Contributing

We welcome contributions to BNBChain MCP! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## References and Acknowledgments

This project is built upon and inspired by the following open-source projects:

- [TermiX-official/bsc-mcp](https://github.com/TermiX-official/bsc-mcp) - Original BSC MCP implementation
- [mcpdotdirect/evm-mcp-server](https://github.com/mcpdotdirect/evm-mcp-server) - EVM-compatible MCP server implementation

We extend our gratitude to the original authors for their contributions to the blockchain ecosystem.
