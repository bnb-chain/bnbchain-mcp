# BNBChain MCP (Model Context Protocol)

A powerful toolkit for interacting with BNB Chain and other EVM-compatible networks through natural language processing and AI assistance.

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

## How to Use in Cursor

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
      "args": ["-y", "@bnb-chain/mcp"],
      "env": {
        "PRIVATE_KEY": "your_private_key_here"
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
      "args": ["-y", "@bnb-chain/mcp", "--sse"],
      "env": {
        "PRIVATE_KEY": "your_private_key_here"
      }
    }
  }
}
```

## Development

### Prerequisites

- [bun](http://bun.sh/) 1.2.10 or higher

```bash
# Install dependencies
bun install

# Start the development server
bun dev
```

## Supported Tools and Resources

| Name                                                               | Description                                           |
| ------------------------------------------------------------------ | ----------------------------------------------------- |
| [`get_chain_info`](src/evm/modules/network/tools.ts)               | Get information about an EVM network                  |
| [`get_supported_networks`](src/evm/modules/network/tools.ts)       | Get a list of supported EVM networks                  |
| [`get_transaction`](src/evm/modules/transactions/tools.ts)         | Get detailed information about a specific transaction |
| [`get_transaction_receipt`](src/evm/modules/transactions/tools.ts) | Get a transaction receipt by its hash                 |
| [`estimate_gas`](src/evm/modules/transactions/tools.ts)            | Estimate the gas cost for a transaction               |
| [`transfer_eth`](src/evm/modules/wallet/tools.ts)                  | Transfer native tokens (ETH, BNB, etc.) to an address |
| [`transfer_token`](src/evm/modules/tokens/tools.ts)                | Transfer ERC20 tokens to another address              |
| [`approve_token_spending`](src/evm/modules/tokens/tools.ts)        | Approve another address to spend your ERC20 tokens    |
| [`transfer_nft`](src/evm/modules/nft/tools.ts)                     | Transfer an NFT (ERC721 token) to another address     |
| [`transfer_erc1155`](src/evm/modules/nft/tools.ts)                 | Transfer ERC1155 tokens to another address            |
| [`check_nft_ownership`](src/evm/modules/nft/tools.ts)              | Check if an address owns a specific NFT               |
| [`get_nft_info`](src/evm/modules/nft/tools.ts)                     | Get detailed information about a specific NFT         |
| [`get_address_from_private_key`](src/evm/modules/wallet/tools.ts)  | Get the EVM address derived from a private key        |
| [`resolve_ens`](src/evm/modules/network/tools.ts)                  | Resolve an ENS name to an EVM address                 |
| [`is_contract`](src/evm/modules/contracts/tools.ts)                | Check if an address is a smart contract or EOA        |

## Supported Networks

Supports BSC, opBNB, Ethereum, and other major EVM-compatible networks. For more details, see [`src/evm/chains.ts`](src/evm/chains.ts).

## Testing

We use the [`@modelcontextprotocol/inspector`](https://github.com/modelcontextprotocol/inspector) tool for testing. Run the following command to open a UI interface for inspection:

```bash
bun run test
```

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
