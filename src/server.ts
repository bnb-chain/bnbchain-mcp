import 'dotenv/config';
import express from "express";
import type { Request, Response } from "express";
import cors from 'cors';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import Logger from './logger';

const app = express();
app.use(cors());

const server = new McpServer({
  name: "BNBChain MCP Server (SSE)",
  version: "1.0.0"
});

// Log the current log level on startup
Logger.info(`Starting server with log level: ${Logger.getLevel()}`);

// Echo tool
server.tool(
  "echo",
  { message: z.string().describe("The message to echo back") },
  async ({ message }) => {
    Logger.debug('Echo tool called', { message });
    return {
      content: [{ type: "text", text: `Echo: ${message}` }]
    };
  }
);

// Time tool
server.tool(
  "getCurrentTime",
  { format: z.enum(["short", "full"]).default("short").describe("Time format to return") },
  async ({ format }) => {
    Logger.debug('GetCurrentTime tool called', { format });
    const now = new Date();
    const text = format === "short" 
      ? now.toLocaleTimeString()
      : now.toISOString();
    return {
      content: [{ type: "text", text: `Current time: ${text}` }]
    };
  }
);

// Simple prompt example
server.prompt(
  "greet",
  { name: z.string().describe("Name to greet") },
  ({ name }) => {
    Logger.debug('Greet prompt called', { name });
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Please generate a friendly greeting for ${name}.`
        }
      }]
    };
  }
);

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports: {[sessionId: string]: SSEServerTransport} = {};

app.get("/sse", async (_: Request, res: Response) => {
  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;
  Logger.info('New SSE connection established', { sessionId: transport.sessionId });
  
  res.on("close", () => {
    Logger.info('SSE connection closed', { sessionId: transport.sessionId });
    delete transports[transport.sessionId];
  });
  
  try {
    await server.connect(transport);
  } catch (error) {
    Logger.error('Error connecting transport', { sessionId: transport.sessionId, error });
  }
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  
  if (transport) {
    Logger.debug('Handling message', { sessionId, body: req.body });
    try {
      await transport.handlePostMessage(req, res);
    } catch (error) {
      Logger.error('Error handling message', { sessionId, error });
      res.status(500).send('Internal server error');
    }
  } else {
    Logger.warn('No transport found for session', { sessionId });
    res.status(400).send('No transport found for sessionId');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  Logger.info(`BNBChain MCP Server is running on http://localhost:${PORT}`);
});
