import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
  const transport = new SSEClientTransport(new URL('http://localhost:3001/sse'));

  const client = new Client({
    name: "BNBChain MCP Client",
    version: "1.0.0"
  });

  try {
    console.log("Connecting to MCP server...");
    await client.connect(transport);
    console.log("Connected to MCP server!");

    // Test echo tool
    const chainInfo = await client.callTool({
      name: "get_chain_info",
      arguments: {
        network: "bsc"
      }
    });
    console.log("Echo chainInfo:", chainInfo);

    // Test prompt
    const prompt = await client.getPrompt({
      name: "explore_block",
      arguments: {
        network: "bsc"
      }
    });
    console.log("Prompt result:", prompt);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log("\nShutting down client...");
  process.exit(0);
});

main(); 