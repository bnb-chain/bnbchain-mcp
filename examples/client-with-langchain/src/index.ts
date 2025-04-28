import { stdin as input, stdout as output } from "node:process"
import * as readline from "node:readline/promises"
import { AIMessage, HumanMessage } from "@langchain/core/messages"
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import { MultiServerMCPClient } from "@langchain/mcp-adapters"
import { ChatOpenAI } from "@langchain/openai"
import dotenv from "dotenv"

dotenv.config()

// 🧩 MCP server configuration
const mcpConfig = {
  // Global tool configuration options
  throwOnLoadError: true,
  prefixToolNameWithServerName: true,
  additionalToolNamePrefix: "mcp",

  // Server configuration
  mcpServers: {
    // Example:
    bnbchain: {
      transport: "stdio" as const,
      command: "npx",
      args: ["-y", "@bnb-chain/mcp@latest"]
    }
  }
}

async function runChat() {
  const rl = readline.createInterface({ input, output })
  const chatHistory = []

  const client = new MultiServerMCPClient(mcpConfig)
  const tools = await client.getTools()

  const model = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY
    // modelName: "deepseek-chat",
    // apiKey: process.env.DEEPSEEK_API_KEY
  })

  const agent = createReactAgent({ llm: model, tools })

  console.log("Agent is ready. Type your message or 'exit' to quit.\n")

  while (true) {
    const userInput = await rl.question("You: ")
    if (!userInput.trim()) continue
    if (userInput.toLowerCase() === "exit") break

    chatHistory.push(new HumanMessage(userInput))
    console.log("\nAgent thinking...\n")

    try {
      const result = await agent.invoke({ messages: chatHistory })
      const lastMsg = result.messages[result.messages.length - 1]
      const reply =
        typeof lastMsg.content === "string"
          ? lastMsg.content
          : JSON.stringify(lastMsg.content)

      console.log("Agent:", reply, "\n")
      chatHistory.push(new AIMessage(reply))
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Agent error:", err.message)
      } else {
        console.error("Agent error:", String(err))
      }
    }
  }

  rl.close()
  if (client?.close) await client.close()
  console.log("Chat ended.")
  process.exit(0)
}

runChat()
