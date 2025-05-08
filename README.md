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
        "PRIVATE_KEY": "your_private_key_here. (optional)"
      }
    }
  }
}
```

SSE mode

```json
{
  "mcpServers": {
    "bnbchain-mcp": {
      "command": "npx",
      "args": ["-y", "@bnb-chain/mcp@latest", "--sse"],
      "env": {
        "PRIVATE_KEY": "your_private_key_here. (optional)"
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
        "PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}
```

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
| analyze_token          | Analyze an ERC20 or NFT token                                       |

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
| get_erc1155_token_uri        | Get the metadata URI for an ERC1155 token                                    |
| get_nft_balance              | Get the total number of NFTs owned by an address from a specific collection  |
| get_erc1155_balance          | Get the balance of a specific ERC1155 token ID owned by an address           |
| gnfd_get_bucket_info         | Get detailed information about a specific bucket                             |
| gnfd_list_buckets            | List all buckets owned by an address                                         |
| gnfd_create_bucket           | Create a new bucket                                                          |
| gnfd_delete_bucket           | Delete a bucket                                                              |
| gnfd_get_object_info         | Get detailed information about a specific object                             |
| gnfd_list_objects            | List all objects in a bucket                                                 |
| gnfd_upload_object           | Upload an object to a bucket                                                 |
| gnfd_download_object         | Download an object from a bucket                                             |
| gnfd_delete_object           | Delete an object from a bucket                                               |
| gnfd_create_folder           | Create a folder in a bucket                                                  |

## Supported Networks

Supports BSC, opBNB, Greenfield, Ethereum, and other major EVM-compatible networks. For more details, see [`src/evm/chains.ts`](src/evm/chains.ts).

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
