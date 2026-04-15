# CLAUDE.md

## LANGUAGE RULE — HIGHEST PRIORITY
**Always match the user's language.** If the user writes in Chinese, every word of your reply must be in Chinese. If in English, reply in English. This rule overrides everything else and applies to every single response, including plans, summaries, and error messages. Never mix languages mid-response.

---

## Project Overview

**bnbchain-mcp** is a Model Context Protocol (MCP) server that exposes BNB Chain blockchain operations as AI-callable tools.

**Two transport modes:**
- **Stdio** (default) — local dev, IDE integrations, Claude Desktop
- **SSE** — HTTP + Server-Sent Events for remote/cloud deployment (port 3001)

**Three top-level modules:**
| Module | Path | Description |
|--------|------|-------------|
| `evm` | `src/evm/` | EVM-compatible chains (BSC, ETH, Polygon, …) via viem |
| `gnfd` | `src/gnfd/` | BNB Greenfield storage & payment via greenfield-js-sdk |
| `confirm` | `src/confirm/` | Transfer preview → confirmation flow |

**Key environment variables** (see `.env.example`):
- `PRIVATE_KEY` — wallet private key (optional; required for write ops)
- `PORT` — HTTP port for SSE mode (default: 3001)
- `LOG_LEVEL` — `DEBUG` / `INFO` / `WARN` / `ERROR`
- `BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION` — skip confirm flow (default: false)

**Internal path alias:** `@/*` → `src/*` (defined in `tsconfig.json`)

---

## Spec-Driven Workflow — MANDATORY, NO EXCEPTIONS

You MUST follow these steps in strict order for every code change request.
If you find yourself about to write code or call Edit/Write/Bash without having completed Step 1 AND received explicit user approval — STOP. Go back to Step 1.

---

### Step 0: Research *(new features only — skip for bug fixes)*

Before planning any non-trivial feature:
- Search for mature open-source libraries that solve the problem (npm, GitHub, etc.).
- Research best practices and common patterns for this domain.
- Evaluate trade-offs: proven library vs. custom (maintenance, bundle size, fit).
- **Only build custom if no suitable library exists or fit is poor.**

Summarize findings before writing the Plan.

---

### Step 1: Plan — OUTPUT PLAN, THEN STOP COMPLETELY

Output a plan using this exact format:

```
## Plan
**Goal:** <one sentence>
**Files:** <list of files to create/modify/delete>
**Approach:** <how, key decisions, trade-offs, libraries chosen>
**Risk:** <what could break, security implications>
```

**HARD RULES for Step 1:**
- After printing the Plan, your message ENDS. No code. No "I'll start by...". No partial implementations.
- Do NOT call Edit, Write, Bash, or any file-modifying tool in this turn.
- Do NOT proceed to Step 2 in the same response as the Plan.
- Wait for the user to explicitly reply. Explicit approval = the user says something like "ok", "go", "approved", "yes", "继续", "好", or equivalent.
- A user asking a clarifying question is NOT approval — answer it and wait again.
- If the user approves but asks for changes to the plan, revise the plan and STOP again.

**You are prohibited from starting Step 2 until you receive explicit approval in a separate user message.**

---

### Step 2: Execute

Implement the approved plan exactly. If scope needs to change mid-implementation, STOP and re-plan (back to Step 1).

---

### Step 3: Verify

- **Every feature must have test cases.** Add or update E2E tests before marking done.
- Run `bun test e2e --timeout 50000` — target only the affected module's test file.
- If the change touches shared logic (utils, server, confirm), run `bun test e2e --timeout 50000` (all E2E).
- Run `bun run check` (Biome lint + format check).
- Run `tsc --noEmit` for type checking.
- Fix all failures before proceeding.

---

### Step 4: Summary

```
## Summary
**Changed:** <file list with one-line descriptions>
**Tests:** <tests added/updated/passed>
**Notes:** <anything the user should know>
```

Check uncommitted changes with `git status` and `git diff`. Then print:
1. A short description of what the commit contains.
2. A ready-to-run git command — do NOT execute it:

```
git add . && git commit -m "<type>(<scope>): <subject>

- <key change 1>
- <key change 2>"
```

Scopes: `evm`, `gnfd`, `confirm`, `server`, `utils`.
- Subject line: concise, imperative, ≤72 chars.
- Bullet body: 3–6 meaningful changes, skip trivial details.

---

## Code Rules

- Bun runtime. Source is ESM; build output is CJS (`bun build --format cjs`).
- Biome for formatting and linting. No Prettier, no ESLint.
- `bun:test` for testing. No Jest, no Vitest.
- Double quotes, no semicolons, no trailing commas, 2-space indent.
- Internal imports use `@/*` alias (maps to `src/*`). Never use relative `../../` beyond one level up.
- Import order (auto-sorted by Biome organizeImports): built-ins → third-party → `@/*` → relative.
- Comments in English only. Explain *why*, never *what*.
- Add logs for errors always; key lifecycle events where useful. Remove noise-only logs before committing.
- E2E tests in `e2e/<module>.test.ts`. Use `MCPClient` from `e2e/util.ts`.
- Commits: `feat(scope): ...`, `fix(scope): ...`.

## Code Quality

- **No redundant code.** Extract repeated logic.
- **Single responsibility.** One file = one clear purpose. Split large files proactively.
- **Encapsulate shared logic** into `src/utils/` — never copy-paste.
- **No dead code**, no unused imports, no commented-out code.
- Functions: small, single-purpose, early returns.
- Naming: self-explanatory — if it needs a comment, rename it.
- Keep folder structure clean and intentional.

## Architecture Patterns

- **MCP tool registration:** each module exports a `register*` function called in `src/server/base.ts`.
- **Transfer confirmation flow:** write tools generate a `confirmToken`, store state in `pendingTransferStore` (5-min TTL), and return a preview. `confirm_transfer` executes on approval. Controlled by `BNBCHAIN_MCP_SKIP_TRANSFER_CONFIRMATION`.
- **Viem clients:** cached by chain ID in `src/evm/services/clients.ts`. Always reuse; never create ad-hoc clients.
- **Chain lookup:** use `chainMap` (by chain ID) or `networkNameMap` (by name string) from `src/evm/chains.ts`.
- **Zod schemas:** define input schemas at the tool layer (`src/evm/modules/*/tools.ts`, `src/gnfd/tools/*.ts`).

## Security

- Validate all external input with Zod at the tool boundary.
- Never log private keys, mnemonics, or signed transactions.
- Never hardcode secrets or tokens — use environment variables.
- Never commit `.env`.
- SSE mode has no built-in auth — deployments must add an auth layer in front.

---

## Self-Check Before Every Response

Before generating any response to a code change request, answer these:
1. Have I output a Plan yet? If no → go to Step 1.
2. Has the user explicitly approved the Plan in their last message? If no → do not write any code.
3. Am I about to call Edit/Write/Bash? If yes and Step 2 hasn't started → STOP.
