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

## Available Prompts and Tools

### Prompts

| Name                   | Description                                                         | Parameters                                                                                                                                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| analyze_block          | Analyze a block and provide detailed information about its contents | - blockNumber: Block number to analyze (optional)<br>- network: Network to analyze the block on (default: "bsc")                                                                                                                                 |
| analyze_transaction    | Analyze a specific transaction                                      | - txHash: Transaction hash to analyze<br>- network: Network to analyze the transaction on (default: "bsc")                                                                                                                                       |
| analyze_address        | Analyze an EVM address                                              | - address: Ethereum address to analyze<br>- network: Network to analyze the address on (default: "bsc")                                                                                                                                          |
| interact_with_contract | Get guidance on interacting with a smart contract                   | - contractAddress: The contract address<br>- abiJson: The contract ABI as a JSON string (optional)<br>- network: Network to query                                                                                                                |
| explain_evm_concept    | Get an explanation of an EVM concept                                | - concept: The EVM concept to explain (e.g., gas, nonce, etc.)                                                                                                                                                                                   |
| compare_networks       | Compare different EVM-compatible networks                           | - networkList: Comma-separated list of networks to compare (e.g., 'bsc,opbnb,ethereum,optimism,base,etc.')                                                                                                                                       |
| analyze_token          | Analyze an ERC20 or NFT token                                       | - tokenAddress: Token contract address to analyze<br>- network: Network to analyze the token on (default: "bsc")<br>- tokenType: Type of token to analyze (erc20, erc721/nft, or auto-detect)<br>- tokenId: Token ID (required for NFT analysis) |

### Tools

