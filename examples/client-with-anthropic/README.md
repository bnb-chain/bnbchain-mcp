# BNBChain MCP - Anthropic Client Integration

This directory contains the integration code for using BNBChain MCP with Anthropic's Claude models.

## Overview

The Anthropic client integration enables Claude models to interact directly with blockchain networks through BNBChain MCP. This allows for powerful capabilities like:

- Blockchain data retrieval and analysis
- Smart contract interaction
- Token operations
- Network status checking
- Wallet management

## Setup

### Prerequisites

- Node.js 17 or higher
- An Anthropic API key
- (Optional) A private key for blockchain transactions

### Installation

1. Install the required dependencies:

   ```bash
   npm install
   ```

2. Configure your environment variables:
   ```bash
   export ANTHROPIC_API_KEY=your_anthropic_api_key
   export PRIVATE_KEY=your_blockchain_private_key  # Optional
   ```

## Usage

### Running the Client

```bash
npm run build
npm start
```

This will start the Anthropic client that can interact with the BNBChain MCP.

### Example Prompts

Once the client is running, you can use the following example prompts:

- "Get the latest block on BSC"
- "Check the balance of address 0x123..."
- "Explain what gas fees are in EVM chains"
- "Analyze this transaction: 0xabc..."
- "How do I interact with the Pancake Swap contract?"

## Troubleshooting

Common issues:

- **API Key errors**: Ensure your Anthropic API key is correctly set in environment variables
- **Network errors**: Check your internet connection and that the MCP server is running
- **Rate limiting**: If you hit rate limits, implement retries with exponential backoff

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Related Resources

- [BNBChain MCP Documentation](https://github.com/bnb-chain/bnbchain-mcp)
- [Anthropic Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
