# bnbchain-mcp

## Project Overview

BNBChain MCP is a Model Context Protocol server that exposes BNB Chain blockchain operations as AI-callable tools. It supports two transport modes: **stdio** (default — local dev, IDE integrations, Claude Desktop) and **SSE** (HTTP + Server-Sent Events, port 3001). Three top-level modules handle EVM-compatible chains (`evm`), BNB Greenfield storage (`gnfd`), and a transfer preview-then-confirm flow (`confirm`).

## Tech Stack

- **Runtime:** Bun. Source is ESM; build output is CJS (`bun build --format cjs`).
- **Language:** TypeScript 5.x
- **Blockchain:** viem 2.x (EVM), @bnb-chain/greenfield-js-sdk 2.x (Greenfield)
- **MCP:** @modelcontextprotocol/sdk 1.x
- **HTTP (SSE mode):** Express 4.x + cors
- **Validation:** Zod 3.x
- **Lint/format:** Biome (no Prettier, no ESLint)
- **Tests:** bun:test (no Jest, no Vitest)

## Architecture

```
src/
  evm/          # EVM-compatible chains (BSC, ETH, Polygon, …)
    chains.ts   # chainMap (by ID) and networkNameMap (by name)
    modules/    # blocks, contracts, network, nft, tokens, transactions, wallet
    services/
      clients.ts  # viem clients cached by chain ID — always reuse, never ad-hoc
  gnfd/         # BNB Greenfield storage & payment
  confirm/      # pendingTransferStore (5-min TTL), confirm_transfer tool
  server/
    base.ts     # registers all module tools via register*() exports
  utils/
  index.ts      # entrypoint; selects stdio or SSE transport
e2e/            # E2E tests using MCPClient from e2e/util.ts
```

**Key patterns:**
- MCP tool registration: each module exports a `register*` function called in `src/server/base.ts`.
- Transfer confirmation: write tools return a `confirmToken` + preview; `confirm_transfer` executes on approval. Controlled by `BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION`.
- Chain lookup: use `chainMap` (by chain ID) or `networkNameMap` (by name string) from `src/evm/chains.ts`.
- Internal path alias: `@/*` → `src/*` (defined in `tsconfig.json`).

**Key environment variables** (see `.env.example`):
- `PRIVATE_KEY` — wallet private key (optional; required for write ops)
- `PORT` — HTTP port for SSE mode (default: 3001)
- `LOG_LEVEL` — `DEBUG` / `INFO` / `WARN` / `ERROR`
- `BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION` — skip confirm flow (default: false)

## Common Commands

```bash
bun dev                          # start dev server (stdio, watch mode)
bun run dev:sse                  # start dev server (SSE mode, watch mode)
bun run build                    # build to dist/ (CJS)
bun run start                    # run built output

bun test e2e --timeout 50000     # run E2E tests (affected module; all if shared logic changed)
bun run check                    # Biome lint + format
tsc --noEmit                     # type check

bun run lint                     # lint only
bun run format                   # format only
```

**Style:** Double quotes, no semicolons, no trailing commas, 2-space indent.
**Imports:** `@/*` alias only — never use relative `../../` beyond one level up. Order (auto-sorted by Biome): built-ins → third-party → `@/*` → relative.

---

## LANGUAGE RULE — HIGHEST PRIORITY

**Always match the user's language.** If the user writes in Chinese, every word of your reply must be in Chinese. If in English, reply in English. This rule overrides everything else and applies to every single response, including plans, summaries, and error messages. Never mix languages mid-response.

---

## Spec-Driven Workflow — MANDATORY

Follow these steps in strict order for every code change request. If you are about to call Edit/Write/Bash without completing Step 1 and receiving explicit approval — STOP. Go back to Step 1.

### Step 0: Research *(new features only — skip for bug fixes)*

Before planning, surface your understanding:

- **State assumptions explicitly.** If the request has multiple valid interpretations, list them — don't pick one silently. Ask for clarification before proceeding.
- Search for mature libraries that solve the problem. Evaluate trade-offs: proven library vs. custom (maintenance, fit, size).
- **Only build custom if no suitable library exists or the fit is poor.**

Summarize findings, then move to Step 1.

### Step 1: Plan — OUTPUT PLAN, THEN STOP COMPLETELY

Output a plan using this exact format:

```
## Plan
**Goal:** <one sentence>
**Assumptions:** <explicit assumptions; flag any ambiguity>
**Files:** <list of files to create/modify/delete>
**Approach:** <how, key decisions, trade-offs, libraries chosen>
**Verify:** <what success looks like — which test passes, which behavior works>
**Risk:** <what could break, security implications>
```

**HARD RULES:**
- After printing the Plan, your message ENDS. No code. No "I'll start by...".
- Do NOT call Edit, Write, Bash, or any file-modifying tool in this turn.
- Wait for the user to explicitly reply. Explicit approval = "ok", "go", "yes", "继续", "好", or equivalent.
- A clarifying question is NOT approval — answer it and wait again.
- If the user approves but asks for changes, revise the plan and STOP again.

### Step 2: Execute

Implement the approved plan exactly. Rules while executing:

- **Surgical changes only.** Every changed line must trace directly to the task. Don't "improve" adjacent code, comments, or formatting.
- **Minimum code.** No speculative features, no unrequested abstractions, no configurability that wasn't asked for.
- **Dead code:**
  - Orphans YOUR changes created → remove immediately.
  - Pre-existing dead code you notice → mention in Summary, don't delete it.
- If scope needs to change mid-implementation → STOP, go back to Step 1.

### Step 3: Verify

```bash
bun test e2e --timeout 50000    # affected module only; all if shared logic changed
bun run check                   # Biome lint + format
tsc --noEmit                    # type check
```

Fix all failures before proceeding. Confirm the **Verify** criteria from Step 1 are met.

### Step 4: Summary

```
## Summary
**Changed:** <file list with one-line descriptions>
**Tests:** <tests added/updated/passed>
**Notes:** <dead code noticed, trade-offs made, anything the user should know>
```

Then print a ready-to-run git commit command — do NOT execute it. Use this format:

```
git commit -m "<type>(<scope>): <subject>

- <key change 1>
- <key change 2>"
```

Types: `feat`, `fix`. Scopes: `evm`, `gnfd`, `confirm`, `server`, `utils`.

---

## Code Quality

- **No redundant code.** Extract repeated logic; never copy-paste.
- **Single responsibility.** One file = one clear purpose. Split large files proactively.
- **No abstractions for single-use code.** Three similar lines > a premature abstraction.
- **No dead code**, no unused imports, no commented-out code (that you wrote).
- Functions: small, single-purpose, early returns.
- Naming: self-explanatory — if it needs a comment, rename it.
- No error handling for impossible scenarios. Trust internal guarantees; validate only at system boundaries.
- Folder structure: clean and intentional.
- **Comments:** English only. Explain *why*, never *what*.
- **Logs:** Always log errors; key lifecycle events where useful. Remove noise-only logs before committing.

---

## Security Baseline

- Validate all external input at the system boundary (Zod schemas at tool layer).
- Never log private keys, mnemonics, signed transactions, or credentials.
- Never hardcode secrets — use environment variables.
- Never commit `.env` or credential files.
- SSE mode has no built-in auth — deployments must add an auth layer in front.

---

## Self-Check Before Every Response

Before responding to a code change request:
1. Have I output a Plan yet? If no → go to Step 1.
2. Has the user explicitly approved the Plan? If no → do not write any code.
3. Am I about to call Edit/Write/Bash? If yes and Step 2 hasn't started → STOP.