| Name                         | Description                                                                  | Parameters                                                                                                                                                                                                                                                                                                  | Default Network |
| ---------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| get_block_by_hash            | Get a block by hash                                                          | - blockHash: The block hash to look up<br>- network: Network to query                                                                                                                                                                                                                                       | bsc             |
| get_block_by_number          | Get a block by number                                                        | - blockNumber: The block number to look up<br>- network: Network to query                                                                                                                                                                                                                                   | bsc             |
| get_latest_block             | Get the latest block                                                         | - network: Network to query                                                                                                                                                                                                                                                                                 | bsc             |
| get_transaction              | Get detailed information about a specific transaction by its hash            | - txHash: The transaction hash to look up<br>- network: Network to query                                                                                                                                                                                                                                    | bsc             |
| get_transaction_receipt      | Get a transaction receipt by its hash                                        | - txHash: The transaction hash to look up<br>- network: Network to query                                                                                                                                                                                                                                    | bsc             |
| estimate_gas                 | Estimate the gas cost for a transaction                                      | - to: The recipient address<br>- value: The amount of ETH to send in ether (optional)<br>- data: The transaction data as a hex string (optional)<br>- network: Network to query                                                                                                                             | bsc             |
| transfer_native_token        | Transfer native tokens (BNB, ETH, MATIC, etc.) to an address                 | - privateKey: Private key of the sender account<br>- to: The recipient address<br>- amount: Amount to send in native token<br>- network: Network to query                                                                                                                                                   | bsc             |
| approve_token_spending       | Approve another address to spend your ERC20 tokens                           | - privateKey: Private key of the token owner account<br>- tokenAddress: The contract address of the ERC20 token<br>- spenderAddress: The contract address being approved to spend your tokens<br>- amount: The amount of tokens to approve<br>- network: Network to query                                   | bsc             |
| transfer_nft                 | Transfer an NFT (ERC721 token) from one address to another                   | - privateKey: Private key of the NFT owner account<br>- tokenAddress: The contract address of the NFT collection<br>- tokenId: The ID of the specific NFT to transfer<br>- toAddress: The recipient wallet address<br>- network: Network to query                                                           | bsc             |
| transfer_erc1155             | Transfer ERC1155 tokens to another address                                   | - privateKey: Private key of the token owner account<br>- tokenAddress: The contract address of the ERC1155 token collection<br>- tokenId: The ID of the specific token to transfer<br>- amount: The quantity of tokens to send<br>- toAddress: The recipient wallet address<br>- network: Network to query | bsc             |
| transfer_erc20               | Transfer ERC20 tokens to an address                                          | - privateKey: Private key of the sender account<br>- tokenAddress: The contract address of the ERC20 token to transfer<br>- toAddress: The recipient address<br>- amount: Amount of tokens to send<br>- network: Network to query                                                                           | bsc             |
| get_address_from_private_key | Get the EVM address derived from a private key                               | - privateKey: Private key in hex format                                                                                                                                                                                                                                                                     | -               |
| get_chain_info               | Get chain information for a specific network                                 | - network: Network to query                                                                                                                                                                                                                                                                                 | bsc             |
| get_supported_networks       | Get list of supported networks                                               | - None                                                                                                                                                                                                                                                                                                      | -               |
| resolve_ens                  | Resolve an ENS name to an EVM address                                        | - ensName: ENS name to resolve<br>- network: Network to query                                                                                                                                                                                                                                               | eth             |
| is_contract                  | Check if an address is a smart contract or an externally owned account (EOA) | - address: The wallet or contract address to check<br>- network: Network to query                                                                                                                                                                                                                           | bsc             |
| read_contract                | Read data from a smart contract by calling a view/pure function              | - contractAddress: The address of the smart contract<br>- abi: The ABI of the smart contract function<br>- functionName: The name of the function to call<br>- args: The arguments to pass to the function (optional)<br>- network: Network to query                                                        | bsc             |
| write_contract               | Write data to a smart contract by calling a state-changing function          | - contractAddress: The address of the smart contract<br>- abi: The ABI of the smart contract function<br>- functionName: The name of the function to call<br>- args: The arguments to pass to the function<br>- privateKey: Private key of the sending account<br>- network: Network to query               | bsc             |
| get_erc20_token_info         | Get ERC20 token information                                                  | - tokenAddress: The ERC20 token contract address<br>- network: Network to query                                                                                                                                                                                                                             | bsc             |
| get_native_balance           | Get native token balance for an address                                      | - address: The address to check balance for<br>- network: Network to query                                                                                                                                                                                                                                  | bsc             |
| get_erc20_balance            | Get ERC20 token balance for an address                                       | - tokenAddress: The ERC20 token contract address<br>- address: The address to check balance for<br>- network: Network to query                                                                                                                                                                              | bsc             |
| get_nft_info                 | Get detailed information about a specific NFT                                | - tokenAddress: The contract address of the NFT collection<br>- tokenId: The ID of the specific NFT token<br>- network: Network to query                                                                                                                                                                    | bsc             |
| check_nft_ownership          | Check if an address owns a specific NFT                                      | - tokenAddress: The contract address of the NFT collection<br>- tokenId: The ID of the NFT to check<br>- ownerAddress: The address to check ownership for<br>- network: Network to query                                                                                                                    | bsc             |
| get_erc1155_token_uri        | Get the metadata URI for an ERC1155 token                                    | - tokenAddress: The contract address of the ERC1155 token collection<br>- tokenId: The ID of the specific token to query metadata for<br>- network: Network to query                                                                                                                                        | bsc             |
| get_nft_balance              | Get the total number of NFTs owned by an address from a specific collection  | - tokenAddress: The contract address of the NFT collection<br>- ownerAddress: The wallet address to check the NFT balance for<br>- network: Network to query                                                                                                                                                | bsc             |
| get_erc1155_balance          | Get the balance of a specific ERC1155 token ID owned by an address           | - tokenAddress: The contract address of the ERC1155 token collection<br>- tokenId: The ID of the specific token to check the balance for<br>- ownerAddress: The wallet address to check the token balance for<br>- network: Network to query                                                                | bsc             |

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
