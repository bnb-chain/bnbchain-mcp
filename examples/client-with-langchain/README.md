# BNBChain MCP with LangChain Integration Example

This example demonstrates how to integrate BNBChain MCP with LangChain to create a powerful CLI agent for blockchain interactions.

## Features

- Seamless integration with LangChain's ReAct agent framework
- Interactive command-line interface for querying blockchain data
- Support for multiple MCP servers
- Conversation history tracking
- Rich error handling and user experience

## Prerequisites

- Node.js 17 or higher
- An OpenAI API key
- (Optional) A BNB Chain private key for transaction operations

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with your API keys:
   ```
   OPENAI_API_KEY=sk-your-openai-key
   ```

## Usage

Start the CLI agent:

```bash
npm run build
npm start
```

### Example Queries

- "What's the latest block on BSC?"
- "Get the balance of this address: 0x123..."
- "Explain the EVM concept of gas"
- "Check if 0xabc... is a contract or EOA"
- "Get the token info for CAKE on BSC"

## How It Works

This example uses:

1. **LangChain's ReAct Agent** - For reasoning and action planning
2. **MCP Adapters** - To connect to BNBChain MCP server
3. **Readline Interface** - For the interactive CLI experience
4. **Message History** - To maintain conversation context

## Customization

You can modify the code to:

- Change the LLM provider (OpenAI, Deepseek, etc.)
- Add more MCP servers for different blockchains
- Customize the agent's capabilities
- Implement additional error handling

## Troubleshooting

Common issues:

- **API Key Errors**: Ensure your API keys are correctly set in the `.env` file
- **Connection Issues**: Check that the MCP server is properly running
- **Rate Limits**: If you encounter rate limits, consider adding backoff logic

## License

This project is licensed under the MIT License - see the LICENSE file for details.
