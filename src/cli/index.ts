#!/usr/bin/env node
import { spawn } from "child_process"
import { resolve } from "path"

// Parse command line arguments
const args = process.argv.slice(2)
const sseMode = args.includes("--sse") || args.includes("-h")

// Determine which file to execute
const scriptPath = resolve(
  process.cwd(),
  "dist/server",
  sseMode ? "sse.js" : "stdio.js"
)

try {
  // Execute the server
  const server = spawn("node", [scriptPath], {
    stdio: "inherit",
    shell: false
  })

  server.on("error", (err) => {
    console.error("Failed to start server:", err)
    process.exit(1)
  })

  // Handle clean shutdown
  const cleanup = () => {
    if (!server.killed) {
      server.kill()
    }
  }

  process.on("SIGINT", cleanup)
  process.on("SIGTERM", cleanup)
  process.on("exit", cleanup)
} catch (error) {
  console.error(
    "Error: Server files not found. The package may not be built correctly."
  )
  console.error(
    "Please try reinstalling the package or contact the maintainers."
  )
  console.error(error)
  process.exit(1)
}
