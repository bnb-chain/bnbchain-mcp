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
  const bytes = new Uint8Array(24)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

function pruneExpired(): void {
  const now = Date.now()
  for (const [token, intent] of store.entries()) {
    if (now - intent.createdAt > TTL_MS) store.delete(token)
  }
}

/**
 * Store an intent and return a one-time confirm token.
 * Enforces a max number of pending intents to prevent memory exhaustion.
 */
export function createPendingIntent(intent: Omit<PendingIntent, "createdAt">): string {
  pruneExpired()
  if (store.size >= MAX_PENDING_INTENTS) {
    const oldest = [...store.entries()].sort(
      (a, b) => a[1].createdAt - b[1].createdAt
    )[0]
    if (oldest) store.delete(oldest[0])
  }
  const token = randomToken()
  store.set(token, { ...intent, createdAt: Date.now() })
  return token
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
