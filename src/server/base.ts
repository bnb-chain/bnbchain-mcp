import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSupportedNetworks } from "../evm/chains.js";
import { registerEVM } from "@/evm/index.js";
import Logger from "@/utils/logger.js";

// Create and start the MCP server
export const startServer = () => {
  try {
    // Create a new MCP server instance
    const server = new McpServer({
      name: "BNBChain MCP Server",
      version: "1.0.0",
    });

    // Register all resources, tools, and prompts
    registerEVM(server);

    // Log server information
    Logger.info(`BNBChain MCP Server initialized`);
    Logger.info(`Supported networks: ${getSupportedNetworks().join(", ")}`);
    Logger.info("Server is ready to handle requests");

    return server;
  } catch (error) {
    Logger.error("Failed to initialize server:", error);
    process.exit(1);
  }
};
