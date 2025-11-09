import "dotenv/config"

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import cors from "cors"
import express from "express"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"

import Logger from "@/utils/logger"
import { startServer } from "./base"

export const startHTTPServer = async () => {
  try {
    const app = express()
    const server = startServer()
    app.use(express.json())
    app.use(cors({
      origin: '*',
      exposedHeaders: ['Mcp-Session-Id'],
      allowedHeaders: ['Content-Type', 'Mcp-Session-Id', 'Accept']
    }))

    Logger.info(`Starting Streamable HTTP server with log level: ${Logger.getLevel()}`)

    const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {}
    const lastSeen: { [sessionId: string]: number } = {}

    // Touch session to track activity
    const touch = (sid?: string) => {
      if (sid) lastSeen[sid] = Date.now()
    }

    // Clean up idle sessions every minute (15 min TTL)
    setInterval(() => {
      const now = Date.now()
      for (const sid of Object.keys(transports)) {
        if (now - (lastSeen[sid] || 0) > 15 * 60_000) {
          Logger.info(`Cleaning up idle session ${sid}`)
          transports[sid]?.close?.()
          delete transports[sid]
          delete lastSeen[sid]
        }
      }
    }, 60_000)

    //=============================================================================
    // STREAMABLE HTTP TRANSPORT (PROTOCOL VERSION 2025-03-26)
    //=============================================================================
    app.all("/mcp", async (req: Request, res: Response) => {

      if (!["GET", "POST", "OPTIONS"].includes(req.method)) {
        res.setHeader("Allow", "GET, POST, OPTIONS")
        return res.status(405).end()
      }

      const accept = String(req.headers["accept"] || "")
      if (!accept.includes("application/json") && !accept.includes("text/event-stream") && !accept.includes("*/*")) {
        return res.status(406).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Not Acceptable: Include application/json or text/event-stream in Accept header'
          },
          id: null
        })
      }

      Logger.debug(`Received ${req.method} request to /mcp`)

      try {
        const sessionId = req.headers['mcp-session-id'] as string | undefined
        let transport: StreamableHTTPServerTransport | undefined

        if (sessionId && transports[sessionId]) {
          transport = transports[sessionId]
          touch(sessionId)
        } else if (!sessionId && req.method === 'POST' && isInitializeRequest(req.body)) {
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId: string) => {
              Logger.info(`StreamableHTTP session initialized with ID: ${newSessionId}`)
              transports[newSessionId] = transport!
              touch(newSessionId)
            }
          })

          transport.onclose = () => {
            const sid = transport!.sessionId
            if (sid && transports[sid]) {
              Logger.info(`Transport closed for session ${sid}`)
              delete transports[sid]
              delete lastSeen[sid]
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
        touch(sessionId)
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

    const PORT = process.env.PORT || 3001
    app.listen(PORT, () => {
      Logger.info(
        `BNBChain MCP Server (Streamable HTTP) is running on http://localhost:${PORT}`
      )
      Logger.info(
        `Endpoint: http://localhost:${PORT}/mcp`
      )
    })
    return server
  } catch (error) {
    Logger.error("Error starting BNBChain MCP Server:", error)
  }
}
