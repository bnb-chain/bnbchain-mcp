# BNBChain MCP Server

A Model Context Protocol (MCP) server implementation for BNB Chain, providing tools and resources for interacting with the BNB Chain network.

## Features

- Chain information resource
- BNB balance checking tool
- Latest block information tool
- Transaction analysis prompts

## Installation

```bash
bun install
```

## Running the Server

Development mode with hot reload:

```bash
bun run dev
```

Production mode:

```bash
bun run start
```

## Available Tools

### 1. Get Balance

Get the balance of a BNB Chain address:

```typescript
{
  name: "get-balance",
  params: {
    address: "0x...", // BNB Chain address
    network: "mainnet" | "testnet"
  }
}
```

### 2. Get Latest Block

Get information about the latest block:

```typescript
{
  name: "get-latest-block",
  params: {
    network: "mainnet" | "testnet"
  }
}
```

## Available Resources

### Chain Information

Access BNB Chain network information:

```
bnb-chain://{network}
```

Where network can be "mainnet" or "testnet"

## Available Prompts

### Transaction Analysis

Analyze a BNB Chain transaction:

```typescript
{
  name: "analyze-transaction",
  params: {
    txHash: "0x...", // Transaction hash
    network: "mainnet" | "testnet"
  }
}
```

## License

MIT
