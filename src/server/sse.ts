import "dotenv/config"

import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import cors from "cors"
import express from "express"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"

import Logger from "@/utils/logger"
import { startServer } from "./base"

type Transport = SSEServerTransport | StreamableHTTPServerTransport

export const startSSEServer = async (httpOnly: boolean = false) => {
  try {
    const app = express()
    const server = startServer()
    app.use(express.json())
    app.use(cors({
      origin: '*',
      exposedHeaders: ['Mcp-Session-Id']
    }))

    // Log the current log level on startup
    Logger.info(`Starting HTTP server with log level: ${Logger.getLevel()}`)

    // to support multiple simultaneous connections we have a lookup object from
    // sessionId to transport
    const transports: { [sessionId: string]: Transport } = {}

    //=============================================================================
    // STREAMABLE HTTP TRANSPORT (PROTOCOL VERSION 2025-03-26)
    //=============================================================================
    app.all("/mcp", async (req: Request, res: Response) => {
      Logger.debug(`Received ${req.method} request to /mcp`)
      try {
        const sessionId = req.headers['mcp-session-id'] as string | undefined
        let transport: StreamableHTTPServerTransport | undefined

        if (sessionId && transports[sessionId]) {
          const existingTransport = transports[sessionId]
          if (existingTransport instanceof StreamableHTTPServerTransport) {
            transport = existingTransport
          } else {
            res.status(400).json({
              jsonrpc: '2.0',
              error: {
                code: -32000,
                message: 'Bad Request: Session exists but uses a different transport protocol'
              },
              id: null
            })
            return
          }
        } else if (!sessionId && req.method === 'POST' && isInitializeRequest(req.body)) {
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId: string) => {
              Logger.info(`StreamableHTTP session initialized with ID: ${newSessionId}`)
              transports[newSessionId] = transport!
            }
          })

          transport.onclose = () => {
            const sid = transport!.sessionId
            if (sid && transports[sid]) {
              Logger.info(`Transport closed for session ${sid}`)
              delete transports[sid]
            }
          }

          await server.connect(transport)
        } else {
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided or not an initialize request'
            },
            id: null
          })
          return
        }

        await transport!.handleRequest(req, res, req.body)
      } catch (error) {
        Logger.error('Error handling MCP request:', error)
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error'
            },
            id: null
          })
        }
      }
    })

    //=============================================================================
    // DEPRECATED HTTP+SSE TRANSPORT (PROTOCOL VERSION 2024-11-05)
    //=============================================================================
    if (!httpOnly) {
      app.get("/sse", async (_: Request, res: Response) => {
        const transport = new SSEServerTransport("/messages", res)
        transports[transport.sessionId] = transport
        Logger.info("New SSE connection established", {
          sessionId: transport.sessionId
        })

        res.on("close", () => {
          Logger.info("SSE connection closed", { sessionId: transport.sessionId })
          delete transports[transport.sessionId]
        })

        try {
          await server.connect(transport)
        } catch (error) {
          Logger.error("Error connecting transport", {
            sessionId: transport.sessionId,
            error
          })
        }
      })

      app.post("/messages", async (req: Request, res: Response) => {
        const sessionId = req.query.sessionId as string
        const transport = transports[sessionId]

        if (transport instanceof SSEServerTransport) {
          Logger.debug("Handling message", { sessionId, body: req.body })
          try {
            await transport.handlePostMessage(req, res, req.body)
          } catch (error) {
            Logger.error("Error handling message", { sessionId, error })
            res.status(500).send("Internal server error")
          }
        } else if (transport) {
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: Session exists but uses a different transport protocol'
            },
            id: null
          })
        } else {
          Logger.warn("No transport found for session", { sessionId })
          res.status(400).send("No transport found for sessionId")
        }
      })
    }

    const PORT = process.env.PORT || 3001
    app.listen(PORT, () => {
      Logger.info(
        `BNBChain MCP Server is running on http://localhost:${PORT}`
      )
      if (httpOnly) {
        Logger.info(
          `Streamable HTTP endpoint: http://localhost:${PORT}/mcp`
        )
      } else {
        Logger.info(
          `Streamable HTTP (recommended): http://localhost:${PORT}/mcp`
        )
        Logger.info(
          `SSE (deprecated): http://localhost:${PORT}/sse`
        )
      }
    })
    return server
  } catch (error) {
    Logger.error("Error starting BNBChain MCP Server:", error)
  }
}
