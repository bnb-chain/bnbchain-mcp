/**
 * In-memory store for pending transfer intents (preview step).
 * Used when confirmation is required: intent is stored under a short-lived token
 * and consumed when the user calls the confirm tool.
 * No private keys are stored.
 */

const TTL_MS = 5 * 60 * 1000 // 5 minutes
const MAX_PENDING_INTENTS = 10_000 // cap to avoid memory exhaustion from abuse

export type PendingIntent = {
  type: string
  params: Record<string, unknown>
  network: string
  createdAt: number
}

const store = new Map<string, PendingIntent>()

function randomToken(): string {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error(
      "crypto.getRandomValues is not available in this environment"
    )
  }
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function pruneExpired(): void {
  const now = Date.now()
  for (const [token, intent] of store.entries()) {
    if (now - intent.createdAt > TTL_MS) store.delete(token)
  }
}

export type PendingIntentResult = {
  token: string
  expiresAt: string
}

/**
 * Store an intent and return a one-time confirm token with its expiry time.
 * Enforces a max number of pending intents to prevent memory exhaustion.
 */
export function createPendingIntent(
  intent: Omit<PendingIntent, "createdAt">
): PendingIntentResult {
  pruneExpired()
  if (store.size >= MAX_PENDING_INTENTS) {
    const oldest = [...store.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    )[0]
    if (oldest) store.delete(oldest[0])
  }
  const token = randomToken()
  const createdAt = Date.now()
  store.set(token, { ...intent, createdAt })
  return { token, expiresAt: new Date(createdAt + TTL_MS).toISOString() }
}

/**
 * Get and remove the intent for the given token. Returns null if not found or expired.
 */
export function getAndConsumeIntent(token: string): PendingIntent | null {
  pruneExpired()
  const intent = store.get(token)
  if (!intent) return null
  if (Date.now() - intent.createdAt > TTL_MS) {
    store.delete(token)
    return null
  }
  store.delete(token)
  return intent
}
